const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ['android/**', 'ios/**', 'dist/**', 'node_modules/**'],
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/array-type': 'off',
      'import/no-named-as-default-member': 'off',
    },
  },
]);
