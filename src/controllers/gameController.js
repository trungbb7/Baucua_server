const Round = require("../models/round");

// API lấy thông tin phiên hiện tại
/**
 * Get information about the current active game round
 * @route GET /api/game/round
 * @returns {Object} 200 - Round information
 * @returns {String} roundId - Unique identifier for the round
 * @returns {Number} timeLeft - Remaining time in milliseconds for the round
 * @returns {Number} startTime - Timestamp when round started
 * @returns {Number} duration - Total duration of the round in milliseconds
 * @returns {Object} 404 - No active round found
 * @returns {Object} 500 - Server error
 */
const getRoundInfo = async (req, res) => {
  try {
    // Find the most recent unfinished round
    const currentRound = await Round.findOne({ isFinished: false }).sort({
      startTime: -1,
    });
    if (!currentRound) {
      return res.status(404).json({ message: "No active round" });
    }

    // Calculate remaining time in the round
    const elapsedTime = Date.now() - currentRound.startTime;
    const timeLeft = Math.max(0, currentRound.duration - elapsedTime);

    // Return round information
    res.json({
      roundId: currentRound.roundId,
      timeLeft,
      startTime: currentRound.startTime,
      duration: currentRound.duration,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving round info" });
  }
};

const Bet = require("../models/bet");

// API đặt cược
/**
 * Place a bet for the current active round
 * @route POST /api/game/bet
 * @param {Object} req.body.username - Username of the player placing the bet
 * @param {Object} req.body.bets - Object containing bet amounts for each symbol
 * @param {Number} req.body.bets[symbol] - Bet amount for a specific symbol (e.g. bets.bau, bets.cua)
 * @returns {Object} 200 - Bet placed successfully
 * @returns {String} roundID - ID of the round the bet was placed for
 * @returns {Object} 400 - Invalid input or no active round
 * @returns {Object} 500 - Server error
 */
const placeBet = async (req, res) => {
  const { username, bets } = req.body;

  if (!username || !bets) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    const currentRound = await Round.findOne({ isFinished: false }).sort({
      startTime: -1,
    });
    if (!currentRound) {
      return res.status(400).json({ message: "No active round" });
    }

    const totalAmount = Object.values(bets).reduce(
      (sum, value) => sum + value,
      0
    );
    const betsString = await JSON.stringify(bets);
    console.log(`bets: ${betsString}`);
    const bet = new Bet({
      username,
      roundId: currentRound.roundId,
      bets,
      totalAmount,
    });

    await bet.save();

    res.json({ roundID: currentRound.roundId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error placing bet" });
  }
};

const Player = require("../models/player");

// API trả kết quả
/**
 * Get the result of a bet for a specific round and player
 * @route POST /api/game/result
 * @param {Object} req.body.roundId - ID of the round to get results for
 * @param {Object} req.body.username - Username of the player
 * @returns {Object} 200 - Bet result retrieved successfully
 * @returns {Array} result - Array of symbols that were rolled
 * @returns {Number} balance - Current balance of the player
 * @returns {Object} 400 - Round not finished yet
 * @returns {Object} 404 - Player not found
 * @returns {Object} 500 - Server error
 */
const getBetResult = async (req, res) => {
  const { roundId, username } = req.body;
  try {
    const round = await Round.findOne({ roundId });
    if (!round || !round.isFinished) {
      return res.status(400).json({ message: "Round not finished yet" });
    }

    const user = await Player.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.json({
      result: round.result,
      balance: user.balance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving bet result" });
  }
};

const getBalanceInfo = async (req, res) => {
  const { username } = req.body;
  try {
    const user = await Player.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.json({ balance: user.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving balance info" });
  }
};

module.exports = {
  getRoundInfo,
  placeBet,
  getBetResult,
  getBalanceInfo,
};
