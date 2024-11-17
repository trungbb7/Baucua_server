const app = require("./src/app");
const connectDB = require("./src/utils/db");
require("dotenv").config();

const { createNewRound, finishRound } = require("./src/services/gameService");

const PORT = process.env.PORT || 3100;

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
