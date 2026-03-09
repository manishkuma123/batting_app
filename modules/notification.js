const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

type: {
  type: String,
  enum: [
    "pool_invitation",
    "pool_accepted",
    "pool_rejected",
    "accept",
    "reject",
    "pool_won",      
    "pool_lost",     
    "pool_reopened"  
  ],
  required: true
},
  // type: {
  //   type: String,
  //   enum: ["pool_invitation", "pool_accepted", "pool_rejected","accept","reject"],
  //   required: true
  // },
  // status:{
  //   required:true,
  //   enum:['pending','accepted',"rejected"]
  // },

  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    poolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pool"
    },
    poolName: String,
    inviterName: String,
    inviterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Notification", notificationSchema);