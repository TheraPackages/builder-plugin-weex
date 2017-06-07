'use babel';

import BuilderPluginWeexView from './builder-plugin-weex-view';
import { CompositeDisposable } from 'atom';

export default {

  builderPluginWeexView: null,
  modalPanel: null,
  subscriptions: null,

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
      'builder-plugin-weex:toggle': () => this.toggle()
    }));
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
  }

};
