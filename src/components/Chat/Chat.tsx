"use client";
import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { BellIcon, EnvelopeIcon, CogIcon, HeartIcon } from "@heroicons/react/24/solid";
import { io } from "socket.io-client";
import { ConnectionState } from "./ConnectionState";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000");

export default function Chat(user: { userName: any; userImage: any }) {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [isLoading, setIsLoading] = useState(false);
    const [value, setValue] = useState("");
    const [likes, setLikes] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [notificationModal, setNotificationModal] = useState(false);
    let [msgIndex, setMsgIndex] = useState(0);
    const [notificationCounter, setNotificationCounter] = useState(0);
    const [messages, setMessages] = useState<Message[]>([]);
    interface Message {
        userId: string;
        userImage: string;
        userName: string;
        message: string;
        msgIndex: number;
    }

    // Using the useRef hook for keeping new messages in scroll view
    let messageContainerRef = useRef(null);

    // Signed in User
    const userId = socket.id;
    const userName = user.userName;
    const userImage = user.userImage;

    // All Users
    const [allUsers, setUsers] = useState([]);

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
            // console.log(socket);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("broadcastMessage", ({ userId, userName, userImage, message, msgIndex }) => {
            const newMessage = {
                userId,
                userImage,
                userName,
                message,
                msgIndex,
            };
            const newMessages = [...messages];
            newMessages.push(newMessage);
            setMessages(newMessages);
        });

        // Retrieve startIndex variable from SERVER
        socket.on("startIndex", (data) => {
            setMsgIndex(data);
        });

        // STEP 1 (1/2): SEND DATA TO SERVER
        socket.emit("newUser", userName, userImage);
        // STEP 2: RETRIEVE DATA FROM SERVER + UPDATE setUsers
        socket.on("onlineUsers", (data) => {
            setUsers(data);
        });

        // STEP 2: RETRIEVE DATA FROM SERVER + UPDATE setLikes
        socket.on("likedMessages", (data) => {
            // Check if liked message is already in the 'likes' array
            const existingLikes = likes.find((item) => item.msgIndex === data.msgIndex);
            if (!existingLikes) {
                setLikes([...likes, data]);
            } else {
                const newLikes = likes.filter((item) => item.msgIndex !== data.msgIndex);
                setLikes(newLikes);
            }
            // console.log(data);
        });

        socket.on("sendNotification", (data) => {
            // Check if notification is already in the 'notifications' array
            const existingNotification = notifications.find((item) => item.likedMessage.msgIndex === data.likedMessage.msgIndex);

            if (!existingNotification) {
                setNotifications([...notifications, data]);
                setNotificationCounter(notificationCounter + 1);
            } else {
                const newNotifications = notifications.filter((item) => item.likedMessage.msgIndex !== data.likedMessage.msgIndex);
                setNotifications(newNotifications);
                setNotificationCounter(notificationCounter > 0 ? notificationCounter - 1 : 0);
            }
            // console.log(data);
        });

        // Scroll to the bottom of the message container
        messageContainerRef.current!.scrollTop = messageContainerRef.current!.scrollHeight;

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("onlineUsers");
            socket.off("message");
        };
    }, [allUsers, likes]);

    const onSubmit = (event: { preventDefault: () => void }) => {
        event.preventDefault();

        setMsgIndex((prevIndex) => {
            const newIndex = prevIndex + 1;
            const messageData = {
                userId,
                userName,
                userImage,
                message: value,
                msgIndex: newIndex,
            };
            socket.emit("nextIndex", newIndex);
            socket.emit("message", messageData);
            setValue("");
            return newIndex;
        });
    };

    const likeMessage = (index: number) => {
        const likedMessage = messages[index];
        const likedUserId = likedMessage.userId;
        const likedUserName = likedMessage.userName;
        const notificationData = {
            sendingUserName: userName,
            sendingUserId: userId,
            sendingUserImage: userImage,
            receivingUserName: likedUserName,
            receivingUserId: likedUserId,
            likedMessage: likedMessage
        };

        console.log("Current Username: " + userName);
        console.log("likedUserId: " + likedUserId);
        console.log("likedUserName: " + likedUserName);

        // STEP 1: SEND DATA TO SERVER
        socket.emit("likedMessage", notificationData);
    };

    const toggleBellIcon = () => {
        if(notificationModal) {
            setNotificationModal(false);
        } else {
            setNotificationModal(true);
            setNotificationCounter(0);
        }
    }

    return (
        <div>
            <p className="text-left">{`Index: ${msgIndex}`}</p>
            <div className="flex flex-col md:flex-row gap-2 max-w-screen-lg mx-auto">
                <div className="flex flex-col text-white text-left bg-gray-800 rounded border p-4 md:w-1/3">
                    <p className="text-lg mb-2">Active Users:</p>
                    <ul className="text-left italic">
                        {Array.isArray(allUsers) &&
                            allUsers.map((user) => (
                                <li key={user.socketId} className="flex items-center text-gray-400 p-2 ml-2 hover:bg-gray-600">
                                    {user.userImage && <img src={user.userImage} width={25} height={25} alt="Author" className="rounded-full mr-2" />}
                                    {user.username}
                                </li>
                            ))}
                    </ul>
                    <p className="mt-4 md:mt-auto text-xs text-gray-500">{`id: ${userId}`}</p>
                </div>

                <div className="flex flex-col text-white bg-gray-700 rounded border md:w-2/3">
                    {/* Message Header */}
                    <div className="flex justify-between items-center relative rounded border-b-2 border-solid border-gray-500 bg-gray-800 px-8 py-2 shadow-lg">
                        <p>Chat App</p>
                        <div className="flex w-1/5 justify-between">
                            <button id="bell-icon" className="relative p-1" onClick={toggleBellIcon}>
                                <BellIcon width={25} />
                                <span className={clsx("block flex items-center justify-center absolute top-0 right-0 text-white bg-red-500 text-xs rounded-full h-4 w-4", {"hidden" : notificationCounter <= 0})}>
                                    {notificationCounter}
                                </span>
                            </button>
                            <button id="message-icon" className="relative p-1">
                                <EnvelopeIcon width={25} />
                                <span className="hidden flex items-center justify-center absolute top-0 right-0 text-white bg-red-500 text-xs rounded-full h-4 w-4">2</span>
                            </button>
                            <button id="" className="relative p-1">
                                <CogIcon width={25} />
                                <span className="hidden flex items-center justify-center absolute top-0 right-0 text-white bg-red-500 text-xs rounded-full h-4 w-4">2</span>
                            </button>
                        </div>

                        {/* Notications Popup */}
                        <div className={clsx("block absolute right-0 top-full w-1/2 p-4 bg-gray-600 text-white text-sm shadow-md z-10", {"hidden" : !notificationModal})}>
                            {notifications.map((notification) => (
                                <div key={notification.likedMessage.msgIndex} className="flex items-center mb-2">
                                    <img src={notification.sendingUserImage} width={25} height={25} alt="Author" className="rounded-full mr-2" />
                                    <p className="text-gray-300 italic">{notification.sendingUserName} liked your message!</p>
                                </div>
                            ))}
                            
                           
                            <button className="bg-teal-500 hover:bg-teal-600 w-full p-2 my-2 rounded">Mark as Read</button>
                        </div>
                    </div>

                    {/* Connection Status */}
                    <div className={clsx("text-right py-2 px-4", { "text-red-500": !isConnected, "text-green-500": isConnected })}>
                        <ConnectionState isConnected={isConnected} />
                    </div>

                    {/* List Messages */}
                    <ul id="messages" className="py-2 px-6 h-96 overflow-scroll" ref={messageContainerRef}>
                        {/* Display the messages */}
                        {messages.map((message) => (
                            <div key={message.msgIndex}>
                                <p
                                    className={clsx("flex items-center w-fit text-sm text-gray-400 mb-2", {
                                        "text-left": message.userId !== userId,
                                        "ml-auto": message.userId === userId,
                                    })}
                                >
                                    <img src={message.userImage} width={25} height={25} alt="Picture of the author" className="rounded-full mr-2" />
                                    {message.userName && message.userName}
                                </p>
                                <li
                                    className={clsx("mb-3 py-1 px-3 text-white w-fit rounded-3xl relative", {
                                        "text-left bg-gray-500": message.userId !== userId,
                                        "ml-auto bg-blue-500": message.userId === userId,
                                    })}
                                >
                                    {message.message}
                                    <button
                                        className={clsx("absolute text-gray-900 stroke-gray-300 hover:stroke-red-600 hover:text-red-600 hover:scale-125 transition-all duration-100", {
                                            "-top-1 -right-2": message.userId !== userId,
                                            "-top-1 -left-2": message.userId === userId,
                                            "scale-125 text-red-600 stroke-red-600 hover:stroke-gray-300": likes.some((item) => item.msgIndex === message.msgIndex),
                                        })}
                                        onClick={() => likeMessage(message.msgIndex)}
                                    >
                                        <HeartIcon className="flex items-center justify-center h-4 w-4" />
                                    </button>
                                </li>
                            </div>
                        ))}
                    </ul>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="flex gap-2 mt-auto p-2 rounded shadow-md bg-gray-600">
                        {/* Input field for sending new messages */}
                        <input type="text" placeholder="Send message here ..." value={value} onChange={(e) => setValue(e.target.value)} className="rounded px-2 py-1 w-3/4 bg-gray-500" autoComplete="off" />

                        {/* Button to submit the new message */}
                        <button type="submit" disabled={isLoading} className="text-white bg-green-600 hover:bg-green-700 py-2 rounded w-1/4">
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
