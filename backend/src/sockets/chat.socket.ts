import { Server, Socket } from "socket.io";
import { Chat } from "../models/chat.model";
import chatController from "../controllers/chat.controller";

const setupChatSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("sendMessage", async (data) => {
      const { username, message } = data;
      if (!username || !message) return;
      try {
        const chat = new Chat({ username, message });
        await chat.save();
        io.emit("newMessage", chat);
      } catch (error) {
        console.error("Error saving chat:", error);
      }
    });

    socket.on("sendRoomChat", async (data) => {
      const { username, message, room } = data;
      if (!username || !message || !room) return;
      try {
        const chat = new Chat({ username, message, room });
        await chat.save();
        io.to(room).emit("chatRoom", chat);
      } catch (error) {
        console.error("Error saving chat:", error);
      }
    });

    socket.on("joinRoom", (data) => {
      const { room, username } = data;
      if (!room || !username) return;
      socket.join(room);
      chatController.addUser(room, socket.id, username);
      socket.emit("chatRoom", {
        username: "System",
        message: `Welcome to ${room}, ${username} 😎`,
      });
      socket
        .to(room)
        .emit("chatRoom", {
          username: "System",
          message: `${username} has joined ${room}`,
        });
      io.to(room).emit("updateRoomUsers", chatController.getUsersInRoom(room));
    });

    socket.on("leaveRoom", (data) => {
      const { room } = data;
      if (!room) return;
      const username = chatController.getUsername(room, socket.id);
      chatController.removeUser(room, socket.id);
      socket.leave(room);
      if (username) {
        io.to(room).emit("chatRoom", {
          username: "System",
          message: `${username} has left ${room}`,
        });
        io.to(room).emit(
          "updateRoomUsers",
          chatController.getUsersInRoom(room)
        );
      }
    });

    socket.on("chatRoom", async (data) => {
      const { room, message } = data;
      if (!room || !message) return;
      const username = chatController.getUsername(room, socket.id) || "Unknown";
      try {
        const chat = new Chat({ username, message, room });
        await chat.save();
        io.to(room).emit("chatRoom", { username, message });
      } catch (error) {
        console.error("Error saving chat:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

export default setupChatSocket;
