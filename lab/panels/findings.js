function renderBody(body, escapeHtml) {
  return body
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split("\n").filter(Boolean);
      if (lines.every((line) => line.trim().startsWith("- ")))
        return `<ul>${lines.map((line) => `<li>${escapeHtml(line.trim().slice(2))}</li>`).join("")}</ul>`;
      return `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`;
    })
    .join("");
}

export function renderFindings({ report, escapeHtml }) {
  const sections = report?.sections || [];
  const rows = sections
    .map(
      (section) => `<details class="finding-row">
        <summary>
          <span class="finding-title">${escapeHtml(section.title)}</span>
          <span class="finding-preview">${escapeHtml(section.preview)}</span>
        </summary>
        <div class="finding-body">${renderBody(section.body, escapeHtml)}</div>
      </details>`,
    )
    .join("");

  return `<aside class="overlay-sheet findings-sheet" aria-label="Findings">
    <div class="overlay-head">
      <div>
        <span class="eyebrow">Owner notes</span>
        <h2>${escapeHtml(report?.title || "Findings")}</h2>
        <p>Short sections first. Open only what you need to review.</p>
      </div>
    </div>
    <div class="overlay-scroll findings-list">${rows}</div>
  </aside>`;
}
