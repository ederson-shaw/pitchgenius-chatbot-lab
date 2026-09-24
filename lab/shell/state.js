import { makeAdapters } from "../adapters/index.js";

export const params = new URLSearchParams(location.search);
export const state = {
  bot: params.get("bot") || "",
  view: params.get("view") || "desktop",
  tab: params.get("tab") || localStorage.getItem("pg.lab.tab") || "bots",
  overlay: params.get("overlay") || "",
  checklistOpen: localStorage.getItem("pg.lab.checklist") === "1",
  conversationCompare: false,
  conversationScenario: "browse-what",
  moreOpen: false,
  events: [],
  ghl: { turns: [], payload: {} },
};
export const data = {
  scenarios: { groups: [] },
  criteria: { criteria: [] },
  checklist: { groups: [], vendors: {} },
  vendors: { vendors: [], rejected: [] },
  runs: {},
  report: { sections: [] },
  bots: {},
  adapters: [],
};
export const tabs = [
  "checklist",
  "bots",
  "scenarios",
  "context",
  "brand",
  "inject",
  "events",
  "score",
  "ghl",
];

export async function loadJson(path) {
  const response = await fetch(path);

  if (!response.ok) throw new Error(`${path} returned ${response.status}`);

  return response.json();
}

export async function loadText(path) {
  const response = await fetch(path);

  if (!response.ok) throw new Error(`${path} returned ${response.status}`);

  return response.text();
}

export async function loadData() {
  const [scenarios, criteria, checklist, vendors, config, runs, report] =
    await Promise.all([
      loadJson("lab/data/scenarios.json"),
      loadJson("lab/data/criteria.json"),
      loadJson("lab/data/checklist.json"),
      loadJson("lab/data/vendors.json"),
      loadJson("config/bots.json"),
      loadJson("lab/data/runs.json"),
      loadJson("lab/data/report.json"),
    ]);

  data.scenarios = scenarios;
  data.criteria = criteria;
  data.checklist = checklist;
  data.vendors = vendors;
  data.runs = runs;
  data.report = report;
  data.bots = config.bots || {};
  data.adapters = makeAdapters(vendors.vendors);

  const ready = data.vendors.vendors
    .filter((vendor) => vendor.rank)
    .sort((left, right) => left.rank - right.rank)
    .find((vendor) => vendorReady(vendor));
  const requested = data.vendors.vendors.find(
    (vendor) => vendor.id === state.bot,
  );

  if (!requested || !vendorReady(requested))
    state.bot = ready?.id || data.adapters[0].id;
}

function vendorReady(vendor) {
  if (vendor.id === "own")
    return Boolean(data.bots.own?.baseUrl && data.bots.own?.model);

  if (vendor.noSignup) return true;

  return Boolean(data.bots[vendor.id]?.snippet?.trim());
}

export function currentAdapter() {
  return (
    data.adapters.find((item) => item.id === state.bot) || data.adapters[0]
  );
}

export function currentVendor() {
  return data.vendors.vendors.find((vendor) => vendor.id === state.bot) || {};
}

export function configFor(item) {
  const saved = localStorage.getItem(`pg.bot.${item.id}`) || "{}";

  let local = {};

  try {
    local = JSON.parse(saved);
  } catch {
    local = {};
  }

  return { ...(data.bots[item.id] || {}), ...local };
}

export function isReady(item) {
  if (currentVendor().platform) return false;

  const config = configFor(item);

  return (item.fields || []).every(
    (field) => field.key === "region" || String(config[field.key] || "").trim(),
  );
}

export function publicConfigFor(item) {
  const config = configFor(item);

  if (item.id === "own") delete config.apiKey;

  return config;
}

export function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
}

function structuredValue(detail) {
  if (typeof detail === "object") return detail;

  try {
    return JSON.parse(detail);
  } catch {
    return {};
  }
}

export function addEvent(type, detail) {
  if (type === "own.turn") state.ghl.turns.unshift(structuredValue(detail));
  if (type === "own.payload") state.ghl.payload = structuredValue(detail);

  const display =
    type === "own.turn"
      ? "Raw structured turn captured"
      : type === "own.payload"
        ? "Accumulated payload updated"
        : typeof detail === "string"
          ? detail
          : JSON.stringify(detail, null, 2);
  const event = {
    type,
    detail: display,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  state.events.unshift(event);

  return event;
}

export function updateUrl() {
  const query = new URLSearchParams({
    bot: state.bot,
    view: state.view,
    tab: state.tab,
  });

  if (state.overlay) query.set("overlay", state.overlay);

  history.replaceState({}, "", `${location.pathname}?${query}`);
  localStorage.setItem("pg.lab.tab", state.tab);
}

export function shortlist() {
  return data.vendors.vendors
    .filter((vendor) => vendor.rank)
    .sort((left, right) => left.rank - right.rank);
}

export function turnFor(scenarioId) {
  return Number(
    localStorage.getItem(`pg.turn.${state.bot}.${scenarioId}`) || 0,
  );
}

export function setTurn(scenarioId, value) {
  localStorage.setItem(`pg.turn.${state.bot}.${scenarioId}`, String(value));
}
