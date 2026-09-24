import { loadScript } from "./load.js";

const source =
  "https://cdn.jsdelivr.net/npm/deep-chat@2.5.1/dist/deepChat.bundle.js";

function demoElement(doc) {
  const chat = doc.createElement("deep-chat");

  chat.setAttribute(
    "demo",
    JSON.stringify({
      displayLoading: { message: true, history: { small: true } },
    }),
  );
  chat.setAttribute(
    "style",
    "position: fixed; z-index: 30; right: 24px; bottom: 24px; border-radius: 8px; height: 560px; width: 420px;",
  );

  return chat;
}

export default {
  id: "deep-chat",
  name: "Deep Chat",
  category: "No signup",
  fields: [],
  async load({ doc, emit }) {
    await loadScript(doc, source, { attributes: { type: "module" } });
    doc.body.append(demoElement(doc));
    emit("deep-chat.loaded", "Demo mode loaded from the documented CDN");
  },
  actions: {
    send: ({ doc, detail }) =>
      doc.querySelector("deep-chat")?.submitUserMessage({ text: detail }),
    reset: ({ doc }) => doc.querySelector("deep-chat")?.clearMessages(),
  },
};
