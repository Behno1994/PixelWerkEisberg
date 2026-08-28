import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * ESLint Flat Config.
 * `eslint-config-next` ab v16 exportiert bereits Flat-Config-Arrays –
 * ein `FlatCompat`-Wrapper ist nicht mehr nötig.
 */
const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "out/**", "next-env.d.ts"] },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default eslintConfig;
