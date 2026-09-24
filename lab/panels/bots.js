function renderField(field, value, escapeHtml) {
  const control =
    field.key === "snippet"
      ? `<textarea id="cfg-${field.key}" data-config="${field.key}"
          placeholder="${escapeHtml(field.placeholder)}">${escapeHtml(value)}</textarea>`
      : `<input id="cfg-${field.key}" data-config="${field.key}"
          value="${escapeHtml(value)}" placeholder="${escapeHtml(field.placeholder)}">`;

  return `<div class="field">
    <label for="cfg-${field.key}">${field.label}</label>
    ${control}
    <span class="small">${field.help}</span>
  </div>`;
}

function renderSetup(steps, escapeHtml) {
  if (!steps?.length) return "";

  const items = steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("");

  return `<div class="setup">
    <strong>Setup</strong>
    <ol>${items}</ol>
  </div>`;
}

function renderDocs(meta, escapeHtml) {
  if (!meta.docs) return "";

  return `<a class="docs-link" href="${escapeHtml(meta.docs)}"
    target="_blank" rel="noreferrer">Official docs ↗</a>`;
}

function renderRejected(vendors, escapeHtml) {
  if (!vendors.rejected?.length) return "";

  const entries = vendors.rejected
    .map((entry) => `<li>${escapeHtml(entry)}</li>`)
    .join("");

  return `<div class="card rejected">
    <div class="card-top">
      <h3>Rejected from shortlist</h3>
      <span class="tag orange">research note</span>
    </div>
    <ul>${entries}</ul>
  </div>`;
}

function renderHeader(adapterLabel, escapeHtml) {
  return `<div class="panel-title">
    <div>
      <div class="eyebrow">One vendor at a time</div>
      <h2>Bot bench</h2>
      <p>${escapeHtml(adapterLabel)} · values stay local until you export them.</p>
    </div>
  </div>`;
}

function renderSelected({
  item,
  meta,
  ready,
  commercial,
  escapeHtml,
  actionButton,
}) {
  return `<div class="card selected">
    <div class="card-top">
      <h3>${escapeHtml(meta.name || item.name)}</h3>
      <span class="tag ${ready ? "" : "orange"}">${ready ? "ready" : "needs setup"}</span>
    </div>
    <p class="small">
      <strong>${escapeHtml(meta.group || meta.category || item.category)}</strong> ·
      ${escapeHtml(meta.status || "status not provided")}
    </p>
    <p class="verdict">
      ${escapeHtml(meta.verdict || `${item.name} adapter. Results appear after a live run.`)}
    </p>
    ${commercial}
    ${renderSetup(meta.setup, escapeHtml)}
    ${renderDocs(meta, escapeHtml)}
    <div class="button-row">
      ${actionButton(item, "open", "Open")}
      ${actionButton(item, "close", "Close")}
      <button class="button primary" data-action="reload">Reload stage</button>
      <button class="button" data-action="save-config">Save config</button>
      <button class="button" data-action="export-config">Export config</button>
    </div>
  </div>`;
}

function renderConfiguration(fields) {
  return `<div class="card">
    <div class="card-top">
      <h3>Configuration</h3>
      <span class="tag">local override</span>
    </div>
    ${fields || `<p class="small">No public configuration fields documented for this adapter.</p>`}
    <p class="small">
      API keys stay in local storage. Exports contain public ids and saved snippets only.
    </p>
  </div>`;
}

export function renderBots({
  item,
  meta,
  cfg,
  ready,
  vendors,
  escapeHtml,
  actionButton,
}) {
  const fields = (item.fields || [])
    .map((field) => renderField(field, cfg[field.key] || "", escapeHtml))
    .join("");
  const commercial = [meta.free, meta.price]
    .filter(Boolean)
    .map((line) => `<p class="small">${escapeHtml(line)}</p>`)
    .join("");
  const adapterLabel =
    meta.adapter === "snippet" ? "Saved snippet adapter" : "Dedicated adapter";

  return `${renderHeader(adapterLabel, escapeHtml)}${renderSelected({
    item,
    meta,
    ready,
    commercial,
    escapeHtml,
    actionButton,
  })}${renderConfiguration(fields)}${renderRejected(vendors, escapeHtml)}`;
}
