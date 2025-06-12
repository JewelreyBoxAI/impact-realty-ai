module.exports = {
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
