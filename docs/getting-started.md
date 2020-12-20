# Getting Started

The documentation for Microsite is still in progress. If you have any questions at all, please consider posting on [GitHub Discussions](https://github.com/natemoo-re/microsite/discussions).

## System Requirements
- [Node.js 12.19](https://nodejs.org/en/) or later
- MacOS, Windows (including WSL), or Linux

## Setup
The easiest way to create a new Microsite project is to use `create-microsite`. It will set up everything automatically for you. To create a project, run:

```
npm init microsite <project-name>
```

## Manual Setup

Install `microsite` and `preact` in your project:

```
npm install microsite preact
```

Open `package.json` and add the following `scripts`:

```json
"scripts": {
  "start": "microsite",
  "build": "microsite build",
  "serve": "microsite serve"
}
```

These scripts are based on common patterns in the Node ecosystem:

- `start` - Runs `microsite dev` which starts Microsite in development mode
- `build` - Runs `microsite build` which builds your project for production
- `serve` - Runs `microsite serve` which serves the ouput of `microsite build`. As a shortcut, both steps can be called using `microsite build --serve`.

Microsite is structured around the concept of pages. A page is a Preact component exported from a `.jsx` or `.tsx` file in the `src/pages` directory.

Pages will generate a corresponding HTML file based on the file name. For example `src/pages/about.tsx` will be output as `/about.html`.

Create a `src` directory inside your project and a `pages` directory inside of `./src/`. Let's create your first page by adding the following to `./src/pages/index.tsx`.

```tsx
import { FunctionComponent } from 'preact';

const HomePage: FunctionComponent = () => {
  return <div>Welcome to Microsite!</div>
}

export default HomePage;
```

Optionally, you may create a `public` directory in the project root (`./public`) to serve any static assets.

To start developing your project, run `npm start`. This will automatically open the development server on `http://localhost:8888`.

We already have some incredible features up and running:
- Automatic compilation and bundling (powered by [Snowpack](https://snowpack.dev) and [esbuild](https://esbuild.github.io/))
- Stateful HMR (powered by [Prefresh](https://github.com/JoviDeCroock/prefresh))
- Static generation of files in `./src/pages/`
- Static file serving. `./public/` is mapped to `/`
