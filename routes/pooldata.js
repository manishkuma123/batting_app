
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Pool = require("../modules/pool");
const Category = require("../modules/category");
const User = require("../modules/User");
const InviteLink = require("../modules/InviteLink");
const auth = require("./authentication");
const Notification = require("../modules/notification");
const { sendInAppNotification } = require("../utils/notification");
const crypto = require("crypto");
const notification = require("../modules/notification");


router.post("/pool/create", auth, async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    // 1️⃣ Validate user
    if (!user?._id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: user not found",
      });
    }

    // 2️⃣ Validate points
    const pointsToJoin = Number(data.pointsToJoin);
    if (isNaN(pointsToJoin) || pointsToJoin <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid pointsToJoin",
      });
    }

    if (Number(user.totalPoints || 0) < pointsToJoin) {
      return res.status(403).json({
        status: "error",
        message: "Insufficient points to create pool",
      });
    }

    // 3️⃣ Validate category
    let categoryName = null;
    if (data.category && mongoose.Types.ObjectId.isValid(data.category)) {
      const category = await Category.findById(data.category);
      if (category) categoryName = category.name;
    }

    // 4️⃣ Prepare participants
    let participants = [];

    if (Array.isArray(data.friends) && data.friends.length > 0) {
      const emails = data.friends.map(f => f.email).filter(Boolean);
      const phones = data.friends
        .map(f => f.phone)
        .filter(p => /^\d+$/.test(p))
        .map(Number);

      const registeredUsers = await User.find({
        $or: [{ email: { $in: emails } }, { phone: { $in: phones } }],
      });

      // Registered users
      registeredUsers.forEach(u => {
        participants.push({
          userId: u._id,
          email: u.email,
          phone: u.phone,
          name: u.name,
          status: "pending",
          joinedViaInviteLink: false
        });
      });

      
      data.friends.forEach(f => {
        const exists = registeredUsers.find(
          u => u.email === f.email || u.phone === Number(f.phone)
        );
        if (!exists) {
          participants.push({
            email: f.email,
            phone: f.phone ? Number(f.phone) : undefined,
            name: f.name,
            status: "pending",
            joinedViaInviteLink: false
          });
        }
      });
    }

    // 5️⃣ Creator auto-accepted
    participants.push({
      userId: user._id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      status: "accepted",
      joinedViaInviteLink: false
    });

    delete data.createdBy;

    // 6️⃣ Create pool
    const pool = await Pool.create({
      ...data,
      participants,
      createdBy: user._id,
    });

    // 🔗 GENERATE INVITE LINK
    const inviteToken = crypto.randomBytes(32).toString('hex');
    
    const inviteLink = await InviteLink.create({
      poolId: pool._id,
      token: inviteToken,
      inviterId: user._id,  // ✅ Using inviterId
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true
    });

    const baseUrl = process.env.FRONTEND_URL || 'https://darkgreen-salmon-727479.hostingersite.com';
    const shareableLink = `${baseUrl}/pool/join/${inviteToken}`;

    // 7️⃣ Deduct points
    user.totalPoints = Number(user.totalPoints || 0) - pointsToJoin;
    await user.save();

    // 8️⃣ Send notifications asynchronously (non-blocking)
    const pendingRegisteredUsers = participants.filter(
      p => p.status === "pending" && p.userId
    );

    pendingRegisteredUsers.forEach(p =>
      sendInAppNotification(p.userId, {
        type: "pool_invitation",
        title: "Pool Invitation",
        message: `${user.name} invited you to join "${pool.poolName}"`,
        data: { 
          poolId: pool._id, 
          inviterId: user._id,
          inviteLink: shareableLink
        },
      })
    );

    // 9️⃣ Respond to client
    const acceptedCount = participants.filter(p => p.status === "accepted").length;

    res.status(201).json({
      status: "success",
      message: "Pool created successfully",
      pool: {
        id: pool._id,
        poolName: pool.poolName,
        category: pool.category,
        categoryName,
        pointsToJoin: pool.pointsToJoin,
        createdBy: { id: user._id, name: user.name },
        participantsCount: acceptedCount,
        inviteLink: shareableLink,
        // inviteLinkToken: inviteToken
      },
    });

  } catch (err) {
    console.error("POOL CREATE ERROR:", err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});
router.post("/pool/createdata", auth, async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    // 1️⃣ Validate user
    if (!user?._id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: user not found",
      });
    }

    // 2️⃣ Validate points
    const pointsToJoin = Number(data.pointsToJoin);
    if (isNaN(pointsToJoin) || pointsToJoin <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid pointsToJoin",
      });
    }

    if (Number(user.totalPoints || 0) < pointsToJoin) {
      return res.status(403).json({
        status: "error",
        message: "Insufficient points to create pool",
      });
    }

    // 3️⃣ Validate category
    let categoryName = null;
    if (data.category && mongoose.Types.ObjectId.isValid(data.category)) {
      const category = await Category.findById(data.category);
      if (category) categoryName = category.name;
    }

    // 4️⃣ Prepare participants
    let participants = [];

    if (Array.isArray(data.friends) && data.friends.length > 0) {
      const emails = data.friends.map(f => f.email).filter(Boolean);
      const phones = data.friends
        .map(f => f.phone)
        .filter(p => /^\d+$/.test(p))
        .map(Number);

      const registeredUsers = await User.find({
        $or: [{ email: { $in: emails } }, { phone: { $in: phones } }],
      });

      // Registered users
      registeredUsers.forEach(u => {
        participants.push({
          userId: u._id,
          email: u.email,
          phone: u.phone,
          name: u.name,
          status: "pending",
          joinedViaInviteLink: false
        });
      });

      
      data.friends.forEach(f => {
        const exists = registeredUsers.find(
          u => u.email === f.email || u.phone === Number(f.phone)
        );
        if (!exists) {
          participants.push({
            email: f.email,
            phone: f.phone ? Number(f.phone) : undefined,
            name: f.name,
            status: "pending",
            joinedViaInviteLink: false
          });
        }
      });
    }

    // 5️⃣ Creator auto-accepted
    participants.push({
      userId: user._id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      status: "accepted",
      joinedViaInviteLink: false
    });

    delete data.createdBy;

    // 6️⃣ Create pool
    const pool = await Pool.create({
      ...data,
      participants,
      createdBy: user._id,
    });

    // 🔗 GENERATE INVITE LINK
    const inviteToken = crypto.randomBytes(32).toString('hex');
    
    const inviteLink = await InviteLink.create({
      poolId: pool._id,
      token: inviteToken,
      inviterId: user._id,  // ✅ Using inviterId
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true
    });

    const baseUrl = process.env.FRONTEND_URL || 'https://darkgreen-salmon-727479.hostingersite.com';
    const shareableLink = `${baseUrl}/pool/join/${inviteToken}`;

    // 7️⃣ Deduct points
    user.totalPoints = Number(user.totalPoints || 0) - pointsToJoin;
    await user.save();

    // 8️⃣ Send notifications asynchronously (non-blocking)
    const pendingRegisteredUsers = participants.filter(
      p => p.status === "pending" && p.userId
    );

    pendingRegisteredUsers.forEach(p =>
      sendInAppNotification(p.userId, {
        type: "pool_invitation",
        title: "Pool Invitation",
        message: `${user.name} invited you to join "${pool.poolName}"`,
        data: { 
          poolId: pool._id, 
          inviterId: user._id,
          inviteLink: shareableLink
        },
      })
    );

    // 9️⃣ Respond to client
    const acceptedCount = participants.filter(p => p.status === "accepted").length;

    res.status(201).json({
      status: "success",
      message: "Pool created successfully",
      pool: {
        id: pool._id,
        poolName: pool.poolName,
        category: pool.category,
        categoryName,
        pointsToJoin: pool.pointsToJoin,
        createdBy: { id: user._id, name: user.name },
        participantsCount: acceptedCount,
        inviteLink: shareableLink,
        // inviteLinkToken: inviteToken
      },
    });

  } catch (err) {
    console.error("POOL CREATE ERROR:", err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

router.patch("/pool/:poolId/options/add", auth, async (req, res) => {
  try {
    const user = req.user;
    const { poolId } = req.params;
    const { options } = req.body;

    if (!user?._id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: user not found",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(poolId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid pool ID",
      });
    }

    const pool = await Pool.findById(poolId);
    
    if (!pool) {
      return res.status(404).json({
        status: "error",
        message: "Pool not found",
      });
    }

    if (pool.status === "completed") {
      return res.status(400).json({
        status: "error",
        message: "Cannot add options to a completed pool",
      });
    }

    if (pool.status === "cancelled") {
      return res.status(400).json({
        status: "error",
        message: "Cannot add options to a cancelled pool",
      });
    }

    const isCreator = pool.createdBy.toString() === user._id.toString();
    
    const participantIndex = pool.participants.findIndex(
      p => p.userId && p.userId.toString() === user._id.toString()
    );
    
    const isAcceptedParticipant = participantIndex !== -1 && 
                                   pool.participants[participantIndex].status === "accepted";

    if (!isCreator && !isAcceptedParticipant) {
      return res.status(403).json({
        status: "error",
        message: "Only pool creator or accepted participants can add options",
      });
    }

   
    if (!Array.isArray(options) || options.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Options must be a non-empty array",
      });
    }

  
    const allStrings = options.every(opt => typeof opt === "string" && opt.trim().length > 0);
    if (!allStrings) {
      return res.status(400).json({
        status: "error",
        message: "All options must be non-empty strings",
      });
    }

    // 7️⃣ Add new options to existing ones (avoid duplicates)
    const currentOptions = pool.options || [];
    const newOptions = options.map(opt => opt.trim());
    
    // Combine and remove duplicates (case-insensitive check)
    const existingLowerCase = currentOptions.map(opt => opt.toLowerCase());
    const uniqueNewOptions = newOptions.filter(
      opt => !existingLowerCase.includes(opt.toLowerCase())
    );

    if (uniqueNewOptions.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "All options already exist in the pool",
      });
    }

    // 8️⃣ Update pool options
    pool.options = [...currentOptions, ...uniqueNewOptions];
    await pool.save();

    // 9️⃣ Send response
    res.status(200).json({
      status: "success",
      message: `${uniqueNewOptions.length} option(s) added successfully`,
      pool: {
        id: pool._id,
        poolName: pool.poolName,
        options: pool.options,
        // addedOptions: uniqueNewOptions,
        // totalOptions: pool.options.length,
        // addedBy: {
        //   id: user._id,
        //   name: user.name,
        //   role: isCreator ? "creator" : "participant"
        // },
        updatedAt: pool.updatedAt,
      },
    });

  } catch (err) {
    console.error("POOL OPTIONS ADD ERROR:", err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});


router.get("/pool/data",(req,res)=>{
  res.send("hello manish")
})



router.put("/pool/:poolId", auth, async (req, res) => {
  try {
    const user = req.user;
    const { poolId } = req.params;
    const { question, options } = req.body;

    if (!user || !user._id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }

    const pool = await Pool.findById(poolId);

    if (!pool) {
      return res.status(404).json({
        status: "error",
        message: "Pool not found"
      });
    }

    // 🔒 Only creator can update
    if (pool.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You are not allowed to update this pool"
      });
    }

    // ❌ Block empty updates
    if (!question && !options) {
      return res.status(400).json({
        status: "error",
        message: "Nothing to update"
      });
    }

    // ✅ Update question
    if (question) {
      pool.question = question;
    }

    // ✅ Update options
    if (options) {
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({
          status: "error",
          message: "Options must be an array with at least 2 values"
        });
      }
      pool.options = options;
    }

    await pool.save();

    res.status(200).json({
      status: "success",
      message: "Question and options updated successfully",
      pool: {
        id: pool._id,
        question: pool.question,
        options: pool.options
      }
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});
router.get("/pool/list", auth, async (req, res) => {
  try {
    const userId = req.user?._id;
    const pools = await Pool.find({
      $or: [
        { createdBy: userId },
        {
          participants: {
            $elemMatch: {
              userId: userId,
              status: "accepted"
            }
          }
        }
      ]
    })
      .populate("createdBy", "name")
      .populate("participants.userId", "name profile createdAt")
      // .populate("leaderboard.userId", "name profile") // ✅ ADD THIS
      .populate("leaderboard.userId", "name profile totalPoints") 
      .sort({ createdAt: -1 });

    // Category handling
    const categoryIds = [];
    const categoryNames = [];

    pools.forEach(pool => {
      if (pool.category) {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(pool.category);
        if (isObjectId) {
          categoryIds.push(pool.category);
        } else {
          categoryNames.push(pool.category);
        }
      }
    });

    const categories = await Category.find({
      $or: [
        { _id: { $in: [...new Set(categoryIds)] } },
        { name: { $in: [...new Set(categoryNames)] } }
      ]
    });
    
    const categoryMapById = {};
    const categoryMapByName = {};
    
    categories.forEach(cat => {
      const categoryData = {
        id: cat._id,
        name: cat.name,
        icon: cat.icon
      };
      categoryMapById[cat._id.toString()] = categoryData;
      categoryMapByName[cat.name] = categoryData;
    });

    // Invite links
    const poolIds = pools.map(p => p._id);
    const inviteLinks = await InviteLink.find({ 
      poolId: { $in: poolIds } 
    });
    
    const inviteLinkMap = {};
    inviteLinks.forEach(link => {
      inviteLinkMap[link.poolId.toString()] = `https://jsmastery.com/invite?token=${link.token}`;
    });

    const formattedPools = pools.map(pool => {
      const acceptedParticipants = pool.participants.filter(
        p => p.status === "accepted"
      );

      const currentUserParticipant = pool.participants.find(
        p => p.userId && p.userId._id.toString() === userId.toString()
      );

      let categoryDetails = null;
      if (pool.category) {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(pool.category);
        if (isObjectId) {
          categoryDetails = categoryMapById[pool.category.toString()];
        } else {
          categoryDetails = categoryMapByName[pool.category];
        }
      }

      let resultInfo = null;
      if (pool.status === "completed" && pool.correctPrediction) {
        resultInfo = {
          correctPrediction: pool.correctPrediction,
          userPointsEarned: currentUserParticipant?.pointsEarned || 0,
          userResult: currentUserParticipant?.resultStatus || null,
        };
      }

      // ✅ LEADERBOARD WITH WINNER DATA
      // Leaderboard will only have data when pool is completed and result is declared
      // It contains only WINNERS (participants who predicted correctly)
      const leaderboard = (pool.leaderboard || []).map((l, index) => ({
        rank: l.rank || index + 1,
                   _id: l._id,
        playerAvatar: l.userId?.profile || null, 
        playerName: l.userId?.name || l.name || "Unknown",
        rewardSystem: l.rewardSystem || pool.rewardSystem || "Points",
        rewardAmount: l.rewardAmount || l.totalPoints || 0,
       
         totalPoints: l.userId?.totalPoints ||0,
        //  question:l.question ||0,
        //  options:l.options||1,
          // predication:l.predication||"unknown",
          // confirmprediction:l.confirmprediction|| "unknown",
 
        joinedAt: l.joinedAt ? new Date(l.joinedAt).toDateString() : null,
        predictionSubmittedAt: l.predictionSubmittedAt ? new Date(l.predictionSubmittedAt).toDateString() : null
      }));
      
      return {
        id: pool._id,
        category: categoryDetails || null, 
        poolStatus: pool.status || "Live",
        rewardSystem: pool.rewardSystem,
        inviteLink: inviteLinkMap[pool._id.toString()] || pool.inviteLink || null,
        title: pool.poolName,
        description: pool.description || "",
        players: acceptedParticipants.length,
        yourPrediction: currentUserParticipant?.prediction || null,
        predictionSubmittedAt: currentUserParticipant?.predictionSubmittedAt || null,
        result: resultInfo,
        participants: acceptedParticipants.map(p => ({
          //  _id: p._id,
          // 
        
          // 
          playerAvatar: p.userId?.profile || null,
          playerName: p.userId?.name || p.name,
          playerJoinedDate: p.joinedAt
            ? new Date(p.joinedAt).toDateString()
            : null
        })),

        betAmount: pool.pointsToJoin,
        totalPot: pool.pointsToJoin * acceptedParticipants.length, 
        maxWin: pool.maxWin || pool.pointsToJoin,
        // pointsScored: pool.pointsScored ||0,
        pointsScored: currentUserParticipant?.resultStatus === "won"
  ? `+${currentUserParticipant?.pointsEarned || 0}`  // "+60"
  : currentUserParticipant?.resultStatus === "lost"
  ? `-${pool.pointsToJoin}`                           // "-30"
  : "0",                                              // "0"
        // userPointsEarned: currentUserParticipant?.pointsEarned || 0,
        question:pool.question || 0,
        options: pool.options || [],
        leaderboard: leaderboard,
        createdBy: {
          id: pool.createdBy?._id,
          name: pool.createdBy?.name
        }
      };
    });

    res.status(200).json({
      status: "success",
      message: "Pools fetched successfully",
      data: formattedPools
    }); 

  } catch (err) {
    console.error("Error fetching pools:", err);
    res.status(500).json({
      status: "fail",
      message: "Unable to fetch pools",
      error: err.message
    });
  }
});

router.post("/pool/:poolId/prediction", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { poolId } = req.params;
    const { prediction } = req.body;

    // ✅ Validate prediction input
    if (!prediction) {
      return res.status(400).json({
        status: "error",
        message: "Prediction is required"
      });
    }

    // ✅ Find pool and populate participants
    const pool = await Pool.findById(poolId).populate("participants.userId", "name email");

    if (!pool) {
      return res.status(404).json({
        status: "error",
        message: "Pool not found"
      });
    }

    // ✅ CHECK: Block predictions AFTER result is declared
    if (pool.status === "completed" || pool.correctPrediction) {
      return res.status(400).json({
        status: "error",
        message: "Result has already been declared. No more predictions allowed.",
        data: {
          correctPrediction: pool.correctPrediction,
          declaredAt: pool.resultDeclaredAt
        }
      });
    }

    // ✅ CHECK: Pool is not cancelled
    if (pool.status === "cancelled") {
      return res.status(400).json({
        status: "error",
        message: "This pool has been cancelled."
      });
    }

    // ✅ Find user in participants
    const participantIndex = pool.participants.findIndex(
      p => p.userId && p.userId._id.toString() === userId.toString()
    );

    if (participantIndex === -1) {
      return res.status(403).json({
        status: "error",
        message: "You are not a participant in this pool"
      });
    }

    const participant = pool.participants[participantIndex];

    // ✅ CHECK: User must be accepted participant
    if (participant.status !== "accepted") {
      return res.status(403).json({
        status: "error",
        message: `Your participation status is "${participant.status}". Only accepted participants can submit predictions.`
      });
    }

    // ✅ VALIDATE: Prediction must be one of the available options
    if (!pool.options || !pool.options.includes(prediction)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid prediction. Must be one of the available options",
        availableOptions: pool.options || []
      });
    }

    // ✅ Track if this is an update or new prediction
    const isUpdate = !!participant.prediction;
    const previousPrediction = participant.prediction;

    // ✅ UPDATE PREDICTION (Latest prediction overwrites previous)
    pool.participants[participantIndex].prediction = prediction;
    pool.participants[participantIndex].predictionSubmittedAt = new Date();

    // ✅ Save changes
    await pool.save();

    // ✅ Calculate statistics
    const totalPredictions = pool.participants.filter(
      p => p.prediction && p.status === "accepted"
    ).length;
    
    const totalParticipants = pool.participants.filter(
      p => p.status === "accepted"
    ).length;

    // ✅ Return success response
    res.status(200).json({
      status: "success",
      message: isUpdate 
        ? "Your prediction has been updated successfully" 
        : "Your prediction has been recorded successfully",
      data: {
        poolId: pool._id,
        poolName: pool.poolName,
        question: pool.question,
        availableOptions: pool.options,
        previousPrediction: isUpdate ? previousPrediction : null,
        currentPrediction: prediction,
        submittedAt: pool.participants[participantIndex].predictionSubmittedAt,
        totalPredictions: totalPredictions,
        totalParticipants: totalParticipants,
        canStillChange: !pool.correctPrediction, // Can change until result declared
        isUpdate: isUpdate
      }
    });

  } catch (err) {
    console.error("Prediction submission error:", err);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});
router.post("/pool/:poolId/declare-result", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { poolId } = req.params;
    const { correctPrediction } = req.body;

    console.log(`🚀 DECLARE RESULT CALLED | poolId: ${poolId} | by: ${userId}`);

    if (!correctPrediction) {
      return res.status(400).json({ status: "error", message: "correctPrediction is required" });
    }

    // ✅ NO .populate() — keeps userId as raw ObjectId so notifications work correctly
    const pool = await Pool.findById(poolId);

    if (!pool) {
      return res.status(404).json({ status: "error", message: "Pool not found" });
    }

    const isCreator = pool.createdBy.toString() === userId.toString();
    const isParticipant = pool.participants.some(
      (p) => p.userId && p.userId.toString() === userId.toString()
    );

    if (!isCreator && !isParticipant) {
      return res.status(403).json({ status: "error", message: "Only the pool creator or participants can declare results" });
    }

    if (pool.correctPrediction) {
      return res.status(400).json({
        status: "error",
        message: "Result has already been declared for this pool",
        data: { correctPrediction: pool.correctPrediction, declaredAt: pool.resultDeclaredAt },
      });
    }

    // ✅ Validate correctPrediction
    if (pool.rewardSystem === "Podium") {
      if (
        typeof correctPrediction !== "object" ||
        Array.isArray(correctPrediction) ||
        !correctPrediction.rank1 ||
        !correctPrediction.rank2 ||
        !correctPrediction.rank3
      ) {
        return res.status(400).json({
          status: "error",
          message: "For Podium system, correctPrediction must be an object with rank1, rank2, and rank3",
          availableOptions: pool.options || [],
        });
      }
      const invalidRanks = [];
      if (!pool.options.includes(correctPrediction.rank1)) invalidRanks.push("rank1");
      if (!pool.options.includes(correctPrediction.rank2)) invalidRanks.push("rank2");
      if (!pool.options.includes(correctPrediction.rank3)) invalidRanks.push("rank3");
      if (invalidRanks.length > 0) {
        return res.status(400).json({ status: "error", message: `Invalid predictions for: ${invalidRanks.join(", ")}`, availableOptions: pool.options });
      }
      if (new Set([correctPrediction.rank1, correctPrediction.rank2, correctPrediction.rank3]).size !== 3) {
        return res.status(400).json({ status: "error", message: "rank1, rank2, and rank3 must be different options" });
      }
    } else if (pool.rewardSystem === "Points Awards") {
      if (typeof correctPrediction !== "string" || !pool.options.includes(correctPrediction)) {
        return res.status(400).json({
          status: "error",
          message: "For Points Awards system, correctPrediction must be a valid option string",
          availableOptions: pool.options || [],
        });
      }
    } else {
      return res.status(400).json({ status: "error", message: "Invalid reward system" });
    }

    pool.correctPrediction = correctPrediction;
    pool.resultDeclaredAt = new Date();
    pool.status = "completed";

    const acceptedParticipants = pool.participants.filter((p) => p.status === "accepted");
    const totalPot = pool.pointsToJoin * acceptedParticipants.length;

    console.log(`📊 totalPot: ${totalPot} | acceptedParticipants: ${acceptedParticipants.length}`);
    console.log(`📊 rewardSystem: ${pool.rewardSystem}`);

    // ============================================================
    // POINTS AWARDS SYSTEM
    // ============================================================
    if (pool.rewardSystem === "Points Awards") {
      const winnerIndices = [];
      const loserIndices = [];

      pool.participants.forEach((p, idx) => {
        if (p.status !== "accepted" || !p.prediction) return;
        if (p.prediction === correctPrediction) {
          pool.participants[idx].resultStatus = "won";
          winnerIndices.push(idx);
        } else {
          pool.participants[idx].resultStatus = "lost";
          loserIndices.push(idx);
        }
      });

      console.log(`🏆 Winners: ${winnerIndices.length} | Losers: ${loserIndices.length}`);

      const pointsPerWinner = winnerIndices.length > 0 ? Math.floor(totalPot / winnerIndices.length) : 0;

      for (const idx of winnerIndices) {
        pool.participants[idx].pointsEarned = pointsPerWinner;
        pool.participants[idx].score = pointsPerWinner;
        const uid = pool.participants[idx].userId;
        if (uid) await User.findByIdAndUpdate(uid, { $inc: { totalPoints: pointsPerWinner } });
      }

      pool.leaderboard = winnerIndices.map((idx, i) => {
        const w = pool.participants[idx];
        return {
          userId: w.userId,
          name: w.name || "Unknown",
          totalPoints: w.pointsEarned || 0,
          rank: i + 1,
          rewardAmount: w.pointsEarned || 0,
          rewardSystem: pool.rewardSystem,
          joinedAt: w.joinedAt,
          predictionSubmittedAt: w.predictionSubmittedAt,
        };
      });

      // ✅ Build notifyList from indices BEFORE save
      const allNotifyIndices = [
        ...winnerIndices.map((idx) => ({ idx, isWinner: true })),
        ...loserIndices.map((idx) => ({ idx, isWinner: false })),
      ];

      const notifyList = allNotifyIndices
        .filter(({ idx }) => pool.participants[idx].userId && pool.participants[idx].prediction)
        .map(({ idx, isWinner }) => {
          const p = pool.participants[idx];
          return {
            notifyId: p.userId.toString(),
            isWinner,
            pointsEarned: p.pointsEarned || 0,
            prediction: p.prediction,
          };
        });

      console.log(`🔔 notifyList: ${JSON.stringify(notifyList)}`);

      pool.markModified("participants");
      await pool.save();
      console.log("✅ Pool saved to DB");

      for (const entry of notifyList) {
        console.log(`📤 Notifying: ${entry.notifyId} | isWinner: ${entry.isWinner}`);
        await sendInAppNotification(entry.notifyId, {
          type: entry.isWinner ? "pool_won" : "pool_lost",
          title: entry.isWinner ? "Congratulations! 🎉" : "Pool Result Declared",
          message: entry.isWinner
            ? `You won ${entry.pointsEarned} points in "${pool.poolName}"! Your prediction was correct.`
            : `Results for "${pool.poolName}" are out. The correct answer was "${correctPrediction}". Better luck next time!`,
          data: {
            poolId: pool._id,
            poolName: pool.poolName,
            resultStatus: entry.isWinner ? "won" : "lost",
            pointsEarned: entry.pointsEarned,
            correctPrediction,
            userPrediction: entry.prediction,
          },
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Result declared successfully",
        data: {
          poolId: pool._id,
          poolName: pool.poolName,
          question: pool.question,
          correctPrediction,
          declaredAt: pool.resultDeclaredAt,
          rewardSystem: pool.rewardSystem,
          totalPot,
          totalWinners: winnerIndices.length,
          totalLosers: loserIndices.length,
          totalParticipants: acceptedParticipants.length,
          pointsPerWinner: winnerIndices.length > 0 ? pointsPerWinner : null,
          winnerdata: pool.leaderboard,
        },
      });
    }

    // ============================================================
    // PODIUM SYSTEM
    // ============================================================
    if (pool.rewardSystem === "Podium") {
      const rank1Indices = [];
      const rank2Indices = [];
      const rank3Indices = [];
      const loserIndices = [];

      pool.participants.forEach((p, idx) => {
        if (p.status !== "accepted" || !p.prediction) return;
        if (p.prediction === correctPrediction.rank1) {
          pool.participants[idx].resultStatus = "won";
          pool.participants[idx].rank = 1;
          pool.participants[idx].matchedRanks = [1];
          rank1Indices.push(idx);
        } else if (p.prediction === correctPrediction.rank2) {
          pool.participants[idx].resultStatus = "won";
          pool.participants[idx].rank = 2;
          pool.participants[idx].matchedRanks = [2];
          rank2Indices.push(idx);
        } else if (p.prediction === correctPrediction.rank3) {
          pool.participants[idx].resultStatus = "won";
          pool.participants[idx].rank = 3;
          pool.participants[idx].matchedRanks = [3];
          rank3Indices.push(idx);
        } else {
          pool.participants[idx].resultStatus = "lost";
          loserIndices.push(idx);
        }
      });

      console.log(`🏆 Rank1: ${rank1Indices.length} | Rank2: ${rank2Indices.length} | Rank3: ${rank3Indices.length} | Losers: ${loserIndices.length}`);

      const rank1Points = Math.floor((totalPot * (pool.winner || 0)) / 100);
      const rank2Points = Math.floor((totalPot * (pool.runnerUp || 0)) / 100);
      const rank3Points = Math.floor((totalPot * (pool.secondRunnerUp || 0)) / 100);

      if (rank1Indices.length > 0) {
        const pts = Math.floor(rank1Points / rank1Indices.length);
        for (const idx of rank1Indices) {
          pool.participants[idx].pointsEarned = pts;
          pool.participants[idx].score = pts;
          const uid = pool.participants[idx].userId;
          if (uid) await User.findByIdAndUpdate(uid, { $inc: { totalPoints: pts } });
        }
      }
      if (rank2Indices.length > 0) {
        const pts = Math.floor(rank2Points / rank2Indices.length);
        for (const idx of rank2Indices) {
          pool.participants[idx].pointsEarned = pts;
          pool.participants[idx].score = pts;
          const uid = pool.participants[idx].userId;
          if (uid) await User.findByIdAndUpdate(uid, { $inc: { totalPoints: pts } });
        }
      }
      if (rank3Indices.length > 0) {
        const pts = Math.floor(rank3Points / rank3Indices.length);
        for (const idx of rank3Indices) {
          pool.participants[idx].pointsEarned = pts;
          pool.participants[idx].score = pts;
          const uid = pool.participants[idx].userId;
          if (uid) await User.findByIdAndUpdate(uid, { $inc: { totalPoints: pts } });
        }
      }

      pool.leaderboard = [...rank1Indices, ...rank2Indices, ...rank3Indices].map((idx) => {
        const w = pool.participants[idx];
        return {
          userId: w.userId,
          name: w.name || "Unknown",
          totalPoints: w.pointsEarned || 0,
          rank: w.rank,
          rewardAmount: w.pointsEarned || 0,
          rewardSystem: pool.rewardSystem,
          joinedAt: w.joinedAt,
          predictionSubmittedAt: w.predictionSubmittedAt,
          matchedRanks: w.matchedRanks || [],
        };
      });

      const allNotifyIndices = [
        ...rank1Indices.map((idx) => ({ idx, isWinner: true })),
        ...rank2Indices.map((idx) => ({ idx, isWinner: true })),
        ...rank3Indices.map((idx) => ({ idx, isWinner: true })),
        ...loserIndices.map((idx) => ({ idx, isWinner: false })),
      ];

      const notifyList = allNotifyIndices
        .filter(({ idx }) => pool.participants[idx].userId && pool.participants[idx].prediction)
        .map(({ idx, isWinner }) => {
          const p = pool.participants[idx];
          return {
            notifyId: p.userId.toString(),
            isWinner,
            pointsEarned: p.pointsEarned || 0,
            prediction: p.prediction,
            rank: p.rank || null,
            matchedRanks: p.matchedRanks || [],
          };
        });

      console.log(`🔔 notifyList: ${JSON.stringify(notifyList)}`);

      pool.markModified("participants");
      await pool.save();
      console.log("✅ Pool saved to DB");

      for (const entry of notifyList) {
        const rankText =
          entry.rank === 1 ? "1st place (Rank 1)"
          : entry.rank === 2 ? "2nd place (Rank 2)"
          : entry.rank === 3 ? "3rd place (Rank 3)" : "";

        console.log(`📤 Notifying: ${entry.notifyId} | isWinner: ${entry.isWinner}`);
        await sendInAppNotification(entry.notifyId, {
          type: entry.isWinner ? "pool_won" : "pool_lost",
          title: entry.isWinner ? "Congratulations! 🎉" : "Pool Result Declared",
          message: entry.isWinner
            ? `You won ${entry.pointsEarned} points in "${pool.poolName}"! Your prediction "${entry.prediction}" matched ${rankText}.`
            : `Results for "${pool.poolName}" are out. Your prediction "${entry.prediction}" didn't match any rank. Better luck next time!`,
          data: {
            poolId: pool._id,
            poolName: pool.poolName,
            resultStatus: entry.isWinner ? "won" : "lost",
            pointsEarned: entry.pointsEarned,
            correctPrediction,
            userPrediction: entry.prediction,
            matchedRanks: entry.matchedRanks,
            rank: entry.rank,
          },
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Result declared successfully",
        data: {
          poolId: pool._id,
          poolName: pool.poolName,
          question: pool.question,
          correctPrediction,
          declaredAt: pool.resultDeclaredAt,
          rewardSystem: pool.rewardSystem,
          totalPot,
          totalWinners: rank1Indices.length + rank2Indices.length + rank3Indices.length,
          totalLosers: loserIndices.length,
          totalParticipants: acceptedParticipants.length,
          winnerdata: pool.leaderboard,
        },
      });
    }

  } catch (err) {
    console.error("❌ Result declaration error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
});
// router.post("/pool/:poolId/declare-result", auth, async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { poolId } = req.params;
//     const { correctPrediction } = req.body;
//     if (!correctPrediction) {
//       return res.status(400).json({
//         status: "error",
//         message: "correctPrediction is required"
//       });
//     }

//     const pool = await Pool.findById(poolId).populate("participants.userId", "name email avatar");

//     if (!pool) {
//       return res.status(404).json({
//         status: "error",
//         message: "Pool not found"
//       });
//     }


//   const isCreator =
//   pool.createdBy &&
//   (pool.createdBy._id
//     ? pool.createdBy._id.toString()
//     : pool.createdBy.toString()) === userId.toString();

// const isParticipant = pool.participants.some(p =>
//   p.userId &&
//   (p.userId._id
//     ? p.userId._id.toString()
//     : p.userId.toString()) === userId.toString()
// );

// if (!isCreator && !isParticipant) {
//   return res.status(403).json({
//     status: "error",
//     message: "Only the pool creator or participants can declare results"
//   });
// }
//     // const isCreator = pool.createdBy.toString() === userId.toString();

//     // if (!isCreator) {
//     //   return res.status(403).json({
//     //     status: "error",
//     //     message: "Only the pool creator can declare results"
//     //   });
//     // }

//     if (pool.correctPrediction) {
//       return res.status(400).json({
//         status: "error",
//         message: "Result has already been declared for this pool",
//         data: {
//           correctPrediction: pool.correctPrediction,
//           declaredAt: pool.resultDeclaredAt
//         }
//       });
//     }

   
//     if (pool.rewardSystem === "Podium") {
     
//       if (typeof correctPrediction !== 'object' || Array.isArray(correctPrediction) || !correctPrediction.rank1 || !correctPrediction.rank2 || !correctPrediction.rank3) {
     
//         const exampleObj = {};
//         if (pool.options && pool.options.length >= 3) {
//           exampleObj.rank1 = pool.options[0];
//           exampleObj.rank2 = pool.options[1];
//           exampleObj.rank3 = pool.options[2];
//         } else {
//           exampleObj.rank1 = "Option 1";
//           exampleObj.rank2 = "Option 2";
//           exampleObj.rank3 = "Option 3";
//         }

//         return res.status(400).json({
//           status: "error",
//           message: "For Podium system, correctPrediction must be an object with rank1, rank2, and rank3",
//           example: exampleObj,
//           availableOptions: pool.options || [],
//           note: "Select 3 different options from availableOptions for rank1, rank2, and rank3"
//         });
//       }


//       const invalidRanks = [];
//       if (!pool.options.includes(correctPrediction.rank1)) invalidRanks.push('rank1');
//       if (!pool.options.includes(correctPrediction.rank2)) invalidRanks.push('rank2');
//       if (!pool.options.includes(correctPrediction.rank3)) invalidRanks.push('rank3');

//       if (invalidRanks.length > 0) {
//         return res.status(400).json({
//           status: "error",
//           message: `Invalid predictions for: ${invalidRanks.join(', ')}. Each rank must be one of the available options.`,
//           availableOptions: pool.options,
//           providedValues: {
//             rank1: correctPrediction.rank1,
//             rank2: correctPrediction.rank2,
//             rank3: correctPrediction.rank3
//           }
//         });
//       }

   
//       const ranks = [correctPrediction.rank1, correctPrediction.rank2, correctPrediction.rank3];
//       const uniqueRanks = new Set(ranks);
//       if (uniqueRanks.size !== 3) {
//         return res.status(400).json({
//           status: "error",
//           message: "rank1, rank2, and rank3 must be different options",
//           providedValues: {
//             rank1: correctPrediction.rank1,
//             rank2: correctPrediction.rank2,
//             rank3: correctPrediction.rank3
//           }
//         });
//       }
//     } else if (pool.rewardSystem === "Points Awards") {
     
//       if (typeof correctPrediction !== 'string' || !pool.options.includes(correctPrediction)) {
//         return res.status(400).json({
//           status: "error",
//           message: "For Points Awards system, correctPrediction must be a string and one of the available options",
//           availableOptions: pool.options || [],
//           providedValue: correctPrediction
//         });
//       }
//     } else {
//       return res.status(400).json({
//         status: "error",
//         message: "Invalid reward system"
//       });
//     }

//     pool.correctPrediction = correctPrediction;
//     pool.resultDeclaredAt = new Date();
//     pool.status = "completed";

//     const acceptedParticipants = pool.participants.filter(p => p.status === "accepted");
//     const totalPot = pool.pointsToJoin * acceptedParticipants.length;

//     // ==================== PODIUM SYSTEM (Ranked Distribution) ====================
//     if (pool.rewardSystem === "Podium") {
//       const rank1Winners = [];
//       const rank2Winners = [];
//       const rank3Winners = [];
//       const losers = [];

//       pool.participants.forEach(participant => {
//         if (participant.status === "accepted" && participant.prediction) {
//           const userPrediction = participant.prediction;
//           let matchedRank = null;

//           // Check if user's prediction matches any rank
//           if (userPrediction === correctPrediction.rank1) {
//             matchedRank = 1;
//             rank1Winners.push(participant);
//           } else if (userPrediction === correctPrediction.rank2) {
//             matchedRank = 2;
//             rank2Winners.push(participant);
//           } else if (userPrediction === correctPrediction.rank3) {
//             matchedRank = 3;
//             rank3Winners.push(participant);
//           }

//           if (matchedRank) {
//             participant.resultStatus = "won";
//             participant.rank = matchedRank;
//             participant.matchedRanks = [matchedRank];
//           } else {
//             participant.resultStatus = "lost";
//             losers.push(participant);
//           }
//         }
//       });

//       // Calculate points for each rank
//       const rank1Points = Math.floor((totalPot * (pool.winner || 0)) / 100);
//       const rank2Points = Math.floor((totalPot * (pool.runnerUp || 0)) / 100);
//       const rank3Points = Math.floor((totalPot * (pool.secondRunnerUp || 0)) / 100);

//       // Distribute rank1 points (split among all rank1 winners)
//       if (rank1Winners.length > 0) {
//         const pointsPerRank1Winner = Math.floor(rank1Points / rank1Winners.length);
//         for (const winner of rank1Winners) {
//           winner.pointsEarned = pointsPerRank1Winner;
//           winner.score = pointsPerRank1Winner;

//           if (winner.userId) {
//             // await User.findByIdAndUpdate(winner.userId._id, {
//             await User.findByIdAndUpdate(winner.userId?._id || winner.userId, {
//               $inc: { totalPoints: pointsPerRank1Winner }
//             });
//           }
//         }
//       }

//       // Distribute rank2 points
//       if (rank2Winners.length > 0) {
//         const pointsPerRank2Winner = Math.floor(rank2Points / rank2Winners.length);
//         for (const winner of rank2Winners) {
//           winner.pointsEarned = pointsPerRank2Winner;
//           winner.score = pointsPerRank2Winner;

//           if (winner.userId) {
//             // await User.findByIdAndUpdate(winner.userId._id, {
//              await User.findByIdAndUpdate(winner.userId?._id || winner.userId, {
//               $inc: { totalPoints: pointsPerRank2Winner }
//             });
//           }
//         }
//       }

//       // Distribute rank3 points
//       if (rank3Winners.length > 0) {
//         const pointsPerRank3Winner = Math.floor(rank3Points / rank3Winners.length);
//         for (const winner of rank3Winners) {
//           winner.pointsEarned = pointsPerRank3Winner;
//           winner.score = pointsPerRank3Winner;

//           if (winner.userId) {
//             // await User.findByIdAndUpdate(winner.userId._id, {
//              await User.findByIdAndUpdate(winner.userId?._id || winner.userId, {
//               $inc: { totalPoints: pointsPerRank3Winner }
//             });
//           }
//         }
//       }

//       // Build leaderboard (all winners sorted by rank)
//       const allWinners = [];
      
//       // Add rank1 winners
//       rank1Winners.forEach(w => {
//         allWinners.push({
//           userId: w.userId?._id || w.userId,
//           name: w.userId?.name || w.name || "Unknown",
//           totalPoints: w.pointsEarned || 0,
//           rank: 1,
//           rewardAmount: w.pointsEarned || 0,
//           rewardSystem: pool.rewardSystem,
//           joinedAt: w.joinedAt,
//           predictionSubmittedAt: w.predictionSubmittedAt,
//           matchedRanks: [1]
//         });
//       });
      
//       // Add rank2 winners
//       rank2Winners.forEach(w => {
//         allWinners.push({
//           userId: w.userId?._id || w.userId,
//           name: w.userId?.name || w.name || "Unknown",
//           totalPoints: w.pointsEarned || 0,
//           rank: 2,
//           rewardAmount: w.pointsEarned || 0,
//           rewardSystem: pool.rewardSystem,
//           joinedAt: w.joinedAt,
//           predictionSubmittedAt: w.predictionSubmittedAt,
//           matchedRanks: [2]
//         });
//       });
      
//       // Add rank3 winners
//       rank3Winners.forEach(w => {
//         allWinners.push({
//           userId: w.userId?._id || w.userId,
//           name: w.userId?.name || w.name || "Unknown",
//           totalPoints: w.pointsEarned || 0,
//           rank: 3,
//           rewardAmount: w.pointsEarned || 0,
//           rewardSystem: pool.rewardSystem,
//           joinedAt: w.joinedAt,
//           predictionSubmittedAt: w.predictionSubmittedAt,
//           matchedRanks: [3]
//         });
//       });

//       pool.leaderboard = allWinners;

//       // Send notifications
//       for (const p of pool.participants) {
//         if (p.userId && p.status === "accepted" && p.prediction) {

//     console.log("=== NOTIFY ===");
//     console.log("userId:", p.userId?._id || p.userId);
//     console.log("resultStatus:", p.resultStatus);
    

//           const isWinner = p.resultStatus === "won";
          
//           let rankText = "";
//           if (p.rank === 1) rankText = "1st place (Rank 1)";
//           else if (p.rank === 2) rankText = "2nd place (Rank 2)";
//           else if (p.rank === 3) rankText = "3rd place (Rank 3)";

//           // await sendInAppNotification(p.userId._id, {
//           await sendInAppNotification(p.userId?._id || p.userId, {
//             type: isWinner ? "pool_won" : "pool_lost",
//             title: isWinner ? "Congratulations! 🎉" : "Pool Result Declared",
//             message: isWinner 
//               ? `You won ${p.pointsEarned || 0} points in "${pool.poolName}"! Your prediction "${p.prediction}" matched ${rankText}.`
//               : `Results for "${pool.poolName}" are out. Your prediction "${p.prediction}" didn't match any rank. Better luck next time!`,
//             data: {
//               poolId: pool._id,
//               poolName: pool.poolName,
//               resultStatus: p.resultStatus,
//               pointsEarned: p.pointsEarned || 0,
//               correctPrediction: correctPrediction,
//               userPrediction: p.prediction,
//               matchedRanks: p.matchedRanks || [],
//               rank: p.rank || null
//             }
//           });
//         }
//       }

//       await pool.save();

//       return res.status(200).json({
//         status: "success",
//         message: "Result declared successfully",
//         data: {
//           poolId: pool._id,
//           poolName: pool.poolName,
//           question: pool.question,
//           correctPrediction: correctPrediction,
//           declaredAt: pool.resultDeclaredAt,
//           rewardSystem: pool.rewardSystem,
//           totalPot: totalPot,
//           totalWinners: rank1Winners.length + rank2Winners.length + rank3Winners.length,
//           totalLosers: losers.length,
//           totalParticipants: acceptedParticipants.length,
//           pointsPerWinner: null,
//           winnerdata: pool.leaderboard
//         }
//       });
//     }

    
//     if (pool.rewardSystem === "Points Awards") {
//       const winners = [];
//       const losers = [];

//       pool.participants.forEach(participant => {
//         if (participant.status === "accepted" && participant.prediction) {
//           if (participant.prediction === correctPrediction) {
//             participant.resultStatus = "won";
//             winners.push(participant);
//           } else {
//             participant.resultStatus = "lost";
//             losers.push(participant);
//           }
//         }
//       });

     
//       if (winners.length > 0) {
//         const pointsPerWinner = Math.floor(totalPot / winners.length);
        
//         for (const winner of winners) {
//           winner.pointsEarned = pointsPerWinner;
//           winner.score = pointsPerWinner;
          
//           if (winner.userId) {
//             await User.findByIdAndUpdate(winner.userId?._id || winner.userId, {
//   // $inc: { totalPoints: pointsPerRank2Winner }
//             // await User.findByIdAndUpdate(winner.userId._id, {
//               $inc: { totalPoints: pointsPerWinner }
              
//             });
//           }
//         }
//       }

//       // Build leaderboard (all winners with equal points)
//       pool.leaderboard = winners.map((winner, index) => ({
//         userId: winner.userId?._id || winner.userId,
//         name: winner.userId?.name || winner.name || "Unknown",
//         totalPoints: winner.pointsEarned || 0,
//         rank: index + 1,
//         rewardAmount: winner.pointsEarned || 0,
//         rewardSystem: pool.rewardSystem,
//         joinedAt: winner.joinedAt,
//         predictionSubmittedAt: winner.predictionSubmittedAt
//       }));

//       // Send notifications
//       for (const p of pool.participants) {
//         if (p.userId && p.status === "accepted" && p.prediction) {
//           const isWinner = p.resultStatus === "won";
          
//           // await sendInAppNotification(p.userId._id, {
//           await sendInAppNotification(p.userId?._id || p.userId, {
//             type: isWinner ? "pool_won" : "pool_lost",
//             title: isWinner ? "Congratulations! 🎉" : "Pool Result Declared",
//             message: isWinner 
//               ? `You won ${p.pointsEarned || 0} points in "${pool.poolName}"! Your prediction was correct.`
//               : `Results for "${pool.poolName}" are out. The correct answer was "${correctPrediction}". Better luck next time!`,
//             data: {
//               poolId: pool._id,
//               poolName: pool.poolName,
//               resultStatus: p.resultStatus,
//               pointsEarned: p.pointsEarned || 0,
//               correctPrediction: correctPrediction,
//               userPrediction: p.prediction
//             }
//           });
//         }
//       }

//       await pool.save();

//       return res.status(200).json({
//         status: "success",
//         message: "Result declared successfully",
//         data: {
//           poolId: pool._id,
//           poolName: pool.poolName,
//           question: pool.question,
//           correctPrediction: correctPrediction,
//           declaredAt: pool.resultDeclaredAt,
//           rewardSystem: pool.rewardSystem,
//           totalPot: totalPot,
//           totalWinners: winners.length,
//           totalLosers: losers.length,
//           totalParticipants: acceptedParticipants.length,
//           pointsPerWinner: winners.length > 0 ? Math.floor(totalPot / winners.length) : null,
//           winnerdata: pool.leaderboard
//         }
//       });
//     }

//   } catch (err) {
//     console.error("Result declaration error:", err);
//     res.status(500).json({
//       status: "error",
//       message: err.message
//     });
//   }
// });
router.get("/pool/:poolId/details", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { poolId } = req.params;

    const pool = await Pool.findById(poolId)
      .populate("createdBy", "name email avatar")
      .populate("participants.userId", "name email avatar");

    if (!pool) {
      return res.status(404).json({
        status: "error",
        message: "Pool not found"
      });
    }

    // Check if user is participant or creator
    const isCreator = pool.createdBy._id.toString() === userId.toString();
    const participantIndex = pool.participants.findIndex(
      p => p.userId && p.userId._id.toString() === userId.toString()
    );

    if (!isCreator && participantIndex === -1) {
      return res.status(403).json({
        status: "error",
        message: "You don't have access to this pool"
      });
    }

    const userParticipant = participantIndex !== -1 ? pool.participants[participantIndex] : null;

    // Count predictions
    const totalPredictions = pool.participants.filter(p => p.prediction && p.status === "accepted").length;
    const totalParticipants = pool.participants.filter(p => p.status === "accepted").length;

    res.status(200).json({
      status: "success",
      data: {
        poolId: pool._id,
        poolName: pool.poolName,
        description: pool.description,
        question: pool.question,
        options: pool.options,
        category: pool.category,
        pointsToJoin: pool.pointsToJoin,
        rewardSystem: pool.rewardSystem,
        status: pool.status,
        isCreator: isCreator,
        createdBy: {
          id: pool.createdBy._id,
          name: pool.createdBy.name,
          avatar: pool.createdBy.avatar
        },
        yourStatus: userParticipant ? userParticipant.status : null,
        yourPrediction: userParticipant ? userParticipant.prediction : null,
        yourPredictionSubmittedAt: userParticipant ? userParticipant.predictionSubmittedAt : null,
        yourResultStatus: userParticipant ? userParticipant.resultStatus : null,
        yourPointsEarned: userParticipant ? userParticipant.pointsEarned : 0,
        yourRank: userParticipant ? userParticipant.rank : null,
        totalPredictions: totalPredictions,
        totalParticipants: totalParticipants,
        correctPrediction: pool.correctPrediction || null,
        resultDeclaredAt: pool.resultDeclaredAt || null,
        leaderboard: pool.leaderboard || [],
        createdAt: pool.createdAt,
        updatedAt: pool.updatedAt
      }
    });

  } catch (err) {
    console.error("Get pool details error:", err);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});
router.get("/notifications", auth, async (req, res) => {
  try {
    const user = req.user;

    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: user._id,
      // isRead: false
    });

    res.status(200).json({
      status: "success",
      // unreadCount,
      notifications
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});
router.post("/invitations/:poolId/respond", auth, async (req, res) => {
  try {
    const user = req.user;
    const { poolId } = req.params;
    const { action } = req.body;

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid action. Use 'accept' or 'reject'"
      });
    }

    const pool = await Pool.findById(poolId).populate("createdBy", "name");

    if (!pool) {
      return res.status(404).json({
        status: "error",
        message: "Pool not found"
      });
    }

    const participantIndex = pool.participants.findIndex(p =>
      (p.userId?.toString() === user._id.toString()) ||
      (p.email === user.email) ||
      (p.phone === user.phone)
    );

    if (participantIndex === -1) {
      return res.status(404).json({
        status: "error",
        message: "You are not invited to this pool"
      });
    }

    const participant = pool.participants[participantIndex];

    if (participant.status !== "pending") {
      return res.status(400).json({
        status: "error",
        message: `You have already ${participant.status} this invitation`
      });
    }

    // ================= ACCEPT =================
    if (action === "accept") {
      // ✅ CHECK IF USER HAS ENOUGH POINTS
      if (user.totalPoints < pool.pointsToJoin) {
        return res.status(403).json({
          status: "error",
          message: "Insufficient points to join this pool",
          required: pool.pointsToJoin,
          available: user.totalPoints
        });
      }

      // ✅ DEDUCT POINTS FROM USER
      user.totalPoints -= pool.pointsToJoin;
      await user.save();

      pool.participants[participantIndex].status = "accepted";
      pool.participants[participantIndex].userId = user._id;
      pool.participants[participantIndex].name = user.name;

      await Notification.findOneAndUpdate(
        {
          userId: user._id,
          "data.poolId": poolId,
          type: "pool_invitation"
        },
        {
          $set: {
            type: "pool_accepted",
            status: "accepted",
            message: `You accepted the invitation to join "${pool.poolName}" (${pool.pointsToJoin} points deducted)`
          }
        }
      );

      await sendInAppNotification(pool.createdBy._id, {
        type: "pool_accepted",
        title: "Invitation Accepted",
        message: `${user.name} accepted your invitation to "${pool.poolName}"`,
        data: {
          poolId: pool._id,
          poolName: pool.poolName,
          acceptedByName: user.name,
          acceptedById: user._id
        }
      });
    }

    // ================= REJECT =================
    if (action === "reject") {
      pool.participants[participantIndex].status = "rejected";

      await Notification.findOneAndUpdate(
        {
          userId: user._id,
          "data.poolId": poolId,
          type: "pool_invitation"
        },
        {
          $set: {
            type: "pool_rejected",
            status: "rejected",
            message: `You declined the invitation to join "${pool.poolName}"`
          }
        }
      );

      await sendInAppNotification(pool.createdBy._id, {
        type: "pool_rejected",
        title: "Invitation Rejected",
        message: `${user.name} declined your invitation to "${pool.poolName}"`,
        data: {
          poolId: pool._id,
          poolName: pool.poolName,
          rejectedByName: user.name,
          rejectedById: user._id
        }
      });
    }

    await pool.save();

    const acceptedCount = pool.participants.filter(
      p => p.status === "accepted"
    ).length;

    res.status(200).json({
      status: "success",
      message: action === "accept" 
        ? `Invitation accepted successfully. ${pool.pointsToJoin} points deducted.`
        : "Invitation rejected successfully",
      pool: {
        id: pool._id,
        poolName: pool.poolName,
        participantsCount: acceptedCount
      },
      pointsDeducted: action === "accept" ? pool.pointsToJoin : 0,
      remainingPoints: user.totalPoints
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
}); 
router.post('/pool/invite/responded',(req,res)=>{
  try{
    const {poolId,inviteLinkid,userId,action}= req.body;
    if(lId){
      Pool.findById(poolId).then(async(pool)=>{
        if(!pool){

          return res.status(404).json({
            success:false,
            message:"pool not found"
            // message:"pool not found it is true that vijay thalapthy do not do any more movies becuase he will focus on his politic career and january 2026 he officially join dmk"
          })
        }
      })
    }
    res.status(200).json({
      status:"success",
      message:"user has responded to the invite link"
    })

  }catch(error){
    res.status(500).json({
      status:"error",
      message:error.message
    })
  }
})
router.post("/pool/correctparidication", async(req,res)=>{
  try {
    const poolid= req.params
    const  pool = await  Pool.findById(poolid);
  } catch (error) {
    status:error,
    res.send(error.message)
  }
})

// router.get("/notifications/details", auth, async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { page = 1, limit = 50, unreadOnly = false, type = null } = req.query;

//     // Build query
//     const query = { userId: userId };
    
//     if (unreadOnly === 'true') {
//       query.isRead = false;
//     }
    
//     if (type) {
//       query.type = type;
//     }

//     // Fetch notifications
//     const notifications = await Notification.find(query)
//       .sort({ createdAt: -1 })
//       .limit(parseInt(limit))
//       .skip((parseInt(page) - 1) * parseInt(limit));

//     const totalNotifications = await Notification.countDocuments(query);
//     const unreadCount = await Notification.countDocuments({
//       userId: userId,
//       isRead: false
//     });

//     // Enrich each notification with full pool details
//     const enrichedNotifications = await Promise.all(
//       notifications.map(async (notification) => {
//         const notifObj = {
//           id: notification._id,
//           type: notification.type,
//           title: notification.title,
//           message: notification.message,
//           data: notification.data,
//           isRead: notification.isRead,
//           readAt: notification.readAt,
//           createdAt: notification.createdAt
//         };

//         // Extract pool ID from notification data
//         const poolId = notification.data?.poolId;

//         if (!poolId) {
//           notifObj.pool = null;
//           notifObj.inviter = null;
//           return notifObj;
//         }

//         // Fetch full pool details
//         const pool = await Pool.findById(poolId)
//           .populate("createdBy", "name email avatar phone")
//           .populate("participants.userId", "name email avatar phone");

//         if (!pool) {
//           notifObj.pool = null;
//           notifObj.inviter = null;
//           notifObj.note = "Pool has been deleted";
//           return notifObj;
//         }

//         // Find inviter information
//         let inviterInfo = null;
//         if (notification.data?.inviterId) {
//           const inviter = await User.findById(notification.data.inviterId)
//             .select("name email avatar phone");
          
//           if (inviter) {
//             inviterInfo = {
//               id: inviter._id,
//               name: inviter.name,
//               email: inviter.email,
//               avatar: inviter.avatar,
//               phone: inviter.phone
//             };
//           }
//         }

//         // Get current user's participation status
//         const currentUserParticipant = pool.participants.find(
//           p => p.userId && p.userId._id.toString() === userId.toString()
//         );

//         // Count participants
//         const acceptedParticipants = pool.participants.filter(
//           p => p.status === "accepted"
//         );
//         const pendingParticipants = pool.participants.filter(
//           p => p.status === "pending"
//         );
//         const totalPredictions = pool.participants.filter(
//           p => p.prediction && p.status === "accepted"
//         ).length;

//         // Get category details
//         let categoryDetails = null;
//         if (pool.category) {
//           const category = await Category.findOne({
//             $or: [
//               { _id: pool.category },
//               { name: pool.category }
//             ]
//           });
          
//           if (category) {
//             categoryDetails = {
//               id: category._id,
//               name: category.name,
//               icon: category.icon
//             };
//           }
//         }

//         // Calculate total pot
//         const totalPot = pool.pointsToJoin * acceptedParticipants.length;

//         // Add inviter info
//         notifObj.inviter = inviterInfo;

//         // Add full pool information
//         notifObj.pool = {
//           id: pool._id,
//           poolName: pool.poolName,
//           description: pool.description || "",
//           question: pool.question,
//           options: pool.options || [],
//           category: categoryDetails,
//           status: pool.status,
//           rewardSystem: pool.rewardSystem,
          
//           // Entry & Rewards
//           pointsToJoin: pool.pointsToJoin,
//           totalPot: totalPot,
          
//           // Podium rewards (if applicable)
//           podiumRewards: pool.rewardSystem === "Podium" ? {
//             winner: pool.winner || 0,
//             runnerUp: pool.runnerUp || 0,
//             secondRunnerUp: pool.secondRunnerUp || 0
//           } : null,
          
//           // Pool creator info
//           createdBy: {
//             id: pool.createdBy._id,
//             name: pool.createdBy.name,
//             email: pool.createdBy.email,
//             avatar: pool.createdBy.avatar,
//             phone: pool.createdBy.phone
//           },
          
//           // Participation statistics
//           stats: {
//             totalParticipants: acceptedParticipants.length,
//             pendingInvites: pendingParticipants.length,
//             totalPredictions: totalPredictions,
//             predictionProgress: acceptedParticipants.length > 0 
//               ? Math.round((totalPredictions / acceptedParticipants.length) * 100) 
//               : 0
//           },
          
//           // Current user's status in this pool
//           yourStatus: {
//             participationStatus: currentUserParticipant?.status || "not_participant",
//             prediction: currentUserParticipant?.prediction || null,
//             predictionSubmittedAt: currentUserParticipant?.predictionSubmittedAt || null,
//             resultStatus: currentUserParticipant?.resultStatus || null,
//             pointsEarned: currentUserParticipant?.pointsEarned || 0,
//             rank: currentUserParticipant?.rank || null,
//             canPredict: currentUserParticipant?.status === "accepted" && !pool.correctPrediction,
//             canRespond: currentUserParticipant?.status === "pending",
//             joinedAt: currentUserParticipant?.joinedAt || null
//           },
          
//           // Accepted participants list
//           participants: acceptedParticipants.map(p => ({
//             id: p.userId?._id || null,
//             name: p.userId?.name || p.name || "Unknown",
//             email: p.userId?.email || p.email || null,
//             avatar: p.userId?.avatar || null,
//             hasPredicted: !!p.prediction,
//             joinedAt: p.joinedAt || null
//           })),
          
//           // Pending invitations list
//           pendingInvites: pendingParticipants.map(p => ({
//             name: p.userId?.name || p.name || "Unknown",
//             email: p.userId?.email || p.email || null,
//             avatar: p.userId?.avatar || null
//           })),
          
//           // Result info (if declared)
//           result: pool.correctPrediction ? {
//             correctPrediction: pool.correctPrediction,
//             declaredAt: pool.resultDeclaredAt,
//             leaderboard: pool.leaderboard || []
//           } : null,
          
//           // Invite link
//           inviteLink: pool.inviteLink || null,
          
//           // Timestamps
//           createdAt: pool.createdAt,
//           updatedAt: pool.updatedAt
//         };

//         return notifObj;
//       })
//     );

//     res.status(200).json({
//       status: "success",
//       message: "All notifications with pool details fetched successfully",
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(totalNotifications / parseInt(limit)),
//         totalNotifications: totalNotifications,
//         limit: parseInt(limit)
//       },
//       unreadCount: unreadCount,
//       data: enrichedNotifications
//     });

//   } catch (err) {
//     console.error("Notifications details error:", err);
//     res.status(500).json({
//       status: "error",
//       message: err.message
//     });
//   }
// });

router.get("/notifications/details", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 50, unreadOnly = false, type = null } = req.query;

    // Build query
    const query = { userId: userId };
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    if (type) {
      query.type = type;
    }

    // Fetch notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalNotifications = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId: userId,
      isRead: false
    });

    // Enrich each notification with pool details
    const enrichedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        const notifObj = {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          isRead: notification.isRead,
          createdAt: notification.createdAt
        };

        // Extract pool ID from notification data
        const poolId = notification.data?.poolId;

        if (!poolId) {
          notifObj.pool = null;
          return notifObj;
        }

        // Fetch pool details
        const pool = await Pool.findById(poolId)
          .populate("createdBy", "name")
          .populate("participants.userId", "name");

        if (!pool) {
          notifObj.pool = null;
          notifObj.shouldHide = true;
          return notifObj;
        }

        // ✅ CHECK: Find current user's participation status
        const currentUserParticipant = pool.participants.find(
          p => p.userId && p.userId._id.toString() === userId.toString()
        );

        const userStatus = currentUserParticipant?.status;
        const isPoolCompleted = pool.status === "completed";
        const isPoolCancelled = pool.status === "cancelled";

        // ✅ HIDE notification in these cases:
        // - User already accepted
        // - Pool is completed
        // - Pool is cancelled
        // - User rejected
        if (userStatus === "accepted" || isPoolCompleted || isPoolCancelled || userStatus === "rejected" || !currentUserParticipant) {
          notifObj.pool = null;
          notifObj.shouldHide = true;
          return notifObj;
        }

        // ✅ ONLY SHOW IF: User is PENDING and Pool is ACTIVE
        if (userStatus !== "pending") {
          notifObj.pool = null;
          notifObj.shouldHide = true;
          return notifObj;
        }

        // Get category details
        let categoryDetails = null;
        if (pool.category) {
          const category = await Category.findOne({
            $or: [
              { _id: pool.category },
              { name: pool.category }
            ]
          });
          
          if (category) {
            categoryDetails = {
              name: category.name,
              icon: category.icon
            };
          }
        }

        // Count accepted participants
        const acceptedParticipants = pool.participants.filter(
          p => p.status === "accepted"
        );

        // Calculate total pot
        const totalPot = pool.pointsToJoin * acceptedParticipants.length;

        // ✅ Simplified pool data
        notifObj.pool = {
          id: pool._id,
          category: categoryDetails,
          poolStatus: pool.status || "active",
          title: pool.poolName,
          question:pool.question,
          description: pool.description || "",
          players: acceptedParticipants.length,
          participants: acceptedParticipants.map(p => p.userId?.name || p.name || "Unknown"),
          betAmount: pool.pointsToJoin,
          totalPot: totalPot,
          maxWin: pool.maxWin || pool.pointsToJoin,
          createdBy: {
            name: pool.createdBy?.name || "Unknown"
          }
        };

        return notifObj;
      })
    );

    // ✅ Filter out hidden notifications
    const filteredNotifications = enrichedNotifications.filter(n => !n.shouldHide && n.pool !== null);

    res.status(200).json({
      status: "success",
      message: filteredNotifications.length > 0 
        ? "Pending pool invitations fetched successfully" 
        : "No pending invitations",
      // pagination: {
      //   currentPage: parseInt(page),
      //   totalPages: Math.ceil(filteredNotifications.length / parseInt(limit)),
      //   totalNotifications: filteredNotifications.length,
      //   limit: parseInt(limit)
      // },
      // unreadCount: unreadCount,
      data: filteredNotifications
    });

  } catch (err) {
    console.error("Notifications details error:", err);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});
// router.get("/pool/result", auth, async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const pools = await Pool.find({
//       $or: [
//         { createdBy: userId },
//         { "participants.userId": userId }
//       ]
//     })
//     .select("poolName category participants status correctPrediction pointsToJoin resultDeclaredAt updatedAt rewardSystem")
//       // .select("poolName category participants status correctPrediction pointsToJoin resultDeclaredAt updatedAt")
//       .sort({ updatedAt: -1 });

//     // ✅ FILTER: Only completed pools where user has submitted prediction
//     const completedPools = pools.filter(pool => {
//       if (pool.status !== "completed") return false;
      
//       const participant = pool.participants?.find(
//         p => p.userId?.toString() === userId.toString()
//       );
      
//       // ✅ Only show if user submitted a prediction
//       return participant && participant.prediction;
//     });

//     if (!completedPools.length) {
//       return res.status(200).json({
//         status: "success",
//         message: "No results available yet",
//         data: []
//       });
//     }

//     // Fetch categories
//     const categoryIds = [];
//     const categoryNames = [];

//     completedPools.forEach(pool => {
//       if (pool.category) {
//         const isObjectId = /^[0-9a-fA-F]{24}$/.test(pool.category);
//         isObjectId ? categoryIds.push(pool.category) : categoryNames.push(pool.category);
//       }
//     });

//     const categories = await Category.find({
//       $or: [
//         { _id: { $in: [...new Set(categoryIds)] } },
//         { name: { $in: [...new Set(categoryNames)] } }
//       ]
//     });

//     const categoryMapById = {};
//     const categoryMapByName = {};

//     categories.forEach(cat => {
//       const data = { id: cat._id, name: cat.name, icon: cat.icon };
//       categoryMapById[cat._id.toString()] = data;
//       categoryMapByName[cat.name] = data;
//     });

//     let totalEarnedPoints = 0;
//     let totalLostPoints = 0;

//     const results = completedPools.map(pool => {
//       const participant = pool.participants?.find(
//         p => p.userId?.toString() === userId.toString()
//       );

//       let categoryDetails = null;
//       if (pool.category) {
//         const isObjectId = /^[0-9a-fA-F]{24}$/.test(pool.category);
//         categoryDetails = isObjectId
//           ? categoryMapById[pool.category.toString()]
//           : categoryMapByName[pool.category];
//       }

//       let displayPoints = 0;
//       let userResult = "lost";
//       let userPrediction = participant?.prediction || null;
//       let pointsLost = 0;

//       if (participant.resultStatus === "won") {
//         displayPoints = participant.pointsEarned || 0;
//         userResult = "won";
//         totalEarnedPoints += displayPoints;
//       } else {
       
//         pointsLost = pool.pointsToJoin;
//         totalLostPoints += pointsLost;
//       }

//       return {
//         id: pool._id,
//         title: pool.poolName,
//         category: categoryDetails?.name || null,
//         categoryIcon: categoryDetails?.icon || null,
//         prediction: userPrediction,
//         correctAnswer: pool.correctPrediction,
//         declaredAt: pool.resultDeclaredAt,
//          betAmount: pool.pointsToJoin,
//           ...(pool.rewardSystem === "Podium" && {
//       rank: participant?.rank || null
//     }), 
//         resultInfo: {
//           userResult, 
//           pointsEarned: displayPoints,
//           pointsLost: pointsLost,
//           rank: participant?.rank || null,
//           displayText: userResult === "won" 
//             ? `+${displayPoints} Points` 
//             : `-${pointsLost} Points`
//         }
//       };
//     });

//     res.status(200).json({
//       status: "success",
//       message: "Results fetched successfully",
//       // summary: {
//       //   totalEarnedPoints,
//       //   totalLostPoints,
//       //   netPoints: totalEarnedPoints - totalLostPoints
//       // },
//       data: results
//     });
//   } catch (err) {
//     console.error("Pool results error:", err);
//     res.status(500).json({
//       status: "error",
//       message: err.message
//     });
//   }
// });
router.get("/pool/result", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const pools = await Pool.find({
      $or: [
        { createdBy: userId },
        { "participants.userId": userId }
      ]
    })
    .select("poolName category participants status correctPrediction pointsToJoin resultDeclaredAt updatedAt rewardSystem")
    .sort({ updatedAt: -1 });

    // ✅ FILTER: Only completed pools where user has submitted prediction
    const completedPools = pools.filter(pool => {
      if (pool.status !== "completed") return false;

      const participant = pool.participants?.find(
        p => p.userId?.toString() === userId.toString()
      );

      return participant && participant.prediction;
    });

    if (!completedPools.length) {
      return res.status(200).json({
        status: "success",
        message: "No results available yet",
        data: []
      });
    }

    // Fetch categories
    const categoryIds = [];
    const categoryNames = [];

    completedPools.forEach(pool => {
      if (pool.category) {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(pool.category);
        isObjectId ? categoryIds.push(pool.category) : categoryNames.push(pool.category);
      }
    });

    const categories = await Category.find({
      $or: [
        { _id: { $in: [...new Set(categoryIds)] } },
        { name: { $in: [...new Set(categoryNames)] } }
      ]
    });

    const categoryMapById = {};
    const categoryMapByName = {};

    categories.forEach(cat => {
      const data = { id: cat._id, name: cat.name, icon: cat.icon };
      categoryMapById[cat._id.toString()] = data;
      categoryMapByName[cat.name] = data;
    });

    let totalEarnedPoints = 0;
    let totalLostPoints = 0;

    const results = completedPools.map(pool => {
      const participant = pool.participants?.find(
        p => p.userId?.toString() === userId.toString()
      );

      let categoryDetails = null;
      if (pool.category) {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(pool.category);
        categoryDetails = isObjectId
          ? categoryMapById[pool.category.toString()]
          : categoryMapByName[pool.category];
      }

      let displayPoints = 0;
      let userResult = "lost";
      let userPrediction = participant?.prediction || null;
      let pointsLost = 0;

      // ✅ Calculate total pot
      const acceptedCount = pool.participants?.filter(p => p.status === "accepted").length || 0;
      const totalPot = pool.pointsToJoin * acceptedCount;

      if (participant.resultStatus === "won") {
        displayPoints = participant.pointsEarned || 0;
        userResult = "won";
        totalEarnedPoints += displayPoints;
      } else {
        pointsLost = pool.pointsToJoin;
        totalLostPoints += pointsLost;
      }

      // ✅ Percentage of total pot the user earned
      const potPercentage = totalPot > 0 && displayPoints > 0
        ? Math.round((displayPoints / totalPot) * 100)
        : 0;

      return {
        id: pool._id,
        title: pool.poolName,
        category: categoryDetails?.name || null,
        categoryIcon: categoryDetails?.icon || null,
        prediction: userPrediction,
        correctAnswer: pool.correctPrediction,
        declaredAt: pool.resultDeclaredAt,
        betAmount: pool.pointsToJoin,
        totalPot,                              // ✅ e.g. 300
        ...(pool.rewardSystem === "Podium" && {
          rank: participant?.rank || null
        }),
        resultInfo: {
          userResult,
          pointsEarned: displayPoints,
          pointsLost: pointsLost,
          rank: participant?.rank || null,
          potPercentage,                       // ✅ e.g. 67
          potPercentageText: userResult === "won"
            ? `You earned ${potPercentage}% of the total pot`
            : `You lost your ${pool.pointsToJoin} entry points`,
          displayText: userResult === "won"
            ? `+${displayPoints} Points`
            : `-${pointsLost} Points`
        }
      };
    });

    res.status(200).json({
      status: "success",
      message: "Results fetched successfully",
      data: results
    });

  } catch (err) {
    console.error("Pool results error:", err);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});

router.get("/pool/head-to-head", auth, async (req, res) => {
  try {
    const userId = req.user._id;


    const userPools = await Pool.find({
      "participants.userId": userId,
      "participants.status": "accepted",
      status: "completed", 
      correctPrediction: { $exists: true, $ne: null } 
    }).populate("participants.userId", "name avatar");
    
    const h2hMap = {};
    
    userPools.forEach(pool => {
      const acceptedParticipants = pool.participants.filter(
        p => p.status === "accepted" && p.userId && p.prediction 
      );

      acceptedParticipants.forEach(participant => {
        if (participant.userId._id.toString() === userId.toString()) return;
        
        const opponentId = participant.userId._id.toString();
        
        if (!h2hMap[opponentId]) {
          h2hMap[opponentId] = {
            opponent: participant.userId,
            poolsPlayedTogether: 0,
            userWins: 0,
            opponentWins: 0,
            userTotalPoints: 0,
            opponentTotalPoints: 0
          };
        }

        h2hMap[opponentId].poolsPlayedTogether++;
        
        // Find both users in this pool
        const currentUser = pool.participants.find(
          p => p.userId?._id.toString() === userId.toString()
        );
        const currentOpponent = pool.participants.find(
          p => p.userId?._id.toString() === opponentId
        );

        // ✅ Only count points if result is declared
        if (pool.correctPrediction) {
          const userPoints = currentUser?.pointsEarned || 0;
          const opponentPoints = currentOpponent?.pointsEarned || 0;

          h2hMap[opponentId].userTotalPoints += userPoints;
          h2hMap[opponentId].opponentTotalPoints += opponentPoints;

          // Track wins
          if (currentUser?.resultStatus === "won") {
            h2hMap[opponentId].userWins++;
          }
          if (currentOpponent?.resultStatus === "won") {
            h2hMap[opponentId].opponentWins++;
          }
        }
      });
    });

    const h2hStats = Object.values(h2hMap).map(stat => ({
      player1: {
        id: userId,
        name: req.user.name,
        avatar: req.user.avatar
      },
      player2: {
        id: stat.opponent._id,
        name: stat.opponent.name,
        avatar: stat.opponent.avatar
      },
      poolsPlayedTogether: stat.poolsPlayedTogether,
      player1Wins: stat.userWins,
      player2Wins: stat.opponentWins,
      player1TotalPoints: stat.userTotalPoints,
      player2TotalPoints: stat.opponentTotalPoints,
      pointsDifference: Math.abs(stat.userTotalPoints - stat.opponentTotalPoints)
    }));

    // Sort by most pools played together
    h2hStats.sort((a, b) => b.poolsPlayedTogether - a.poolsPlayedTogether);

    res.status(200).json({
      status: "success",
      message: "Head-to-head stats fetched successfully",
      data: h2hStats
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});


router.post("/pool/:poolId/reopen", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { poolId } = req.params;

    const pool = await Pool.findById(poolId).populate("participants.userId", "name email");

    if (!pool) {
      return res.status(404).json({
        status: "error",
        message: "Pool not found"
      });
    }

    if (pool.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Only the pool creator can reopen this pool"
      });
    }

    if (!pool.correctPrediction || pool.status !== "completed") {
      return res.status(400).json({
        status: "error",
        message: "Pool has not been completed yet"
      }); 
    }

    const winnersRefunded = [];
    
    // ✅ Refund points to winners
    for (const participant of pool.participants) {
      if (participant.pointsEarned && participant.pointsEarned > 0 && participant.userId) {
        await User.findByIdAndUpdate(participant.userId?._id || participant.userId, {
        // await User.findByIdAndUpdate(participant.userId._id, {
          $inc: { totalPoints: -participant.pointsEarned }
        });

        winnersRefunded.push({
          userId: participant.userId._id,
          name: participant.name,
          pointsRefunded: participant.pointsEarned
        });

        // await sendInAppNotification(participant.userId._id, {
          await sendInAppNotification(participant.userId?._id || participant.userId, {
          type: "pool_reopened",
          title: "Pool Reopened",
          message: `"${pool.poolName}" has been reopened. Your ${participant.pointsEarned} points have been refunded.`,
          data: {
            poolId: pool._id,
            poolName: pool.poolName,
            pointsRefunded: participant.pointsEarned
          }
        });
      }
    }

    // ✅ RESET ONLY RESULT DATA - KEEP PREDICTIONS
    pool.participants.forEach(participant => {
      if (participant.status === "accepted") {
        // ✅ KEEP: prediction and predictionSubmittedAt (user can update them)
        // ✅ RESET: Only result-related fields
        participant.resultStatus = null;
        participant.pointsEarned = 0;
        participant.score = 0;
        participant.rank = null;
        participant.matchedRanks = [];
      }
    });

    // ✅ RESET ALL POOL RESULT DATA
    pool.correctPrediction = null;
    pool.resultDeclaredAt = null;
    pool.status = "active";
    pool.leaderboard = [];

    await pool.save();

    // Notify all participants
    for (const participant of pool.participants) {
      if (participant.userId && participant.status === "accepted") {
        if (!winnersRefunded.find(w => w.userId.toString() === participant.userId._id.toString())) {
          // await sendInAppNotification(participant.userId._id, {
          await sendInAppNotification(participant.userId?._id || participant.userId, {
            type: "pool_reopened",
            title: "Pool Reopened",
            message: `"${pool.poolName}" has been reopened. You can update your prediction if needed.`,
            data: {
              poolId: pool._id,
              poolName: pool.poolName,
              currentPrediction: participant.prediction
            }
          });
        }
      }
    }

    // Count predictions that are still there
    const predictionsKept = pool.participants.filter(
      p => p.status === "accepted" && p.prediction
    ).length;

    res.status(200).json({
      status: "success",
      message: "Pool reopened successfully. Results cleared, predictions retained.",
      data: {
        poolId: pool._id,
        poolName: pool.poolName,
        status: pool.status,
        winnersRefunded: winnersRefunded.length,
        totalPointsRefunded: winnersRefunded.reduce((sum, w) => sum + w.pointsRefunded, 0),
        predictionsKept: predictionsKept,
        note: "Users can still update their predictions before the next result declaration"
      }
    });

  } catch (err) {
    console.error("Reopen pool error:", err);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});

module.exports = router;

