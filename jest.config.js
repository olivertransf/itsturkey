const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

const customJestConfig = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@backend/(.*)$': '<rootDir>/backend/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@fonts/(.*)$': '<rootDir>/fonts/$1',
    '^@pages/(.*)$': '<rootDir>/pages/$1',
    '^@redux/(.*)$': '<rootDir>/redux-utils/$1',
    '^@styles/(.*)$': '<rootDir>/styles/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@types/(.*)$': '<rootDir>/@types/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}

module.exports = createJestConfig(customJestConfig)
