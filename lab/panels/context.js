export function renderContext(item, actionButton) {
  const fields = [
    ["path", "Page path", "/pricing", ""],
    ["utm_source", "UTM source", "linkedin", ""],
    ["utm_medium", "UTM medium", "cpc", ""],
    ["utm_campaign", "UTM campaign", "book-a-pilot", ""],
    ["email", "Known visitor email", "", "name@company.com"],
    ["name", "Visitor name", "", "Alex Morgan"],
    ["company", "Company", "", "Company name"],
    ["role", "Role", "", "Sales manager"],
  ];

  const controls = fields
    .map(
      ([key, label, value, placeholder]) =>
        `<div class="field">
          <label for="context-${key}">${label}</label>
          <input id="context-${key}" data-context="${key}" value="${value}"
            placeholder="${placeholder}">
        </div>`,
    )
    .join("");

  return `<div class="panel-title">
    <div>
      <div class="eyebrow">Simulated visitor</div>
      <h2>Visitor context</h2>
      <p>Shape the page signal before the next open.</p>
    </div>
  </div>
  ${controls}
  <label class="check-line">
    <input type="checkbox" data-context="returning"> Returning visitor
  </label>
  <div class="button-row">
    ${actionButton(item, "open", "Open")}
    ${actionButton(item, "close", "Close")}
    ${actionButton(item, "proactive", "Proactive message")}
    ${actionButton(item, "identify", "Identify")}
    ${actionButton(item, "context", "Send context")}
    ${actionButton(item, "reset", "Reset session")}
  </div>`;
}
