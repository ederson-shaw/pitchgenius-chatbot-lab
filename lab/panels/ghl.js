function json(value) {
  return JSON.stringify(value || {}, null, 2);
}

export function renderGhl(ghl) {
  const turns = ghl.turns.length
    ? ghl.turns
        .map(
          (turn, index) =>
            `<details class="turn-json" ${index === 0 ? "open" : ""}>
              <summary>Turn ${ghl.turns.length - index} · raw model object</summary>
              <pre>${json(turn)}</pre>
            </details>`,
        )
        .join("")
    : `<p class="small">Run the own agent to capture the model’s raw JSON per turn.</p>`;

  return `<div class="panel-title">
    <div>
      <div class="eyebrow">CRM handoff</div>
      <h2>GHL payload</h2>
      <p>The widget stays visitor-facing; this is the lab’s inspection view.</p>
    </div>
  </div>
  <div class="card payload-card">
    <div class="card-top">
      <h3>Accumulated payload</h3>
      <span class="tag">transport only</span>
    </div>
    <pre>${json(ghl.payload)}</pre>
  </div>
  <div class="card">
    <div class="card-top">
      <h3>Raw turns</h3>
      <span class="tag">${ghl.turns.length}</span>
    </div>
    ${turns}
  </div>`;
}
