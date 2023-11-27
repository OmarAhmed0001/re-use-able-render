"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const initSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        pingTimeout: 60000,
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true,
        },
        transports: ['websocket'],
    });
    io.on("connection", (socket) => {
        console.log(`A Client connected with ID: ${socket.id}`);
        socket.on("joinRoom", (room) => {
            socket.join(room);
            console.log(`A Client with ID ${socket.id} joined room: ${room}`);
        });
        socket.on("leaveRoom", (room) => {
            socket.leave(room);
            console.log(`Client ${socket.id} left room: ${room}`);
        });
        socket.on("disconnect", () => {
            socket.removeAllListeners();
            console.log(`A Client with ID ${socket.id} disconnected`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
