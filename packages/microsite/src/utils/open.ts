// Sourced from Snowpack
// https://github.com/snowpackjs/snowpack/blob/2cbbdbbad1c4f842f86ff56d19f86afedf07d2e2/snowpack/src/util.ts#L156:L227

/*
 *  MIT License
 *
 *  Copyright (c) 2019 Fred K. Schott
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */
import open from "open";
import execa from "execa";
import { join } from "path";

const cwd = process.cwd();

const appNames = {
  win32: {
    brave: "brave",
    chrome: "chrome",
  },
  darwin: {
    brave: "Brave Browser",
    chrome: "Google Chrome",
  },
  linux: {
    brave: "brave",
    chrome: "google-chrome",
  },
};

async function openInExistingChromeBrowser(url: string) {
  // see if Chrome process is open; fail if not
  await execa.command('ps cax | grep "Google Chrome"', {
    shell: true,
  });
  // use open Chrome tab if exists; create new Chrome tab if not
  const openChrome = execa(
    `osascript ${join(
      "node_modules",
      "microsite",
      "assets",
      "openChrome.appleScript"
    )} "${encodeURI(url)}"`,
    {
      cwd,
      stdio: "ignore",
      shell: true,
    }
  );
  // if Chrome doesn’t respond within 3s, fall back to opening new tab in default browser
  let isChromeStalled = setTimeout(() => {
    openChrome.cancel();
  }, 3000);
  try {
    await openChrome;
  } catch (err) {
    console.error(err);
    if (err.isCanceled) {
      console.warn(
        `Chrome not responding to Snowpack after 3s. Opening in new tab.`
      );
    } else {
      console.error(err.toString() || err);
    }
    throw err;
  } finally {
    clearTimeout(isChromeStalled);
  }
}
export async function openInBrowser(
  protocol: string,
  hostname: string,
  port: number,
  basePath: string,
  browser: string
): Promise<void> {
  if (process.env.BROWSER === 'false') {
    return;
  }
  const url = `${protocol}//${hostname}:${port}${basePath.replace(/\/$/, '')}`;
  browser = /chrome/i.test(browser)
    ? appNames[process.platform]["chrome"]
    : /brave/i.test(browser)
    ? appNames[process.platform]["brave"]
    : browser;
  const isMac = process.platform === "darwin";
  const isBrowserChrome = /chrome|default/i.test(browser);
  if (!isMac || !isBrowserChrome) {
    await (browser === "default" ? open(url) : open(url, { app: browser }));
    return;
  }

  try {
    // If we're on macOS, and we haven't requested a specific browser,
    // we can try opening Chrome with AppleScript. This lets us reuse an
    // existing tab when possible instead of creating a new one.
    await openInExistingChromeBrowser(url);
  } catch (err) {
    // if no open Chrome process, just go ahead and open default browser.
    await open(url);
  }
}
