import { applyInjection } from "./frame.js";
import { addEvent, configFor, data, publicConfigFor } from "./state.js";

function downloadJson(name, value) {
  const link = document.createElement("a");

  link.href = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
}

function scoreExport() {
  const scores = Object.fromEntries(
    data.criteria.criteria.map((criterion) => [
      criterion.id,
      Object.fromEntries(
        data.adapters.map((item) => [
          item.id,
          {
            score:
              localStorage.getItem(`pg.score.${item.id}.${criterion.id}`) || "",
            note:
              localStorage.getItem(`pg.note.${item.id}.${criterion.id}`) || "",
          },
        ]),
      ),
    ]),
  );

  downloadJson("pitchgenius-score.json", {
    exported: new Date().toISOString(),
    scores,
  });
  addEvent("score.exported", "Score grid downloaded");
}

async function importScores(event) {
  const file = event.target.files[0];

  if (!file) return;

  const value = JSON.parse(await file.text());

  Object.entries(value.scores || {}).forEach(([criterion, entries]) =>
    Object.entries(entries).forEach(([bot, score]) => {
      const valueObject =
        typeof score === "object" ? score : { score, note: "" };

      localStorage.setItem(
        `pg.score.${bot}.${criterion}`,
        valueObject.score || "",
      );
      localStorage.setItem(
        `pg.note.${bot}.${criterion}`,
        valueObject.note || "",
      );
    }),
  );
  addEvent("score.imported", "Score grid restored");
}

function exportConfig() {
  downloadJson("pitchgenius-bots.json", {
    exported: new Date().toISOString(),
    bots: Object.fromEntries(
      data.adapters.map((entry) => [entry.id, publicConfigFor(entry)]),
    ),
  });
  addEvent("config.exported", "Merged public config downloaded");
}

function importConfig() {
  const input = document.querySelector("#score-file");

  input.click();
  input.addEventListener("change", importScores, { once: true });
}

export function handleConfigAction(action, item, render) {
  if (action === "save-config") {
    const values = Object.fromEntries(
      [...document.querySelectorAll("[data-config]")].map((input) => [
        input.dataset.config,
        input.value,
      ]),
    );

    localStorage.setItem(
      `pg.bot.${item.id}`,
      JSON.stringify({ ...configFor(item), ...values }),
    );
    addEvent("config.saved", `${item.name} · local override saved`);
    render();
    return true;
  }

  if (action === "save-inject") {
    const values = Object.fromEntries(
      [...document.querySelectorAll("[data-inject]")].map((input) => [
        input.dataset.inject,
        input.value,
      ]),
    );

    localStorage.setItem(`pg.inject.${item.id}`, JSON.stringify(values));
    applyInjection(document.querySelector("#home-frame"));
    addEvent("inject.saved", `${item.name} · CSS and JS applied`);
    render();
    return true;
  }

  if (action === "reload") {
    render();
    return true;
  }

  if (action === "export-config") {
    exportConfig();
    return true;
  }

  if (action === "export-score") {
    scoreExport();
    return true;
  }

  if (action === "import-score") {
    importConfig();
    return true;
  }

  return false;
}
