const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");
const messagesDiv = document.getElementById("messages");

function addMessage(text, role) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.textContent = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMsg = input.value.trim();
  if (!userMsg) return;

  addMessage(userMsg, "user");
  input.value = "";
  input.disabled = true;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg })
    });
    const data = await res.json();
    addMessage(data.reply, "bot");
  } catch (err) {
    console.error(err);
    addMessage("Ошибка сервера, попробуйте позже.", "bot");
  } finally {
    input.disabled = false;
    input.focus();
  }
});
