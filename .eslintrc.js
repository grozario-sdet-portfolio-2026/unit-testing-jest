module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: 'standard',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['node'],
  rules: {
    'indent': ['error', 2],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': ['error', { args: 'after-used', argsIgnorePattern: '^_' }],
    'node/no-unsupported-features/es-syntax': 'off',
    'camelcase': ['warn', { properties: 'never', ignoreDestructuring: true }],
    'no-useless-catch': 'warn',
  },
};
