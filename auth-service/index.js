const express = require("express");
const { createClient } = require("redis");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

const users = [
  { id: 1, username: "john", password: "pass123" },
  { id: 2, username: "alice", password: "alice456" },
  { id: 3, username: "bob", password: "bob789" }
];


const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const redisClient = createClient({ url: REDIS_URL });

redisClient.connect()
  .then(() => console.log(`✅ Connected to Redis at ${REDIS_URL}`))
  .catch(err => {
    console.error("❌ Redis connection error:", err);
    process.exit(1);
  });

const getTokenFromHeader = (req) => {
  return req.headers.authorization?.split(" ")[1] || null;
};



// Routes
// app.get("/users", (req, res) => {
//   const safeUsers = users.map(({ password, ...u }) => u);
//   res.json(safeUsers);
// });

app.post("/login", async (req, res) => {
  const { id, password } = req.body;
  const user = users.find(u => u.id === id);

  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.password !== password) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const token = uuidv4();
  await redisClient.set(`session:${token}`, JSON.stringify(user), { EX: 3600 });

  res.json({ token, user: { id: user.id, username: user.username } });
});

app.get("/", async (req, res) => {
  res.json({test: 'working' });
});


// app.get("/verify", async (req, res) => {
//   const token = getTokenFromHeader(req);
//   if (!token) return res.status(401).json({ message: "No token provided" });

//   const sessionData = await redisClient.get(`session:${token}`);
//   if (!sessionData) {
//     return res.status(401).json({ valid: false, message: "Invalid or expired token" });
//   }

//   res.json({ valid: true, user: JSON.parse(sessionData) });
// });

// app.post("/logout", async (req, res) => {
//   const token = getTokenFromHeader(req);
//   if (!token) return res.status(400).json({ message: "No token provided" });

//   await redisClient.del(`session:${token}`);
//   res.json({ message: "Logged out successfully" });
// });

app.listen(3000, () => console.log("🚀 Auth Service running on port 3000"));
