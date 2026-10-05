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
        const autolinkingDir = entries.find((e) => e.startsWith('expo-modules-autolinking@'));
        if (autolinkingDir) {
          const ktsFile = path.join(
            pnpmStore,
            autolinkingDir,
            'node_modules',
            'expo-modules-autolinking',
            'android',
            'expo-gradle-plugin',
            'build.gradle.kts',
          );
          let kts = await fs.readFile(ktsFile, 'utf8');
          if (/kotlin\("jvm"\) version "[^"]+"/.test(kts)) {
            kts = kts.replace(
              /kotlin\("jvm"\) version "[^"]+"/,
              `kotlin("jvm") version "${KOTLIN_VERSION}"`,
            );
            await fs.writeFile(ktsFile, kts);
          }
        }
      } catch (e) {
        // Non-fatal: build will surface the original error if this misses.
        console.warn('withGradleWrapper: could not patch expo-modules-autolinking:', e);
      }

      return cfg;
    },
  ]);
}
