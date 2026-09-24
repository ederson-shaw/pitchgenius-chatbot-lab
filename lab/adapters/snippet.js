function parseNodes(doc, source) {
  const template = doc.createElement("template");
  template.innerHTML = source;
  return [...template.content.childNodes];
}

function appendScript(doc, node) {
  const script = doc.createElement("script");

  [...node.attributes].forEach((attribute) =>
    script.setAttribute(attribute.name, attribute.value),
  );
  script.textContent = node.textContent;

  if (!node.src) {
    doc.body.append(script);
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error(`Could not load ${node.src}`)),
      { once: true },
    );
    doc.body.append(script);
  });
}

export default {
  id: "snippet",
  name: "Raw snippet",
  category: "Generic",
  fields: [
    {
      key: "snippet",
      label: "Embed snippet",
      placeholder: "<script>...</script>",
      help: "Scripts and non-script nodes are recreated inside the frame.",
    },
  ],
  async load({ doc, cfg, emit }) {
    const nodes = parseNodes(doc, cfg.snippet || "");

    for (const node of nodes) {
      if (node.nodeName === "SCRIPT") await appendScript(doc, node);
      else if (node.nodeType === 1) doc.body.append(node.cloneNode(true));
    }

    emit("snippet.loaded", `${nodes.length} nodes recreated`);
  },
  actions: {},
};
