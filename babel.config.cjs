module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }]
  ],
  plugins: [
    // Replaces import.meta.url with a Node-compatible equivalent.
    // This is needed because the backend controllers use import.meta.url
    // to resolve __dirname, which Babel's CJS transform doesn't handle on its own.
    function replaceImportMeta() {
      return {
        visitor: {
          MetaProperty(path) {
            if (
              path.node.meta.name === 'import' &&
              path.node.property.name === 'meta'
            ) {
              path.replaceWithSourceString(
                '({ url: require("url").pathToFileURL(__filename).href })'
              );
            }
          }
        }
      };
    }
  ]
};
