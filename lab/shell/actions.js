import { scenarioFor } from "../panels/scenarios.js";
import { handleConfigAction } from "./config-actions.js";
import {
  addEvent,
  configFor,
  currentAdapter,
  data,
  setTurn,
  state,
  turnFor,
} from "./state.js";

function contextValues() {
  return Object.fromEntries(
    [...document.querySelectorAll("[data-context]")].map((input) => [
      input.dataset.context,
      input.type === "checkbox" ? input.checked : input.value,
    ]),
  );
}

function brandValues() {
  return Object.fromEntries(
    [...document.querySelectorAll("[data-brand]")].map((input) => [
      input.dataset.brand,
      input.value,
    ]),
  );
}

function refresh(renderPanel) {
  if (document.querySelector("#drawer-body")) renderPanel();
}

function advanceTurn(scenarioId, renderPanel) {
  const scenario = scenarioFor(data, scenarioId);
  const next = (turnFor(scenarioId) + 1) % (scenario?.turns.length || 1);

  setTurn(scenarioId, next);
  renderPanel();
}

async function copyCurrentTurn(scenarioId, renderPanel) {
  const scenario = scenarioFor(data, scenarioId);
  const index = turnFor(scenarioId);
  const turn = scenario?.turns[index] || scenario?.turns[0] || "";

  try {
    await navigator.clipboard?.writeText(turn);
  } catch {
    addEvent(
      "scenario.copy.unavailable",
      "Clipboard permission was unavailable",
    );
  }

  addEvent(
    "scenario.copied",
    `${scenario?.title || "Scenario"} · turn ${index + 1}`,
  );

  if ((scenario?.turns.length || 0) > 1) advanceTurn(scenarioId, renderPanel);
  else refresh(renderPanel);
}

async function callAdapter(action, detail, renderPanel) {
  const frame = document.querySelector("#home-frame");
  const item = currentAdapter();
  const fn = item.actions?.[action];

  if (!frame || typeof fn !== "function") {
    addEvent(
      "action.unavailable",
      `${item.name} · ${action} not in this vendor's API`,
    );
    refresh(renderPanel);
    return;
  }

  try {
    await fn({
      win: frame.contentWindow,
      doc: frame.contentDocument,
      cfg: configFor(item),
      detail,
      emit: (type, value) => {
        addEvent(type, value);
        refresh(renderPanel);
      },
    });
  } catch (error) {
    addEvent("action.error", `${item.name} · ${error.message}`);
    refresh(renderPanel);
  }
}

function nextScenario(scenarioId, scenario, renderPanel) {
  advanceTurn(scenarioId, renderPanel);
  addEvent(
    "scenario.next",
    `${scenario?.title || "Scenario"} · turn ${turnFor(scenarioId) + 1}`,
  );
  refresh(renderPanel);
}

async function sendScenario(item, scenario, scenarioId, renderPanel) {
  const turn = scenario?.turns[turnFor(scenarioId)] || scenario?.turns[0] || "";

  addEvent(
    "scenario.sent",
    `${item.name} · ${scenario?.title || "Scenario"} · turn ${turnFor(scenarioId) + 1}`,
  );
  refresh(renderPanel);
  await callAdapter("send", turn, renderPanel);
}

async function handleScenarioAction(
  action,
  item,
  scenario,
  scenarioId,
  renderPanel,
) {
  if (action === "scenario-next") {
    nextScenario(scenarioId, scenario, renderPanel);
    return true;
  }

  if (action === "scenario-copy") {
    await copyCurrentTurn(scenarioId, renderPanel);
    return true;
  }

  if (action === "scenario-send") {
    await sendScenario(item, scenario, scenarioId, renderPanel);
    return true;
  }

  return false;
}

async function handleAdapterAction(action, item, renderPanel) {
  addEvent(`lab.${action}`, `${item.name} · action recorded`);
  refresh(renderPanel);
  await callAdapter(
    action,
    action === "brand" ? brandValues() : contextValues(),
    renderPanel,
  );

  if (action === "reset") {
    state.ghl = { turns: [], payload: {} };
    renderPanel();
  }
}

export function makeActions({ render, renderPanel }) {
  return async function runAction(action, scenarioId) {
    const item = currentAdapter();
    const scenario = scenarioFor(data, scenarioId);

    if (
      await handleScenarioAction(
        action,
        item,
        scenario,
        scenarioId,
        renderPanel,
      )
    )
      return;

    if (handleConfigAction(action, item, render)) return;

    await handleAdapterAction(action, item, renderPanel);
  };
}
