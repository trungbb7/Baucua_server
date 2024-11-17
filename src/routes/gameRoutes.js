const express = require("express");
const {
  getRoundInfo,
  placeBet,
  getBetResult,
  getBalanceInfo,
} = require("../controllers/gameController");

const router = express.Router();

router.get("/round", getRoundInfo);
router.post("/bet", placeBet);
router.post("/result", getBetResult);
router.post("/getBalance", getBalanceInfo);

module.exports = router;
