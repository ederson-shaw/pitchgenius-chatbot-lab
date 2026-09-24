const moduleUrl =
  "https://esm.sh/react-chatbotify@2.5.0?deps=react@18.3.1,react-dom@18.3.1";
const styleUrl = "https://unpkg.com/react-chatbotify@2.5.0/dist/style.css";

function sourceFor() {
  return `
import React from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import ChatBot from "${moduleUrl}";

const mount = document.createElement("div");
mount.id = "react-chatbotify-demo";
mount.style.cssText =
  "position: fixed; z-index: 30; right: 24px; bottom: 24px; height: 560px; width: 420px;";
document.body.append(mount);

const flow = {
  start: {
    message: "Hello from a client-side flow. Ask me about the team plan.",
    path: "answer",
  },
  answer: {
    message: "The demo is scripted in the page, so it needs no account or API key.",
    path: "end",
  },
  end: {
    message: "Thanks for testing React Chatbotify.",
    end: true,
  },
};

const settings = {
  general: {
    embedded: true,
    primaryColor: "#1ebeb4",
    secondaryColor: "#12243d",
    fontFamily: "Pitch Manrope, system-ui, sans-serif",
    showFooter: false,
  },
  header: { title: "PitchGenius guide", showAvatar: false, buttons: [] },
  tooltip: { mode: "CLOSE", text: "PitchGenius guide" },
};

createRoot(mount).render(React.createElement(ChatBot, { flow, settings }));
window.parent.postMessage({ type: "react-chatbotify.loaded" }, "*");
`;
}

function demoScript(doc) {
  const script = doc.createElement("script");

  script.type = "module";
  script.textContent = sourceFor();

  return script;
}

export default {
  id: "react-chatbotify",
  name: "React Chatbotify",
  category: "No signup",
  fields: [],
  load({ doc, emit }) {
    const style = doc.createElement("link");
    style.rel = "stylesheet";
    style.href = styleUrl;
    doc.head.append(style);
    doc.body.append(demoScript(doc));
    emit(
      "react-chatbotify.loaded",
      "Client-side scripted demo loaded from esm.sh",
    );
  },
  actions: {},
};
