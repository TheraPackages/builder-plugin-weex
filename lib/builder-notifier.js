'use babel'

class BuilderNotifier {

  constructor() {

  }

  push(data) {
    atom.commands.dispatch(atom.views.getView(atom.workspace), "thera-builder:push", data);
  }
}

module.exports = new BuilderNotifier();
