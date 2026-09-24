import { streamObject } from "./stream.js";
import { createView, resetView, showBooking } from "./view.js";

function readSettings(win, initial) {
  const saved = JSON.parse(win.localStorage.getItem("pg.bot.own") || "{}");

  return { ...initial, ...saved };
}

function saveSettings(win, settings) {
  win.localStorage.setItem("pg.bot.own", JSON.stringify(settings));
}

function wireSettings(view) {
  view.panel.querySelectorAll("[data-key]").forEach((input) => {
    input.value = view.cfg[input.dataset.key] || "";
    input.addEventListener("change", () =>
      saveSettings(view.win, {
        ...readSettings(view.win, {}),
        [input.dataset.key]: input.value,
      }),
    );
  });
}

function wireView(view) {
  view.launcher.addEventListener("click", () => {
    view.panel.hidden = false;
    view.input.focus();
  });
  view.panel.querySelector(".pg-agent-close").addEventListener("click", () => {
    view.panel.hidden = true;
    view.launcher.focus();
  });
  view.bookingClose.addEventListener("click", () => {
    view.booking.hidden = true;
    view.launcher.focus();
  });
  view.booking.addEventListener("click", (event) => {
    if (event.target === view.booking) view.booking.hidden = true;
  });
  view.win.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (!view.booking.hidden) view.booking.hidden = true;
    else {
      view.panel.hidden = true;
      view.launcher.focus();
    }
  });
  view.form.addEventListener("submit", (event) => submitTurn(event, view));
}

async function submitTurn(event, view) {
  event.preventDefault();
  const message = view.input.value.trim();

  if (!message) return;

  view.input.value = "";
  view.addMessage(message, "user");
  view.history.push({ role: "user", content: message });

  if (!view.cfg.baseUrl || !view.cfg.model) {
    view.addMessage("Add a model in Local model settings to run the own agent.", "agent");

    return;
  }

  try {
    await streamObject(view);
  } catch (error) {
    if (event.retry) return view.addMessage(`The model did not finish this turn: ${error.message}`, "agent");

    event.retry = true;

    try {
      await streamObject(view);
    } catch (retryError) {
      view.addMessage(`The model did not finish this turn: ${retryError.message}`, "agent");
    }
  }
}

export function mountOwnAgent(doc, win, cfg, emit) {
  const view = createView(doc, win, readSettings(win, cfg), emit);

  wireSettings(view);
  wireView(view);
  view.pageContext.textContent = `AI assistant · ${win.location.pathname}`;
  win.__pgOwn = {
    view,
    open: () => {
      view.panel.hidden = false;
    },
    close: () => {
      view.panel.hidden = true;
    },
    identify: (value) => {
      view.context = { ...view.context, ...value };
    },
    context: (value) => {
      view.context = { ...view.context, ...value };
    },
    reset: () => resetView(view),
    proactive: () => {
      view.panel.hidden = false;
    },
    booking: () => showBooking(view),
  };

  return view;
}
