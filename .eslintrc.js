module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true,
        node: true,
        jest: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 'latest'
    },
    rules: {
        'indent': ['error', 4],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'no-unused-vars': ['warn'],
        'no-console': 'off',
        'no-undef': 'error',
        'no-unreachable': 'error',
        'no-duplicate-imports': 'error',
        'prefer-const': 'warn',
        'no-var': 'error'
    },
    ignorePatterns: [
        'node_modules/',
        'coverage/',
        'logs/',
        'uploads/',
        '*.min.js'
    ]
};
