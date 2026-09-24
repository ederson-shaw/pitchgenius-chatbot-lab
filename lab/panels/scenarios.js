function scenarioFor(data, scenarioId) {
  return data.scenarios.groups
    .flatMap((group) => group.items)
    .find((item) => item.id === scenarioId);
}

function renderScenario(item, scenario, index, hasSend, escapeHtml) {
  const total = scenario.turns.length;
  const turn = scenario.turns[index] || scenario.turns[0];
  const send = hasSend
    ? `<button class="button primary" data-action="scenario-send" data-scenario="${scenario.id}">Send</button>`
    : "";
  const advance =
    total > 1 && hasSend
      ? `<button class="button" data-action="scenario-next" data-scenario="${scenario.id}">Send next turn</button>`
      : "";
  const copy = `<button class="button" data-action="scenario-copy"
    data-scenario="${scenario.id}">${hasSend ? "Copy" : "Copy & next"}</button>`;

  return `<div class="scenario">
    <div class="scenario-head">
      <h3>${escapeHtml(scenario.title)}</h3>
      <span class="turn-count">Turn ${index + 1} of ${total}</span>
    </div>
    <p class="scenario-turn">${escapeHtml(turn)}</p>
    <p class="scenario-expect">
      <strong>Expect:</strong> ${escapeHtml(scenario.expect)}
    </p>
    <div class="button-row">${send}${advance}${copy}</div>
  </div>`;
}

export function renderScenarios({ data, item, turnFor, escapeHtml }) {
  const groups = data.scenarios.groups || [];
  const hasSend = typeof item.actions?.send === "function";

  if (!groups.length)
    return `<div class="panel-title"><h2>Scenarios</h2><p>No scenarios.json data is present.</p></div>`;

  const groupCards = groups
    .map(
      (group) => `<div class="card scenario-group">
        <span class="tag">${escapeHtml(group.title)}</span>
        ${group.items
          .map((scenario) =>
            renderScenario(
              item,
              scenario,
              turnFor(scenario.id),
              hasSend,
              escapeHtml,
            ),
          )
          .join("")}
      </div>`,
    )
    .join("");
  const description = hasSend
    ? "Send the current turn or advance the conversation."
    : "This adapter has no documented send method; copy each turn to the vendor.";

  return `<div class="panel-title">
    <div>
      <div class="eyebrow">Same test, different widget</div>
      <h2>Scenarios</h2>
      <p>${description}</p>
    </div>
  </div>${groupCards}`;
}

export { scenarioFor };
