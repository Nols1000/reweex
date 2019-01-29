# reweex

[![Build Status](https://img.shields.io/travis/nols1000/reweex.svg?style=flat-square)](https://travis-ci.org/Nols1000/reweex)
[![NPM Version](https://img.shields.io/npm/v/reweex.svg?style=flat-square)](https://www.npmjs.com/package/reweex)

reweex is a redux wrapper for webextensions. It uses the messaging system of the webextension-API to make redux stores available in all parts of a webextension.

## Installation

Use the package manager [npm](https://www.npmjs.com/get-npm) to install `reweex`.

```bash
npm install reweex
```

## Usage

First initialize a store-server in the background script:

```typescript
const store = createStoreServer(reducers);
```

Then initialize a store-proxy in any content-script or popup you would like to use redux:

```typescript
async function initApp() {
    const store = createStoreProxy();
}

initApp()
```

## Built With
- [Typescript](https://www.typescriptlang.org/) - programming language
- [webpack](https://webpack.js.org/) - module bundler
- [Redux](https://redux.js.org/) - predictable state container

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/nols1000/reweex/tags).

## Authors
- **Nils-Börger Margotti** - *Maintainer* - [Nols1000](https://github.com/nols1000)

## License
This project is licensed under the GPLv3 License - see the [LICENSE](LICENSE)-file for details

## Acknowledgments
- [Alexander Ivantsov](https://github.com/ivantsov) for his [redux-webext](https://github.com/ivantsov/redux-webext)-library