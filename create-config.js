import antfu from "@antfu/eslint-config";

export default function createConfig(options, ...userConfigs) {
  return antfu({
    react: true,
    typescript: true,
    formatters: true,
    stylistic: {
      indent: 2,
      semi: true,
      quotes: "double",
    },
    ignores: ["**/components/ui/*", "**/tsconfig.json", "**/tsconfig.node.json", "**/tsconfig.app.json", "README.md"],
    ...options,
  }, {
    rules: {
      "no-console": "off",
      "ts/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "unused-imports/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "ts/consistent-type-definitions": "off",
    },
  }, {
    files: ["README.md"],
    rules: {
      "unused-imports/no-unused-vars": "off",
      "ts/no-unused-vars": "off",
      "react-refresh/only-export-components": "off",
    },
  }, ...userConfigs);
}
