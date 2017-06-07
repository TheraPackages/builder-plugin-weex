'use babel'

export default class BuilderService {

  constructor() {
    console.log('Construct builder service.');
  }

  buildDebug() {
    console.log('Command building debug output.');
  }

  buildRelease() {
    console.log('Command building release output.');
  }

  watch() {
    console.log('Command watch.')
  }
}
