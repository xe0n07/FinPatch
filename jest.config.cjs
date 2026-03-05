// jest.config.cjs
module.exports = {
  // Look for test files inside src/backend/tests/
  testMatch: ['**/src/backend/tests/**/*.test.js'],

  // Transform ES module files using babel-jest
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // Don't transform files inside node_modules
  transformIgnorePatterns: ['/node_modules/'],

  // Show individual test names in output
  verbose: true,

  // Clear mock state between each test
  clearMocks: true,

  // Set test environment to Node (not browser)
  testEnvironment: 'node'
};
