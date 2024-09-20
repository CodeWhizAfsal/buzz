import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const port = 5000;

mongoose.connect(process.env.MONGODB_CONN_URL);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  avatarUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

const messageSchema = new mongoose.Schema({
  room: { type: String, required: true },
  sender: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

const chatSchema = new mongoose.Schema({
  name: { type: String },
  participants: [{ type: String, required: true }],
  lastMessage: { type: String },
  lastMessageTimestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", chatSchema);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello from Buzz App!");
});

const verifySession = (cookie, callback) => {
  if (!cookie) {
    return;
  } else {
    jwt.verify(cookie, process.env.JWT_SECRET, (err, id) => {
      if (err) {
        return;
      } else {
        return callback(id);
      }
    });
  }
};

io.use((socket, next) => {
  const sessionCookie = socket.handshake.headers.cookie;
  const token = sessionCookie && sessionCookie.split("authtoken=")[1];
  verifySession(token, (user) => {
    if (user) {
      socket.userId = user._id;
      console.log("USER ", user, user._id, socket.id);
      next();
    } else {
      console.log("ERROR ");
      next(new Error("Authentication error"));
    }
  });
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("authenticate", async () => {
    if (socket.userId) {
      try {
        const userDetails = await User.findById(socket.userId).select(
          "displayName avatarUrl"
        );

        if (userDetails) {
          socket.displayName = userDetails.displayName;
          socket.avatarUrl = userDetails.avatarUrl;

          socket.emit("authenticated", {
            userId: socket.userId,
            displayName: socket.displayName,
            avatarUrl: socket.avatarUrl,
          });
        } else {
          socket.emit("authentication_error", "User not found");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        socket.emit("authentication_error", "Failed to fetch user details");
      }
    } else {
      socket.emit("authentication_error", "Invalid session");
    }
  });

  socket.on("join_room", async (roomId) => {
    if (!socket.userId) {
      console.log("AUTH ERROR JOIN ROOM");
      socket.emit("error", "Not authenticated");
      return;
    }
    socket.join(roomId);
    console.log(`User ${socket.userId} joined room ${roomId}`);

    try {
      const messages = await Message.find({ room: roomId })
        .sort({ timestamp: -1 })
        .limit(50);

      const users = await User.find({
        _id: { $in: messages.map((m) => m.sender) },
      });

      const userMap = users.reduce((acc, user) => {
        acc[user._id] = {
          displayName: user.displayName,
          avatarUrl: user.avatarUrl || "/default-avatar.jpg",
        };
        return acc;
      }, {});

      const enrichedMessages = messages.map((message) => ({
        ...message.toObject(),
        sender: {
          id: message.sender,
          displayName: userMap[message.sender]?.displayName || message.sender,
          avatarUrl:
            userMap[message.sender]?.avatarUrl || "/default-avatar.jpg",
        },
      }));

      socket.emit("previous_messages", enrichedMessages.reverse());
    } catch (err) {
      console.error("Error fetching messages:", err);
      socket.emit("error", "Failed to fetch messages");
    }
  });

  // Leave a chat room
  socket.on("leave_room", (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.userId} left room ${roomId}`);
  });

  socket.on("initiate_chat", async ({ receiverIds, chatName }) => {
    if (!socket.userId) {
      socket.emit("error", "Not authenticated");
      return;
    }
    try {
      const emails = receiverIds.split(",").map((email) => email.trim());
      const users = await User.find({ email: { $in: emails } });
      const participantIds = users.map((user) => user._id);

      if (!participantIds.includes(socket.userId)) {
        participantIds.push(socket.userId);
      }

      const existingChat = await Chat.findOne({
        participants: { $all: participantIds },
      });

      if (existingChat) {
        socket.emit("chat_initiated", { chatId: existingChat._id });
      } else {
        const newChat = new Chat({
          participants: participantIds,
          name: chatName,
        });
        await newChat.save();
        socket.emit("chat_initiated", { chatId: newChat._id });
      }
    } catch (error) {
      console.error("Error initiating chat:", error);
      socket.emit("error", "Failed to initiate chat");
    }
  });

  socket.on("get_chats", async () => {
    console.log(`socket  connected with ${socket.id}`);
    if (!socket.userId) {
      socket.emit("error", "Not authenticated");
      return;
    }

    try {
      const chats = await Chat.find({ participants: socket.userId }).sort({
        lastMessageTimestamp: -1,
      });

      const participantIds = chats.flatMap((chat) => chat.participants);
      const users = await User.find({ _id: { $in: participantIds } });
      const userMap = users.reduce((acc, user) => {
        acc[user._id] = {
          id: user._id,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        };
        return acc;
      }, {});

      const chatsWithNames = chats.map((chat) => ({
        ...chat._doc,
        participants: chat.participants.map(
          (id) => userMap[id] || { id, displayName: id, photo: "" }
        ),
      }));

      socket.emit("chats_list", chatsWithNames);
    } catch (error) {
      console.error("Error fetching chats:", error);
      socket.emit("error", "Failed to fetch chats");
    }
  });

  socket.on("send_message", async ({ chatId, message }) => {
    console.log(chatId, message)
    if (!socket.userId) {
      socket.emit("error", "Not authenticated");
      return;
    }

    try {
      const newMessage = new Message({
        room: chatId,
        sender: socket.userId,
        message: message,
      });
      await newMessage.save();

      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: message,
        lastMessageTimestamp: new Date(),
      });

      const sender = await User.findById(socket.userId).select(
        "displayName avatarUrl"
      );

      const enrichedMessage = {
        _id: newMessage._id,
        sender: {
          id: sender._id,
          displayName: sender.displayName,
          avatarUrl: sender.avatarUrl,
        },
        message: newMessage.message,
        timestamp: newMessage.timestamp,
      };

      io.to(chatId).emit("new_message", enrichedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", "Failed to send message");
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
      scope: ["profile", "email"],
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get("/auth/google", passport.authenticate("google"));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: process.env.FRONTEND_URL + "/login",
    session: false,
  }),
  async function (req, res) {
    try {
      const existingUser = await User.findOne({
        email: req.user.emails[0].value,
      });

      let user;
      if (existingUser) {
        user = existingUser;
      } else {
        const newUser = new User({
          id: req.user._json.sub,
          email: req.user._json.email,
          displayName: req.user._json.name,
          avatarUrl: req.user._json.picture,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await newUser.save();
        user = newUser;
      }

      const jwtToken = jwt.sign(
        { email: req.user.emails[0].value, _id: user._id },
        process.env.JWT_SECRET
      );
      res.cookie("authtoken", jwtToken, { maxAge: 432000, httpOnly: false });
      res.redirect(process.env.FRONTEND_URL + "/chat");
    } catch (error) {
      console.error("Error during user authentication or creation:", error);
    }
  }
);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
