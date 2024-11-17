const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
  username: { type: String, required: true },
  roundId: { type: String, required: true }, // ID của phiên chơi
  bets: {
    bầu: { type: Number, default: 0 },
    cua: { type: Number, default: 0 },
    tôm: { type: Number, default: 0 },
    cá: { type: Number, default: 0 },
    gà: { type: Number, default: 0 },
    nai: { type: Number, default: 0 },
  },
  totalAmount: { type: Number, default: 0 },
  isResolved: { type: Boolean, default: false }, // Đã xử lý kết quả hay chưa
});

betSchema.index({ roundId: 1, isResolved: 1 });

module.exports = mongoose.model("Bet", betSchema);
