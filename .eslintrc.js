// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parserOptions: {
    project: path.resolve(__dirname, "tsconfig.json")
  },
  extends: ["next/core-web-vitals", "prettier"],
  plugins: ["import"],
  rules: {
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "object",
          "type"
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true }
      }
    ],
    "react/jsx-filename-extension": ["error", { extensions: [".tsx"] }]
  },
  ignorePatterns: ["*.config.*", "next-env.d.ts"]
};
