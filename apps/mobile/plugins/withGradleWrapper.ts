import { withDangerousMod } from 'expo/config-plugins';
import { promises as fs } from 'node:fs';
import path from 'node:path';

// RN 0.87's Android Gradle Plugin requires Gradle >= 9.4.1, but Expo SDK
// 57's prebuild template pins 9.3.1 — EAS CNG builds fail with:
//   "Minimum supported Gradle version is 9.4.1. Current version is 9.3.1."
// Patch the generated wrapper after prebuild (the android/ dir is not
// committed — continuous native generation).
export default function withGradleWrapper(config: import('expo/config').ExpoConfig) {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const file = path.join(
        cfg.modRequest.platformProjectRoot,
        'gradle',
        'wrapper',
        'gradle-wrapper.properties',
      );
      const content = await fs.readFile(file, 'utf8');
      if (content.includes('distributionUrl=')) {
        const updated = content.replace(
          /distributionUrl=.*/,
          'distributionUrl=https\\://services.gradle.org/distributions/gradle-9.4.1-bin.zip',
        );
        await fs.writeFile(file, updated);
      }
      return cfg;
    },
  ]);
}
