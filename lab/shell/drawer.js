import { renderBots } from "../panels/bots.js";
import { renderBrand } from "../panels/brand.js";
import { renderContext } from "../panels/context.js";
import { renderEvents } from "../panels/events.js";
import { renderGhl } from "../panels/ghl.js";
import { renderInject } from "../panels/inject.js";
import { renderScore } from "../panels/score.js";
import { renderScenarios } from "../panels/scenarios.js";
import {
  configFor,
  currentAdapter,
  currentVendor,
  data,
  escapeHtml,
  isReady,
  state,
  tabs,
  turnFor,
} from "./state.js";

export function actionButton(item, action, label) {
  const available = typeof item.actions?.[action] === "function";
  const className = action === "open" || action === "send" ? " primary" : "";

  return `<button class="button${className}" data-action="${action}"
    ${available ? "" : "disabled"}
    title="${available ? label : "Not documented"}">
    ${label}${available ? "" : " · not documented"}
  </button>`;
}

export function renderDrawer() {
  const tabButtons = tabs
    .map(
      (tab) => `<button class="tab ${tab === state.tab ? "active" : ""}"
        role="tab" aria-selected="${tab === state.tab}" data-tab="${tab}">
        ${tab === "ghl" ? "GHL" : tab[0].toUpperCase() + tab.slice(1)}
      </button>`,
    )
    .join("");

  return `<aside class="drawer">
    <nav class="drawer-tabs" role="tablist" aria-label="Lab panels">${tabButtons}</nav>
    <div class="drawer-body" id="drawer-body"></div>
  </aside>`;
}

export function renderPanel() {
  const body = document.querySelector("#drawer-body");
  const item = currentAdapter();
  const meta = currentVendor();
  const renderers = {
    bots: () =>
      renderBots({
        item,
        meta,
        cfg: configFor(item),
        ready: isReady(item),
        vendors: data.vendors,
        escapeHtml,
        actionButton,
      }),
    scenarios: () => renderScenarios({ data, item, turnFor, escapeHtml }),
    context: () => renderContext(item, actionButton),
    brand: () => renderBrand(item, actionButton),
    events: () => renderEvents(state.events),
    score: () => renderScore({ data, adapters: data.adapters, escapeHtml }),
    ghl: () => renderGhl(state.ghl),
    inject: () => renderInject({ vendor: meta, escapeHtml }),
  };

  body.innerHTML = renderers[state.tab]();
}
