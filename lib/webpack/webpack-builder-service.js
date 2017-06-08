'use babel'

import BuilderService from './../builder/builder-service'
var Fs = require('fs');
var Path = require('path');
var Webpack = require('webpack');
var Loader = require('weex-loader');
var Transformer = require('weex-transformer');
var Mkdirp = require('mkdirp');
var Watch = require('node-watch');

var ext2Name = {
    '.we': 'Weex',
    '.vue': 'Vue'
};
function loadModulePath(moduleName, extra) {
    try {
        var path = require.resolve(Path.join(moduleName, extra || ''));
        return path.slice(0, path.indexOf(moduleName) + moduleName.length);
    } catch (e) {
        return moduleName;
    }
}

export default class BuilderServiceWebpack extends BuilderService {

  constructor() {
    super();
    this.name = 'weex';
  }

  /**
   config: {
     source: "/.../...",
     output: "/....",
     minify: true/false,
     sourcemap: true/false
   }
   */
  buildDebug(config) {
    super.buildDebug(config);
    return this.build(config, config.source, config.output);
  }

  buildRelease(config) {
    super.buildRelease(config);
    return this.build(config, config.source, config.output);
  }

  watch(config) {
    super.watch(config);
    this.watchImpl(config, config.source, config.output);
  }

  /** Transform .we file into bundle.js */
  transform(source, outputDir) {
    if (!source) {
      return new Promise(function(resolve, reject){reject('Input source file should not be empty!')});
    }
    var targetPath = outputDir ? outputDir : Path.join(Path.parse(source).dir, 'generated');

    return new Promise(function(resolve, reject) {
      Fs.readFile(source, function(err, fileContent) {
        if (err) {
          console.error(err);
          return reject(err);
        }
        var output = Transformer.transform(Path.basename(source, '.we'), fileContent.toString());
        var targetDir = Path.join(targetPath, Path.basename(source, '.we') + '.js');
        Mkdirp.sync(Path.dirname(targetDir));
        Fs.writeFileSync(targetDir, output.result);
        resolve(targetDir);
      });
    });
  }

  /**
   *  config: {
   *    minify: true/false,  # Need minify output bundle.
   *    sourcemap: true/false   # Need inline sourcemap.
   *  }
   */
  build(config, source, outputDir) {
    if (!source) {
      return new Promise(function(resolve, reject){reject('Input source file should not be empty!')});
    }
    var targetPath = outputDir ? outputDir : Path.join(Path.parse(source).dir, 'generated');

    return new Promise(function(resolve, reject) {
      var ext = Path.extname(source);
      var basename = Path.basename(source, ext);
      var targetDir = targetPath;
      var weexLoaderRoot = Path.join(__dirname, '../../node_modules');

      var bannerPlugin = new Webpack.BannerPlugin('// { "framework": "' + ext2Name[ext] + '" }\n', { raw: true });
      var webpackConfig = {
        entry: source + '?entry=true',
        output: {
          path: targetDir,
          filename: basename + '.js'
        },
        devtool: config.sourcemap ? '#inline-source-map' : 'source-map',
        module: {
          loaders: [{
            test: /\.we(\?[^?]+)?$/,
            loader: 'weex'
          }, {
            test: /\.vue(\?[^?]+)?$/,
            loader: 'weex'
          }]
        },
        resolve: {
          alias: {
            'babel-runtime': loadModulePath('babel-runtime', 'core-js'),
            'babel-polyfill': loadModulePath('babel-polyfill')
          }
        },
        resolveLoader: {
          root: weexLoaderRoot
        },
        plugins: [bannerPlugin]
      }

      if (config.minify) {
        webpackConfig.plugins.push(new Webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false
          }
        }));
      }

      Webpack(webpackConfig, function(err, stats) {
        if (err) {
          return reject(err);
        }
        var jsonStats = stats.toJson();
        if (jsonStats.errors.length > 0) {
          console.error('[webpack errors]\n', jsonStats.errors.join('\n'));
          return reject(jsonStats.errors);
        }
        if (jsonStats.warnings.length > 0) {
          console.warn('[webpack warnings]', jsonStats.warnings.join('\n'));
        }
        resolve(targetDir + '/' + basename + '.js');
      });

    });
  }

  watchImpl(config, source, outputDir) {

  }
}
