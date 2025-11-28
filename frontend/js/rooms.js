const socket = io("http://localhost:3500");

const roomSelect = document.getElementById("room-select");
const usernameInput = document.getElementById("username");
const messages = document.getElementById("messages");
const btnJoin = document.getElementById("btn-join");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-message");
const users = document.getElementById("users");
const btnLoad = document.getElementById("btn-load");

let currentUsername = null;
let currentRoom = null;

btnLoad.addEventListener("click", async (e) => {
  e.preventDefault();
  if (!currentRoom) {
    alert("Please join a room first!");
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:3500/api/chat/chat/${currentRoom}`
    );
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

btnJoin.addEventListener("click", function () {
  const username = usernameInput.value.trim();
  const selectedRoom = roomSelect.value;

  if (!username) {
    alert("Enter a username!");
    return;
  }

  if (currentRoom) {
    socket.emit("leaveRoom", { room: currentRoom });
    messages.innerHTML = "";
  }

  currentUsername = username;
  currentRoom = selectedRoom;
  socket.emit("joinRoom", {
    room: selectedRoom,
    username: currentUsername,
  });
});

chatForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!currentRoom || !currentUsername) {
    alert("Join a room first!");
    return;
  }
  if (!message) return;

  socket.emit("sendRoomChat", {
    room: currentRoom,
    username: currentUsername,
    message: message,
  });
  chatInput.value = "";
});

socket.on("chatRoom", (data) => {
  const li = document.createElement("li");
  li.textContent = `${data.username}: ${data.message}`;
  messages.appendChild(li);
});

socket.on("updateRoomUsers", (data) => {
  users.innerHTML = "";
  data.forEach((u) => {
    const li = document.createElement("li");
    li.textContent = u;
    users.appendChild(li);
  });
});
