// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude better-sqlite3 from bundle since it's only used in tests
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'better-sqlite3') {
    // Return a mock module for better-sqlite3 in production builds
    return {
      type: 'empty',
    };
  }
  // Use default resolver for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
