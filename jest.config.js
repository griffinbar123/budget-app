// jest.config.js or jest.config.mjs
const nextJest = require('next/jest')
// Or if using ES Modules: import nextJest from 'next/jest.js'

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Use JSDOM environment to simulate browser APIs needed by React Testing Library
  testEnvironment: 'jest-environment-jsdom',

  // Handle module aliases (adjust based on your tsconfig.json or jsconfig.json paths)
  moduleNameMapper: {
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/components/(.*)$': '<rootDir>/app/components/$1',
    '^@/store/(.*)$': '<rootDir>/app/store/$1',
    '^@/utils/(.*)$': '<rootDir>/app/utils/$1',
    // Add other aliases here if needed
  },

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Add more Jest options here if needed...
  // verbose: true,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
// Or if using ES Modules: export default createJestConfig(customJestConfig)
