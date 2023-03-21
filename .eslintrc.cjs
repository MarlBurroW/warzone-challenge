module.exports = {
    root: true,
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
    },
    plugins: ['@typescript-eslint', 'vue', 'prettier'],
    extends: [
        'plugin:vue/base',
        "eslint:recommended",
        'plugin:vue/vue3-recommended',
        'plugin:vue/essential',
        'plugin:@typescript-eslint/recommended',
        "plugin:prettier/recommended",
        'eslint-config-prettier'
    ],

    rules: {
        "vue/multi-word-component-names": "off",
        "prettier/prettier": [
          "error",
            {
                endOfLine: "auto",
            }
        ],
        'no-console': 'off',
    },
}