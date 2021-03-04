// @ts-nocheck
import puppeteer from "puppeteer";
import lighthouse from "lighthouse";
import { createServer } from "http";
import sirv from "sirv";
import { URL } from "url";

// const Good3G = {
//     'offline': false,
//     'downloadThroughput': 1.5 * 1024 * 1024 / 8,
//     'uploadThroughput': 750 * 1024 / 8,
//     'latency': 40
// };

const phone = puppeteer.devices["Nexus 5X"];

// async function calcVitals() {
//     var script = document.createElement('script');
//     script.src = 'https://unpkg.com/web-vitals';
//     function report(metric) {
//         if (!window.vitals) window.vitals = {};
//         window.vitals[metric.name] = metric.value;
//         console.log(metric.name, metric.value);
//     }
//     script.onload = function() {
//         webVitals.getTTFB(report, true);
//         webVitals.getFCP(report, true);
//         webVitals.getCLS(report, true);
//         webVitals.getLCP(report, true);
//     }
//     await new Promise((resolve) => {
//         if (document.readyState != 'loading') {
//             resolve();
//         } else {
//             document.addEventListener('DOMContentLoaded', resolve, { once: true });
//         }
//     })

//     document.head.appendChild(script);
// }

export default async function getVitals(assetPath) {
  const PORT = 3001;
  const handler = sirv(assetPath);

  const server = createServer((req, res) => {
    handler(req, res, () => {
      res.statusCode = 404;
      res.end("");
    });
  }).listen(PORT);

  const url = `http://localhost:${PORT}`;
  const vitals = await extractVitals(url);

  server.close();
  return vitals;
}

export async function extractVitals(url) {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    timeout: 10000,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    const client = await page.target().createCDPSession();

    await client.send("Network.enable");
    await client.send("ServiceWorker.enable");

    await page.emulate(phone);
    await page.goto(url);

    const { lhr } = await lighthouse(
      url,
      {
        port: new URL(browser.wsEndpoint()).port,
        output: "json",
      },
      {
        extends: "lighthouse:default",
        settings: {
          onlyAudits: [
            "first-meaningful-paint",
            "speed-index",
            "first-cpu-idle",
            "interactive",
          ],
        },
      }
    );

    browser.close();

    return Object.values(lhr.audits);
  } catch (error) {
    console.log(error);
    browser.close();
  }
}
