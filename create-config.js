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
    ignores: [
      "README.md",
    ],
    ...options,
  }, {
    files: ["tsconfig.json"],
    rules: {
      "jsonc/sort-keys": "off",
    },
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
  }, ...userConfigs);
}
