/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', '@next/next', 'jsx-a11y'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@next/next/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@next/next/no-html-link-for-pages': ['error', 'apps/web/src/app/'],
    // Remote/user-uploaded images (Unsplash, S3) can't use next/image without
    // per-domain remotePatterns — track as warning until image pipeline lands
    '@next/next/no-img-element': 'warn',
    // React Compiler-era rules false-positive the established async setState pattern
    'react-hooks/set-state-in-effect': 'off',
    'react-hooks/purity': 'off',
    'react-hooks/refs': 'off',
  },
  ignorePatterns: ['dist/', 'build/', '.next/', '.expo/', 'node_modules/', '*.config.*'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
