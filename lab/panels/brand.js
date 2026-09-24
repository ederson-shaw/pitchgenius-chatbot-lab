export function renderBrand(item, actionButton) {
  return `<div class="panel-title">
    <div>
      <div class="eyebrow">Widget surface</div>
      <h2>Brand controls</h2>
      <p>Applied values travel through the adapter only when documented.</p>
    </div>
  </div>
  <div class="field">
    <label for="colour">Primary colour</label>
    <input id="colour" data-brand="colour" value="#2D61D4">
  </div>
  <div class="field">
    <label for="bot-name">Bot name</label>
    <input id="bot-name" data-brand="name" value="PitchGenius guide">
  </div>
  <div class="field">
    <label for="position">Launcher position</label>
    <select id="position" data-brand="position">
      <option value="bottom-right">Bottom right</option>
      <option value="bottom-left">Bottom left</option>
    </select>
  </div>
  <div class="field">
    <label for="greeting">Greeting</label>
    <textarea id="greeting" data-brand="greeting">Hi, I’m the PitchGenius guide. What brings you here?</textarea>
  </div>
  ${actionButton(item, "brand", "Apply brand")}`;
}
