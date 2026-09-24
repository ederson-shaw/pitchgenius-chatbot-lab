import { mountOwnAgent } from "../own/agent.js";

export default {
  id: "own",
  name: "Own agent",
  category: "PitchGenius",
  fields: [
    {
      key: "baseUrl",
      label: "Base URL",
      placeholder: "https://openrouter.ai/api/v1",
      help: "Stored only in this browser.",
    },
    {
      key: "model",
      label: "Model",
      placeholder: "openai/gpt-4o-mini",
      help: "Use an OpenRouter model id.",
    },
    {
      key: "apiKey",
      label: "API key",
      placeholder: "sk-…",
      help: "Never included in exports.",
    },
  ],
  load({ win, doc, cfg, emit }) {
    const link = doc.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("../own/style.css", import.meta.url).href;
    doc.head.append(link);
    mountOwnAgent(doc, win, cfg, emit);
    emit("own.loaded", "PitchGenius agent mounted");
  },
  actions: {
    open: ({ win }) => win.__pgOwn?.open(),
    close: ({ win }) => win.__pgOwn?.close(),
    identify: ({ win, detail }) => win.__pgOwn?.identify(detail),
    context: ({ win, detail }) => win.__pgOwn?.context(detail),
    reset: ({ win }) => win.__pgOwn?.reset(),
    proactive: ({ win }) => win.__pgOwn?.open(),
    send: ({ win, detail }) => {
      if (win.__pgOwn) {
        win.__pgOwn.open();
        win.__pgOwn.view.input.value = detail || "";
        win.__pgOwn.view.form.requestSubmit();
      }
    },
    brand: ({ win, detail }) => {
      if (detail?.colour)
        win.document.documentElement.style.setProperty(
          "--pg-agent-accent",
          detail.colour,
        );
    },
  },
};
