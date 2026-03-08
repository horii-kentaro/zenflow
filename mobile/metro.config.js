const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix tslib ESM/CJS interop for web SSR (framer-motion via moti)
// Override the "node" condition to avoid tslib/modules/index.js which breaks in Metro
if (config.resolver.unstable_conditionNames) {
  config.resolver.unstable_conditionNames = config.resolver.unstable_conditionNames.filter(
    (c) => c !== 'node'
  );
}

module.exports = config;
