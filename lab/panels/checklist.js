const STATUS = {
  native: { label: "Built in", className: "native" },
  build: { label: "We build it", className: "build" },
  no: { label: "Not possible", className: "no" },
  unknown: { label: "Unknown", className: "unknown" },
};

function countValues(items, values) {
  const result = { native: 0, build: 0, no: 0, unknown: 0 };

  items.forEach((item) => {
    const status = values[item.id]?.status || "unknown";
    result[status] = (result[status] || 0) + 1;
  });

  return result;
}

const ICONS = { native: "✓", build: "⚙", no: "✕", unknown: "?" };

function countPills(result) {
  return ["native", "build", "no", "unknown"]
    .filter((status) => result[status])
    .map(
      (status) =>
        `<span class="count-pill ${status}" title="${STATUS[status].label}">${ICONS[status]} ${result[status]}</span>`,
    )
    .join("");
}

function statusBar(items, values, escapeHtml) {
  const segments = items
    .map((item) => {
      const status = values[item.id]?.status || "unknown";

      return `<span class="status-seg ${status}" title="${escapeHtml(item.short || item.title)}"></span>`;
    })
    .join("");

  return `<span class="status-bar" aria-hidden="true">${segments}</span>`;
}

function legend() {
  const entries = ["native", "build", "no", "unknown"]
    .map(
      (status) =>
        `<span class="legend-entry ${status}">${ICONS[status]} ${STATUS[status].label}</span>`,
    )
    .join("");

  return `<p class="checklist-legend">${entries}</p>`;
}

function statusMark(status) {
  const value = STATUS[status] || STATUS.unknown;

  return `<span class="checklist-status-mark ${value.className}" aria-hidden="true"></span>
    <span class="checklist-status-word ${value.className}">${value.label}</span>`;
}

function itemRows(group, values, escapeHtml) {
  return group.items
    .map((item) => {
      const value = values[item.id] || {
        status: "unknown",
        how: "not researched yet",
        source: "",
      };
      const source = value.source
        ? `<a href="${escapeHtml(value.source)}" target="_blank" rel="noreferrer">Source ↗</a>`
        : `<span class="muted">Source pending</span>`;

      return `<details class="checklist-item ${STATUS[value.status]?.className || "unknown"}">
        <summary>
          <span class="checklist-item-title">${escapeHtml(item.short || item.title)}</span>
          <span class="checklist-status">${statusMark(value.status)}</span>
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

function groupRows(groups, values, escapeHtml) {
  return groups
    .map((group) => {
      const total = countValues(group.items, values);

      return `<button class="checklist-group-row" data-checklist-group="${escapeHtml(group.id)}">
        <span class="checklist-group-name">${escapeHtml(group.title)}</span>
        <span class="checklist-group-count">${countPills(total)}</span>
        <span class="checklist-group-arrow" aria-hidden="true">›</span>
      </button>`;
    })
    .join("");
}

function controls() {
  return `<div class="checklist-actions">
    <button class="checklist-control" data-checklist-mode="minimized"
      aria-label="Minimise checklist" title="Minimise checklist">−</button>
    <button class="checklist-control" data-checklist-close
      aria-label="Close checklist" title="Close checklist">×</button>
  </div>`;
}

function renderMinimized(total, vendor, bar, escapeHtml) {
  return `<aside class="checklist-card checklist-minimized" aria-label="${escapeHtml(vendor.name)} checklist">
    <button class="checklist-pill" data-checklist-mode="groups">
      <span class="checklist-pill-main">
        <span class="checklist-pill-name">${escapeHtml(vendor.name)}</span>
        <span class="checklist-pill-counts">${countPills(total)}</span>
      </span>
      ${bar}
      <span class="checklist-pill-arrow" aria-hidden="true">⌃</span>
    </button>
    <button class="checklist-control checklist-pill-close" data-checklist-close
      aria-label="Close checklist" title="Close checklist">×</button>
  </aside>`;
}

function renderGroups(groups, total, vendor, values, bar, escapeHtml) {
  return `<aside class="checklist-card checklist-expanded" aria-label="${escapeHtml(vendor.name)} checklist">
    <header class="checklist-header">
      <div>
        <span class="eyebrow">Checklist</span>
        <h2>${escapeHtml(vendor.name)}</h2>
      </div>
      ${controls()}
    </header>
    <div class="checklist-total">${countPills(total)}${bar}</div>
    ${legend()}
    <div class="checklist-groups">${groupRows(groups, values, escapeHtml)}</div>
  </aside>`;
}

function renderOpen(group, total, vendor, values, escapeHtml) {
  return `<aside class="checklist-card checklist-expanded checklist-open-group"
    aria-label="${escapeHtml(vendor.name)} ${escapeHtml(group.title)} checklist">
    <header class="checklist-header">
      <div>
        <button class="checklist-back" data-checklist-mode="groups">‹ All groups</button>
        <h2>${escapeHtml(group.title)}</h2>
      </div>
      ${controls()}
    </header>
    <div class="checklist-total">${countPills(total)}</div>
    ${legend()}
    <div class="checklist-items">${itemRows(group, values, escapeHtml)}</div>
  </aside>`;
}

export function renderChecklist({
  vendor,
  checklist,
  escapeHtml,
  mode = "minimized",
  groupId = "",
}) {
  const groups = checklist?.groups || [];
  const values = checklist?.vendors?.[vendor.id]?.items || {};
  const allItems = groups.flatMap((group) => group.items);
  const total = countValues(allItems, values);
  const bar = statusBar(allItems, values, escapeHtml);

  if (mode === "closed") return "";
  if (mode === "minimized") return renderMinimized(total, vendor, bar, escapeHtml);
  if (mode === "open") {
    const group = groups.find((item) => item.id === groupId) || groups[0];
    if (group)
      return renderOpen(group, countValues(group.items, values), vendor, values, escapeHtml);
  }

  return renderGroups(groups, total, vendor, values, bar, escapeHtml);
}
