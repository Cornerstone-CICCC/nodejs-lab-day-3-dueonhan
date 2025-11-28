import { Request, Response } from "express";
import { Chat } from "../models/chat.model";

const usersInRoom: Record<string, Record<string, string>> = {};

// Get all chats
const getAllChats = async (req: Request, res: Response) => {
  try {
    const chats = await Chat.find().sort({ createdAt: 1 }); // Sort by createdAt field
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: "Error fetching chats" });
  }
};

// Get room all chats /api/chat/:room
const getRoomChats = async (req: Request, res: Response) => {
  const { room } = req.params;
  try {
    const chats = await Chat.find({ room }).sort({ createdAt: 1 }); // Sort by createdAt field
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: "Error fetching chats" });
  }
};

const addUser = (room: string, socketId: string, username: string) => {
  // If room does not exist, create room
  if (!usersInRoom[room]) {
    usersInRoom[room] = {};
  }

  // Add user to room
  usersInRoom[room][socketId] = username;
};

const removeUser = (room: string, socketId: string) => {
  const roomUsers = usersInRoom[room];
  if (!roomUsers) return; // room does not exist

  // Remove user from room
  delete roomUsers[socketId];

  // if room is empty, remove the room
  if (Object.keys(roomUsers).length === 0) {
    delete usersInRoom[room];
  }
};

const getUsersInRoom = (room: string) => {
  const roomUsers = usersInRoom[room];
  return roomUsers ? Object.values(roomUsers) : [];
};

const getUsername = (room: string, socketId: string) => {
  return usersInRoom[room]?.[socketId];
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

export default {
  getAllChats,
  getRoomChats,
  addUser,
  removeUser,
  getUsersInRoom,
  getUsername,
};
