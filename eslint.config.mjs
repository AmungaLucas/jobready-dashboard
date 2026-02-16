import globals from "globals";
import nextPlugin from "@next/eslint-plugin-next";

export default [
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      globals: {
        ...globals.browser, // Defines browser global variables like `document` and `window`
        ...globals.node, // Defines Node.js global variables and scoping
      },
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Enable JSX parsing
        },
      },
    },
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      // Add any additional rules or overrides here
      "react/prop-types": "off", // Disable prop-types rule, as it's less critical in a Next.js (TypeScript/JavaScript) environment
      "react/react-in-jsx-scope": "off", // Disable rule requiring React to be in scope, as Next.js handles this automatically
    },
    settings: {
      react: {
        version: "detect", // Automatically detect the React version
      },
    },
  },
];