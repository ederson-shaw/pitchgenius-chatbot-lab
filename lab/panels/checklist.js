const STATUS = {
  native: { label: "Built in", mark: "✓", className: "native" },
  build: { label: "We build it", mark: "↗", className: "build" },
  no: { label: "Not possible", mark: "×", className: "no" },
  unknown: { label: "Unknown", mark: "?", className: "unknown" },
};

function counts(groups, values) {
  const result = { native: 0, build: 0, no: 0, unknown: 0 };

  groups.forEach((group) =>
    group.items.forEach((item) => {
      const status = values[item.id]?.status || "unknown";
      result[status] = (result[status] || 0) + 1;
    }),
  );

  return result;
}

function countLabel(result) {
  const labels = [
    ["native", "built in"],
    ["build", "we build"],
    ["no", "not possible"],
    ["unknown", "unknown"],
  ];

  return labels
    .filter(([status]) => result[status])
    .map(([status, label]) => `${result[status]} ${label}`)
    .join(" · ");
}

function itemRows(group, values, escapeHtml) {
  return group.items
    .map((item) => {
      const value = values[item.id] || {
        status: "unknown",
        how: "not researched yet",
        source: "",
      };
      const status = STATUS[value.status] || STATUS.unknown;
      const source = value.source
        ? `<a href="${escapeHtml(value.source)}" target="_blank" rel="noreferrer">source ↗</a>`
        : `<span class="muted">source pending</span>`;

      return `<details class="checklist-item ${status.className}">
        <summary>
          <span class="checklist-mark" aria-label="${status.label}">${status.mark}</span>
          <span class="checklist-short">${escapeHtml(item.short || item.title)}</span>
          <span class="checklist-status">${status.label}</span>
        </summary>
        <div class="checklist-item-detail">
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(value.how)}</p>
          ${source}
        </div>
      </details>`;
    })
    .join("");
}

function groupRows(group, values, escapeHtml) {
  const result = { native: 0, build: 0, no: 0, unknown: 0 };

  group.items.forEach((item) => {
    const status = values[item.id]?.status || "unknown";
    result[status] = (result[status] || 0) + 1;
  });

  return `<details class="checklist-group">
    <summary>
      <span>${escapeHtml(group.title)}</span>
      <span>${countLabel(result)}</span>
    </summary>
    <div class="checklist-items">${itemRows(group, values, escapeHtml)}</div>
  </details>`;
}

export function renderChecklist({
  vendor,
  checklist,
  escapeHtml,
  open = false,
}) {
  const groups = checklist?.groups || [];
  const values = checklist?.vendors?.[vendor.id]?.items || {};
  const total = counts(groups, values);
  const summary = `${escapeHtml(vendor.name)} · ${total.native} built in · ${
    total.build
  } we build · ${total.no} not possible`;
  const unknown = total.unknown ? ` · ${total.unknown} unknown` : "";
  const rows = groups
    .map((group) => groupRows(group, values, escapeHtml))
    .join("");

  return `<details class="checklist-card" id="checklist-card" ${open ? "open" : ""}>
    <summary class="checklist-summary">
      <span class="checklist-summary-text">${summary}${unknown}</span>
      <span class="checklist-chevron" aria-hidden="true">⌄</span>
    </summary>
    <div class="checklist-content">
      <div class="checklist-heading">
        <span class="eyebrow">Capability map</span>
        <span>Click a group, then an item.</span>
      </div>
      <div class="checklist-groups">${rows}</div>
    </div>
  </details>`;
}
