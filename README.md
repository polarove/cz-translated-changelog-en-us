# cz-translated-changelog-en-us

> [!TIP]
> cz-conventional-changelog with two more features

[![npm version](https://img.shields.io/npm/v/@cz-translated-changelog/en-us.svg?style=flat-square)](https://www.npmjs.com/package/@cz-translated-changelog/en-us) [![npm downloads](https://img.shields.io/npm/dm/@cz-translated-changelog/en-us.svg?style=flat-square)](http://npm-stat.com/charts.html?package=@cz-translated-changelog/en-us&from=2024-03-16)

## standards

- reference to: [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)

- uses `!` to mark `BREAKING CHANGES`

- types and options are forked from `cz-conventional-changelog`

## Demostrate

![演示](https://raw.githubusercontent.com/polarove/cz-translated-changelog-en-us/master/assets/demo.gif)

## New features

🚀 a prompt window that allows you to check your message in summary

![新功能](https://raw.githubusercontent.com/polarove/cz-translated-changelog-en-us/master/assets/confirm-prompt.png)

✨ adds `!` to your messages automatically and mark it as `BREAKING CHANGES`

![新功能](https://raw.githubusercontent.com/polarove/cz-translated-changelog-en-us/master/assets/exclamation-mark.png)

## Get started

> [!NOTE]
> Before you start, please confirm that you have installed [commitizen](https://github.com/commitizen/cz-cli)

**install it as a devDependency for you projects**

```sh
npm i @cz-translated-changelog/en-us -D
```

Copy the json below into your `package.json`

```json
{
  "config": {
    "commitizen": {
      "showConfirmPrompt": true,
      "path": "node_modules/@cz-translated-changelog/en-us"
    }
  }
}
```

**or use it as a global package**

```sh [npm]
commitizen init @cz-translated-changelog/en-us --save-dev --save-exact
```

Copy the json below into your `package.json`

```json
{
  "config": {
    "commitizen": {
      "showConfirmPrompt": true,
      "path": "@cz-translated-changelog/en-us"
    }
  }
}
```

set `"config.commitizen.showConfirmPrompt": false` in your `package.json` to disable this feature.

## ENV_VARIABLES

these environment variables are used to override configs，including config insde your `package.json`.

- CZ_TYPE = defaultType
- CZ_SCOPE = defaultScope
- CZ_SUBJECT = defaultSubject
- CZ_BODY = defaultBody
- CZ_MAX_HEADER_WIDTH = maxHeaderWidth
- CZ_MAX_LINE_WIDTH = maxLineWidth

## Commitlint

If using the [commitlint](https://github.com/conventional-changelog/commitlint) js library, the "maxHeaderWidth" configuration property will default to the configuration of the "header-max-length" rule instead of the hard coded value of 100. This can be ovewritten by setting the 'maxHeaderWidth' configuration in package.json or the CZ_MAX_HEADER_WIDTH environment variable.
