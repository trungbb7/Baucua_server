const mongoose = require("mongoose");

const roundSchema = new mongoose.Schema({
  roundId: { type: String, required: true },
  startTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // Thời gian của phiên (ví dụ: 30 giây)
  result: { type: [String], default: [] }, // Kết quả phiên chơi (ví dụ: ["Bầu", "Cua", "Nai"])
  isFinished: { type: Boolean, default: false },
});

roundSchema.index({ isFinished: 1, startTime: 1 });

module.exports = mongoose.model("Round", roundSchema);
