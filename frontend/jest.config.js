module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  // moduleFileExtensions: ['js', 'jsx', 'json', 'vue', 'ts'],
  // transform: {
  //   '^.+\\.vue$': 'vue-jest',
  //   '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$':
  //     'jest-transform-stub',
  //   '^.+\\.(js|jsx)?$': 'babel-jest',
  // },
  // moduleNameMapper: {
  //   '^@/(.*)$': '<rootDir>/src/$1',
  // },
  // snapshotSerializers: ['jest-serializer-vue'],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  // testMatch: [
  //   '<rootDir>/(tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx))',
  // ],
  // transformIgnorePatterns: ['/node_modules/(?!(@transmute)/)'],

};
