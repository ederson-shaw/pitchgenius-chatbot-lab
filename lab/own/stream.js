function readJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractReply(value) {
  const match = value.match(/"reply"\s*:\s*"((?:\\.|[^"\\])*)/);

  return match ? readJson(`"${match[1]}"`) : "";
}

function mergeStructured(current, next) {
  if (!current) return next;
  if (Array.isArray(current) && Array.isArray(next)) return [...current, ...next];

  if (current && next && typeof current === "object" && typeof next === "object") {
    const keys = Array.from(new Set([...Object.keys(current), ...Object.keys(next)]));

    return Object.fromEntries(keys.map((key) => [key, mergeStructured(current[key], next[key])]));
  }

  return next ?? current;
}

function appendChunk(view, chunk, stream) {
  chunk.split("\n").forEach((line) => {
    if (!line.startsWith("data:")) return;

    const value = line.slice(5).trim();

    if (value === "[DONE]") return;

    const parsed = readJson(value);

    stream.text += parsed?.choices?.[0]?.delta?.content || "";
    const reply = extractReply(stream.text);

    if (reply && !stream.message) stream.message = view.addMessage(reply, "agent");
    else if (reply && stream.message) stream.message.textContent = reply;
  });
}

function payloadFromState(value) {
  const crm = value?.crm || {};

  return {
    contact: value?.contact || crm.contact || {},
    answers: value?.answers || {},
    tags: crm.tags || value?.tags || [],
    lead_status: crm.lead_status || value?.lead_status || "",
    pipeline_stage: crm.pipeline_stage || value?.pipeline_stage || "",
    summary: crm.summary || value?.summary || "",
  };
}

async function getPrompt(win) {
  const response = await win.fetch(new URL("./prompt.md", import.meta.url).href);

  return response.text();
}

function getBody(view, prompt) {
  return {
    model: view.cfg.model,
    stream: true,
    messages: [{ role: "system", content: prompt }, ...view.history],
    metadata: { page: view.win.location.pathname, context: view.context },
  };
}

async function requestModel(view) {
  const prompt = await getPrompt(view.win);
  const response = await view.win.fetch(`${view.cfg.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${view.cfg.apiKey || ""}`,
    },
    body: JSON.stringify(getBody(view, prompt)),
  });

  if (!response.ok || !response.body) throw new Error(`Model request failed with ${response.status}`);

  return response;
}

async function readModelStream(view, response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const stream = { text: "", message: null, buffer: "" };

  while (true) {
    const { done, value } = await reader.read();

    stream.buffer += decoder.decode(value || new Uint8Array(), {
      stream: !done,
    });
    const lines = stream.buffer.split("\n");

    stream.buffer = lines.pop() || "";
    appendChunk(view, lines.join("\n"), stream);

    if (done) break;
  }

  return stream;
}

function finishModelTurn(view, stream) {
  const output = readJson(stream.text);

  if (!output?.reply) throw new Error("The stream ended before a complete structured reply arrived.");

  view.ghlState = mergeStructured(view.ghlState, output);
  view.emit("own.turn", output);
  view.emit("own.payload", payloadFromState(view.ghlState));
  view.history.push({ role: "assistant", content: output.reply });
  output.buttons?.forEach((label) => view.addQuickReply(label, output.next_action === "offer_booking"));

  return output;
}

export async function streamObject(view) {
  const response = await requestModel(view);
  const stream = await readModelStream(view, response);

  return finishModelTurn(view, stream);
}
