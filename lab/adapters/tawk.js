import { loadScript } from "./load.js";

export default {
  id: "tawk",
  name: "Tawk.to",
  category: "Inbox",
  fields: [
    {
      key: "propertyId",
      label: "Property ID",
      placeholder: "Tawk property id",
      help: "Public property from the widget URL.",
    },
    {
      key: "widgetId",
      label: "Widget ID",
      placeholder: "default",
      help: "Usually default.",
    },
  ],
  async load({ doc, cfg, emit }) {
    await loadScript(
      doc,
      `https://embed.tawk.to/${cfg.propertyId}/${cfg.widgetId || "default"}`,
    );
    emit("tawk.loaded", "Official Tawk.to embed loaded");
  },
  actions: {
    open: ({ win }) => win.Tawk_API?.maximize(),
    close: ({ win }) => win.Tawk_API?.minimize(),
    identify: ({ win, detail }) =>
      win.Tawk_API?.setAttributes(detail || {}, () => {}),
    context: ({ win, detail }) =>
      win.Tawk_API?.setAttributes(detail || {}, () => {}),
    reset: ({ win }) => win.Tawk_API?.endChat(),
  },
};
