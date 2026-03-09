// const Notification = require("../modules/notification");
// const User = require("../modules/User");
// const { sendPushNotification } = require("./pushNotification");

// const sendInAppNotification = async (userId, { type, title, message, data }) => {
//   try {
//     let actualUserId;

//     if (userId && typeof userId === "object" && userId._id) {
//       actualUserId = userId._id.toString();
//     } else if (userId) {
//       actualUserId = userId.toString();
//     } else {
//       console.error("❌ sendInAppNotification: userId is null — skipping");
//       return;
//     }

//     console.log(`🔔 NOTIFY | userId: ${actualUserId} | type: ${type}`);

//     await Notification.create({ userId: actualUserId, type, title, message, data });
//     console.log(`✅ Notification saved to DB for: ${actualUserId}`);

//     const user = await User.findById(actualUserId);

//     if (!user) {
//       console.error(`❌ User not found for id: ${actualUserId}`);
//       return;
//     }

//     console.log(`✅ User found: ${user.name} | fcmToken: ${user.fcmToken ? "EXISTS" : "MISSING"}`);

//     if (user.notificationStatus === "off") return;
//     if (!user.fcmToken) return;

//     await sendPushNotification(user, title, message, {
//       type,
//       poolId: data?.poolId?.toString() || "",
//       poolName: data?.poolName || "",
//     });

//     console.log(`✅ Push sent to: ${user.name}`);

//   } catch (err) {
//     console.error(`❌ sendInAppNotification ERROR:`, err.message);
//   }
// };


// module.exports = { sendInAppNotification };


const Notification = require("../modules/notification");
const User = require("../modules/User");
const { sendPushNotification } = require("./pushNotification");

const sendInAppNotification = async (userId, { type, title, message, data }) => {
  try {
    let actualUserId;

    if (userId && typeof userId === "object" && userId._id) {
      actualUserId = userId._id.toString();
    } else if (userId) {
      actualUserId = userId.toString();
    } else {
      console.error("❌ sendInAppNotification: userId is null — skipping");
      return;
    }

    console.log(`🔔 NOTIFY | userId: ${actualUserId} | type: ${type}`);

    // ✅ STEP 1: Always save to DB first (in-app notification)
    await Notification.create({ userId: actualUserId, type, title, message, data });
    console.log(`✅ DB notification saved for: ${actualUserId}`);

    // ✅ STEP 2: Find user
    const user = await User.findById(actualUserId);

    if (!user) {
      console.error(`❌ User not found for id: ${actualUserId}`);
      return;
    }

    // ✅ STEP 3: Log everything so you can see exactly where it stops
    console.log(`👤 User: ${user.name}`);
    console.log(`🔕 notificationStatus: ${user.notificationStatus}`);
    console.log(`📲 fcmToken: ${user.fcmToken ? "EXISTS ✅" : "MISSING ❌"}`);

    // ✅ STEP 4: Check notification status
    if (user.notificationStatus === "off") {
      console.warn(`⚠️ Notifications OFF for: ${user.name} — skipping push`);
      return;
    }

    // ✅ STEP 5: Check FCM token
    if (!user.fcmToken) {
      console.warn(`⚠️ No FCM token for: ${user.name} — push skipped`);
      return;
    }

    // ✅ STEP 6: Send push
    await sendPushNotification(user, title, message, {
      type,
      poolId: data?.poolId?.toString() || "",
      poolName: data?.poolName || "",
    });

    console.log(`✅ Push notification sent to: ${user.name}`);

  } catch (err) {
    console.error(`❌ sendInAppNotification ERROR for userId ${userId}:`, err.message);
  }
};

module.exports = { sendInAppNotification };