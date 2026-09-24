function testedBy(criteriaId, scenarios, escapeHtml) {
  const matches = scenarios.groups
    .flatMap((group) => group.items)
    .filter((item) => item.criteria?.includes(criteriaId));

  if (!matches.length) return `<span class="small">No mapped scenario</span>`;

  const links = matches
    .map(
      (item) => `<span class="scenario-chip">${escapeHtml(item.title)}</span>`,
    )
    .join("");

  return `<span class="scenario-links">${links}</span>`;
}

function renderScoreRow(criterion, adapters, data, escapeHtml) {
  const cells = adapters
    .map(
      (item) => `<td>
        <input data-score="${criterion.id}" data-bot="${item.id}"
          type="number" min="0" max="100"
          value="${localStorage.getItem(`pg.score.${item.id}.${criterion.id}`) || ""}"
          aria-label="${item.name} ${criterion.id}">
        <input class="note" data-score-note="${criterion.id}" data-bot="${item.id}"
          placeholder="note"
          value="${escapeHtml(localStorage.getItem(`pg.note.${item.id}.${criterion.id}`) || "")}"
          aria-label="${item.name} ${criterion.id} note">
      </td>`,
    )
    .join("");

  return `<tr>
    <td>
      <strong>${escapeHtml(criterion.id)}</strong>
      <span class="criterion-title">${escapeHtml(criterion.title)}</span>
      <span class="criterion-test">${escapeHtml(criterion.test)}</span>
      ${testedBy(criterion.id, data.scenarios, escapeHtml)}
    </td>
    ${cells}
  </tr>`;
}

function renderScoreRows(criteria, adapters, data, escapeHtml) {
  return criteria
    .map((criterion) => renderScoreRow(criterion, adapters, data, escapeHtml))
    .join("");
}

function renderScoreHeader(adapters, escapeHtml) {
  const headings = adapters
    .map((item) => `<th>${escapeHtml(item.name)}</th>`)
    .join("");

  return `<thead><tr><th>Criterion / test</th>${headings}</tr></thead>`;
}

export function renderScore({ data, adapters, escapeHtml }) {
  const criteria = data.criteria.criteria || [];
  const rows = renderScoreRows(criteria, adapters, data, escapeHtml);

  return `<div class="panel-title">
    <div>
      <div class="eyebrow">Human judgment</div>
      <h2>Scorecard</h2>
      <p>Raw numbers, mapped scenarios, and notes. No average, ranking, or winner.</p>
    </div>
  </div>
  <div class="score-grid">
    <table>
      ${renderScoreHeader(adapters, escapeHtml)}
      <tbody>${rows}</tbody>
    </table>
  </div>
  <div class="button-row">
    <button class="button" data-action="export-score">Export JSON</button>
    <button class="button" data-action="import-score">Import JSON</button>
    <input id="score-file" type="file" accept="application/json" hidden>
  </div>`;
}
