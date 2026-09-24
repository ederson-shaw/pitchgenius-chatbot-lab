function scenariosFor(data) {
  return (data.scenarios.groups || []).flatMap((group) => group.items);
}

function firstLine(value) {
  return (
    String(value || "")
      .split(/\r?\n/)[0]
      .trim() || "No answer captured"
  );
}

function seconds(value) {
  return Number.isFinite(Number(value)) ? `${Number(value).toFixed(2)}s` : "—";
}

function timing(run) {
  const turn = run?.turns?.[0] || {};

  return `first ${seconds(turn.seconds_to_first_text)} · final ${seconds(turn.seconds_to_final)}`;
}

function turns(run, escapeHtml) {
  return (run?.turns || [])
    .map(
      (turn, index) => `<div class="conversation-turn">
        <span class="conversation-turn-label">Turn ${index + 1}</span>
        <p class="conversation-visitor">${escapeHtml(turn.visitor)}</p>
        <p class="conversation-bot">${escapeHtml(turn.bot)}</p>
        <span class="conversation-timing">${timing({ turns: [turn] })}</span>
      </div>`,
    )
    .join("");
}

function runDetail(vendorId, scenarioId, run, escapeHtml) {
  const errors = run.errors?.length
    ? `<p class="conversation-errors">${escapeHtml(run.errors.join(" · "))}</p>`
    : "";
  const image = run.screenshot
    ? run.screenshot
    : `lab/runs/${vendorId}/${scenarioId}.png`;

  return `<div class="conversation-detail">
    <div class="conversation-turns">${turns(run, escapeHtml)}</div>
    <div class="conversation-meta">
      <span>${escapeHtml(run.date || "Date unavailable")}</span>
      ${errors}
    </div>
    <a class="conversation-thumb" href="${escapeHtml(image)}" target="_blank" rel="noreferrer">
      <img src="${escapeHtml(image)}" alt="Recorded ${escapeHtml(scenarioId)} run" />
      <span>Open capture ↗</span>
    </a>
  </div>`;
}

function currentRows(data, scenarioList, escapeHtml) {
  const vendorId = data.currentVendorId;

  return (
    scenarioList
      .filter((scenario) => data.runs[vendorId]?.[scenario.id])
      .map((scenario) => {
        const run = data.runs[vendorId][scenario.id];
        const answer = firstLine(run.turns?.[0]?.bot);

        return `<details class="conversation-row">
        <summary>
          <span class="conversation-row-name">${escapeHtml(scenario.title)}</span>
          <span class="conversation-row-answer">${escapeHtml(answer)}</span>
          <span class="conversation-row-time">${timing(run)}</span>
        </summary>
        ${runDetail(vendorId, scenario.id, run, escapeHtml)}
      </details>`;
      })
      .join("") ||
    `<p class="overlay-empty">No recorded scenarios for this vendor yet.</p>`
  );
}

function vendorOrder(data) {
  return data.vendors.vendors.slice().sort((left, right) => {
    const leftRank = left.rank || 999;
    const rightRank = right.rank || 999;
    return leftRank - rightRank || left.name.localeCompare(right.name);
  });
}

function compareRows(data, scenario, escapeHtml) {
  return vendorOrder(data)
    .map((vendor) => {
      const run = data.runs[vendor.id]?.[scenario.id];
      const answer = run ? firstLine(run.turns?.[0]?.bot) : "not run yet";
      const detail = run
        ? runDetail(vendor.id, scenario.id, run, escapeHtml)
        : `<div class="conversation-detail"><p class="overlay-empty">not run yet</p></div>`;

      return `<details class="conversation-row compare-row">
        <summary>
          <span class="conversation-row-name">${escapeHtml(vendor.name)}</span>
          <span class="conversation-row-answer">${escapeHtml(answer)}</span>
          <span class="conversation-row-time">${run ? timing(run) : "—"}</span>
        </summary>
        ${detail}
      </details>`;
    })
    .join("");
}

function scenarioSelect(scenarioList, selected, escapeHtml) {
  return `<label class="conversation-select">
    <span>Scenario</span>
    <select data-conversation-scenario>
      ${scenarioList
        .map(
          (scenario) =>
            `<option value="${escapeHtml(scenario.id)}" ${
              scenario.id === selected ? "selected" : ""
            }>${escapeHtml(scenario.title)}</option>`,
        )
        .join("")}
    </select>
  </label>`;
}

export function renderConversations({ data, vendor, escapeHtml, state }) {
  const scenarioList = scenariosFor(data);
  const selected = scenarioList.some(
    (scenario) => scenario.id === state.conversationScenario,
  )
    ? state.conversationScenario
    : scenarioList[0]?.id;
  const scenario =
    scenarioList.find((item) => item.id === selected) || scenarioList[0];
  const content = state.conversationCompare
    ? compareRows({ ...data, currentVendorId: vendor.id }, scenario, escapeHtml)
    : currentRows(
        { ...data, currentVendorId: vendor.id },
        scenarioList,
        escapeHtml,
      );
  const controls = state.conversationCompare
    ? scenarioSelect(scenarioList, selected, escapeHtml)
    : `<span class="conversation-scope">${escapeHtml(vendor.name)} · recorded runs</span>`;

  return `<aside class="overlay-sheet conversations-sheet" aria-label="Conversations">
    <div class="overlay-head">
      <div>
        <span class="eyebrow">Recorded evidence</span>
        <h2>Conversations</h2>
        <p>${
          state.conversationCompare
            ? "One scenario, every vendor."
            : "Open a line for the full turns and capture."
        }</p>
      </div>
      <div class="conversation-controls">
        ${controls}
        <button class="overlay-switch ${state.conversationCompare ? "active" : ""}"
          data-conversation-compare aria-pressed="${state.conversationCompare}">
          ${state.conversationCompare ? "Current vendor" : "Compare all"}
        </button>
      </div>
    </div>
    <div class="overlay-scroll conversation-list">${content}</div>
  </aside>`;
}
