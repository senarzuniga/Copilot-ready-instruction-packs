module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:security/recommended'
  ],
  plugins: ['security'],
  env: {
    node: true,
    es6: true
  },
  rules: {
    // Add custom rules or overrides here
  }
};
