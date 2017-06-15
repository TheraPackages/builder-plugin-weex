'use babel'

const builder = require('weex-builder')

export default class WebpackBuilderOfficialImpl {

  constructor() {
    this.name = 'weex';
  }

  /**
   *  config: {
   *    source: "/.../...",
   *    output: "/....",
   *    minify: true/false,  # Need minify output bundle.
   *    sourcemap: true/false   # Need inline sourcemap.
   *  }
   */
  build(config, source, outputDir) {
    if (!source) {
      return new Promise(function(resolve, reject){reject('Input source file should not be empty!')});
    }
    var targetPath = outputDir ? outputDir : Path.join(Path.dirname(source), atom.config.get(DEFAULT_BUILD_PATH));

    return new Promise(function(resolve, reject) {

      var options = {
        root: undefined,
        web: config.web,
        min: config.minify,
        devtool: config.devtool,
        onProgress: false,
        watch: false
      };
      // build(source, dest, options,callback)
      builder.build(source, outputDir, options, function(errorString, result, jsonStats) {
        if (errorString) {
          return reject(errorString);
        }
        if (jsonStats.errors.length > 0) {
          console.error('[webpack errors]\n', jsonStats.errors.join('\n'));
          return reject(jsonStats.errors);
        }
        if (jsonStats.warnings.length > 0) {
          console.warn('[webpack warnings]', jsonStats.warnings.join('\n'));
        }
        if (result instanceof Array && result.length > 0) {
          resolve(result[0].to);
        } else {
          reject('Result is empty.');
        }
      });
    });
  }
}
