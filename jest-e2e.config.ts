import jestConfig from './jest.config'

import type { Config } from 'jest'

export default {
  ...jestConfig,
  testRegex: '.e2e-spec.ts$',
} satisfies Config
