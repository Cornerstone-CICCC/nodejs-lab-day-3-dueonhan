"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chat_model_1 = require("../models/chat.model");
const chat_controller_1 = __importDefault(require("../controllers/chat.controller"));
const setupChatSocket = (io) => {
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);
        socket.on("sendMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { username, message } = data;
            if (!username || !message)
                return;
            try {
                const chat = new chat_model_1.Chat({ username, message });
                yield chat.save();
                io.emit("newMessage", chat);
            }
            catch (error) {
                console.error("Error saving chat:", error);
            }
        }));
        socket.on("sendRoomChat", (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { username, message, room } = data;
            if (!username || !message || !room)
                return;
            try {
                const chat = new chat_model_1.Chat({ username, message, room });
                yield chat.save();
                io.to(room).emit("chatRoom", chat);
            }
            catch (error) {
                console.error("Error saving chat:", error);
            }
        }));
        socket.on("joinRoom", (data) => {
            const { room, username } = data;
            if (!room || !username)
                return;
            socket.join(room);
            chat_controller_1.default.addUser(room, socket.id, username);
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
            io.to(room).emit("updateRoomUsers", chat_controller_1.default.getUsersInRoom(room));
        });
        socket.on("leaveRoom", (data) => {
            const { room } = data;
            if (!room)
                return;
            const username = chat_controller_1.default.getUsername(room, socket.id);
            chat_controller_1.default.removeUser(room, socket.id);
            socket.leave(room);
            if (username) {
                io.to(room).emit("chatRoom", {
                    username: "System",
                    message: `${username} has left ${room}`,
                });
                io.to(room).emit("updateRoomUsers", chat_controller_1.default.getUsersInRoom(room));
            }
        });
        socket.on("chatRoom", (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { room, message } = data;
            if (!room || !message)
                return;
            const username = chat_controller_1.default.getUsername(room, socket.id) || "Unknown";
            try {
                const chat = new chat_model_1.Chat({ username, message, room });
                yield chat.save();
                io.to(room).emit("chatRoom", { username, message });
            }
            catch (error) {
                console.error("Error saving chat:", error);
            }
        }));
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};
exports.default = setupChatSocket;
