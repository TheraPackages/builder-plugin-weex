'use babel';

import BuilderPluginWeexView from './builder-plugin-weex-view';
import { CompositeDisposable } from 'atom';
import BuilderServiceWebpack from './webpack/webpack-builder-service'
const Path = require('path');
const Fs = require('fs');
import TestEntry from './testdir/test-entry'

export default {

  builderPluginWeexView: null,
  modalPanel: null,
  subscriptions: null,
  proCfgService: null,
  buildService: null,

  activate(state) {
    this.builderPluginWeexView = new BuilderPluginWeexView(state.builderPluginWeexViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.builderPluginWeexView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'builder-plugin-weex:toggle': () => this.toggle(),
      'builder-plugin-weex:build-watch': () => this.buildWatch(),
      'builder-plugin-weex:build-debug': () => this.buildDebug(),
      'builder-plugin-weex:build-release': () => this.buildRelease(),
      'thera-project-service:file-changed': (event) => this.projectFileChanged(event.detail)
    }));

    // new TestEntry().run();
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.builderPluginWeexView.destroy();
  },

  serialize() {
    return {
      builderPluginWeexViewState: this.builderPluginWeexView.serialize()
    };
  },

  toggle() {
    console.log('BuilderPluginWeex was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  },

  /** Provide build service. */
  provideBuildService() {
    this.buildService = new BuilderServiceWebpack();
    return this.buildService;
  },

  /** Consume project config service. */
  consumeProjectConfigService(proCfgService) {
    console.log('Consume project config service.');
    this.proCfgService = proCfgService;
  },

  /** For test. */
  getTestSrc() {
    var root = atom.packages.resolvePackagePath('builder-plugin-weex');
    // var vueSrc = Path.join(root, 'lib/testdir/main.vue');
    var vueSrc = '/Users/xuqiulxq/github/guide/topen.vue';
    return vueSrc;
  },

  getProjectConfig() {
    return (this.proCfgService && this.proCfgService.getConfigs()) || {};
  },

  buildWatch() {

    var config = this.getProjectConfig();
    var watchConfig = {
      source: this.getTestSrc(),
      output: '',
      minify: false,
      sourcemap: true
    };
    this.buildService.buildWatch(watchConfig);
  },

  buildDebug() {

    var pConfig = this.getProjectConfig();
    if (!pConfig) {
      console.error('Project configuration is invalid!');
      return;
    }
    var config = {
      source: this.getTestSrc(),
      output: '',
      minify: false,
      sourcemap: true
    };

    console.log('Debug build mode with configuration:', config)
    this.buildWithConfig(config);
  },

  buildRelease() {
    var pConfig = this.getProjectConfig();
    if (!pConfig) {
      console.error('Project configuration is invalid!');
      return;
    }
    var config = {
      source: this.getTestSrc(),
      output: '',
      minify: true,
      sourcemap: false
    };
    console.log('Release build mode with configuration:', config)
    this.buildWithConfig(config);
  },

  buildWithConfig(config) {
    var self = this;
    this.buildService.build(config, config.source, config.output).then((result) => {
      console.log('Build success to: ' + result);
    }).catch((err) => {
      console.error('Build error !', err);
    });
  },

  /**
   * @param {Array<String>} changes
   */
  projectFileChanged(changes) {

    if (changes && changes.event === 'change' && changes.filePath) {
      console.log('Received file changed notification:', changes)
      var config = this.getProjectConfig();

      if (Path.basename(changes.filePath) === 'launch.json') {
        // launch.json
        this.buildDebug();

      } else if (/\.vue$/.test(changes.filePath) && /\.we$/.test(changes.filePath)) {
        // *.vue  *.we  recompile from the main entry.
        this.buildDebug()

      } else if (/\.js$/.test(changes.filePath)) {
        // *.js
        this.publishBuildResult('', changes.filePath);
      }
    }
  },

  publishBuildResult(sourceFile, filePath) {

    if (filePath) {
      console.log(`Begin publish ${filePath}`);
      Fs.readFile(filePath, function(err, content) {
        if (err) {
          console.error('Read publish file error: ', err);
          return;
        }

        var basename = Path.basename(filePath, '.js');
        atom.commands.dispatch(
          atom.views.getView(atom.workspace),
          "thera-builder:weex",
          {
            type: 'weex',
            name: basename + '.js',
            bundleUrl: filePath,
            fileName: Path.basename(sourceFile),
            logs: undefined,
            template: content.toString()
          }
        );
        console.log(`Success publish ${filePath}`);
      });
    }
  }
};
