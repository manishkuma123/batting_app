const express = require("express");
const router = express.Router();
const auth = require("./authentication");
const Pool = require("../modules/pool");
const User = require("../modules/User");
const generateSlug = require('../utils/generateSlug');
const icon = require('../modules/category')
const { sendInAppNotification } = require("../utils/notification");
const Notification = require("../modules/notification");
const Category = require("../modules/category");
const InviteLink = require("../modules/InviteLink");
const generateInviteToken = require("../utils/generateInviteToken");
const { v4: uuidv4 } = require("uuid");

router.post("/pool/createdata", auth, async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    if (!user || !user._id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: user not found"
      });
    }

    if (user.totalPoints < data.pointsToJoin) {
      return res.status(403).json({
        status: "error",
        message: "Insufficient points to create pool"
      });
    }

    // 🔹 Category name
    let categoryName = null;
    if (data.category) {
      const category = await Category.findById(data.category);
      if (category) categoryName = category.name;
    }

    let participants = [];

    // 🔹 Invite friends
    if (data.friends?.length) {
      const emails = data.friends.map(f => f.email).filter(Boolean);
      const phones = data.friends
        .map(f => f.phone)
        .filter(p => /^\d+$/.test(p))
        .map(Number);

      const registeredUsers = await User.find({
        $or: [{ email: { $in: emails } }, { phone: { $in: phones } }]
      });

      registeredUsers.forEach(u => {
        participants.push({
          userId: u._id,
          email: u.email,
          phone: u.phone,
          name: u.name,
          status: "pending"
        });
      });

      // Unregistered users (only email/phone)
      data.friends.forEach(f => {
        const exists = registeredUsers.find(
          u => u.email === f.email || u.phone === Number(f.phone)
        );
        if (!exists) {
          participants.push({
            email: f.email,
            phone: f.phone ? Number(f.phone) : undefined,
            name: f.name,
            status: "pending"
          });
        }
      });
    }

    // 🔹 Creator auto-accepted
    participants.push({
      userId: user._id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      status: "accepted"
    });

    delete data.createdBy;

    // 🔹 Create Pool
    const pool = await Pool.create({
      ...data,
      participants,
      slug: generateSlug(),
      createdBy: user._id
    });

    // 🔹 Deduct points
    user.totalPoints -= data.pointsToJoin;
    
    await user.save();

    // 🔹 Send notifications
    const pendingRegisteredUsers = participants.filter(
      p => p.status === "pending" && p.userId
    );

    for (const participant of pendingRegisteredUsers) {
      await sendInAppNotification(participant.userId, {
        type: "pool_invitation",
        title: "Pool Invitation",
        message: `${user.name} invited you to join "${pool.poolName}"`,
        data: {
          poolId: pool._id,
          inviterId: user._id
          
        }
      });
    }

    // 🔑 INVITE LINK GENERATION (NEW)
    const inviteToken = uuidv4();

    await InviteLink.create({
      poolId: pool._id,
      inviterId: user._id,
      
      token: inviteToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

const baseURL = "https://darkgreen-salmon-727479.hostingersite.com";
const inviteLink = `${baseURL}/invite/${inviteToken}`;

// Save invite link to pool
pool.inviteLink = inviteLink;
await pool.save();
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
        inviteLink,
        createdBy: {
          id: user._id,
          name: user.name
        },
        participantsCount: acceptedCount
      }
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});

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

      
      const leaderboard = (pool.leaderboard || []).map((l, index) => ({
        rank: l.rank || index + 1,
                   _id: l._id,
        playerAvatar: l.userId?.profile || null, 
        playerName: l.userId?.name || l.name || "Unknown",
        rewardSystem: l.rewardSystem || pool.rewardSystem || "Points",
        rewardAmount: l.rewardAmount || l.totalPoints || 0,
       
         totalPoints: l.userId?.totalPoints,
         
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
    
          playerAvatar: p.userId?.profile || null,
          playerName: p.userId?.name || p.name,
          playerJoinedDate: p.joinedAt
            ? new Date(p.joinedAt).toDateString()
            : null
        })),

        betAmount: pool.pointsToJoin,
        totalPot: pool.pointsToJoin * acceptedParticipants.length, 
        maxWin: pool.maxWin || pool.pointsToJoin,
        pointsScored: pool.pointsScored || 0,
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

router.get('/pool/:poolId/predication',auth, async(req,res)=>{

})

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
    if (!correctPrediction) {
      return res.status(400).json({
        status: "error",
        message: "correctPrediction is required"
      });
    }

    const pool = await Pool.findById(poolId).populate("participants.userId", "name email avatar");

    if (!pool) {
      return res.status(404).json({
        status: "error",
        message: "Pool not found"
      });
    }

    // const isCreator = pool.createdBy.toString() === userId.toString();

    // if (!isCreator) {
    //   return res.status(403).json({
    //     status: "error",
    //     message: "Only the pool creator can declare results"
    //   });
    // }

    if (pool.correctPrediction) {
      return res.status(400).json({
        status: "error",
        message: "Result has already been declared for this pool",
        data: {
          correctPrediction: pool.correctPrediction,
          declaredAt: pool.resultDeclaredAt
        }
      });
    }

   
    if (pool.rewardSystem === "Podium") {
     
      if (typeof correctPrediction !== 'object' || Array.isArray(correctPrediction) || !correctPrediction.rank1 || !correctPrediction.rank2 || !correctPrediction.rank3) {
     
        const exampleObj = {};
        if (pool.options && pool.options.length >= 3) {
          exampleObj.rank1 = pool.options[0];
          exampleObj.rank2 = pool.options[1];
          exampleObj.rank3 = pool.options[2];
        } else {
          exampleObj.rank1 = "Option 1";
          exampleObj.rank2 = "Option 2";
          exampleObj.rank3 = "Option 3";
        }

        return res.status(400).json({
          status: "error",
          message: "For Podium system, correctPrediction must be an object with rank1, rank2, and rank3",
          example: exampleObj,
          availableOptions: pool.options || [],
          note: "Select 3 different options from availableOptions for rank1, rank2, and rank3"
        });
      }


      const invalidRanks = [];
      if (!pool.options.includes(correctPrediction.rank1)) invalidRanks.push('rank1');
      if (!pool.options.includes(correctPrediction.rank2)) invalidRanks.push('rank2');
      if (!pool.options.includes(correctPrediction.rank3)) invalidRanks.push('rank3');

      if (invalidRanks.length > 0) {
        return res.status(400).json({
          status: "error",
          message: `Invalid predictions for: ${invalidRanks.join(', ')}. Each rank must be one of the available options.`,
          availableOptions: pool.options,
          providedValues: {
            rank1: correctPrediction.rank1,
            rank2: correctPrediction.rank2,
            rank3: correctPrediction.rank3
          }
        });
      }

   
      const ranks = [correctPrediction.rank1, correctPrediction.rank2, correctPrediction.rank3];
      const uniqueRanks = new Set(ranks);
      if (uniqueRanks.size !== 3) {
        return res.status(400).json({
          status: "error",
          message: "rank1, rank2, and rank3 must be different options",
          providedValues: {
            rank1: correctPrediction.rank1,
            rank2: correctPrediction.rank2,
            rank3: correctPrediction.rank3
          }
        });
      }
    } else if (pool.rewardSystem === "Points Awards") {
      // For Points Awards system, expect string
      if (typeof correctPrediction !== 'string' || !pool.options.includes(correctPrediction)) {
        return res.status(400).json({
          status: "error",
          message: "For Points Awards system, correctPrediction must be a string and one of the available options",
          availableOptions: pool.options || [],
          providedValue: correctPrediction
        });
      }
    } else {
      return res.status(400).json({
        status: "error",
        message: "Invalid reward system"
      });
    }

    pool.correctPrediction = correctPrediction;
    pool.resultDeclaredAt = new Date();
    pool.status = "completed";

    const acceptedParticipants = pool.participants.filter(p => p.status === "accepted");
    const totalPot = pool.pointsToJoin * acceptedParticipants.length;

    // ==================== PODIUM SYSTEM (Ranked Distribution) ====================
    if (pool.rewardSystem === "Podium") {
      const rank1Winners = [];
      const rank2Winners = [];
      const rank3Winners = [];
      const losers = [];

      pool.participants.forEach(participant => {
        if (participant.status === "accepted" && participant.prediction) {
          const userPrediction = participant.prediction;
          let matchedRank = null;

          // Check if user's prediction matches any rank
          if (userPrediction === correctPrediction.rank1) {
            matchedRank = 1;
            rank1Winners.push(participant);
          } else if (userPrediction === correctPrediction.rank2) {
            matchedRank = 2;
            rank2Winners.push(participant);
          } else if (userPrediction === correctPrediction.rank3) {
            matchedRank = 3;
            rank3Winners.push(participant);
          }

          if (matchedRank) {
            participant.resultStatus = "won";
            participant.rank = matchedRank;
            participant.matchedRanks = [matchedRank];
          } else {
            participant.resultStatus = "lost";
            losers.push(participant);
          }
        }
      });

      // Calculate points for each rank
      const rank1Points = Math.floor((totalPot * (pool.winner || 0)) / 100);
      const rank2Points = Math.floor((totalPot * (pool.runnerUp || 0)) / 100);
      const rank3Points = Math.floor((totalPot * (pool.secondRunnerUp || 0)) / 100);

      if (rank1Winners.length > 0) {
        const pointsPerRank1Winner = Math.floor(rank1Points / rank1Winners.length);
        for (const winner of rank1Winners) {
          winner.pointsEarned = pointsPerRank1Winner;
          winner.score = pointsPerRank1Winner;

          if (winner.userId) {
            await User.findByIdAndUpdate(winner.userId._id, {
              $inc: { totalPoints: pointsPerRank1Winner }
            });
          }
        }
      }

      // Distribute rank2 points
      if (rank2Winners.length > 0) {
        const pointsPerRank2Winner = Math.floor(rank2Points / rank2Winners.length);
        for (const winner of rank2Winners) {
          winner.pointsEarned = pointsPerRank2Winner;
          winner.score = pointsPerRank2Winner;

          if (winner.userId) {
            await User.findByIdAndUpdate(winner.userId._id, {
              $inc: { totalPoints: pointsPerRank2Winner }
            });
          }
        }
      }

      // Distribute rank3 points
      if (rank3Winners.length > 0) {
        const pointsPerRank3Winner = Math.floor(rank3Points / rank3Winners.length);
        for (const winner of rank3Winners) {
          winner.pointsEarned = pointsPerRank3Winner;
          winner.score = pointsPerRank3Winner;

          if (winner.userId) {
            await User.findByIdAndUpdate(winner.userId._id, {
              $inc: { totalPoints: pointsPerRank3Winner }
            });
          }
        }
      }

      // Build leaderboard (all winners sorted by rank)
      const allWinners = [];
      
      // Add rank1 winners
      rank1Winners.forEach(w => {
        allWinners.push({
          userId: w.userId?._id || w.userId,
          name: w.userId?.name || w.name || "Unknown",
          totalPoints: w.pointsEarned || 0,
          rank: 1,
          rewardAmount: w.pointsEarned || 0,
          rewardSystem: pool.rewardSystem,
          joinedAt: w.joinedAt,
          predictionSubmittedAt: w.predictionSubmittedAt,
          matchedRanks: [1]
        });
      });
      
      // Add rank2 winners
      rank2Winners.forEach(w => {
        allWinners.push({
          userId: w.userId?._id || w.userId,
          name: w.userId?.name || w.name || "Unknown",
          totalPoints: w.pointsEarned || 0,
          rank: 2,
          rewardAmount: w.pointsEarned || 0,
          rewardSystem: pool.rewardSystem,
          joinedAt: w.joinedAt,
          predictionSubmittedAt: w.predictionSubmittedAt,
          matchedRanks: [2]
        });
      });
     
      rank3Winners.forEach(w => {
        allWinners.push({
          userId: w.userId?._id || w.userId,
          name: w.userId?.name || w.name || "Unknown",
          totalPoints: w.pointsEarned || 0,
          rank: 3,
          rewardAmount: w.pointsEarned || 0,
          rewardSystem: pool.rewardSystem,
          joinedAt: w.joinedAt,
          predictionSubmittedAt: w.predictionSubmittedAt,
          matchedRanks: [3]
        });
      });

      pool.leaderboard = allWinners;

      // Send notifications
      for (const p of pool.participants) {
        if (p.userId && p.status === "accepted" && p.prediction) {
          const isWinner = p.resultStatus === "won";
          
          let rankText = "";
          if (p.rank === 1) rankText = "1st place (Rank 1)";
          else if (p.rank === 2) rankText = "2nd place (Rank 2)";
          else if (p.rank === 3) rankText = "3rd place (Rank 3)";

          await sendInAppNotification(p.userId._id, {
            type: isWinner ? "pool_won" : "pool_lost",
            title: isWinner ? "Congratulations! 🎉" : "Pool Result Declared",
            message: isWinner 
              ? `You won ${p.pointsEarned || 0} points in "${pool.poolName}"! Your prediction "${p.prediction}" matched ${rankText}.`
              : `Results for "${pool.poolName}" are out. Your prediction "${p.prediction}" didn't match any rank. Better luck next time!`,
            data: {
              poolId: pool._id,
              poolName: pool.poolName,
              resultStatus: p.resultStatus,
              pointsEarned: p.pointsEarned || 0,
              correctPrediction: correctPrediction,
              userPrediction: p.prediction,
              matchedRanks: p.matchedRanks || [],
              rank: p.rank || null
            }
          });
        }
      }

      await pool.save();

      return res.status(200).json({
        status: "success",
        message: "Result declared successfully",
        data: {
          poolId: pool._id,
          poolName: pool.poolName,
          question: pool.question,
          correctPrediction: correctPrediction,
          declaredAt: pool.resultDeclaredAt,
          rewardSystem: pool.rewardSystem,
          totalPot: totalPot,
          totalWinners: rank1Winners.length + rank2Winners.length + rank3Winners.length,
          totalLosers: losers.length,
          totalParticipants: acceptedParticipants.length,
          pointsPerWinner: null,
          winnerdata: pool.leaderboard
        }
      });
    }

    // ==================== POINTS AWARDS SYSTEM (Equal Distribution) ====================
    if (pool.rewardSystem === "Points Awards") {
      const winners = [];
      const losers = [];

      pool.participants.forEach(participant => {
        if (participant.status === "accepted" && participant.prediction) {
          if (participant.prediction === correctPrediction) {
            participant.resultStatus = "won";
            winners.push(participant);
          } else {
            participant.resultStatus = "lost";
            losers.push(participant);
          }
        }
      });

      // Equal distribution of TOTAL POT among all winners
      if (winners.length > 0) {
        const pointsPerWinner = Math.floor(totalPot / winners.length);
        
        for (const winner of winners) {
          winner.pointsEarned = pointsPerWinner;
          winner.score = pointsPerWinner;
          
          if (winner.userId) {
            await User.findByIdAndUpdate(winner.userId._id, {
              $inc: { totalPoints: pointsPerWinner }
            });
          }
        }
      }

      // Build leaderboard (all winners with equal points)
      pool.leaderboard = winners.map((winner, index) => ({
        userId: winner.userId?._id || winner.userId,
        name: winner.userId?.name || winner.name || "Unknown",
        totalPoints: winner.pointsEarned || 0,
        rank: index + 1,
        rewardAmount: winner.pointsEarned || 0,
        rewardSystem: pool.rewardSystem,
        joinedAt: winner.joinedAt,
        predictionSubmittedAt: winner.predictionSubmittedAt
      }));

      // Send notifications
      for (const p of pool.participants) {
        if (p.userId && p.status === "accepted" && p.prediction) {
          const isWinner = p.resultStatus === "won";
          
          await sendInAppNotification(p.userId._id, {
            type: isWinner ? "pool_won" : "pool_lost",
            title: isWinner ? "Congratulations! 🎉" : "Pool Result Declared",
            message: isWinner 
              ? `You won ${p.pointsEarned || 0} points in "${pool.poolName}"! Your prediction was correct.`
              : `Results for "${pool.poolName}" are out. The correct answer was "${correctPrediction}". Better luck next time!`,
            data: {
              poolId: pool._id,
              poolName: pool.poolName,
              resultStatus: p.resultStatus,
              pointsEarned: p.pointsEarned || 0,
              correctPrediction: correctPrediction,
              userPrediction: p.prediction
            }
          });
        }
      }

      await pool.save();

      return res.status(200).json({
        status: "success",
        message: "Result declared successfully",
        data: {
          poolId: pool._id,
          poolName: pool.poolName,
          question: pool.question,
          correctPrediction: correctPrediction,
          declaredAt: pool.resultDeclaredAt,
          rewardSystem: pool.rewardSystem,
          totalPot: totalPot,
          totalWinners: winners.length,
          totalLosers: losers.length,
          totalParticipants: acceptedParticipants.length,
          pointsPerWinner: winners.length > 0 ? Math.floor(totalPot / winners.length) : null,
          winnerdata: pool.leaderboard
        }
      });
    }

  } catch (err) {
    console.error("Result declaration error:", err);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});
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

// router.post("/pool/:poolId/reopen", auth, async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { poolId } = req.params;


//     const pool = await Pool.findById(poolId).populate("participants.userId", "name email");

//     if (!pool) {
//       return res.status(404).json({
//         status: "error",
//         message: "Pool not found"
//       });
//     }

   
//     if (pool.createdBy.toString() !== userId.toString()) {
//       return res.status(403).json({
//         status: "error",
//         message: "Only the pool creator can reopen this pool"
//       });
//     }


//     if (!pool.correctPrediction || pool.status !== "completed") {
//       return res.status(400).json({
//         status: "error",
//         message: "Pool has not been completed yet. Only completed pools can be reopened."
//       });
//     }

  
//     const winnersRefunded = [];
    
//     for (const participant of pool.participants) {
//       if (participant.pointsEarned && participant.pointsEarned > 0 && participant.userId) {
        
//         await User.findByIdAndUpdate(participant.userId._id, {
//           $inc: { totalPoints: -participant.pointsEarned }
//         });

//         winnersRefunded.push({
//           userId: participant.userId._id,
//           name: participant.name,
//           pointsRefunded: participant.pointsEarned
//         });

//         await sendInAppNotification(participant.userId._id, {
//           type: "pool_reopened",
//           title: "Pool Reopened",
//           message: `"${pool.poolName}" has been reopened. Your ${participant.pointsEarned} points have been refunded.`,
//           data: {
//             poolId: pool._id,
//             poolName: pool.poolName,
//             pointsRefunded: participant.pointsEarned
//           }
//         });
//       }
//     }

    
//     pool.participants.forEach(participant => {
//       if (participant.status === "accepted") {
//         participant.prediction = null;
//         participant.predictionSubmittedAt = null;
//         participant.resultStatus = null;
//         participant.pointsEarned = 0;
//         participant.score = 0;
//         participant.rank = null;
//       }
//     });

//     // Clear pool results
//     pool.correctPrediction = null;
//     pool.resultDeclaredAt = null;
//     pool.status = "active";
//     pool.leaderboard = [];

//     await pool.save();

//     // Notify all participants that pool has been reopened
//     for (const participant of pool.participants) {
//       if (participant.userId && participant.status === "accepted") {
//         // Skip if already notified above (winner)
//         if (!winnersRefunded.find(w => w.userId.toString() === participant.userId._id.toString())) {
//           await sendInAppNotification(participant.userId._id, {
//             type: "pool_reopened",
//             title: "Pool Reopened",
//             message: `"${pool.poolName}" has been reopened. You can submit your prediction again.`,
//             data: {
//               poolId: pool._id,
//               poolName: pool.poolName
//             }
//           });
//         }
//       }
//     }

//     res.status(200).json({
//       status: "success",
//       message: "Pool reopened successfully",
//       data: {
//         poolId: pool._id,
//         poolName: pool.poolName,
//         status: pool.status,
//         winnersRefunded: winnersRefunded.length,
//         totalPointsRefunded: winnersRefunded.reduce((sum, w) => sum + w.pointsRefunded, 0),
//         participantsReset: pool.participants.filter(p => p.status === "accepted").length,
//         // refundDetails: winnersRefunded
//       }
//     });

//   } catch (err) {
//     console.error("Reopen pool error:", err);
//     res.status(500).json({
//       status: "error",
//       message: err.message
//     });
//   }
// });

// router.get("/pool/result", auth, async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const pools = await Pool.find({
//       $or: [
//         { createdBy: userId },
//         { "participants.userId": userId },
//         { invitedUsers: userId }
//       ]
//     })
//       .select(
//         "poolName category leaderboard participants status correctPrediction pointsToJoin updatedAt"
//       )
//       .sort({ updatedAt: -1 });

//     // ✅ FILTER: ONLY COMPLETED POOLS
//     const completedPools = pools.filter(pool => pool.status === "completed");

//     if (!completedPools.length) {
//       return res.status(404).json({
//         status: "fail",
//         message: "No completed pool results found"
//       });
//     }

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

//       const leaderboardUser = pool.leaderboard?.find(
//         lb => lb.userId?.toString() === userId.toString()
//       );

//       let categoryDetails = null;
//       if (pool.category) {
//         const isObjectId = /^[0-9a-fA-F]{24}$/.test(pool.category);
//         categoryDetails = isObjectId
//           ? categoryMapById[pool.category.toString()]
//           : categoryMapByName[pool.category];
//       }

//       let displayPoints = 0;
//       let userResult = "no_result";
//       let userPrediction = null;

//       if (participant) {
//         userPrediction = participant.prediction || null;

//         if (participant.resultStatus === "won") {
//           displayPoints = participant.pointsEarned || 0;
//           userResult = "won";
//           totalEarnedPoints += displayPoints;
//         } else {
//           totalLostPoints += pool.pointsToJoin;
//         }
//       } else {
//         totalLostPoints += pool.pointsToJoin;
//       }

//       return {
//         id: pool._id,
//         title: pool.poolName,
//         category: categoryDetails?.name || null,
//         prediction: userPrediction || "Not predicted yet",
//         rank: leaderboardUser?.rank || null,
//         points: leaderboardUser?.points || 0,
//         resultInfo: {
//           correctPrediction: pool.correctPrediction || null,
//           userPointsEarned: displayPoints,
//           userPointsLost: pool.pointsToJoin, // ✅ ALWAYS
//           userPrediction,
//           userResult,
//           displayText:
//             displayPoints > 0
//               ? `Win Points +${displayPoints}`
//               : displayPoints < 0
//               ? `Lost Points ${displayPoints}`
//               : "No Result"
//         }
//       };
//     });

//     res.status(200).json({
//       status: "success",
//       message: "User completed pool results fetched successfully",
//       // total: results.length,
//       // totalEarnedPoints,
//       // totalLostPoints,
//       data: results
//     });
//   } catch (err) {
//     console.error("Pool results error:", err);
//     res.status(500).json({
//       status: "fail",
//       message: err.message
//     });
//   }
// });

// router.get("/pool/head-to-head", auth, async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const usercategory = req.user.category;
//     const userPools = await Pool.find({
//       "participants.userId": userId,
//       "participants.status": "accepted"
//     }).populate("participants.userId", "name avatar");
    
//     const h2hMap = {};
    
//     userPools.forEach(pool => {
//       const acceptedParticipants = pool.participants.filter(
//         p => p.status === "accepted" && p.userId
//       );

//       acceptedParticipants.forEach(participant => {
//         if (participant.userId._id.toString() === userId.toString()) return;
        
//         const opponentId = participant.userId._id.toString();
        
//         if (!h2hMap[opponentId]) {
//           h2hMap[opponentId] = {
//             opponent: participant.userId,
//             poolsPlayedTogether: 0,
//             userTotalPoints: 0,
//             opponentTotalPoints: 0
//           };
//         }

//         h2hMap[opponentId].poolsPlayedTogether++;
        
      
//         const currentUser = pool.participants.find(
//           p => p.userId?._id.toString() === userId.toString()
//         );
//         const currentOpponent = pool.participants.find(
//           p => p.userId?._id.toString() === opponentId
//         );


//         h2hMap[opponentId].userTotalPoints += currentUser?.pointsEarned || 0;
//         h2hMap[opponentId].opponentTotalPoints += currentOpponent?.pointsEarned || 0;
//       });
//     });

//     const h2hStats = Object.values(h2hMap).map(stat => ({
//       player1: {
//         id: userId,
//         name: req.user.name,
//         avatar: req.user.avatar
//       },
//       player2: {
//         id: stat.opponent._id,
//         name: stat.opponent.name,
//         avatar: stat.opponent.avatar
//       },
//       poolsPlayedTogether: stat.poolsPlayedTogether,
//       pointsDifference: Math.abs(stat.userTotalPoints - stat.opponentTotalPoints),
//       player1TotalPoints: stat.userTotalPoints,
//       player2TotalPoints: stat.opponentTotalPoints
//     }));

//     h2hStats.sort((a, b) => b.poolsPlayedTogether - a.poolsPlayedTogether);

//     res.status(200).json({
//       status: "success",
//       data: h2hStats
//     });

//   } catch (err) {
//     res.status(500).json({
//       status: "error",
//       message: err.message
//     });
//   }
// });
// ✅ FIXED: Pool Result API - Only show after user prediction + result declared
router.get("/pool/result", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const pools = await Pool.find({
      $or: [
        { createdBy: userId },
        { "participants.userId": userId }
      ]
    })
      .select("poolName category participants status correctPrediction pointsToJoin resultDeclaredAt updatedAt")
      .sort({ updatedAt: -1 });

    // ✅ FILTER: Only completed pools where user has submitted prediction
    const completedPools = pools.filter(pool => {
      if (pool.status !== "completed") return false;
      
      const participant = pool.participants?.find(
        p => p.userId?.toString() === userId.toString()
      );
      
      // ✅ Only show if user submitted a prediction
      return participant && participant.prediction;
    });

    if (!completedPools.length) {
      return res.status(200).json({
        status: "success",
        message: "No results available yet",
        data: []
      });
    }

    
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


    // function uniquedataarray(arr){
    //   let seen = new Set()
    //   let result =[]
    //   for (let i = 0; i < arr.length; i++) {
    //     if (!seen.has(arr[i])) {
    //       seen.add(arr[i])
    //       result.push(arr[i])
    //     }
        
    //   }
    //   return result
    // }
    // console.log(uniquedataarray([1,2,3,4,1,4,1,4,5,9,5]));
    
    const categoryMapById = {};
    const categoryMapByName = {};
    const categorydata ={}
    category
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

      if (participant.resultStatus === "won") {
        displayPoints = participant.pointsEarned || 0;
        userResult = "won";
        totalEarnedPoints += displayPoints;
      } else {
        
        pointsLost = pool.pointsToJoin;
        totalLostPoints += pointsLost;
      }

      return {
        id: pool._id,
        title: pool.poolName,
        category: categoryDetails?.name || null,
        categoryIcon: categoryDetails?.icon || null,
        prediction: userPrediction,
        correctAnswer: pool.correctPrediction,
        declaredAt: pool.resultDeclaredAt,
        resultInfo: {
          userResult, // "won" or "lost"
          pointsEarned: displayPoints,
          pointsLost: pointsLost,
          rank: participant?.rank || null,
          displayText: userResult === "won" 
            ? `+${displayPoints} Points` 
            : `-${pointsLost} Points`
        }
      };
    });

    res.status(200).json({
      status: "success",
      message: "Results fetched successfully",
      // summary: {
      //   totalEarnedPoints,
      //   totalLostPoints,
      //   netPoints: totalEarnedPoints - totalLostPoints
      // },
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

// ✅ FIXED: Head-to-Head API - Only count completed pools with declared results
// router.get("/pool/head-to-head", auth, async (req, res) => {
//   try {
//     const userId = req.user._id;

//     // ✅ Only fetch COMPLETED pools where result is declared
//     const userPools = await Pool.find({
//       "participants.userId": userId,
//       "participants.status": "accepted",
//       status: "completed", // ✅ Must be completed
//       correctPrediction: { $exists: true, $ne: null } 
//     }).populate("participants.userId", "name avatar");
    
//     const h2hMap = {};
    
//     userPools.forEach(pool => {
//       const acceptedParticipants = pool.participants.filter(
//         p => p.status === "accepted" && p.userId && p.prediction 
//       );

//       acceptedParticipants.forEach(participant => {
//         if (participant.userId._id.toString() === userId.toString()) return;
        
//         const opponentId = participant.userId._id.toString();
        
//         if (!h2hMap[opponentId]) {
//           h2hMap[opponentId] = {
//             opponent: participant.userId,
//             poolsPlayedTogether: 0,
//             userWins: 0,
//             opponentWins: 0,
//             userTotalPoints: 0,
//             opponentTotalPoints: 0
//           };
//         }

//         h2hMap[opponentId].poolsPlayedTogether++;
        
//         // Find both users in this pool
//         const currentUser = pool.participants.find(
//           p => p.userId?._id.toString() === userId.toString()
//         );
//         const currentOpponent = pool.participants.find(
//           p => p.userId?._id.toString() === opponentId
//         );

//         // ✅ Only count points if result is declared
//         if (pool.correctPrediction) {
//           const userPoints = currentUser?.pointsEarned || 0;
//           const opponentPoints = currentOpponent?.pointsEarned || 0;

//           h2hMap[opponentId].userTotalPoints += userPoints;
//           h2hMap[opponentId].opponentTotalPoints += opponentPoints;

//           // Track wins
//           if (currentUser?.resultStatus === "won") {
//             h2hMap[opponentId].userWins++;
//           }
//           if (currentOpponent?.resultStatus === "won") {
//             h2hMap[opponentId].opponentWins++;
//           }
//         }
//       });
//     });

//     const h2hStats = Object.values(h2hMap).map(stat => ({
//       player1: {
//         id: userId,
//         name: req.user.name,
//         avatar: req.user.avatar
//       },
//       player2: {
//         id: stat.opponent._id,
//         name: stat.opponent.name,
//         avatar: stat.opponent.avatar
//       },
//       poolsPlayedTogether: stat.poolsPlayedTogether,
//       player1Wins: stat.userWins,
//       player2Wins: stat.opponentWins,
//       player1TotalPoints: stat.userTotalPoints,
//       player2TotalPoints: stat.opponentTotalPoints,
//       pointsDifference: Math.abs(stat.userTotalPoints - stat.opponentTotalPoints)
//     }));

//     // Sort by most pools played together
//     h2hStats.sort((a, b) => b.poolsPlayedTogether - a.poolsPlayedTogether);

//     res.status(200).json({
//       status: "success",
//       message: "Head-to-head stats fetched successfully",
//       data: h2hStats
//     });

//   } catch (err) {
//     res.status(500).json({
//       status: "error",
//       message: err.message
//     });
//   }
// });


// ✅ HEAD-TO-HEAD API ENDPOINT
// Replace your existing router.get("/pool/head-to-head", ...) with this

router.get("/pool/head-to-head", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all pools where user is an accepted participant
    const userPools = await Pool.find({
      "participants.userId": userId,
      "participants.status": "accepted"
    }).populate("participants.userId", "name avatar");

    const h2hMap = {};
    
    userPools.forEach(pool => {
      // ✅ Only process completed pools with declared results
      if (pool.status !== "completed" || !pool.correctPrediction) {
        return;
      }

      // Find current user's participation data
      const currentUser = pool.participants.find(
        p => p.userId?._id.toString() === userId.toString()
      );

      // Skip if current user didn't submit a prediction
      if (!currentUser || !currentUser.prediction) {
        return;
      }

      // Get all OTHER accepted participants who submitted predictions
      const otherParticipants = pool.participants.filter(
        p => p.userId && 
             p.userId._id.toString() !== userId.toString() &&
             p.status === "accepted" &&
             p.prediction
      );

      // Process each opponent
      otherParticipants.forEach(opponent => {
        const opponentId = opponent.userId._id.toString();
        
        // Initialize h2h record if doesn't exist
        if (!h2hMap[opponentId]) {
          h2hMap[opponentId] = {
            opponent: {
              id: opponent.userId._id,
              name: opponent.userId.name,
              avatar: opponent.userId.avatar
            },
            poolsPlayedTogether: 0,
            userWins: 0,
            opponentWins: 0,
            draws: 0,
            userTotalPoints: 0,
            opponentTotalPoints: 0
          };
        }

        // Increment pools played together
        h2hMap[opponentId].poolsPlayedTogether++;
        
        // Add points
        const userPoints = currentUser.pointsEarned || 0;
        const opponentPoints = opponent.pointsEarned || 0;

        h2hMap[opponentId].userTotalPoints += userPoints;
        h2hMap[opponentId].opponentTotalPoints += opponentPoints;

        // Determine win/loss/draw
        const userWon = currentUser.resultStatus === "won";
        const opponentWon = opponent.resultStatus === "won";

        if (userWon && !opponentWon) {
          h2hMap[opponentId].userWins++;
        } else if (opponentWon && !userWon) {
          h2hMap[opponentId].opponentWins++;
        } else {
          // Both won or both lost = draw
          h2hMap[opponentId].draws++;
        }
      });
    });

    // Convert to array and format response
    const h2hStats = Object.values(h2hMap).map(stat => ({
      player1: {
        id: userId,
        name: req.user.name,
        avatar: req.user.avatar
      },
      player2: stat.opponent,
      poolsPlayedTogether: stat.poolsPlayedTogether,
      player1Wins: stat.userWins,
      player2Wins: stat.opponentWins,
      draws: stat.draws,
      player1TotalPoints: stat.userTotalPoints,
      player2TotalPoints: stat.opponentTotalPoints,
      pointsDifference: Math.abs(stat.userTotalPoints - stat.opponentTotalPoints),
      player1WinPercentage: stat.poolsPlayedTogether > 0 
        ? parseFloat(((stat.userWins / stat.poolsPlayedTogether) * 100).toFixed(1))
        : 0,
      player2WinPercentage: stat.poolsPlayedTogether > 0 
        ? parseFloat(((stat.opponentWins / stat.poolsPlayedTogether) * 100).toFixed(1))
        : 0
    }));

    h2hStats.sort((a, b) => b.poolsPlayedTogether - a.poolsPlayedTogether);

    res.status(200).json({
      status: "success",
      message: h2hStats.length > 0 
        ? "Head-to-head stats fetched successfully" 
        : "No head-to-head data available. Play pools with other users to see stats.",
      total: h2hStats.length,
      data: h2hStats
    });

  } catch (err) {
    console.error("Head-to-head error:", err);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});
// ✅ ENHANCED: Reopen endpoint - Clear all result data properly
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
        await User.findByIdAndUpdate(participant.userId._id, {
          $inc: { totalPoints: -participant.pointsEarned }
        });

        winnersRefunded.push({
          userId: participant.userId._id,
          name: participant.name,
          pointsRefunded: participant.pointsEarned
        });

        await sendInAppNotification(participant.userId._id, {
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

    // ✅ RESET ALL PARTICIPANT DATA
    pool.participants.forEach(participant => {
      if (participant.status === "accepted") {
        participant.prediction = null;
        participant.predictionSubmittedAt = null;
        participant.resultStatus = null;
        participant.pointsEarned = 0;
        participant.score = 0;
        participant.rank = null;
      }
    });

    // ✅ RESET ALL POOL RESULT DATA
    pool.correctPrediction = null;
    pool.resultDeclaredAt = null;
    pool.status = "active";
    pool.leaderboard = [];

    await pool.save();

    // Notify all partic  `ipants
    for (const participant of pool.participants) {
      if (participant.userId && participant.status === "accepted") {
        if (!winnersRefunded.find(w => w.userId.toString() === participant.userId._id.toString())) {
          await sendInAppNotification(participant.userId._id, {
            type: "pool_reopened",
            title: "Pool Reopened",
            message: `"${pool.poolName}" has been reopened. Submit your prediction again.`,
            data: {
              poolId: pool._id,
              poolName: pool.poolName
            }
          });
        }
      }
    }

    res.status(200).json({
      status: "success",
      message: "Pool reopened successfully. All results and predictions cleared.",
      data: {
        poolId: pool._id,
        poolName: pool.poolName,
        status: pool.status,
        winnersRefunded: winnersRefunded.length,
        totalPointsRefunded: winnersRefunded.reduce((sum, w) => sum + w.pointsRefunded, 0)
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

