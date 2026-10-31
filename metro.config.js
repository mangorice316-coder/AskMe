const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix react-native-svg for web platform
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-svg' && platform === 'web') {
    return context.resolveRequest(context, 'react-native-svg-web', platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
