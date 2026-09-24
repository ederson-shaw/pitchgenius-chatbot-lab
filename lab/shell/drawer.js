import { renderBots } from "../panels/bots.js";
import { renderBrand } from "../panels/brand.js";
import { renderChecklist } from "../panels/checklist.js";
import { renderContext } from "../panels/context.js";
import { renderEvents } from "../panels/events.js";
import { renderFindings } from "../panels/findings.js";
import { renderGhl } from "../panels/ghl.js";
import { renderInject } from "../panels/inject.js";
import { renderConversations } from "../panels/conversations.js";
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
    ${available ? "" : "disabled"} title="${available ? label : "Not documented"}">
    ${label}${available ? "" : " · not documented"}
  </button>`;
}

function renderTools() {
  const tabButtons = tabs
    .map(
      (tab) => `<button class="tab ${tab === state.tab ? "active" : ""}"
        role="tab" aria-selected="${tab === state.tab}" data-tab="${tab}">
        ${tab === "ghl" ? "GHL" : tab[0].toUpperCase() + tab.slice(1)}
      </button>`,
    )
    .join("");

  return `<aside class="overlay-sheet tools-sheet" aria-label="Tools">
    <div class="overlay-head tools-head">
      <div>
        <span class="eyebrow">Power panels</span>
        <h2>Tools</h2>
        <p>Configuration, controls, and diagnostics stay out of the default view.</p>
      </div>
      <div class="viewport-switch" aria-label="Preview viewport">
        <button class="overlay-switch ${state.view === "desktop" ? "active" : ""}"
          data-view="desktop">Desktop</button>
        <button class="overlay-switch ${state.view === "mobile" ? "active" : ""}"
          data-view="mobile">Mobile</button>
      </div>
    </div>
    <nav class="tools-tabs" role="tablist" aria-label="Tools panels">${tabButtons}</nav>
    <div class="overlay-scroll tools-body" id="overlay-body"></div>
  </aside>`;
}

export function renderOverlay() {
  if (state.overlay === "conversations")
    return renderConversations({
      data,
      vendor: currentVendor(),
      escapeHtml,
      state,
    });
  if (state.overlay === "findings")
    return renderFindings({ report: data.report, escapeHtml });
  if (state.overlay === "tools") return renderTools();
  return "";
}

export function renderPanel() {
  const body = document.querySelector("#overlay-body");
  if (!body || state.overlay !== "tools") return;

  const item = currentAdapter();
  const meta = currentVendor();
  const renderers = {
    checklist: () =>
      renderChecklist({
        vendor: meta,
        checklist: data.checklist,
        escapeHtml,
        open: true,
      }),
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
