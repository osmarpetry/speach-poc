import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  {
    ignores: [
      '.output/**',
      '.wxt/**',
      'node_modules/**',
      'storybook-static/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Source files — full typed linting
    files: ['entrypoints/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'hooks/**/*.{ts,tsx}', 'utils/**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
    settings: {
      react: { version: 'detect' },
    },
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // Test files — typed but relaxed rules, no React hooks check
    files: ['**/*.test.{ts,tsx}', '**/*.stories.{ts,tsx}', '__mocks__/**/*.ts'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': 'off',
    },
    settings: {
      react: { version: 'detect' },
    },
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // Config files and e2e — no typed linting (not in tsconfig project)
    files: [
      'vitest.config.ts',
      'playwright.config.ts',
      '.storybook/**/*.ts',
      'tests/e2e/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
  },
);
