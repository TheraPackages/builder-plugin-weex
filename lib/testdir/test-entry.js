'use babel'

import BuilderServiceWebpack from './../webpack/webpack-builder-service'
var Path = require('path');

export default class TestEntry {

  constructor() {
    this.buildService = new BuilderServiceWebpack();
  }

  run() {
    this.runpack();
  }

  runpack() {
    var root = atom.packages.resolvePackagePath('builder-plugin-weex');
    var weSrc = Path.join(root, 'lib/testdir/main.we');
    var vueSrc = Path.join(root, 'lib/testdir/main.vue');

    // this.buildService.transform(weSrc).then((res) => {
    //   console.log(res);
    // }).catch((err) => {
    //   console.error(err);
    // });

    var debugConfig = {
      source: vueSrc,
      output: '',
      minify: false,
      sourcemap: true
    };
    this.buildService.buildDebug(debugConfig).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.error(err);
    });

    // var releaseConfig = {
    //   source: vueSrc,
    //   output: '',
    //   minify: true,
    //   sourcemap: false
    // };
    // this.buildService.buildRelease(releaseConfig).then((res) => {
    //   console.log(res);
    // }).catch((err) => {
    //   console.error(err);
    // });
  }
}
