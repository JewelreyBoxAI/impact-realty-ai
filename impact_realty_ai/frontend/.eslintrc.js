module.exports = {
  root: true,
  extends: [
    'next',
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'react'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn'],
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'warn',
    'no-console': 'warn'
  }
};
