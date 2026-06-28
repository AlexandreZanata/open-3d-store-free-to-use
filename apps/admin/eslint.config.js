import rootConfig from "../../eslint.config.mjs";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";

export default [...rootConfig, eslintPluginPrettier];
