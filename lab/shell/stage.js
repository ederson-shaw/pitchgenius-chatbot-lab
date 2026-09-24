import {
  configFor,
  currentVendor,
  escapeHtml,
  isReady,
  state,
} from "./state.js";

function savedSnippet(item) {
  return String(configFor(item).snippet || "").trim();
}

function setupCard(item, vendor) {
  const snippet = savedSnippet(item);
  const embed = Array.isArray(vendor.embed)
    ? vendor.embed.join("\n")
    : vendor.embed;
  const snippetArea = [
    '<textarea data-config="snippet" ',
    `placeholder="${escapeHtml(embed || "<script>...</script>")}">`,
    `${escapeHtml(snippet)}</textarea>`,
  ].join("");

  return `<div class="signup-card">
    <span class="eyebrow">Provider setup</span>
    <strong>Needs a signup</strong>
    <p>
      ${escapeHtml(vendor.verdict || "This provider needs an account before it can render here.")}
    </p>
    <a
      class="button primary"
      href="${escapeHtml(vendor.signupUrl)}"
      target="_blank"
      rel="noreferrer"
    >Open signup ↗</a>
    <label class="field">
      <span>Paste the provider embed snippet</span>
      ${snippetArea}
    </label>
    <button class="button" data-action="save-config">Save snippet and reload</button>
  </div>`;
}

function platformCard(vendor) {
  return `<div class="empty-stage platform-stage">
    <span class="eyebrow">Owner decision</span>
    <strong>${escapeHtml(vendor.name)} is not loadable yet</strong>
    <span>${escapeHtml(vendor.verdict)}</span>
  </div>`;
}

export function renderStage(item) {
  const vendor = currentVendor();

  if (vendor.platform) return platformCard(vendor);

  if (!isReady(item) && item.fields?.some((field) => field.key === "snippet"))
    return setupCard(item, vendor);

  if (!isReady(item))
    return `<div class="empty-stage">
      <strong>${escapeHtml(vendor.name)} needs setup</strong>
      <span>Open Bot and paste its public configuration values before loading the stage.</span>
    </div>`;

  const frame = `<iframe class="frame ${state.view === "mobile" ? "mobile" : ""}"
    id="home-frame" src="home.html" title="PitchGenius website preview"></iframe>`;

  if (state.view === "mobile")
    return `<div class="device-frame">
      <div class="device-speaker" aria-hidden="true"></div>
      <div class="device-screen">${frame}</div>
    </div>`;

  return frame;
}
