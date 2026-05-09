import { spawn } from 'node:child_process';

const url = 'https://3000-ibhiqf4egke1mzoe64d3i-ab353b9c.us2.manus.computer/?navdiag=1';
const port = 9333;
const chrome = spawn('chromium', [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--disable-cache',
  '--force-device-scale-factor=1',
  '--window-size=390,844',
  `--remote-debugging-port=${port}`,
  url,
], { stdio: ['ignore', 'ignore', 'ignore'] });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJsonEndpoint() {
  for (let i = 0; i < 50; i += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const pages = await response.json();
      const page = pages.find((entry) => entry.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      await sleep(100);
    }
  }
  throw new Error('Unable to connect to Chromium DevTools endpoint.');
}

function cdp(ws, method, params = {}) {
  const id = cdp.nextId = (cdp.nextId || 0) + 1;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => {
    const onMessage = (event) => {
      const data = JSON.parse(event.data.toString());
      if (data.id !== id) return;
      ws.removeEventListener('message', onMessage);
      if (data.error) reject(new Error(JSON.stringify(data.error)));
      else resolve(data.result);
    };
    ws.addEventListener('message', onMessage);
  });
}

try {
  const wsUrl = await getJsonEndpoint();
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  await cdp(ws, 'Page.enable');
  await cdp(ws, 'Runtime.enable');
  await sleep(2500);
  const result = await cdp(ws, 'Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const button = document.querySelector('button[aria-label="Open primary navigation menu"]');
      const header = document.querySelector('header');
      const btnRect = button?.getBoundingClientRect();
      const headerRect = header?.getBoundingClientRect();
      const style = button ? getComputedStyle(button) : null;
      return {
        location: window.location.href,
        innerWidth: window.innerWidth,
        outerWidth: window.outerWidth,
        documentClientWidth: document.documentElement.clientWidth,
        bodyScrollWidth: document.body.scrollWidth,
        buttonExists: Boolean(button),
        buttonText: button?.textContent?.trim() ?? null,
        buttonClass: button?.getAttribute('class') ?? null,
        buttonDisplay: style?.display ?? null,
        buttonPosition: style?.position ?? null,
        buttonRight: style?.right ?? null,
        buttonTop: style?.top ?? null,
        buttonRect: btnRect ? { x: btnRect.x, y: btnRect.y, width: btnRect.width, height: btnRect.height, right: btnRect.right } : null,
        headerRect: headerRect ? { x: headerRect.x, y: headerRect.y, width: headerRect.width, height: headerRect.height, right: headerRect.right } : null,
      };
    })()`,
  });
  console.log(JSON.stringify(result.result.value, null, 2));
  ws.close();
} finally {
  chrome.kill('SIGTERM');
}
