const express = require("express");
const app = express();

const products = [
  { id: 1, name: "Laptop", price: 1000 },
  { id: 2, name: "Phone", price: 500 },
  { id: 3, name: "Headphones", price: 100 }
];

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

app.get("/products", checkUserDataHeader, (req, res) => {
  res.json(products);
});

app.listen(4005, () => console.log("Product Service running on port 4005"));
