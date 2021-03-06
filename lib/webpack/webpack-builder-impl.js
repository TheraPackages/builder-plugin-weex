'use babel'

var Fs = require('fs');
var Path = require('path');
var Webpack = require('webpack');
var Transformer = require('weex-transformer');
var Mkdirp = require('mkdirp');
const DEFAULT_BUILD_PATH = 'builder-plugin-weex.BuildPath';

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

export default class WebpackBuilderImpl {

  constructor() {
    this.name = 'weex';
  }

  /** Transform .we file into bundle.js */
  transform(source, outputDir) {
    if (!source) {
      return new Promise(function(resolve, reject){reject('Input source file should not be empty!')});
    }
    var targetPath = outputDir ? outputDir : Path.join(Path.dirname(source), atom.config.get(DEFAULT_BUILD_PATH));

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
   *    source: "/.../...",
   *    output: "/....",
   *    minify: true/false,  # Need minify output bundle.
   *    devtool: true/false   # Need inline devtool.
   *  }
   */
  build(config, source, outputDir) {
    if (!source) {
      return new Promise(function(resolve, reject){reject('Input source file should not be empty!')});
    }
    var targetPath = outputDir ? outputDir : Path.join(Path.dirname(source), atom.config.get(DEFAULT_BUILD_PATH));

    return new Promise(function(resolve, reject) {
      var ext = Path.extname(source);
      var basename = Path.basename(source, ext);
      var targetDir = targetPath;
      var weexLoaderRoot = Path.join(__dirname, '../../node_modules');

      var plugins = []  // Assemble webpack plugins
      if (config.minify) {
        plugins.push(new Webpack.optimize.UglifyJsPlugin({
          minimize: true,
          compress: { warnings: false },
          output: { comments: false, ascii_only: true },
          test: /\.(js|xtpl)($|\?)/i
        }));
      }
      plugins.push(new Webpack.BannerPlugin(
        `// { "framework": "${ext2Name[ext]}" }\n`,
        { raw: true }
      ));

      var webpackConfig = {
        entry: source + '?entry=true',  // entry must be specified.
        output: {
          path: targetDir,
          filename: basename + '.js'
        },
        devtool: config.devtool ? 'source-map' : false,
        // devtool: config.devtool ? '#inline-source-map' : 'source-map',
        module: {
          loaders: [
            { test: /\.vue(\?[^?]+)?$/, loader: 'weex' },
            { test: /\.we(\?[^?]+)?$/, loader: 'weex' },
          ]
        },
        resolve: {
          alias: {
            'babel-runtime': loadModulePath('babel-runtime', 'core-js'),
            'babel-polyfill': loadModulePath('babel-polyfill')
          },
          extensions: ['', '.js', '.es6']
        },
        vue: {
          // ...
        },
        resolveLoader: {
          root: weexLoaderRoot
        },
        plugins: plugins
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
}
