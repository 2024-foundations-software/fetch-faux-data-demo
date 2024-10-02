module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.mjs$": "babel-jest", // Add this line to support ECMAScript modules
  },
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy'
  }

};