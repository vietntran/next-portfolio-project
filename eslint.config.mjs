// eslint.config.mjs
import globals from "globals";
import js from "@eslint/js";
import jest from "eslint-plugin-jest";
import * as tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";

export default [
  // Base configuration for all files
  {
    ignores: ["build/*", "dist/*", "node_modules/*"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "error",
      // Add Next.js specific rules
      "@next/next/no-html-link-for-pages": "error",
    },
  },
  // Jest specific configuration
  {
    files: ["**/__tests__/**/*.[jt]s?(x)", "**/*.{test,spec}.[jt]s?(x)"],
    plugins: {
      jest,
    },
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      ...jest.configs.recommended.rules,
      "jest/no-focused-tests": "error",
      "jest/no-disabled-tests": "warn",
      "jest/expect-expect": "error",
      "jest/no-identical-title": "error",
      "jest/valid-expect": "error",
    },
  },
];
