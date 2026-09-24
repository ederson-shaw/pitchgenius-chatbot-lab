import { loadScript } from "./load.js";

export default {
  id: "hubspot",
  name: "HubSpot",
  category: "CRM",
  fields: [
    {
      key: "portalId",
      label: "Portal ID",
      placeholder: "HubSpot portal id",
      help: "Public portal identifier.",
    },
    {
      key: "region",
      label: "Region",
      placeholder: "na1",
      help: "Regional script host.",
    },
  ],
  async load({ win, doc, cfg, emit }) {
    win.hsConversationsSettings = { region: cfg.region || "na1" };
    await loadScript(
      doc,
      `https://js-${cfg.region || "na1"}.hs-scripts.com/${cfg.portalId}.js`,
    );
    emit("hubspot.loaded", "Official HubSpot Conversations script loaded");
  },
  actions: {
    open: ({ win }) => win.HubSpotConversations?.widget?.open(),
    close: ({ win }) => win.HubSpotConversations?.widget?.close(),
    reset: ({ win }) => win.HubSpotConversations?.clear({ resetWidget: true }),
  },
};
