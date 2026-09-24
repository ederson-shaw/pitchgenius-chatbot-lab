import { makeActions } from "./actions.js";
import { bootFrame } from "./frame.js";
import { renderOverlay, renderPanel } from "./drawer.js";
import { renderStage } from "./stage.js";
import { renderChecklist } from "../panels/checklist.js";
import {
  addEvent,
  currentAdapter,
  data,
  escapeHtml,
  loadData,
  saveChecklistState,
  state,
  updateUrl,
  shortlist,
} from "./state.js";
import { renderTopbar } from "./topbar.js";
import { bindChipScroll } from "./chipscroll.js";

const app = document.querySelector("#app");
let runAction;

function currentChecklist() {
  const vendor = data.vendors.vendors.find((item) => item.id === state.bot);

  return renderChecklist({
    vendor,
    checklist: data.checklist,
    escapeHtml,
    mode: state.checklistMode,
    groupId: state.checklistGroup,
  });
}

function recordFrameEvent(type, detail) {
  addEvent(type, detail);

  if (
    state.overlay === "tools" &&
    (state.tab === "events" || state.tab === "ghl")
  )
    refreshPanel();
}

function refreshPanel() {
  renderPanel();
  document
    .querySelectorAll("button[data-action]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        runAction(button.dataset.action, button.dataset.scenario),
      ),
    );
}

function render() {
  const item = currentAdapter();

  app.innerHTML = `${renderTopbar()}
    <main class="layout">
      <section class="stage-wrap" aria-label="Website stage">
        <div class="stage-shell ${state.view === "mobile" ? "mobile-stage" : ""}">
          ${renderStage(item)}
        </div>
      </section>
    </main>
    <div id="checklist-host">${currentChecklist()}</div>
    <div id="overlay-host">${renderOverlay()}</div>`;
  bindEvents();
  bindChipScroll();
  refreshPanel();
  bootFrame(recordFrameEvent);
}

function refreshChrome() {
  document
    .querySelector(".topbar")
    ?.replaceWith(
      new DOMParser().parseFromString(renderTopbar(), "text/html").body
        .firstElementChild,
    );
  const checklistHost = document.querySelector("#checklist-host");
  if (checklistHost) checklistHost.innerHTML = currentChecklist();
  const overlayHost = document.querySelector("#overlay-host");
  if (overlayHost) overlayHost.innerHTML = renderOverlay();
  bindEvents();
  bindChipScroll();
  refreshPanel();
}

function setBot(id) {
  state.bot = id;
  state.moreOpen = false;
  state.events = [];
  state.ghl = { turns: [], payload: {} };
  updateUrl();
  render();
}

function cycleBot(direction) {
  const entries = shortlist();
  const current = entries.findIndex((vendor) => vendor.id === state.bot);

  if (current < 0) return;

  setBot(entries[(current + direction + entries.length) % entries.length].id);
}

function bindEvents() {
  document
    .querySelectorAll("[data-vendor]")
    .forEach((button) =>
      button.addEventListener("click", () => setBot(button.dataset.vendor)),
    );
  document.querySelector("[data-more]")?.addEventListener("click", () => {
    state.moreOpen = !state.moreOpen;
    refreshChrome();
  });
  document.querySelectorAll("[data-overlay]").forEach((button) =>
    button.addEventListener("click", () => {
      const target = button.dataset.overlay;
      if (target === "checklist") {
        state.checklistMode =
          state.checklistMode === "closed" ? "minimized" : "closed";
        saveChecklistState();
      } else {
        state.overlay = state.overlay === target ? "" : target;
        updateUrl();
      }
      refreshChrome();
    }),
  );
  document.querySelectorAll("[data-checklist-mode]").forEach((button) =>
    button.addEventListener("click", () => {
      state.checklistMode = button.dataset.checklistMode;
      saveChecklistState();
      refreshChrome();
    }),
  );
  document.querySelectorAll("[data-checklist-group]").forEach((button) =>
    button.addEventListener("click", () => {
      state.checklistGroup = button.dataset.checklistGroup;
      state.checklistMode = "open";
      saveChecklistState();
      refreshChrome();
    }),
  );
  document.querySelectorAll("[data-checklist-close]").forEach((button) =>
    button.addEventListener("click", () => {
      state.checklistMode = "closed";
      saveChecklistState();
      refreshChrome();
    }),
  );
  document.querySelectorAll("[data-view]").forEach((button) =>
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      updateUrl();
      render();
    }),
  );
  document.querySelectorAll("[data-tab]").forEach((button) =>
    button.addEventListener("click", () => {
      state.tab = button.dataset.tab;
      updateUrl();
      refreshChrome();
    }),
  );
  document
    .querySelector("[data-conversation-compare]")
    ?.addEventListener("click", () => {
      state.conversationCompare = !state.conversationCompare;
      refreshChrome();
    });
  document
    .querySelector("[data-conversation-scenario]")
    ?.addEventListener("change", (event) => {
      state.conversationScenario = event.target.value;
      refreshChrome();
    });
}

document.addEventListener("keydown", (event) => {
  if (
    event.target.matches?.("input, textarea, select, [contenteditable='true']")
  )
    return;
  if (event.key === "ArrowRight") cycleBot(1);
  if (event.key === "ArrowLeft") cycleBot(-1);
  if (event.key === "Escape" && state.overlay) {
    state.overlay = "";
    updateUrl();
    refreshChrome();
  }
});

runAction = makeActions({ render, renderPanel: refreshPanel });

loadData()
  .then(() => {
    addEvent("lab.ready", "Shell and source data loaded");
    render();
  })
  .catch((error) => {
    addEvent("lab.error", error.message);
    app.innerHTML = `<main class="fatal-error">
      <h1>Chatbot Lab could not load</h1>
      <p>${escapeHtml(error.message)}</p>
    </main>`;
  });
