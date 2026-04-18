// @ts-check
import eslintPlugin from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslintPlugin.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  }
);
