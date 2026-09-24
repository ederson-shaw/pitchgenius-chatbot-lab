import { loadScript } from "./load.js";

export default {
  id: "typebot",
  name: "Typebot",
  category: "Agent",
  fields: [
    {
      key: "typebotId",
      label: "Typebot ID",
      placeholder: "published typebot id",
      help: "Published typebot identifier.",
    },
  ],
  async load({ win, doc, cfg, emit }) {
    await loadScript(
      doc,
      "https://cdn.jsdelivr.net/npm/@typebot.io/js@0/dist/web.js",
      {
        attributes: { type: "module" },
        ready: () =>
          win.Typebot?.initBubble({
            typebot: cfg.typebotId,
            theme: { button: { backgroundColor: "#2d61d4" } },
          }),
      },
    );
    emit("typebot.loaded", "Official Typebot CDN loaded");
  },
  actions: {
    open: ({ win }) => win.Typebot?.open(),
    close: ({ win }) => win.Typebot?.close(),
    context: ({ win, detail }) => win.Typebot?.setPrefilledVariables(detail),
    send: ({ win, detail }) => {
      win.Typebot?.setInputValue(detail);
      win.Typebot?.submitInput();
    },
    proactive: ({ win, detail }) => win.Typebot?.showPreviewMessage(detail),
    reset: ({ win }) => win.Typebot?.reset(),
  },
};
