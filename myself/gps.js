let wasm = null, watchId = null, map, marker, accuracyCircle;
let lastPosition = null, addressBusy = false;

const $ = id => document.getElementById(id);
const log = msg => {
  const line = `[${new Date().toLocaleTimeString("ja-JP")}] ${msg}`;
  $("log").textContent = line + "\n" + $("log").textContent;
  console.log("[GPS]", msg);
};
const setValue = (id, value, active=true) => {
  $(id).textContent = value;
  const item = $("i-" + id);
  if (item && active) item.classList.add("active");
};

async function loadWasm() {
  try {
    const r = await fetch("./gps.wasm");
    if (!r.ok) throw new Error(`gps.wasm HTTP ${r.status}`);
    const bytes = await r.arrayBuffer();
    const result = await WebAssembly.instantiate(bytes, {});
    wasm = result.instance;
    log("WASM loaded successfully.");
  } catch (e) {
    log("WASM load failed: " + e.message);
    $("status").textContent = "WASM load error. Check gps.wasm.";
  }
}

function initMap() {
  map = L.map("map").setView([35.681236,139.767125],5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom:19,
    attribution:"&copy; OpenStreetMap contributors"
  }).addTo(map);
}

function formatHeading(h) {
  if (h == null || Number.isNaN(h)) return "N/A";
  const dirs = ["北","北東","東","南東","南","南西","西","北西"];
  return `${h.toFixed(1)}° (${dirs[Math.round(h/45)%8]})`;
}

function updateTelemetry(position) {
  lastPosition = position;
  const c = position.coords;
  const lat = c.latitude, lng = c.longitude;

  setValue("lat", `${lat.toFixed(7)}°`);
  setValue("lng", `${lng.toFixed(7)}°`);
  setValue("alt", c.altitude == null ? "N/A" : `${c.altitude.toFixed(1)} m`);
  setValue("heading", formatHeading(c.heading));
  setValue("speed", c.speed == null || Number.isNaN(c.speed) ? "0.0 km/h" : `${(c.speed*3.6).toFixed(1)} km/h`);
  setValue("accuracy", `±${c.accuracy.toFixed(1)} m`);
  const d = new Date(position.timestamp);
  setValue("time", d.toLocaleTimeString("ja-JP") + "." + String(d.getMilliseconds()).padStart(3,"0"));

  $("addressBtn").disabled = false;
  $("status").textContent = `Receiving live data / accuracy ±${c.accuracy.toFixed(0)}m`;

  if (map) {
    map.setView([lat,lng],16);
    if (!marker) marker = L.marker([lat,lng]).addTo(map);
    else marker.setLatLng([lat,lng]);
    if (!accuracyCircle) accuracyCircle = L.circle([lat,lng],{radius:c.accuracy}).addTo(map);
    else { accuracyCircle.setLatLng([lat,lng]); accuracyCircle.setRadius(c.accuracy); }
  }
  log(`position lat=${lat.toFixed(6)} lng=${lng.toFixed(6)} alt=${c.altitude}`);
}

async function reverseGeocode(force=false) {
  if (!lastPosition || addressBusy) return;
  if (!force && $("address").textContent !== "--") return;
  const {latitude,longitude} = lastPosition.coords;
  addressBusy = true;
  $("status").textContent = "Address API: requesting...";
  try {
    // OpenStreetMap Nominatim: public endpoint. Respect rate limits; manual button is supported.
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=18&addressdetails=1&accept-language=ja`;
    const r = await fetch(url, {headers:{"Accept":"application/json"}});
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    setValue("address", data.display_name || "住所なし");
    $("status").textContent = "Address updated.";
    log("reverse geocoding completed.");
  } catch(e) {
    setValue("address", "取得失敗");
    $("status").textContent = "Address API error: " + e.message;
    log("reverse geocoding error: " + e.message);
  } finally {
    addressBusy = false;
  }
}

$("trackBtn").addEventListener("click", () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    $("trackBtn").textContent = "START TRACKING";
    $("trackBtn").classList.remove("tracking");
    $("status").textContent = "Tracking stopped.";
    log("tracking stopped.");
    return;
  }
  if (!navigator.geolocation) {
    $("status").textContent = "Geolocation is not supported.";
    return;
  }
  $("trackBtn").textContent = "STOP TRACKING";
  $("trackBtn").classList.add("tracking");
  $("status").textContent = "Requesting GPS permission...";
  log("starting watchPosition.");
  watchId = navigator.geolocation.watchPosition(
    p => updateTelemetry(p),
    e => {
      $("status").textContent = `GPS Error ${e.code}: ${e.message}`;
      log(`GPS error ${e.code}: ${e.message}`);
    },
    {enableHighAccuracy:true, timeout:10000, maximumAge:0}
  );
});

$("addressBtn").addEventListener("click", () => reverseGeocode(true));

initMap();
loadWasm();
