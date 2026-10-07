import { withDangerousMod } from 'expo/config-plugins';
import { promises as fs } from 'node:fs';
import path from 'node:path';

// RN 0.87's Android Gradle Plugin requires Gradle >= 9.4.1, but Expo SDK
// 57's prebuild template pins 9.3.1 — EAS CNG builds fail with:
//   "Minimum supported Gradle version is 9.4.1. Current version is 9.3.1."
// Gradle 9.4.1 also bundles Kotlin stdlib 2.3.0, while the template's
// toolchain resolves Kotlin 2.1.0 (via the RN gradle plugin) — so pin both:
//   "Module was compiled with an incompatible version of Kotlin. The binary
//    version of its metadata is 2.3.0, expected version is 2.1.0."
// Patch the generated files after prebuild (the android/ dir is not
// committed — continuous native generation).
const GRADLE_VERSION = '9.4.1';
const KOTLIN_VERSION = '2.3.0';

export default function withGradleWrapper(config: import('expo/config').ExpoConfig) {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const root = cfg.modRequest.platformProjectRoot;

      const wrapperFile = path.join(root, 'gradle', 'wrapper', 'gradle-wrapper.properties');
      const wrapper = await fs.readFile(wrapperFile, 'utf8');
      if (wrapper.includes('distributionUrl=')) {
        await fs.writeFile(
          wrapperFile,
          wrapper.replace(
            /distributionUrl=.*/,
            `distributionUrl=https\\://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip`,
          ),
        );
      }

      // The RN gradle plugin reads `kotlinVersion` from gradle.properties.
      const propsFile = path.join(root, 'gradle.properties');
      let props = await fs.readFile(propsFile, 'utf8');
      if (/kotlinVersion=/.test(props)) {
        props = props.replace(/kotlinVersion=.*/, `kotlinVersion=${KOTLIN_VERSION}`);
      } else {
        props += `\nkotlinVersion=${KOTLIN_VERSION}\n`;
      }
      await fs.writeFile(propsFile, props);

      // With kotlinVersion set, the RN rootproject plugin applies
      // org.jetbrains.kotlin.android to the app — the prebuild template also
      // applies it explicitly, and Kotlin 2.3 errors on the duplicate
      // registration ("Cannot add extension with name 'kotlin'"). Drop the
      // explicit apply; the RN plugin's application covers it.
      const appGradleFile = path.join(root, 'app', 'build.gradle');
      let appGradle = await fs.readFile(appGradleFile, 'utf8');
      if (appGradle.includes('apply plugin: "org.jetbrains.kotlin.android"')) {
        appGradle = appGradle.replace(/apply plugin: "org\.jetbrains\.kotlin\.android"\r?\n/, '');
        await fs.writeFile(appGradleFile, appGradle);
      }

      // AGP 9 removed getDefaultProguardFile("proguard-android.txt") —
      // evaluation fails on the template's release block. Use the
      // optimize variant (R8 default) instead.
      if (appGradle.includes('getDefaultProguardFile("proguard-android.txt")')) {
        appGradle = appGradle.replace(
          /getDefaultProguardFile\("proguard-android\.txt"\)/g,
          'getDefaultProguardFile("proguard-android-optimize.txt")',
        );
        await fs.writeFile(appGradleFile, appGradle);
      }

      // expo-modules-autolinking ships its own included gradle build whose
      // build.gradle.kts pins kotlin("jvm") 2.1.20 — compileKotlin of
      // expo-autolinking-settings-plugin fails against Gradle 9.4.1's
      // bundled stdlib 2.3.0. Patch it in the pnpm virtual store (the
      // store lives at the monorepo root — two levels up from the app —
      // on the EAS worker too).
      const repoRoot = path.resolve(cfg.modRequest.projectRoot, '..', '..');
      const pnpmStore = path.join(repoRoot, 'node_modules', '.pnpm');
      try {
        const entries = await fs.readdir(pnpmStore);
        // Several expo packages ship their own included gradle builds that
        // pin kotlin("jvm") 2.1.20 (expo-modules-autolinking, expo-dev-launcher,
        // ...). Each compileKotlin fails against Gradle 9.4.1's bundled stdlib
        // 2.3.0 — and they consume each other's jars, so ALL must move.
        // Sweep every expo-* package in the pnpm virtual store.
        const expoDirs = entries.filter((e) => e.startsWith('expo'));
        for (const dir of expoDirs) {
          const pkgRoot = path.join(pnpmStore, dir, 'node_modules');
          await sweepKotlinPins(pkgRoot);
        }
      } catch (e) {
        // Non-fatal: build will surface the original error if this misses.
        console.warn('withGradleWrapper: could not sweep expo kotlin pins:', e);
      }

      return cfg;
    },
  ]);
}

async function sweepKotlinPins(dir: string): Promise<void> {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await sweepKotlinPins(full);
      continue;
    }
    let content;
    try {
      content = await fs.readFile(full, 'utf8');
    } catch {
      continue;
    }
    if (entry.name === 'build.gradle.kts' && /kotlin\("jvm"\) version "[^"]+"/.test(content)) {
      await fs.writeFile(
        full,
        content.replace(
          /kotlin\("jvm"\) version "[^"]+"/,
          `kotlin("jvm") version "${KOTLIN_VERSION}"`,
        ),
      );
    }
    // RN's rootproject plugin applies org.jetbrains.kotlin.android globally
    // when kotlinVersion is set; expo plugins re-apply kotlin-android guarded
    // only by the short plugin id — the duplicate registration fails with
    // "Cannot add extension with name 'kotlin'". Widen the negated guards
    // to require BOTH ids absent before applying.
    if (content.includes('!plugins.hasPlugin("kotlin-android")')) {
      await fs.writeFile(
        full,
        content.replaceAll(
          '!plugins.hasPlugin("kotlin-android")',
          '!plugins.hasPlugin("kotlin-android") && !plugins.hasPlugin("org.jetbrains.kotlin.android")',
        ),
      );
    }
  }
}
