import { loadScript } from "./load.js";

export default {
  id: "chatwoot",
  name: "Chatwoot",
  category: "Inbox",
  fields: [
    {
      key: "baseUrl",
      label: "Base URL",
      placeholder: "https://app.chatwoot.com",
      help: "Chatwoot installation URL.",
    },
    {
      key: "websiteToken",
      label: "Website token",
      placeholder: "website token",
      help: "Public website token.",
    },
  ],
  async load({ win, doc, cfg, emit }) {
    win.chatwootSettings = {
      position: "right",
      type: "standard",
      locale: "en",
    };
    await loadScript(doc, `${cfg.baseUrl.replace(/\/$/, "")}/packs/js/sdk.js`, {
      ready: () =>
        win.chatwootSDK?.run({
          websiteToken: cfg.websiteToken,
          baseUrl: cfg.baseUrl,
        }),
    });
    emit("chatwoot.loaded", "Official Chatwoot SDK loaded");
  },
  actions: {},
};
