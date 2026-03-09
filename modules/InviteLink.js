const mongoose = require("mongoose");

const inviteLinkSchema = new mongoose.Schema({
  poolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pool",
    required: true
  },
  inviterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  token: {
    type: String,
    unique: true,
    required: true
  },
  expiresAt: Date,
  maxUses: {
    type: Number,
    default: 10
  },
  usedCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("InviteLink", inviteLinkSchema);