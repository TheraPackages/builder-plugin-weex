'use babel'

import BaseBuilderService from './../builder/base-builder-service';
import WebpackBuilderImpl from './webpack-builder-impl';
var Fs = require('fs');

export default class WebpackBuilderService extends BaseBuilderService {

  constructor() {
    super();
    this.name = 'weex';
    this.builder = new WebpackBuilderImpl();
    this.proConfigService = null;
  }

  /**
   * Set project configuration service.
   * @Param {Object} service
   * Apis: Promise getConfig()
   */
  setProjectConfigService(service) {
    this.proConfigService = service;
  }

  /**
   * Async get project configuration.
   * @Param {Function} callback(err, configObject)
   */
  getProjectConfig(callback) {
    if (!callback) {
      return;
    }
    if (this.proConfigService) {
      this.proConfigService.getConfig()
        .then((configs) => {
          callback(null, configs);
        }).catch((err) => {
          callback(err || 'Error', null);
        })
    } else {
      callback('Project config service not exists.', null);
    }
  }

  /**
   * Query project config service to guide build.
   * @Param {string} buildType debug/release/undefined
   */
  build(buildType) {

    var self = this;
    this.getProjectConfig((err, proConfigs) => {
      if (err) {
        console.error('Error while get project configs: ', err);
      } else if (!proConfigs) {
        console.error('Project configuration is empty.');
      } else {
        self._dispatchBuild(proConfigs, buildType);
      }
    });
  }

  /**
    @Param {String} buildType
    @Param {Object} proConfigs
    proConfigs: {
      build: {
        apply: 'debug',
        types: {
          debug: {
            minify: false,
            sourcemap: true
          },
          release: {
            minify: false,
            sourcemap: true
          }
        }
      }
    }
  */
  _dispatchBuild(proConfigs, buildType) {

    // Basic build configs.
    var buildConfig = {
      buildType: 'debug',
      source: proConfigs.main,
      output: proConfigs.transformPath
    }
    if (!Fs.existsSync(buildConfig.source)) {
      console.error('Entry file not exists: ', buildConfig.source);
      return;
    }

    // Apply custom configs.
    var build = proConfigs.build || {};

    if (buildType === 'release' || build.apply === 'release') {
      // Build release version
      buildConfig.buildType = 'release';
      buildConfig.minify = build.types && build.types.release && build.types.release.minify ? true : false;
      buildConfig.sourcemap = build.types && build.types.release && build.types.release.sourcemap ? true : false;

    } else if (buildType === 'debug' || build.apply === 'debug' || true) {
      // Build debug version. // Use default configuration to build debug version.
      buildConfig.buildType = 'debug';
      buildConfig.minify = build.types && build.types.debug && build.types.debug.minify ? true : false;
      buildConfig.sourcemap = build.types && build.types.debug && build.types.debug.sourcemap ? true : false;
    }

    this._buildWithConfigs(buildConfig);
  }

  _buildWithConfigs(configs) {
    var self = this;
    this.builder.build(configs, configs.source, configs.output).then((result) => {
      console.log('Build success to: ' + result);
    }).catch((err) => {
      console.error('Build error !', err);
    });
  }

  /** For test. */
  getTestSrc() {
    var root = atom.packages.resolvePackagePath('builder-plugin-weex');
    // var vueSrc = Path.join(root, 'lib/testdir/main.vue');
    var vueSrc = '/Users/xuqiulxq/github/guide/topen.vue';
    return vueSrc;
  }
}
