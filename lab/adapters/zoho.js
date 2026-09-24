import { loadScript } from "./load.js";

export default {
  id: "zoho",
  name: "Zoho SalesIQ",
  category: "CRM",
  fields: [
    {
      key: "widgetCode",
      label: "Widget code",
      placeholder: "SalesIQ widget code",
      help: "Public code from SalesIQ.",
    },
  ],
  async load({ doc, cfg, emit }) {
    await loadScript(
      doc,
      `https://salesiq.zohopublic.com/widget?wc=${cfg.widgetCode}`,
    );
    emit("zoho.loaded", "Official SalesIQ widget loaded");
  },
  actions: {
    identify: ({ win, detail }) => {
      if (win.$zoho?.salesiq?.visitor) {
        if (detail?.name) win.$zoho.salesiq.visitor.name(detail.name);
        if (detail?.email) win.$zoho.salesiq.visitor.email(detail.email);
      }
    },
  },
};
