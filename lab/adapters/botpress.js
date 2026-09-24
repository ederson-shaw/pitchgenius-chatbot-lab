import { loadScript } from "./load.js";

export default {
  id: "botpress",
  name: "Botpress",
  category: "Agent",
  fields: [
    {
      key: "botId",
      label: "Bot ID",
      placeholder: "Botpress bot id",
      help: "From Webchat Deploy Settings.",
    },
    {
      key: "clientId",
      label: "Client ID",
      placeholder: "Botpress client id",
      help: "From Webchat Deploy Settings.",
    },
  ],
  async load({ win, doc, cfg, emit }) {
    await loadScript(doc, "https://cdn.botpress.cloud/webchat/v3.3/inject.js", {
      ready: () =>
        win.botpress?.init({
          botId: cfg.botId,
          clientId: cfg.clientId,
          configuration: {
            variant: "soft",
            themeMode: "light",
            fontFamily: "inter",
          },
        }),
    });
    emit("botpress.loaded", "Official Webchat v3.3 loaded");
  },
  actions: {
    open: ({ win }) => win.botpress?.open(),
    close: ({ win }) => win.botpress?.close(),
    identify: ({ win, detail }) => win.botpress?.updateUser(detail),
    context: ({ win, detail }) => win.botpress?.config({ data: detail }),
    send: ({ win, detail }) => win.botpress?.sendMessage(detail),
    reset: ({ win }) => win.botpress?.restartConversation(),
  },
};
