# Engines

Microsite is an **ESM node package** which requires a Node environment that supports ESM.

We officially support the latest version of [`node` v12 LTS (Erbium)](https://nodejs.org/download/release/latest-v12.x/) and [`node` v14 LTS (Fermium)](https://nodejs.org/download/release/latest-v14.x/).

## Setup Guide

There are many different tools to manage `node` versions. While [`nvm`](https://github.com/nvm-sh/nvm) is among the most popular, we really love the speed and simplicity of [`volta`](https://volta.sh/) and highly recommend it!

The following guides assume that you have [installed `volta`](https://docs.volta.sh/guide/getting-started) or [installed `nvm`](https://github.com/nvm-sh/nvm#install--update-script).

**Volta**
Inside of your Microsite project, run the following command:

```shell
volta pin node@lts
```

**NVM**
Inside of your Microsite project, run the following commands:

```shell
echo "lts/*" > .nvmrc
nvm use
```
