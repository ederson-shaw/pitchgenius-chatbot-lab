import { loadScript } from "./load.js";

export default {
  id: "tidio",
  name: "Tidio",
  category: "Inbox",
  fields: [
    {
      key: "publicKey",
      label: "Public key",
      placeholder: "Tidio public key",
      help: "Public widget key.",
    },
  ],
  async load({ doc, cfg, emit }) {
    await loadScript(doc, `https://code.tidio.co/${cfg.publicKey}.js`);
    emit("tidio.loaded", "Official Tidio widget loaded");
  },
  actions: {
    open: ({ win }) => win.tidioChatApi?.open(),
    send: ({ win, detail }) =>
      win.tidioChatApi?.method("messageFromVisitor", detail),
  },
};
