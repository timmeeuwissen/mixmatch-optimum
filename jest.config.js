module.exports = {
  moduleFileExtensions: ['js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
};
