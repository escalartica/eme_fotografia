import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Third-party agent/skill packages vendored into the repo. vitest.config.ts
    // already excludes them; eslint did not, which is where the bulk of the
    // 174 errors in `npm run lint` came from -- so CI failed on code this
    // project does not own or ship.
    ".agents/**",
    ".claude/**",
  ]),
]);

export default eslintConfig;
