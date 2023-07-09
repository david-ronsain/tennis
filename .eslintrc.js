/* eslint-env node */
module.exports = {
    extends: [
        'eslint:recommended', 
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@typescript-eslint/strict'
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    parserOptions: {
      project: ['./tsconfig.eslint.json', './back/*/tsconfig.json', './core/tsconfig.json', './front/*/tsconfig.json'],
      tsconfigRootDir: __dirname,
    },
    root: true,
    rules: {
      "prefer-destructuring": ["error", {"object": true, "array": false}]
    },
}