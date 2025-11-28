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
Object.defineProperty(exports, "__esModule", { value: true });
const chat_model_1 = require("../models/chat.model");
const usersInRoom = {};
// Get all chats
const getAllChats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chats = yield chat_model_1.Chat.find().sort({ createdAt: 1 }); // Sort by createdAt field
        res.status(200).json(chats);
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching chats" });
    }
});
// Get room all chats /api/chat/:room
const getRoomChats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { room } = req.params;
    try {
        const chats = yield chat_model_1.Chat.find({ room }).sort({ createdAt: 1 }); // Sort by createdAt field
        res.status(200).json(chats);
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching chats" });
    }
});
const addUser = (room, socketId, username) => {
    // If room does not exist, create room
    if (!usersInRoom[room]) {
        usersInRoom[room] = {};
    }
    // Add user to room
    usersInRoom[room][socketId] = username;
};
const removeUser = (room, socketId) => {
    const roomUsers = usersInRoom[room];
    if (!roomUsers)
        return; // room does not exist
    // Remove user from room
    delete roomUsers[socketId];
    // if room is empty, remove the room
    if (Object.keys(roomUsers).length === 0) {
        delete usersInRoom[room];
    }
};
const getUsersInRoom = (room) => {
    const roomUsers = usersInRoom[room];
    return roomUsers ? Object.values(roomUsers) : [];
};
const getUsername = (room, socketId) => {
    var _a;
    return (_a = usersInRoom[room]) === null || _a === void 0 ? void 0 : _a[socketId];
};
// // delete chat
// const deletechats = async (req: Request, res: Response) => {
//   try {
//     const chats = await Chat.deleteMany({});
//     res.status(200).json(chats);
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching chats" });
//   }
// };
// const addChats = async (req: Request, res: Response) => {
//   try {
//     //const chats = await Chat.deleteMany({});
//     //res.status(200).json(chats);
//     const { username, message } = req.body;
//     const newChat = await Chat.create({
//       username,
//       message,
//     });
//     res.status(200).json(newChat);
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching chats" });
//   }
//};
exports.default = {
    getAllChats,
    getRoomChats,
    addUser,
    removeUser,
    getUsersInRoom,
    getUsername,
};
