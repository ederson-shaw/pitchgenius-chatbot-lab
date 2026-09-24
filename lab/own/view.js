function makeNode(doc, markup) {
  const wrapper = doc.createElement("div");

  wrapper.innerHTML = markup.trim();

  return wrapper.firstElementChild;
}

function addMessage(view, text, role) {
  const message = view.doc.createElement("div");

  message.className = `pg-agent-message ${role}`;
  message.textContent = text;
  view.main.append(message);
  view.main.scrollTop = view.main.scrollHeight;

  return message;
}

function addQuickReply(view, label, opensBooking, showBooking) {
  const button = view.doc.createElement("button");

  button.className = "pg-agent-send pg-agent-action";
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", () => {
    if (opensBooking) showBooking(view);
    else {
      view.input.value = label;
      view.form.requestSubmit();
    }
  });
  view.main.append(button);
}

function applySiteTokens(doc, win) {
  const cta = [...doc.querySelectorAll("a, button")].find((node) => node.textContent.trim() === "Book a pilot");

  if (!cta) return;

  const styles = win.getComputedStyle(cta);

  doc.documentElement.style.setProperty("--pg-agent-accent", styles.backgroundColor);
  doc.documentElement.style.setProperty("--pg-agent-cta-text", styles.color);
  doc.documentElement.style.setProperty("--pg-agent-font", styles.fontFamily);
}

export function showBooking(view) {
  view.booking.hidden = false;
  view.bookingClose.focus();
}

export function resetView(view) {
  view.history = [];
  view.context = {};
  view.ghlState = null;
  view.main.replaceChildren();
}

function panelMarkup() {
  return `
    <section class="pg-agent-panel" aria-label="PitchGenius guide" hidden>
      <header class="pg-agent-head">
        <div>
          <strong>PitchGenius guide</strong>
          <span data-page-context>AI assistant · page context</span>
        </div>
        <button class="pg-agent-close" aria-label="Close PitchGenius guide">×</button>
      </header>
      <main class="pg-agent-main"></main>
      <form class="pg-agent-actions">
        <input
          class="pg-agent-input"
          aria-label="Message the PitchGenius guide"
          placeholder="Ask about buyer intelligence…"
        >
        <button class="pg-agent-send" aria-label="Send message">Send</button>
      </form>
      <details class="pg-agent-settings">
        <summary>Local model settings</summary>
        <input data-key="baseUrl" placeholder="OpenRouter or compatible base URL">
        <input data-key="model" placeholder="Model name">
        <input data-key="apiKey" type="password" placeholder="API key stays in this browser">
      </details>
    </section>
  `;
}

function bookingMarkup() {
  return `
      <div
        class="pg-agent-booking"
        role="dialog"
        aria-modal="true"
        aria-label="Book a PitchGenius pilot"
        hidden
      >
        <button class="pg-agent-booking-close" aria-label="Close booking calendar">×</button>
        <iframe
          title="PitchGenius booking calendar"
          src="https://api.leadconnectorhq.com/widget/bookings/investor-introduction-0g3fy"
        ></iframe>
      </div>
  `;
}

export function createView(doc, win, cfg, emit) {
  const launcher = makeNode(
    doc,
    "<button class='pg-agent-launcher' aria-label='Open PitchGenius guide'>Open guide</button>",
  );
  const panel = makeNode(doc, panelMarkup());
  const booking = makeNode(doc, bookingMarkup());

  doc.body.append(launcher, panel, booking);
  applySiteTokens(doc, win);

  const view = {
    doc,
    win,
    cfg,
    emit,
    launcher,
    panel,
    booking,
    bookingClose: booking.querySelector(".pg-agent-booking-close"),
    main: panel.querySelector(".pg-agent-main"),
    form: panel.querySelector("form"),
    input: panel.querySelector(".pg-agent-input"),
    pageContext: panel.querySelector("[data-page-context]"),
    history: [],
    context: {},
    ghlState: null,
  };

  view.addMessage = (text, role) => addMessage(view, text, role);
  view.addQuickReply = (label, opensBooking) => addQuickReply(view, label, opensBooking, showBooking);

  return view;
}
