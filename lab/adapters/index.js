import own from "./own.js";
import snippet from "./snippet.js";
import crisp from "./crisp.js";
import tawk from "./tawk.js";
import intercom from "./intercom.js";
import tidio from "./tidio.js";
import hubspot from "./hubspot.js";
import botpress from "./botpress.js";
import voiceflow from "./voiceflow.js";
import typebot from "./typebot.js";
import chatbase from "./chatbase.js";
import chatwoot from "./chatwoot.js";
import zoho from "./zoho.js";
import ghl from "./ghl.js";
import deepChat from "./deep-chat.js";
import reactChatbotify from "./react-chatbotify.js";
import chatling from "./chatling.js";
import docsbot from "./docsbot.js";
import freshchat from "./freshchat.js";
import jivochat from "./jivochat.js";
import wonderchat from "./wonderchat.js";
import yellow from "./yellow.js";

const dedicated = [
  own,
  deepChat,
  reactChatbotify,
  crisp,
  tawk,
  intercom,
  tidio,
  hubspot,
  botpress,
  voiceflow,
  typebot,
  chatbase,
  chatwoot,
  zoho,
  ghl,
  chatling,
  docsbot,
  freshchat,
  jivochat,
  wonderchat,
  yellow,
];

function snippetAdapter(vendor) {
  return {
    ...snippet,
    id: vendor.id,
    name: vendor.name,
    category: vendor.group || vendor.category,
    fields: vendor.noSignup ? [] : snippet.fields,
  };
}

export function makeAdapter(vendor) {
  const match = dedicated.find((adapter) => adapter.id === vendor.id);

  if (vendor.adapter === "demo" && match)
    return { ...match, name: vendor.name, category: vendor.group };

  if (vendor.adapter === "own" && match)
    return { ...match, name: vendor.name, category: vendor.group };

  if (vendor.adapter === "snippet") {
    const base = snippetAdapter(vendor);

    return { ...base, actions: match?.actions || {} };
  }

  if (match) return { ...match, name: vendor.name, category: vendor.group };

  return snippetAdapter(vendor);
}

export function makeAdapters(vendors) {
  return vendors.map(makeAdapter);
}
