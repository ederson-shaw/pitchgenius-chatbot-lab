import { loadScript } from "./load.js";

export default {
  id: "crisp",
  name: "Crisp",
  category: "Inbox",
  fields: [
    {
      key: "websiteId",
      label: "Website ID",
      placeholder: "Crisp website id",
      help: "Public id from the Crisp dashboard.",
    },
  ],
  async load({ win, doc, cfg, emit }) {
    win.$crisp = win.$crisp || [];
    win.CRISP_WEBSITE_ID = cfg.websiteId;
    await loadScript(doc, "https://client.crisp.chat/l.js");
    emit("crisp.loaded", "Official Crisp script loaded");
  },
  actions: {
    open: ({ win }) => win.$crisp?.push(["do", "chat:open"]),
    close: ({ win }) => win.$crisp?.push(["do", "chat:close"]),
    identify: ({ win, detail }) => {
      if (detail?.email)
        win.$crisp?.push(["set", "user:email", [detail.email]]);
      if (detail?.name)
        win.$crisp?.push(["set", "user:nickname", [detail.name]]);
      if (detail?.company)
        win.$crisp?.push(["set", "user:company", [detail.company]]);
    },
    context: ({ win, detail }) =>
      win.$crisp?.push(["set", "session:data", [Object.entries(detail || {})]]),
    send: ({ win, detail }) =>
      win.$crisp?.push(["do", "message:send", ["text", detail]]),
    reset: ({ win }) => win.$crisp?.push(["do", "session:reset", [false]]),
  },
};
