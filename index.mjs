import { fixupPluginRules } from '@eslint/compat';
import js from '@eslint/js';
import typescriptParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import arrayFunc from 'eslint-plugin-array-func';
import compat from 'eslint-plugin-compat';
import formatjs from 'eslint-plugin-formatjs';
import importPlugin from 'eslint-plugin-import';
import jest from 'eslint-plugin-jest';
import eslintPluginJson from 'eslint-plugin-json';
import a11y from 'eslint-plugin-jsx-a11y';
import eslintPluginPromise from 'eslint-plugin-promise';
import react from 'eslint-plugin-react';
import reactCompiler from 'eslint-plugin-react-compiler';
import reactHooks from 'eslint-plugin-react-hooks';
import regexp from 'eslint-plugin-regexp';
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import testingLibrary from 'eslint-plugin-testing-library';
import unusedImports from 'eslint-plugin-unused-imports';
import eslintPluginYml from 'eslint-plugin-yml';
import globals from 'globals';
import { merge, omit } from 'lodash-es';
import ts from 'typescript-eslint';
import tsConfig from '../../tsconfig.json' with { type: 'json' };

import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const tsConfigPath = pathToFileURL(path.resolve(process.cwd(), 'tsconfig.json'));

let tsConfig = {};
try {
   tsConfig = await import(tsConfigPath, { with: { type: 'json' } });
} catch (error) {
   console.warn(`⚠️  Warning: Could not load tsconfig.json at ${tsConfigPath.href}. Some ESLint rules may not work correctly.`);
}


const ignores = tsConfig.exclude;

const jsConfigs = [
   eslintPluginPromise.configs['flat/recommended'], // OK
   formatjs.configs.recommended, // OK
   sonarjs.configs.recommended, // OK
   arrayFunc.configs.recommended, // OK
   react.configs.flat.recommended, // OK
   security.configs.recommended, // OK
   regexp.configs['flat/recommended'], // OK
   compat.configs['flat/recommended'], // OK
   a11y.flatConfigs.recommended, // OK
   importPlugin.flatConfigs.recommended, // OK
   omit(reactHooks.configs.recommended, ['plugins']), // plugins is an array here. Should be an object
   js.configs.recommended, // OK
];

const tsConfigs = [
   eslintPluginPromise.configs['flat/recommended'], // OK
   formatjs.configs.recommended, // OK
   sonarjs.configs.recommended, // OK
   arrayFunc.configs.recommended, // OK
   react.configs.flat.recommended, // OK
   security.configs.recommended, // OK
   regexp.configs['flat/recommended'], // OK
   compat.configs['flat/recommended'], // OK
   a11y.flatConfigs.recommended, // OK
   importPlugin.flatConfigs.recommended, // OK
   omit(reactHooks.configs.recommended, ['plugins']), // plugins is an array here. Should be an object
   js.configs.recommended, // OK
   ts.configs.recommended, // OK
];

const jsconfig = merge({}, ...jsConfigs, {
   plugins: { 'react-hooks': fixupPluginRules(reactHooks), 'unused-imports': unusedImports, 'react-compiler': reactCompiler },
});
const tsconfig = merge({}, ...tsConfigs, {
   plugins: { 'react-hooks': fixupPluginRules(reactHooks), 'unused-imports': unusedImports, 'react-compiler': reactCompiler },
});

const testConfig = merge(jsconfig, jest.configs['flat/recommended'], testingLibrary.configs['flat/react']);
const testPlugins = {
   ...jsconfig.plugins,
   ...jest.configs['flat/recommended'].plugins,
   ...testingLibrary.configs['flat/react'].plugins,
};

const rulesCustomization = {
   'sort-imports': [
      'warn',
      {
         ignoreCase: true,
         ignoreDeclarationSort: true,
         ignoreMemberSort: false,
      },
   ],
   'import/order': [
      'warn',
      {
         groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
         pathGroups: [
            {
               pattern: 'react',
               group: 'external',
               position: 'before',
            },
         ],
         pathGroupsExcludedImportTypes: ['react'],
         alphabetize: {
            order: 'asc',
            caseInsensitive: true,
         },
      },
   ],
   'no-unused-vars': 'warn',
   'security/detect-object-injection': 'off',
   'react/prop-types': 'warn',
   'react/react-in-jsx-scope': 'off',
   'react/jsx-curly-brace-presence': 'warn',
   'formatjs/enforce-description': 'off',
   'formatjs/enforce-default-message': 'off',
   'sonarjs/cognitive-complexity': 'warn',
   'sonarjs/no-nested-functions': 'warn',
   'sonarjs/function-return-type': 'warn',
   'sonarjs/todo-tag': 'warn',
   'sonarjs/fixme-tag': 'warn',
   'sonarjs/deprecation': 'off',
   'sonarjs/no-nested-conditional': 'warn',
   'sonarjs/pseudo-random': 'warn',
   'sonarjs/no-selector-parameter': 'warn',
   'sonarjs/no-unused-vars': 'warn',
   'sonarjs/no-dead-store': 'warn',
   'sonarjs/no-nested-template-literals': 'warn',
   'sonarjs/max-switch-cases': 'warn',
   'sonarjs/no-commented-code': 'warn',
   'jsx-a11y/no-autofocus': [
      'warn',
      {
         ignoreNonDOM: true,
      },
   ],
   'react-compiler/react-compiler': 'error',
};

const languageOptions = {
   ...react.configs.recommended.languageOptions,
   parser: typescriptParser,
   parserOptions: {
      ...react.configs.recommended.parserOptions,
      ecmaVersion: 'latest',
      project: path.fileURLToPath(tsConfigPath),
   },
   globals: {
      ...globals.serviceworker,
      ...globals.browser,
      ...globals.node,
   },
};

const settings = {
   'import/resolver': {
      node: {
         moduleDirectory: ['node_modules', 'src'],
         extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
   },
   react: {
      version: 'detect',
   },
};

export default [
   {
      files: ['src/**/!(*.test,spec).{js,jsx}'],
      languageOptions: {
         ...languageOptions,
      },
      settings: {
         compat: true,
         ...settings,
      },
      plugins: jsconfig.plugins,
      rules: { ...jsconfig.rules, ...rulesCustomization },
      ignores,
   },
   {
      files: ['src/**/!(*.test,spec).{ts,tsx}'],
      languageOptions: {
         ...languageOptions,
      },
      settings: {
         ...settings,
      },
      plugins: tsconfig.plugins,
      rules: { ...tsconfig.rules, ...rulesCustomization },
      ignores,
   },
   {
      ...eslintPluginJson.configs['recommended'],
      files: ['**/*.json'],
      ignores,
   },
   {
      plugins: {
         yml: eslintPluginYml,
      },
      files: ['**/*.yml', '**/*.yaml'],
      rules: eslintPluginYml.configs.recommended.rules,
      ignores,
   },
   eslintConfigPrettier,
];
