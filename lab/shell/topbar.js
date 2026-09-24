import { data, isReady, state, shortlist, escapeHtml } from "./state.js";

function chipName(vendor) {
  const names = {
    own: "Own agent",
    ghl: "GHL AI",
    closebot: "CloseBot",
    asyntai: "Asyntai",
    stammer: "Stammer",
    botpress: "Botpress",
    typebot: "Typebot",
    voiceflow: "Voiceflow",
    chatbase: "Chatbase",
    chatling: "Chatling",
    docsbot: "DocsBot",
  };

  return names[vendor.id] || vendor.name;
}

function renderVendorChip(vendor) {
  const item = data.adapters.find((adapter) => adapter.id === vendor.id);
  const active = vendor.id === state.bot;

  return `<button class="vendor-chip ${active ? "active" : ""}" data-vendor="${vendor.id}"
    ${vendor.platform ? "disabled" : ""}
    aria-pressed="${active}" title="${escapeHtml(vendor.name)}">
    ${vendor.rank ? `<span class="chip-rank">${vendor.rank}</span>` : ""}
    <span class="status-dot ${isReady(item) ? "" : "warn"}"></span>
    <span>${escapeHtml(chipName(vendor))}</span>
  </button>`;
}

function renderGroups() {
  const vendors = shortlist();

  return `<div class="chip-group">${vendors.map(renderVendorChip).join("")}</div>`;
}

function renderPlatform() {
  const vendors = data.vendors.vendors.filter((vendor) => vendor.platform);

  return `<div class="chip-group platform-group">${vendors.map(renderVendorChip).join("")}</div>`;
}

function renderMore() {
  if (!state.moreOpen) return "";

  const vendors = data.vendors.vendors.filter(
    (vendor) => !vendor.rank && !vendor.platform,
  );

  return `<div class="more-menu">${vendors.map(renderVendorChip).join("")}</div>`;
}

export function renderTopbar() {
  return `<header class="topbar">
    <a class="brand" href="index.html" aria-label="PitchGenius Chatbot Lab">
      <span class="site-mark" aria-hidden="true"><span class="site-mark-dot"></span></span>
      <span class="brand-name">PitchGenius</span>
      <span class="brand-divider">/</span>
      <span class="brand-label">Chatbot Lab</span>
    </a>
    <div class="vendor-nav" aria-label="Chatbot vendors">
      <div class="chip-groups">${renderGroups()}<div class="more-wrap">
        <button class="top-link more-trigger" data-more aria-expanded="${state.moreOpen}">More</button>
        ${renderMore()}
      </div>${renderPlatform()}</div>
    </div>
    <div class="top-actions">
      <a class="top-link" href="report.html">Findings</a>
      <button class="top-button ${state.view === "desktop" ? "active" : ""}"
        data-view="desktop" aria-label="Use desktop viewport">Desktop</button>
      <button class="top-button ${state.view === "mobile" ? "active" : ""}"
        data-view="mobile" aria-label="Use mobile viewport">Mobile</button>
      <button class="top-button ${state.drawer ? "active" : ""}" id="drawer-toggle"
        aria-label="Toggle detail drawer">☰</button>
    </div>
  </header>`;
}
