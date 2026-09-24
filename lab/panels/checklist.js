const STATUS = {
  native: { label: "Built in", mark: "✓", className: "native" },
  build: { label: "We build it", mark: "↗", className: "build" },
  no: { label: "Not possible", mark: "×", className: "no" },
  unknown: { label: "Unknown", mark: "?", className: "unknown" },
};

function itemRows(group, values, escapeHtml) {
  return group.items
    .map((item) => {
      const value = values[item.id] || {
        status: "unknown",
        how: "not researched yet",
        source: "",
      };
      const status = STATUS[value.status] || STATUS.unknown;
      const flowchart = escapeHtml(item.flowchart);
      const source = value.source
        ? `<a class="checklist-source" href="${escapeHtml(value.source)}" target="_blank" rel="noreferrer">source ↗</a>`
        : `<span class="checklist-source muted">source pending</span>`;

      return `<li class="checklist-item ${status.className}" title="${flowchart}" data-flowchart="${flowchart}">
        <span class="checklist-mark" aria-label="${status.label}">${status.mark}</span>
        <div class="checklist-copy">
          <div class="checklist-item-head">
            <strong>${escapeHtml(item.title)}</strong>
            <span class="checklist-status">${status.label}</span>
          </div>
          <p>${escapeHtml(value.how)}</p>
          ${source}
        </div>
      </li>`;
    })
    .join("");
}

function groupCounts(group, values) {
  const totals = { native: 0, build: 0, no: 0, unknown: 0 };
  const labels = {
    native: "built in",
    build: "we build",
    no: "not possible",
    unknown: "unknown",
  };

  group.items.forEach((item) => {
    const status = values[item.id]?.status || "unknown";
    totals[status] = (totals[status] || 0) + 1;
  });

  return Object.entries(totals)
    .filter(([, count]) => count)
    .map(([status, count]) => `${count} ${labels[status]}`)
    .join(" · ");
}

export function renderChecklist({ vendor, checklist, escapeHtml }) {
  const values = checklist?.vendors?.[vendor.id]?.items || {};
  const label = `${escapeHtml(vendor.name)} capability checklist`;
  const groups = (checklist?.groups || [])
    .map(
      (group) => `<section class="checklist-group">
        <div class="checklist-group-head">
          <h3>${escapeHtml(group.title)}</h3>
          <span>${groupCounts(group, values)}</span>
        </div>
        <ul>${itemRows(group, values, escapeHtml)}</ul>
      </section>`,
    )
    .join("");

  return `<aside class="checklist-panel" id="checklist-panel" aria-label="${label}">
    <div class="checklist-intro">
      <span class="eyebrow">Capability map</span>
      <h2>What ${escapeHtml(vendor.name)} covers</h2>
      <p>Built-in capability, build work, and hard limits in the same order every time.</p>
    </div>
    <div class="checklist-groups">${groups}</div>
  </aside>`;
}
