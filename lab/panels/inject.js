function savedFor(id) {
  try {
    return JSON.parse(localStorage.getItem(`pg.inject.${id}`) || "{}");
  } catch {
    return {};
  }
}

export function renderInject({ vendor, escapeHtml }) {
  const saved = savedFor(vendor.id);
  const iframeNote =
    vendor.injection === "iframe"
      ? "This provider uses an iframe; outside CSS cannot style its internals."
      : "CSS runs in the same stage document after the widget loads.";

  return `<div class="panel-title">
    <div>
      <div class="eyebrow">Stage document</div>
      <h2>Inject</h2>
      <p>Saved per vendor and applied after the provider adapter loads.</p>
    </div>
  </div>
  <div class="card inject-card">
    <div class="card-top">
      <h3>Injection boundary</h3>
      <span class="tag">${escapeHtml(vendor.injection)}</span>
    </div>
    <p class="small">${escapeHtml(iframeNote)}</p>
    <label class="field">
      <span>CSS</span>
      <textarea
        data-inject="css"
        placeholder=".widget { outline: 2px solid #1ebeb4; }"
      >${escapeHtml(saved.css || "")}</textarea>
    </label>
    <label class="field">
      <span>JavaScript</span>
      <textarea
        data-inject="js"
        placeholder="document.body.dataset.labInjected = 'yes';"
      >${escapeHtml(saved.js || "")}</textarea>
    </label>
    <button class="button primary" data-action="save-inject">Save and apply</button>
  </div>`;
}
