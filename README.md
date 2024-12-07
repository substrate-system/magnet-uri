# magnet-uri
![tests](https://github.com/substrate-system/magnet-uri/actions/workflows/ci.yml/badge.svg)
[![types](https://img.shields.io/npm/types/@substrate-system/magnet-uri?style=flat-square)](README.md)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-blue?logo=semver&style=flat-square)](https://semver.org/)
[![Common Changelog](https://nichoth.github.io/badge/common-changelog.svg)](./CHANGELOG.md)
[![install size](https://flat.badgen.net/packagephobia/install/@substrate-system/magnet-uri)](https://packagephobia.com/result?p=@substrate-system/magnet-uri)
[![license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)

## Parse a magnet URI and return an object of keys/values.

Also works in the browser with [browserify](http://browserify.org/)! This module is used by [WebTorrent](http://webtorrent.io).

<details><summary><h2>Contents</h2></summary>

<!-- toc -->

- [install](#install)
- [usage](#usage)
  * [decode](#decode)
  * [encode](#encode)
- [license](#license)

<!-- tocstop -->

</details>

## install

```
npm i -S @substrate-system/magnet-uri
```

## Use

Import like normal

```js
import { encode, decode } from '@substrate-system/magnet-uri'
```

## API

### decode

Parse a magnet URI and return an object of keys/values.

```js
import { decode } from '@substrate-system/magnet-uri'

// "Leaves of Grass" by Walt Whitman
const uri = 'magnet:?xt=urn:btih:d2474e86c95b19b8bcfdb92bc12c9d44667cfa36&dn=Leaves+of+Grass+by+Walt+Whitman.epub&tr=udp%3A%2F%2Ftracker.example4.com%3A80&tr=udp%3A%2F%2Ftracker.example5.com%3A80&tr=udp%3A%2F%2Ftracker.example3.com%3A6969&tr=udp%3A%2F%2Ftracker.example2.com%3A80&tr=udp%3A%2F%2Ftracker.example1.com%3A1337'

const parsed = decode(uri)
console.log(parsed.dn) // "Leaves of Grass by Walt Whitman.epub"
console.log(parsed.infoHash) // "d2474e86c95b19b8bcfdb92bc12c9d44667cfa36"

```

The parsed magnet link object looks like this:

```js
  {
    "xt": "urn:btih:d2474e86c95b19b8bcfdb92bc12c9d44667cfa36",
    "dn": "Leaves of Grass by Walt Whitman.epub",
    "tr": [
      "udp://tracker.example1.com:1337",
      "udp://tracker.example2.com:80",
      "udp://tracker.example3.com:6969",
      "udp://tracker.example4.com:80",
      "udp://tracker.example5.com:80"
    ],

    // added for convenience:
    "infoHash": "d2474e86c95b19b8bcfdb92bc12c9d44667cfa36",
    "infoHashBuffer": ...,
    "name": "Leaves of Grass by Walt Whitman.epub",
    "announce": [
      "udp://tracker.example1.com:1337",
      "udp://tracker.example2.com:80",
      "udp://tracker.example3.com:6969",
      "udp://tracker.example4.com:80",
      "udp://tracker.example5.com:80"
    ]
  }
```

### encode

Convert an object of key/values into a magnet URI string.

```js
import { encode } from '@substrate-system/magnet-uri'

const uri = encode({
  xt: [
    'urn:ed2k:354B15E68FB8F36D7CD88FF94116CDC1',
    'urn:tree:tiger:7N5OAMRNGMSSEUE3ORHOKWN4WWIQ5X4EBOOTLJY',
    'urn:btih:QHQXPYWMACKDWKP47RRVIV7VOURXFE5Q'
  ],
  xl: '10826029',
  dn: 'mediawiki-1.15.1.tar.gz',
  tr: [
    'udp://tracker.openbittorrent.com:80/announce'
  ],
  as: 'http://download.wikimedia.org/mediawiki/1.15/mediawiki-1.15.1.tar.gz',
  xs: [
    'http://cache.example.org/XRX2PEFXOOEJFRVUCX6HMZMKS5TWG4K5',
    'dchub://example.org'
  ]
})

console.log(uri) // the magnet uri
```

The returned magnet uri will be:

```
magnet:?xt=urn:ed2k:354B15E68FB8F36D7CD88FF94116CDC1&xt=urn:tree:tiger:7N5OAMRNGMSSEUE3ORHOKWN4WWIQ5X4EBOOTLJY&xt=urn:btih:QHQXPYWMACKDWKP47RRVIV7VOURXFE5Q&xl=10826029&dn=mediawiki-1.15.1.tar.gz&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&as=http%3A%2F%2Fdownload.wikimedia.org%2Fmediawiki%2F1.15%2Fmediawiki-1.15.1.tar.gz&xs=http%3A%2F%2Fcache.example.org%2FXRX2PEFXOOEJFRVUCX6HMZMKS5TWG4K5&xs=dchub%3A%2F%2Fexample.org
```

You can also use convenience key names like `name` (`dn`), `infoHash` (`xt`),
`infoHashBuffer` (`xt`), `publicKey` (`xs`), `publicKeyBuffer` (`xs`), `announce` (`tr`), and `keywords` (`kt`).

## license

MIT. Copyright (c) [Feross Aboukhadijeh](https://feross.org) and [WebTorrent, LLC](https://webtorrent.io).
