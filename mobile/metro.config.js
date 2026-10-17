const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.watchFolders = [__dirname];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];
// config.resolver.disableHierarchicalLookup = true;
config.resolver.extraNodeModules = {
  punycode: require.resolve('punycode/')
};

module.exports = withNativeWind(config, { input: './src/global.css' });
