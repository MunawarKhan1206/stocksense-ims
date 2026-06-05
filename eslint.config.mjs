import nextVitalsConfig from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitalsConfig,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off"
    }
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "temp/**"
    ]
  }
];

export default eslintConfig;
