'use babel'

const BuilderNotifier = require('./../builder-notifier');
import BaseBuilderService from './../builder/base-builder-service';
// import WebpackBuilderImpl from './webpack-builder-impl';
import WebpackBuilderOfficialImpl from './webpack-builder-official-impl';
var Fs = require('fs');

export default class WebpackBuilderService extends BaseBuilderService {

  constructor() {
    super();
    this.name = 'weex';
    // this.builder = new WebpackBuilderImpl();
    this.builder = new WebpackBuilderOfficialImpl();
    this.projectConfigService = null;
    this.cachedProjectConfigs = null;
  }

  /**
   * Set project configuration service.
   * @Param {Object} service
   * Apis: Promise getConfig()
   */
  setProjectConfigService(service) {
    this.projectConfigService = service;
  }

  /** Async read project config from service and cache it locally. */
  updateProjectConfig(callback) {
    if (this.projectConfigService) {
      var self = this;
      this.projectConfigService.getConfig()
        .then((configs) => {
          self.cachedProjectConfigs = configs;  // Cache config object
          callback(null, configs);
        }).catch((err) => {
          self.cachedProjectConfigs = null;
          callback(err || new Error(), null);
        });
    } else {
      callback('Project config service not exists.', null);
    }
  }

  /**
   * Get cached local project configuration object. If cached object is null, try to read from service.
   * @Param {Function} callback(err, configObject)
   */
  getProjectConfig(callback) {
    if (!callback) {
      return;
    }
    if (this.cachedProjectConfigs) {
      callback(null, this.cachedProjectConfigs);
    } else {
      this.updateProjectConfig(callback);
    }
  }

  /**
   * Query project config service to guide build.
   * @Param {string} buildType debug/release/undefined
   */
  build(buildType) {

    var self = this;
    this.getProjectConfig((err, pConfigs) => {
      if (err) {
        console.error('Error while get project configs: ', err);
      } else if (!pConfigs) {
        console.error('Project configuration is empty.');
      } else if (pConfigs.type === 'weex') {  // Only accept weex project.
        // Specify build type explicitly.
        if (pConfigs.build && buildType) {
          pConfigs.build.apply = 'debug';
        }
        self._dispatchBuild(pConfigs);
      } else {
        console.log('Project type: ' + pConfigs.type);
      }
    });
  }

  /**
    @Param {String} buildType
    @Param {Object} pConfigs
    pConfigs: {
      build: {
        apply: 'debug',
        types: {
          debug: {
            minify: false,
            web: false,
            devtool: "source-map"
          },
          release: {
            minify: false,
            web: false,
            devtool: false
          }
        }
      }
    }
  */
  _dispatchBuild(pConfigs) {

    // Basic build configs.
    var buildOptions = {
      buildType: 'debug',
      source: pConfigs.main,
      output: pConfigs.transformPath
    }
    if (!Fs.existsSync(buildOptions.source)) {
      console.error('Entry file not exists: ', buildOptions.source);
      return;
    }

    // Apply custom configs.
    var build = pConfigs.build || {};

    if (build.apply === 'release') {
      // Build release version
      buildOptions.buildType = 'release';
      buildOptions.minify = build.types && build.types.release && build.types.release.minify ? true : false;
      buildOptions.devtool = build.types && build.types.release && build.types.release.devtool ? build.types.release.devtool : null;

    } else if (build.apply === 'debug' || true) {
      // Build debug version. // Use default configuration to build debug version.
      buildOptions.buildType = 'debug';
      buildOptions.minify = build.types && build.types.debug && build.types.debug.minify ? true : false;
      buildOptions.devtool = build.types && build.types.debug && build.types.debug.devtool ? build.types.debug.devtool : null;
    }

    this._buildWithConfigs(buildOptions);
  }

  _buildWithConfigs(configs) {
    var self = this;
    this.builder.build(configs, configs.source, configs.output).then((result) => {
      console.log('Build success to: ' + result);
      self.sendBuildSuccessNotify([]);
    }).catch((err) => {
      console.error('Build error !', err);
      this.sendBuildFailedNotify(err);
    });
  }

  sendBuildSuccessNotify(logObj) {
    // Notify package host.
    atom.commands.dispatch(atom.views.getView(atom.workspace),
      'thera-live-server:transformed',
      { 'message': 'transformSuccessNotify', 'data': { 'logs': logObj } }
    );
    // Notify app via later build.js changes.
  }

  sendBuildFailedNotify(err) {
    // Notify package host.
    atom.commands.dispatch(atom.views.getView(atom.workspace),
      'thera-live-server:transformed',
      { 'message': 'transformFailedNotify', 'data': { 'error': err } }
    );
    // Notify app the error
    BuilderNotifier.push({
      name: '',
      type: 'weex',
      template: '',
      logs: this.filterLogs(err, 'ERROR'),
      fileName: '',
      bundleUrl: ''
    });
  }

  filterLogs(logs, logLevel) {
      if (!(logs instanceof Array)) {return logs;}

      logLevel = logLevel ? logLevel.toUpperCase() : 'NOTE'
      var logLevels = ['OFF', 'ERROR', 'WARNING', 'NOTE']
      if (logLevel === 'ALL' || logLevels.indexOf(logLevel) === -1) {
          logLevel = 'NOTE'
      }
      var specifyLevel = logLevels.indexOf(logLevel)

      return logs.filter(function (log) {
          var curLevel = logLevels.indexOf(log.reason.match(/^(ERROR|WARNING|NOTE): /)[1])
          return curLevel <= specifyLevel
      })
  }

  /** For test. */
  getTestSrc() {
    var root = atom.packages.resolvePackagePath('builder-plugin-weex');
    // var vueSrc = Path.join(root, 'lib/testdir/main.vue');
    var vueSrc = '/Users/xuqiulxq/github/guide/topen.vue';
    return vueSrc;
  }
}
