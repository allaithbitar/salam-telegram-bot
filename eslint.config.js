import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["src/**/*.js"],
    ignores: ["**/*.config.js", "!**/eslint.config.js"],
    languageOptions: { globals: globals.node },
  },
  pluginJs.configs.recommended,
];
