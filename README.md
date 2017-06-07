# builder-plugin-weex package

Build weex project created by thera into runnable bundle.

### Build debug/release version

This package provides two build production (debug and release) for weex project in thera IDE. In debug version, debug code will be added to the output bundle.js for the purpose of debugging. While release bundle.js tries to be clean to improve the running performance. Additionally minify trick can be applied to build more compact output bundle.

### Config build types

```
buildTypes: {
  debug: {
    ...
  },
  release: {
    ...
  }
}
```
