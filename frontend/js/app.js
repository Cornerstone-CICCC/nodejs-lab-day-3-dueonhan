const chatForm = document.getElementById("chat-form");
const messages = document.getElementById("messages");
const usernameInput = document.getElementById("username");
const chatInput = document.getElementById("message");
const userList = document.getElementById("users");
const loadBtn = document.getElementById("load");

const socket = io("http://localhost:3500"); // backend url

let currentUsername = null;

loadBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:3500/api/chat/");
    if (!res.ok) throw new Error("Failed to fetch chats");

    const chats = await res.json();
    messages.innerHTML = "";

    chats.forEach((chat) => {
      const li = document.createElement("li");
      li.innerHTML = `<span style="${
        chat.username === currentUsername ? "color: green" : "color: black"
      }">${chat.username}</span>: ${chat.message}`;
      messages.appendChild(li);
    });
  } catch (error) {
    console.error(error);
  }
});

chatForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!currentUsername) {
    currentUsername = usernameInput.value.trim();
    if (!usernameInput.value.trim()) {
      alert("Enter username first!");
      return;
    }
    socket.emit("join", currentUsername);
    usernameInput.disabled = true;
  }

  socket.emit("sendMessage", {
    username: usernameInput.value,
    message: chatInput.value,
  });

  chatInput.value = "";
});

socket.on("newMessage", (data) => {
  const li = document.createElement("li");
  li.innerHTML = `<span style="${
    data.username === currentUsername ? "color: green" : "color: black"
  }">${data.username}</span>: ${data.message}`;
  messages.appendChild(li);
});

// Listen for user updates
socket.on("updateUsers", (data) => {
  //alert("data", data);
  users.innerHTML = "";
  data.forEach((u) => {
    const li = document.createElement("li");
    li.textContent = u;
    users.appendChild(li);
  });
});
