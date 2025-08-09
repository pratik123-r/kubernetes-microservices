const express = require("express");
const app = express();
app.use(express.json());

const orders = [];

function checkUserDataHeader(req, res, next) {
  const userData = req.headers['x-user-data'];

  if (!userData) {
    return res.status(400).json({ message: "Missing 'x-user-data' header" });
  }

  try {
    req.userData = JSON.parse(userData);
  } catch (err) {
    return res.status(400).json({ message: "'x-user-data' header must be valid JSON" });
  }

  next();
}

app.post("/orders", checkUserDataHeader, (req, res) => {
  const { productId } = req.body;
   const { userId }= req.userData
  if (!userId || !productId) {
    return res.status(400).json({ message: "userId and productId required" });
  }
  const order = { id: orders.length + 1, userId, productId };
  orders.push(order);
  res.status(201).json(order);
});

app.get("/orders", checkUserDataHeader, (req, res) => {
  res.json(orders);
});

app.listen(4003, () => console.log("Order Service running on port 4003"));

app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message });
});