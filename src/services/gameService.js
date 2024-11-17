const cron = require("node-cron");
const Round = require("../models/round");
const { v4: uuidv4 } = require("uuid");
const { processRound } = require("../utils/processRound.js");

let isProcessing = false; // Add lock mechanism

async function createNewRound() {
  // Only create if no active rounds exist
  const activeRound = await Round.findOne({ isFinished: false });
  if (activeRound) {
    console.log("Active round already exists, skipping creation");
    return null;
  }

  const round = new Round({
    roundId: uuidv4(),
    startTime: Date.now(),
    duration: 30000, // 30 seconds
  });

  await round.save();
  console.log(`Created new round: ${round.roundId}`);
  return round;
}

async function processAndCreateNewRound() {
  console.log("processAndCreateNewRound running");
  try {
    // Find all unfinished rounds that have exceeded their duration
    const expiredRounds = await Round.find({
      isFinished: false,
      startTime: { $lt: Date.now() - 28000 },
    });
    console.log("expiredRounds");

    // Process all expired rounds in parallel
    if (expiredRounds.length > 0) {
      await Promise.all(
        expiredRounds.map(async (round) => {
          const options = ["bầu", "cua", "tôm", "cá", "gà", "nai"];
          const result = Array(3)
            .fill()
            .map(() => options[Math.floor(Math.random() * options.length)]);

          round.result = result;
          round.isFinished = true;
          console.log("da vao ddddd");
          await round.save();
          await processRound(round.roundId);
          return;
        })
      );
    }

    console.log("create new round");

    // Create new round immediately after processing
    await createNewRound();
  } catch (error) {
    console.error("Error in round processing:", error);
  }
}

async function finishRound(roundId) {
  const round = await Round.findOne({ roundId });
  if (!round || round.isFinished) {
    return;
  }

  // Generate random result
  const options = ["bầu", "cua", "tôm", "cá", "gà", "nai"];
  const result = Array(3)
    .fill()
    .map(() => options[Math.floor(Math.random() * options.length)]);

  round.result = result;
  round.isFinished = true;
  await round.save();

  console.log(`Round ${roundId} finished with result: ${result}`);
  await processRound(roundId);
}

// Modified cron job with lock mechanism
// Modified cron job with parallel processing
cron.schedule("*/30 * * * * *", async () => {
  console.log("cron job running");
  if (isProcessing) {
    console.log("Previous round processing still in progress, skipping...");
    return;
  }

  try {
    isProcessing = true;
    await processAndCreateNewRound();
  } finally {
    isProcessing = false;
  }
});

module.exports = { createNewRound, finishRound };
