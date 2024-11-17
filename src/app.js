const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const gameRoutes = require("./routes/gameRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/api/game", gameRoutes);

module.exports = app;
