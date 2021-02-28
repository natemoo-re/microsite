import { createGlobalStyles } from 'goober/global';

const Global = createGlobalStyles`
  * {
    box-sizing: border-box;
    margin: 0;
  }

  :root {
    font-family: system-ui;
  }

  html, body {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(133.33deg, #F4F4F4 25%, #FFFFFF 115%);
  }

  @media (prefers-color-scheme: dark) {
    :root {
      color: white;
    }
    html, body {
      background: linear-gradient(133.33deg, #2F333E 25%, rgba(55, 59, 70, 0) 115%), #181A1F;
    }
  }

  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  p {
    font-size: 1.5em;
  }
`

export default Global;
