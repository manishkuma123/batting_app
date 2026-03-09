

const mongoose = require("mongoose");

const poolSchema = new mongoose.Schema({
  poolName: { type: String, required: true },
  description: String,
  category: String,

  question: { type: String, required: true },
  options: { type: [String], required: true },

  pointsToJoin: { type: Number, required: true },
  winningCriteria: String,
  customRules: String,

  rewardSystem: {
    type: String,
    enum: ["Points Awards", "Podium"] 
  },
 
  winner: Number, 
  runnerUp: Number,  
  secondRunnerUp: Number, 
  correctPrediction: {
    type: mongoose.Schema.Types.Mixed,  
    default: null
  },
  
  resultDeclaredAt: { type: Date, default: null },
  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active"
  },

  participants: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      email: String,
      phone: String,
      name: String,
     
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
      },

      joinedAt: {
        type: Date,
        default: Date.now  
      },
      score: { type: Number, default: 0 },
      pointsEarned: { type: Number, default: 0 },
      

      prediction: {
        type: mongoose.Schema.Types.Mixed, 
        default: null
      },
      predictionSubmittedAt: { type: Date, default: null },
      
      resultStatus: {
        type: String,
        enum: ["won", "lost", "partial", null],
        default: null
      },
      
      rank: { type: Number, default: null },  
      matchedRanks: { type: [Number], default: [] } 
    }
  ],

  leaderboard: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      totalPoints: { type: Number, default: 0 },
      rank: Number,
      rewardAmount: Number,
      rewardSystem: String,
      joinedAt: Date,
      predictionSubmittedAt: Date,
      matchedRanks: [Number]
    }
  ],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // slug: { type: String, unique: true, required: true },
  // inviteLink: { type: String, default: null }
  joinedViaInviteLink: { 
        type: Boolean, 
        default: false 
      },
      inviteLinkToken: { 
        type: String, 
        default: null 
      }

}, { timestamps: true });

module.exports = mongoose.model("Pool", poolSchema);