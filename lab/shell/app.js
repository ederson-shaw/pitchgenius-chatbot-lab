import { makeActions } from "./actions.js";
import { bootFrame } from "./frame.js";
import { renderDrawer, renderPanel } from "./drawer.js";
import { renderStage } from "./stage.js";
import { renderChecklist } from "../panels/checklist.js";
import {
  addEvent,
  currentAdapter,
  data,
  escapeHtml,
  loadData,
  state,
  updateUrl,
  shortlist,
} from "./state.js";
import { renderTopbar } from "./topbar.js";

const app = document.querySelector("#app");
let runAction;

function recordFrameEvent(type, detail) {
  addEvent(type, detail);

  if (
    (state.tab === "events" || state.tab === "ghl") &&
    document.querySelector("#drawer-body")
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
  const checklist =
    window.innerWidth > 1100
      ? renderChecklist({
          vendor: data.vendors.vendors.find(
            (vendor) => vendor.id === state.bot,
          ),
          checklist: data.checklist,
          escapeHtml,
        })
      : "";

  app.innerHTML = `${renderTopbar()}
    <main class="layout ${state.drawer ? "" : "drawer-closed"}">
      ${checklist}
      <section class="stage-wrap" aria-label="Website stage">
        <div class="stage-shell ${state.view === "mobile" ? "mobile-stage" : ""}">
          ${renderStage(item)}
        </div>
      </section>
      ${renderDrawer()}
    </main>`;
  bindEvents();
  refreshPanel();
  bootFrame(recordFrameEvent);
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
    render();
  });
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
      refreshPanel();
    }),
  );
  document.querySelector("#drawer-toggle").addEventListener("click", () => {
    state.drawer = !state.drawer;
    render();
  });
}

document.addEventListener("keydown", (event) => {
  if (
    event.target.matches?.("input, textarea, select, [contenteditable='true']")
  )
    return;
  if (event.key === "ArrowRight") cycleBot(1);
  if (event.key === "ArrowLeft") cycleBot(-1);
  if (event.key === "Escape" && state.drawer) {
    state.drawer = false;
    render();
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
