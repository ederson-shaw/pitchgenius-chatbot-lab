import { loadScript } from "./load.js";

export default {
  id: "voiceflow",
  name: "Voiceflow",
  category: "Agent",
  fields: [
    {
      key: "projectId",
      label: "Project ID",
      placeholder: "Voiceflow project id",
      help: "From the web chat API deploy panel.",
    },
    {
      key: "versionId",
      label: "Version ID",
      placeholder: "production",
      help: "Environment alias.",
    },
  ],
  async load({ win, doc, cfg, emit }) {
    await loadScript(doc, "https://cdn.voiceflow.com/widget/bundle.mjs", {
      ready: () =>
        win.voiceflow?.chat?.load({
          verify: { projectID: cfg.projectId },
          versionID: cfg.versionId || "production",
          url: "https://general-runtime.voiceflow.com",
          assistant: { persistence: "localStorage" },
        }),
    });
    emit("voiceflow.loaded", "Official web chat API loaded");
  },
  actions: {
    open: ({ win }) => win.voiceflow?.chat?.open(),
    close: ({ win }) => win.voiceflow?.chat?.close(),
    context: ({ win, detail }) =>
      win.voiceflow?.chat?.interact({
        action: { type: "event", payload: detail },
      }),
    send: ({ win, detail }) =>
      win.voiceflow?.chat?.interact({
        action: { type: "text", payload: detail },
      }),
    proactive: ({ win, detail }) =>
      win.voiceflow?.chat?.proactive?.push(detail),
    reset: ({ win }) => win.voiceflow?.chat?.destroy(),
  },
};
