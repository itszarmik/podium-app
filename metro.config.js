const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Exclude node_modules from file watching to prevent EMFILE errors on Node 24
config.watchFolders = [__dirname];
config.resolver.blockList = [
  /node_modules\/.*\/node_modules\/react-native\/.*/,
];

// Use polling instead of FSEvents to avoid hitting open file limits
config.watcher = {
  watchman: {
    deferStates: ['hg.update'],
  },
  healthCheck: {
    enabled: true,
    interval: 30000,
    timeout: 5000,
    filePrefix: '.metro-health-check',
  },
};

module.exports = config;