const express = require("express");
const app = express();
app.use(express.json());
const axios = require("axios");

const orders = [];

function checkUserDataHeader(req, res, next) {
  const userData = req.headers["x-user-data"];

  if (!userData) {
    return res.status(400).json({ message: "Missing 'x-user-data' header" });
  }

  try {
    req.userData = JSON.parse(userData);
  } catch (err) {
    return res
      .status(400)
      .json({ message: "'x-user-data' header must be valid JSON" });
  }

  next();
}

async function getProductInfo(productId, userData) {
  const response = await axios.get(
    `http://product-service.product.svc.cluster.local:4005/product/${productId}`,
    {
      headers: {
        "x-user-data": JSON.stringify(userData),
      },
    }
  );
  return response.data;
}

app.post("/orders", checkUserDataHeader, (req, res) => {
  const { productId } = req.body;
  const userId = req.userData.id;
  if (!userId || !productId) {
    return res.status(400).json({ message: "userId and productId required" });
  }
  const order = { id: orders.length + 1, userId, productId };
  orders.push(order);
  res.status(201).json(order);
});

app.get("/orders", checkUserDataHeader, async (req, res) => {
  const ordersWithProductInfo = await Promise.all(
    orders.map(async (order) => {
      const productInfo = await getProductInfo(order.productId, req.userData);
      return { ...order, product: {...productInfo }};
    })
  );
  res.json(ordersWithProductInfo);
});

app.listen(4003, () => console.log("Order Service running on port 4003"));

app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message });
});
