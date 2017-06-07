'use babel'

import BuilderService from './../builder/builder-service'

export default class BuilderServiceWebpack extends BuilderService {

  constructor() {
    super();
    this.name = 'weex';
  }

  buildDebug() {
    super.buildDebug();
  }

  buildRelease() {
    super.buildRelease();
  }

  watch() {
    super.watch();
  }
}
