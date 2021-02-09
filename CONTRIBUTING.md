# Contributing

Hello and welcome! Thank you for considering contributing to this Github Action. Before forking the repo, please try submitting an issue to gather support and inform other contributors who can provide assistance. Otherwise, please use this document to understand local environment setup and developing the plugin further.

## Development Setup

This project is built using **Typescript** with decorators enabled. That being said, you can simply run the following to install all neccessary dependencies:

```
npm install
```

You can test locally using the `./example` project and using the [`act`](https://github.com/nektos/act) CLI tool.

## Publishing

Before publishing this as a Github Action, you have to make sure to check in the compiled code (i.e. `./dist`) into the repo. At the time of writing this, Github does not run any preflight requests for compiling actions.

The compiled code is done using [`ncc`](https://www.npmjs.com/package/@zeit/ncc) - *a compiler to generate single file executables*. The command below achieves this:

```
npm run build
```

Then simply follow the instructions listed via Github on how to [publish actions to Marketplace](https://docs.github.com/en/actions/creating-actions/publishing-actions-in-github-marketplace).
