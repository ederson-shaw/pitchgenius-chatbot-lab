function detailText(detail) {
  return typeof detail === "string" ? detail : JSON.stringify(detail, null, 2);
}

export function renderEvents(events) {
  const network =
    events.find((event) => event.type === "network")?.detail ||
    "Third-party request counts appear after a widget loads.";
  const rows = events.length
    ? events
        .map(
          (event) =>
            `<div class="log-row">
              <span class="log-time">${event.time}</span>
              <span>
                <span class="log-type">${event.type}</span><br>
                ${detailText(event.detail)}
              </span>
            </div>`,
        )
        .join("")
    : `<p class="small">No events yet. Reload a configured bot or run a scenario.</p>`;

  return `<div class="panel-title">
    <div>
      <div class="eyebrow">Observable behavior</div>
      <h2>Event stream</h2>
      <p>Actions, adapter signals, and the network meter.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-top">
      <h3>Network meter</h3>
      <span class="tag">observing</span>
    </div>
    <p class="small">${network}</p>
  </div>
  <div class="log">${rows}</div>`;
}
