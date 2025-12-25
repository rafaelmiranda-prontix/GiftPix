module.exports = {
  root: true,
  ignorePatterns: ['dist', 'node_modules', '.next', 'coverage'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript'
  ],
  rules: {
    'import/no-named-as-default-member': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        project: ['./apps/api/tsconfig.json', './apps/web/tsconfig.json'],
      },
    },
  },
  overrides: [
    {
      files: ['apps/api/**/*.{ts,tsx}'],
      env: {
        node: true,
        browser: false,
      },
      rules: {
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'import/no-named-as-default': 'off'
      },
    },
    {
      files: ['apps/web/**/*.{ts,tsx}'],
      env: {
        browser: true,
        node: true,
      },
      rules: {
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
      },
      extends: ['next/core-web-vitals'],
    },
  ],
};
