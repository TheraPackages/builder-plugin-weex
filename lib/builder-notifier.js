'use babel'

class BuilderNotifier {

  constructor() {

  }

  /** Push data object to app via preview server. */
  pushBuildResult(data) {
    atom.commands.dispatch(atom.views.getView(atom.workspace), "thera-builder:push", data);
  }

  /** Notify message on widget */
  notifyBuildSuccess(logObj) {
    atom.commands.dispatch(atom.views.getView(atom.workspace),
      'thera-live-server:transformed',
      { 'message': 'transformSuccessNotify', 'data': { 'logs': logObj } }
    );
  }

  notifyBuildFailed(err) {
    atom.commands.dispatch(atom.views.getView(atom.workspace),
      'thera-live-server:transformed',
      { 'message': 'transformFailedNotify', 'data': { 'error': err } }
    );
  }

  /** Write build log console-panel#device */
  writeBuildSuccessLog(log) {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'server:log', [this.stringify(log), 'log']);
  }

  writeBuildFailedLog(errLog) {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'server:log', [this.stringify(errLog), 'error']);
  }

  stringify(object) {
    if (object instanceof String) {
      return object;
    } else if (object) {
      return JSON.stringify(object);
    } else {
      return '';
    }
  }
}

module.exports = new BuilderNotifier();
