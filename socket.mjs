import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

// SERVER SIDE CODE //

const app = express();
app.use(
    cors({
        origin: "http://localhost:3000", // Replace with the actual origin of your Next.js app
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
    })
);
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Replace with the actual origin of your Next.js app
        methods: ["GET", "POST"],
    },
});

// Create array for online users
let onlineUsers = [];

// Create the startIndex for messages
let startIndex = -1;

const addNewUser = (username, userImage, socketId) => {
    const existingUser = onlineUsers.find((user) => user.username === username);
    if (!existingUser) {
        onlineUsers.push({ username, userImage, socketId });
        return true; // User added successfully
    }
    return false; // User with the same username already exists
};
const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};
const getUser = (username) => {
    return onlineUsers.find((user) => user.username === username);
};

// Create a map to store nicknames
const nicknameMap = new Map();

io.on("connection", (socket) => {
    // console.log("A user connected");

    // Assign a unique identifier to the connected user
    let userId = socket.id;

    // STEP 1(2/2): RETRIEVE DATA FROM CLIENT + UPDATE ARRAY WITH addNewUser FUNCTION
    socket.on("newUser", (userName, userImage) => {
        const userAdded = addNewUser(userName, userImage, socket.id);
        if (userAdded) {
            // console.log(`User ${userName} added successfully`);
            // STEP 2(1/2): SEND UPDATED ARRAY BACK TO CLIENT
            io.emit("onlineUsers", onlineUsers);
        } else {
            // console.log(`User ${userName} already exists`);
        }
    })

    // Send the startIndex variable to CLIENT
    io.emit("startIndex", startIndex);
    socket.on("nextIndex", (newIndex) => {
        startIndex = newIndex;
    });

    socket.on("likedMessage", (data) => {
        io.emit("likedMessages", data);
        console.log(data);
    });

    // Send onlineUsers to CLIENT
    io.emit("onlineUsers", onlineUsers);

    // Handle events, e.g., chat messages
    socket.on("message", (msgData) => {
        console.log(`Received Message from User ${userId}:`, msgData.message);
        // Access the userName & userImage from the messageData object
        let userName = msgData.userName;
        let userImage = msgData.userImage;
        // Store or update the nickname for the user
        nicknameMap.set(userId, userName);

        // Broadcast the message with nickname to all connected clients
        io.emit("broadcastMessage", { userId, userName, userImage, message: msgData.message, msgIndex: msgData.msgIndex });
    });

    socket.on("disconnect", () => {
        // console.log("A user disconnected");

        // Call removeUser function
        removeUser(socket.id);
        // Emit the updated list of online users
        io.emit("onlineUsers", onlineUsers);

        // Remove the nickname when a user disconnects
        nicknameMap.delete(userId);
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`WebSocket server is running on port ${PORT}`);
});
