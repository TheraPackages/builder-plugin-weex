'use babel';

import BuilderPluginWeexView from './builder-plugin-weex-view';
import { CompositeDisposable } from 'atom';
import WebpackBuilderService from './webpack/webpack-builder-service'
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
      // For self package test.
      'builder-plugin-weex:build-debug': () => { this.buildService.build('debug'); },
      'builder-plugin-weex:build-release': () => { this.buildService.build('release'); },
      // Auto build when file updated.
      'thera-project-service:file-changed': (event) => this.projectFileChanged(event.detail)
    }));

    this.buildService = new WebpackBuilderService();

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
    console.log('Provide weex build service.')
    return this.buildService;
  },

  /** Consume project config service. */
  consumeProjectConfigService(proCfgService) {
    console.log('Consume project config service.');
    this.proCfgService = proCfgService;
    this.buildService.setProjectConfigService(proCfgService);
  },

  /**
   * @param {Array<String>} changes
   */
  projectFileChanged(changes) {

    if (changes && changes.event === 'change' && changes.filePath) {
      console.log('Received file changed notification:', changes)

      if (Path.basename(changes.filePath) === 'launch.json') {
        // launch.json
        this.buildService.build('debug');

      } else if (/\.vue$/.test(changes.filePath) || /\.we$/.test(changes.filePath)) {
        // *.vue  *.we  recompile from the main entry.
        this.buildService.build('debug');

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
          "thera-builder:push",
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
