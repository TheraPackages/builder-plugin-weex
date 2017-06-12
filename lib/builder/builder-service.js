'use babel'

export default class BuilderService {

  constructor() {
    console.log('Construct builder service.');
  }

  build(config, source, outputDir) {
    console.log('Command build.');
  }

  buildWatch() {
    console.log('Command watch.');
  }
}
