# Webpack Boilerplate TS

Minimalistic Webpack + TS + SCSS Scaffolding.
With preconfigured TypeScript (TS), Sass (SCSS).

## Setup
1. [Download ZIP and unpack](https://github.com/mykhailo-petrenko/webpack-boilerplate/archive/refs/heads/master.zip). Or clone and remove `.git` folder.
2. Rename project in `package.json`
3. `yarn install`
4. `yarn start`

## File sctucture
* `src` - Sources
  * `template.html` - entry html page.
  * `index.ts` - entry (main) typescript file.
  * `styles` - SCSS styles
* `config`
  * `.babelrc` - Babel config
  * `webpack.*.js` - webpack configuration
  * `path.js` - paths to src, public and build folders
* `public` - folder to keep static files. They will be copied to build directory while build.
* `typings` - folder to keep TypeScript types definition.
* `tsconfig.json` - TypeScript config
