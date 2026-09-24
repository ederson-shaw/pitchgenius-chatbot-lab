import { loadScript } from "./load.js";

export default {
  id: "chatbase",
  name: "Chatbase",
  category: "Agent",
  fields: [
    {
      key: "chatbotId",
      label: "Chatbot ID",
      placeholder: "Chatbase chatbot id",
      help: "Public embed identifier.",
    },
  ],
  async load({ win, doc, cfg, emit }) {
    win.chatbaseConfig = { chatbotId: cfg.chatbotId };
    await loadScript(doc, "https://www.chatbase.co/embed.min.js");
    emit("chatbase.loaded", "Official Chatbase embed loaded");
  },
  actions: {
    open: ({ win }) => win.chatbase?.("open"),
  },
};
