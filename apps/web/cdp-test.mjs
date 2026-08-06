import http from "node:http";

function getJson(path) {
  return new Promise((resolve, reject) => {
    http
      .get({ host: "localhost", port: 9222, path }, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

function putJson(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: "localhost", port: 9222, path, method: "PUT" },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const url = process.env.URL || "http://localhost:5174/passenger";
  const waitMs = parseInt(process.env.WAIT || "16000", 10);

  let target;
  try {
    target = await putJson("/json/new?" + encodeURIComponent(url));
  } catch (e) {
    target = await getJson("/json/new?" + encodeURIComponent(url));
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let msgId = 0;
  const pending = new Map();
  const events = [];

  ws.addEventListener("message", (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    } else if (m.method) {
      events.push(m);
    }
  });

  await new Promise((r) => ws.addEventListener("open", r));

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = ++msgId;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send("Runtime.enable");
  await send("Page.enable");
  if (process.env.LAT && process.env.LNG) {
    const lat = parseFloat(process.env.LAT);
    const lng = parseFloat(process.env.LNG);
    await send("Page.addScriptToEvaluateOnNewDocument", {
      source: `
        (function () {
          var cb = function (success, error) {
            success({ coords: {
              latitude: ${lat}, longitude: ${lng}, accuracy: 20,
              altitude: null, altitudeAccuracy: null, heading: null, speed: null,
            } });
          };
          if (navigator.geolocation === undefined) {
            Object.defineProperty(navigator, "geolocation", { value: { getCurrentPosition: cb }, configurable: true });
          } else {
            navigator.geolocation.getCurrentPosition = cb;
          }
        })();
      `,
    });
  } else if (process.env.GEO === "deny") {
    await send("Page.addScriptToEvaluateOnNewDocument", {
      source: `
        navigator.geolocation.getCurrentPosition = function (s, e) {
          var err = new Error("denied"); err.code = 1;
          e(err);
        };
      `,
    });
  }
  await sleep(1000);
  await send("Page.navigate", { url });
  await sleep(waitMs);

  const expr = `(() => {
    const t = document.body ? document.body.innerText : '';
    const grab = (label) => {
      const m = t.match(new RegExp(label + '\\\\s*:\\\\s*([^\\\\n]+)'));
      return m ? m[1].trim() : null;
    };
    return {
      hasNoStopsText: t.includes('No stops within radius') || t.includes('No bus stops found within the selected radius') || t.includes('No bus stops found nearby'),
      hasStopCards: t.includes('R.S. Puram') || t.includes('Gandhipuram') || t.includes('City Centre'),
      debugLat: grab('Passenger Latitude'),
      debugLng: grab('Passenger Longitude'),
      debugNearest: grab('Nearest Stop'),
      debugNearestDist: grab('Nearest Stop Distance'),
      debugTotalStops: grab('Total Stops Loaded'),
      debugNearbyCount: grab('Nearby Stops Count'),
      networkStops: grab('Network Stops'),
      activeBuses: grab('Active Buses'),
    };
  })()`;

  const res = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
  console.log(JSON.stringify(res.result.result.value, null, 2));
  ws.close();
  process.exit(0);
}

main().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});

