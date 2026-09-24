import { loadScript } from "./load.js";

export default {
  id: "ghl",
  name: "LeadConnector",
  category: "CRM",
  fields: [
    {
      key: "widgetId",
      label: "Widget ID",
      placeholder: "LeadConnector widget id",
      help: "Public chat widget id from GHL.",
    },
  ],
  async load({ doc, cfg, emit }) {
    await loadScript(doc, "https://widgets.leadconnectorhq.com/loader.js", {
      attributes: {
        "data-resources-url":
          "https://widgets.leadconnectorhq.com/chat-widget/loader.js",
        "data-widget-id": cfg.widgetId,
      },
    });
    emit("ghl.loaded", "Official LeadConnector loader loaded");
  },
  actions: {
    open: ({ win }) => win.leadConnector?.chatWidget?.openWidget(),
    close: ({ win }) => win.leadConnector?.chatWidget?.closeWidget(),
    brand: ({ win, detail }) =>
      win.leadConnector?.chatWidget?.localizeWidget({ name: detail?.name }),
  },
};
