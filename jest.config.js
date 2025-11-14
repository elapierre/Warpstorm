const { createDefaultPreset } = require("ts-jest");
const ts = require("typescript");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|@react-native-community|@react-native-picker|@react-native-async-storage|expo(nent)?|@expo(nent)?/.*|sentry-expo|native-base|@ui-kitten/components|@ui-kitten/theme|@eva-design/eva)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};