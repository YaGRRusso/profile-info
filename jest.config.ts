import type { Config } from 'jest'

export default {
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.service.(t|j)s', '**/*.controller.(t|j)s'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: {
    '@/(.*)': ['<rootDir>/src/$1'],
  },
} satisfies Config
