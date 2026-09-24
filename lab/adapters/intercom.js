import { loadScript } from "./load.js";

export default {
  id: "intercom",
  name: "Intercom",
  category: "Inbox",
  fields: [
    {
      key: "appId",
      label: "App ID",
      placeholder: "Intercom app id",
      help: "Public app identifier.",
    },
  ],
  async load({ win, doc, cfg, emit }) {
    win.Intercom =
      win.Intercom ||
      function (...args) {
        (win.Intercom.q = win.Intercom.q || []).push(args);
      };
    win.intercomSettings = { app_id: cfg.appId };
    await loadScript(doc, `https://widget.intercom.io/widget/${cfg.appId}`);
    emit("intercom.loaded", "Official Intercom widget loaded");
  },
  actions: {
    open: ({ win }) => win.Intercom?.("show"),
    close: ({ win }) => win.Intercom?.("hide"),
    identify: ({ win, detail }) =>
      win.Intercom?.("boot", { ...win.intercomSettings, ...detail }),
    context: ({ win, detail }) => win.Intercom?.("update", detail),
    send: ({ win, detail }) => win.Intercom?.("startConversation", detail),
    reset: ({ win }) => win.Intercom?.("shutdown"),
  },
};
