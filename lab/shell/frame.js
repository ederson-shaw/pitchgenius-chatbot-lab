import {
  configFor,
  currentAdapter,
  addEvent,
  escapeHtml,
  state,
} from "./state.js";

function observeNetwork(win) {
  if (!win.PerformanceObserver) return;

  try {
    const observer = new win.PerformanceObserver((list) => {
      const entries = list
        .getEntries()
        .filter(
          (entry) =>
            entry.name.startsWith("http") &&
            !entry.name.includes(location.host),
        );
      const bytes = entries.reduce(
        (total, entry) => total + (entry.transferSize || 0),
        0,
      );

      addEvent(
        "network",
        `${entries.length} third-party requests · ${bytes ? `${bytes} bytes` : "transfer hidden by vendor"}`,
      );
    });

    observer.observe({ type: "resource", buffered: true });
  } catch {
    addEvent("network", "PerformanceObserver unavailable");
  }
}

export function applyInjection(frame) {
  if (!frame?.contentDocument) return;

  const saved = localStorage.getItem(`pg.inject.${state.bot}`) || "{}";
  let values = {};

  try {
    values = JSON.parse(saved);
  } catch {
    values = {};
  }

  const doc = frame.contentDocument;
  doc.querySelector("#lab-injected-css")?.remove();
  doc.querySelector("#lab-injected-js")?.remove();

  if (values.css) {
    const style = doc.createElement("style");
    style.id = "lab-injected-css";
    style.textContent = values.css;
    doc.head.append(style);
  }

  if (values.js) {
    const script = doc.createElement("script");
    script.id = "lab-injected-js";
    script.textContent = values.js;
    doc.body.append(script);
  }
}

export function bootFrame() {
  const frame = document.querySelector("#home-frame");
  const item = currentAdapter();

  if (!frame) return;

  frame.addEventListener(
    "load",
    async () => {
      const loadStarted = performance.now();

      try {
        observeNetwork(frame.contentWindow);
        await item.load({
          win: frame.contentWindow,
          doc: frame.contentDocument,
          cfg: configFor(item),
          emit: (type, detail) => addEvent(type, detail),
        });
        applyInjection(frame);
        addEvent("frame.ready", `${item.name} injected`);
        frame.contentWindow.requestAnimationFrame(() =>
          addEvent(
            "network",
            `load → first widget frame ${Math.round(performance.now() - loadStarted)}ms · request meter active`,
          ),
        );
      } catch (error) {
        addEvent("frame.error", `${item.name}: ${error.message}`);
        frame.contentDocument.body.innerHTML = `<div style="padding:32px;font:16px system-ui;color:#12243d">
          ${escapeHtml(item.name)} failed to load. See Events for details.
        </div>`;
      }
    },
    { once: true },
  );
}
