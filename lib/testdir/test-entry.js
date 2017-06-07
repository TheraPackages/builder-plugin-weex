'use babel'

import BuilderServiceWebpack from './../webpack/webpack-builder-service'
var Path = require('path');

export default class TestEntry {

  constructor() {
    this.packService = new BuilderServiceWebpack();
  }

  run() {
    this.runpack();
  }

  runpack() {
    var weSrc = Path.join(__dirname, '../testdir/main.we');
    var vueSrc = Path.join(__dirname, '../testdir/main.vue');

    // this.packService.transform(weSrc).then((res) => {
    //   console.log(res);
    // }).catch((err) => {
    //   console.error(err);
    // });

    // this.packService.buildDebug({min: false}, vueSrc, '').then((res) => {
    //   console.log(res);
    // }).catch((err) => {
    //   console.error(err);
    // });

    this.packService.buildRelease({min: true}, vueSrc, '').then((res) => {
      console.log(res);
    }).catch((err) => {
      console.error(err);
    });
  }
}
