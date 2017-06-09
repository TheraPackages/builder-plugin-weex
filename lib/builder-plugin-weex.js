'use babel';

import BuilderPluginWeexView from './builder-plugin-weex-view';
import { CompositeDisposable } from 'atom';
import BuilderServiceWebpack from './webpack/webpack-builder-service'
const Path = require('path');
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
      'tree-view-project:update': (event) => this.projectUpdate(event.detail)
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
    var vueSrc = Path.join(root, 'lib/testdir/main.vue');
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

    var config = this.getProjectConfig();
    var debugConfig = {
      source: this.getTestSrc(),
      output: '',
      minify: false,
      sourcemap: true
    };

    this.buildService.buildDebug(debugConfig).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.error(err);
    });
  },

  buildRelease() {

    var config = this.getProjectConfig();
    var releaseConfig = {
      source: this.getTestSrc(),
      output: '',
      minify: true,
      sourcemap: false
    };

    this.buildService.buildRelease(releaseConfig).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.error(err);
    });
  },

  /**
   * @param {Array<String>} changes
   */
  projectUpdate(changes) {
    console.log('Received project changes:', changes)
    var config = this.getProjectConfig();
    // launch.json

    // *.vue

    // *.js
  }
};
