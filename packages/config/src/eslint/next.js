/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['./react.js', 'plugin:@next/next/recommended'],
  plugins: ['@next/next'],
  rules: {
    '@next/next/no-html-link-for-pages': ['error', 'apps/web/src/app/'],
    '@next/next/no-img-element': 'error',
  },
};
