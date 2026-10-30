import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: { console: "readonly" },
    },
    rules: {
      "no-unused-vars": "error",
      "prefer-const": "error",
      eqeqeq: "error",
    },
  },
];