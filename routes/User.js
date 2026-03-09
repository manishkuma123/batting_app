const express = require("express")
const router = express.Router();
const User = require("../modules/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const OTP = require("../modules/OTP");
const Notification = require("../modules/notification");
const InviteLink = require("../modules/InviteLink");
const { sendOTPEmail } = require("./emailService");
const authMiddleware = require('./authentication')
const TokenBlacklist = require("../modules/TokenBlacklist");
const multer = require("multer");
const Pool = require("../modules/pool");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  
    cloud_name: "di1bf8n5p",
  api_key: "756854938742942",
  api_secret: "uzBfUbHaIJ_7MVosR-N695UajT0"
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user_profiles",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
      return "profile-" + req.user.userId + "-" + uniqueSuffix;
    }
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  }
});

const { sendWelcomeEmail } = require('./sendWelcomeEmail');

router.post('/api/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        const exituser = await User.findOne({ email });
        if (exituser) {
            return res.status(400).json({ message: "User already exists" });
        }


        const phonenum = await User.findOne({ phone });
        if (phonenum) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newuser = new User({
            name,
            email,
            phone,
            password: hashedPassword
        });

        const saveduser = await newuser.save();

        const token = jwt.sign(
            { userId: saveduser._id },
            "manishkumartokendata",
            { expiresIn: "7d" }
        );

        const userData = saveduser.toObject();
        delete userData.password;

        sendWelcomeEmail(email, name).then(sent => {
            if (!sent) console.log("Welcome email could not be sent.");
        });

        res.status(201).json({
            status: true,
            message: 'User registration successful',
            user: userData,
            token,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


router.put(
  "/api/auth/updateprofile",
  authMiddleware,
  upload.single("profile"), 
  async (req, res) => {
    try {
      const userId = req.user.id || req.user._id;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          name: req.body.name,
          ...(req.file && {
            profile:  req.file.path,
              // public_id: req.file.filename || req.file.public_id
            
          })
        },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ status: false, message: "User not found" });
      }

      res.status(200).json({
        status: true,
        message: "Profile updated",
        data: updatedUser
      });

    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  }
);
router.delete('/api/auth/delete-account', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // ==== FIND USER ====
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found"
      });
    }

    let totalPointsRefunded = 0;

    // ==== 1. POOLS CREATED BY USER ====
    const createdPools = await Pool.find({ createdBy: userId });

    for (const pool of createdPools) {
      const points = Number(pool.pointsToJoin) || 0;

      for (const participant of pool.participants) {
        if (
          participant.userId &&
          participant.status === "accepted" &&
          participant.userId.toString() !== userId.toString() &&
          points > 0
        ) {
          await User.findByIdAndUpdate(participant.userId, {
            $inc: { totalPoints: points }
          });

          // Notify participant
          try {
            await sendInAppNotification(participant.userId, {
              type: "pool_deleted",
              title: "Pool Deleted",
              message: `The pool "${pool.poolName}" was deleted. ${points} points refunded.`,
              data: {
                poolId: pool._id,
                pointsRefunded: points
              }
            });
          } catch (_) {}
        }
      }

      await InviteLink.deleteMany({ poolId: pool._id });
    }

    // Delete pools created by user
    await Pool.deleteMany({ createdBy: userId });

    // ==== 2. POOLS WHERE USER IS A PARTICIPANT ====
    const participatingPools = await Pool.find({
      "participants.userId": userId,
      createdBy: { $ne: userId }
    });

    for (const pool of participatingPools) {
      const participant = pool.participants.find(
        p => p.userId && p.userId.toString() === userId.toString()
      );

      const points = Number(pool.pointsToJoin) || 0;

      if (participant && participant.status === "accepted" && points > 0) {
        totalPointsRefunded += points;

        try {
          await sendInAppNotification(pool.createdBy, {
            type: "participant_left",
            title: "Participant Left",
            message: `${user.name} left "${pool.poolName}" due to account deletion.`,
            data: {
              poolId: pool._id,
              userId
            }
          });
        } catch (_) {}
      }

      // ✅ SAFE UPDATE — NO VALIDATION
      await Pool.updateOne(
        { _id: pool._id },
        {
          $pull: {
            participants: { userId },
            leaderboard: { userId }
          }
        }
      );
    }

    // Refund total points to deleted user
    if (totalPointsRefunded > 0) {
      await User.findByIdAndUpdate(userId, {
        $inc: { totalPoints: totalPointsRefunded }
      });
    }

    // ==== 3. DELETE USER NOTIFICATIONS ====
    await Notification.deleteMany({ userId });

    // ==== 4. DELETE INVITE LINKS ====
    await InviteLink.deleteMany({ inviterId: userId });

    // ==== 5. DELETE USER ====
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      status: "success",
      message: "Account deleted successfully",
      data: {
        poolsDeleted: createdPools.length,
        poolsLeft: participatingPools.length,
        pointsRefundedToYou: totalPointsRefunded
      }
    });

  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({
      status: "fail",
      message: "Something went wrong while deleting your account",
      error: error.message
    });
  }
});



router.put("/api/auth/update-notification", authMiddleware, async (req, res) => {
  try {
    const { notificationStatus } = req.body;

    if (!["on", "off"].includes(notificationStatus)) {
      return res.status(400).json({
        status: false,
        message: "notificationStatus must be 'on' or 'off'"
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { notificationStatus },
      { new: true }
    ).select("-password");

    res.status(200).json({
      status: true,
      message: "Notification status updated",
      data: {
        notificationStatus: updatedUser.notificationStatus
      }
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
});

router.post('/api/login', async (req, res) => {
    try {
        const { email, phone, password } = req.body;
       
        if (!email && !phone) {
            return res.status(400).json({ message: "Please provide email or phone" });
        }

        const exituser = await User.findOne({
            $or: [
                { email: email || null },
                { phone: phone || null }
            ]
        });
        if (!exituser) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, exituser.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }      
        const token = jwt.sign(
            { userId: exituser._id },
            "manishkumartokendata",
            { expiresIn: "7d" }
        );

        const userData = exituser.toObject();
        delete userData.password;

        res.status(200).json({
            status: true,
            message: 'User login successful',
            user: userData,
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });   
    }
});

router.post('/api/auth/forgot-password-request-otp', async (req, res) => {
    try {
        const { email } = req.body;

        // Validate input
        if (!email) {
            return res.status(400).json({
                status: "fail",
                message: "Email is required"
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });

        // Always return success message for security (don't reveal if email exists)
        if (!user) {
            return res.status(200).json({
                status: "success",
                message: "If this email is registered, an OTP has been sent"
            });
        }

        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000);

        // Delete any existing OTPs for this email
        await OTP.deleteMany({ email });

        // Save new OTP
        const newOTP = new OTP({
            email,
            otp
        });
        await newOTP.save();

        // Send OTP via email
        const emailSent = await sendOTPEmail(email, otp);

        if (!emailSent) {
            return res.status(500).json({
                status: "fail",
                message: "Something went wrong"
            });
        }

        res.status(200).json({
            status: "success",
            message: "If this email is registered, an OTP has been sent"
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            status: "fail",
            message: "Something went wrong"
        });
    }
});
router.post('/api/auth/logout', authMiddleware, async (req, res) => {
  try {
    await TokenBlacklist.create({ token: req.token });

    res.status(200).json({
      status: true,
      message: "Logout successful"
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      status: false,
      message: "Logout failed"
    });
  }
});
router.get("/api/auth/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const allJoinedPools = await Pool.find({
      "participants.userId": userId,
      "participants.status": "accepted"
    });

    let totalStaked = 0;
    let totalPayout = 0;
    let totalWon    = 0;
    let totalLost   = 0;
    let totalPlayed = 0;

    allJoinedPools.forEach(pool => {
      const participant = pool.participants.find(
        p => p.userId?.toString() === userId.toString()
      );

      if (!participant) return;

      if (pool.status === "completed" && participant.prediction) {
        totalPlayed++;

        const stake = pool.pointsToJoin || 0;
        const payout = participant.pointsEarned || 0;

        totalStaked += stake;
        totalPayout += payout;

        if (participant.resultStatus === "won") totalWon++;
        if (participant.resultStatus === "lost") totalLost++;
      }
    });


    const totalWinnings = totalPayout - totalStaked;


    const bankroll  = req.user.totalPoints || 0;

    // ✅ Monthly Stipend Tracker (optional field in DB)
    // const bankroll = req.user.bankroll || 0;

    const winRate = totalPlayed > 0
      ? Number(((totalWon / totalPlayed) * 100).toFixed(1))
      : 0;

    const userData = req.user.toObject();
    delete userData.password;

//     const userProfile = {
//   ...userData,
//   bankroll,
//   totalWinnings,
//   totalStaked,
//   totalPayout,
//   totalPlayed,
//   totalWon,
//   totalLost,
//   winRate
// };
    return res.status(200).json({
      status: true,
      message: "Profile fetched successfully",
      
      user: userData,

      bettingBag: {
        // currentBalance,   // Points available to bet
        bankroll,         // Monthly stipend (NOT profit)
        totalWinnings     // Net betting P&L only
      },

      stats: {
        totalStaked,
        totalPayout,
        totalPlayed,
        totalWon,
        totalLost,
  
      }
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "server  error ",
      
    });
  }
});


router.get("/api/users",authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, "name _id");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router.post('/api/auth/reset-password-with-otp', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Validate input
        if (!email || !otp) {
            return res.status(400).json({
                status: "fail",
                message: "Email and OTP are required"
            });
        }

        // Find and verify OTP
        const otpRecord = await OTP.findOne({ email, otp: Number(otp) });

        if (!otpRecord) {
            return res.status(400).json({
                status: "fail",
                message: "Invalid or expired OTP"
            });
        }
// 
        // If newPassword provided, reset password
        if (newPassword) {
            // Validate password
            if (newPassword.length < 6) {
                return res.status(400).json({
                    status: "fail",
                    message: "Password must be at least 6 characters"
                });
            }

            // Find user
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({
                    status: "fail",
                    message: "User not found"
                });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            user.password = hashedPassword;
            await user.save();

            // Delete OTP after successful password reset
            await OTP.deleteOne({ _id: otpRecord._id });

            return res.status(200).json({
                status: "success",
                message: "Password reset successful"
            });
        }

        // If no newPassword, just verify OTP
        res.status(200).json({
            status: "success",
            message: "Otp verification successful"
        });

    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            status: "fail",
            message: "Invalid or expired OTP"
        });
    }
});

router.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Validate input
        if (!email || !newPassword) {
            return res.status(400).json({
                status: "fail",
                message: "Email and new password are required"
            });
        }

        // Validate password
        if (newPassword.length < 6) {
            return res.status(400).json({
                status: "fail",
                message: "Password must be at least 6 characters"
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                status: "fail",
                message: "Something went wrong"
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            status: "success",
            message: "Password reset successful"
        });

    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            status: "fail",
            message: "Something went wrong"
        });
    }
});


router.get('/api',authMiddleware,(req,res)=>{
    res.send("user route work")
})


router.get("/test-firebase", async (req, res) => {
  try {
    const admin = require("firebase-admin");
    const app = admin.app(); // will throw if not initialized
    res.json({ status: "success", message: "Firebase connected", appName: app.name });
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

router.post("/api/auth/device-token", authMiddleware, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ status: false, message: "fcmToken is required" });
    }
    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    res.status(200).json({ status: true, message: "Device token saved" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});
module.exports = router;

