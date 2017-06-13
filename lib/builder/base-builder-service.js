'use babel'

export default class BaseBuilderService {

  constructor() {
    console.log('Construct builder service.');
  }

  build(config, source, outputDir) {
    console.log('Command build.');
  }
}
