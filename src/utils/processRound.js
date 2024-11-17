const Bet = require("../models/bet");
const Player = require("../models/player");
const Round = require("../models/round");

async function processRound(roundId) {
  console.log("starttt");
  try {
    const round = await Round.findOne({ roundId: roundId }); // Changed from findById
    if (!round) {
      console.log("round not found");
      return;
    }
    const result = round.result;
    const bets = await Bet.find({ roundId });
    for (const bet of bets) {
      let winAmount = 0;
      const betO = bet.bets;
      for (const [symbol, amount] of Object.entries(betO)) {
        if (amount > 0) {
          const occurrences = result.filter((r) => r === symbol).length;
          if (occurrences > 0) {
            winAmount = amount * occurrences + amount;
          }
        }
      }

      console.log("winAmount", winAmount);
      const player = await Player.findOne({ username: bet.username });
      const newBalance = player.balance + winAmount - bet.totalAmount;
      console.log("player.balance", player.balance);
      console.log("newBalance", newBalance);
      await Player.updateOne(
        { username: bet.username },
        { balance: newBalance }
      );
      bet.isRewarded = true;
      await bet.save();
    }
  } catch (error) {
    console.error("Error processing round:", error);
  }
}

module.exports = { processRound };
