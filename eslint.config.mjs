import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) })

export default [
  { ignores: ['.next/**', 'out/**', 'node_modules/**', 'public/**', 'scripts/**', 'docs/**', '.wrangler/**', 'playwright-report/**', 'test-results/**'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@next/next/no-img-element': 'off', // export estático: usamos <img> com srcset próprio
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
]
