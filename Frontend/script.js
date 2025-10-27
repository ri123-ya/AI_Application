const input = document.getElementById("input");

const chatContainer = document.getElementById("chat-container");

const askBtn = document.getElementById("ask");

const threadId = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

console.log(input);

input?.addEventListener("keyup", handleClick);

askBtn?.addEventListener("click", handleAsk);

const loading = document.createElement("div");
loading.className = "my-6 animate-pulse";
loading.textContent = "Thinking...";

async function generate(text) {
  /**
   * 1. append user msg to ui
   * 2. send the msg to LLM
   * 3. append the response to ui
   */

  const msg = document.createElement("div");
  msg.className = `bg-neutral-800 my-6 p-3 rounded-lg ml-auto max-w-fit`;
  msg.innerText = text;

  chatContainer.appendChild(msg);
  scrollToBottom();

  input.value = ""; //empty the input field

  chatContainer?.appendChild(loading);
  scrollToBottom();

  //call the server
  const assistantMsg = await callServer(text);

  const assistantElem = document.createElement("div");
  assistantElem.className = `max-w-fit`;
  assistantElem.innerText = assistantMsg;
   loading.remove();
   scrollToBottom();
  chatContainer.appendChild(assistantElem);
  scrollToBottom();
  //console.log("Assistant : " , assistantMsg);
}
function scrollToBottom() {
  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: "smooth", 
  });
}
async function callServer(msg) {
  const response = await fetch("http://localhost:3001/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: msg, threadId: threadId }),
  });

  if (!response.ok) {
    throw new Error("Error in fetching from server");
  }

  const result = await response.json();
  return result.message;
}

async function handleAsk(e) {
  const text = input.value.trim();
  if (!text) return;

  await generate(text);
}

async function handleClick(e) {
  if (e.key === "Enter") {
    const text = input.value.trim();
    if (!text) return;

    await generate(text);
  }
}
