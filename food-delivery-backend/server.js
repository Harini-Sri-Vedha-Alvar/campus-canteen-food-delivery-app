const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/users");
app.use("/users", userRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});