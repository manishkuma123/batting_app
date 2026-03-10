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

    await Notification.create({ userId: actualUserId, type, title, message, data });
    console.log(`✅ DB notification saved for: ${actualUserId}`);

 
    const user = await User.findById(actualUserId);

    if (!user) {
      console.error(`❌ User not found for id: ${actualUserId}`);
      return;
    }

    console.log(`👤 User: ${user.name}`);
    console.log(`🔕 notificationStatus: ${user.notificationStatus}`);
    console.log(`📲 fcmToken: ${user.fcmToken ? "EXISTS ✅" : "MISSING ❌"}`);

    if (user.notificationStatus === "off") {
      console.warn(`⚠️ Notifications OFF for: ${user.name} — skipping push`);
      return;
    }

    if (!user.fcmToken) {
      console.warn(`⚠️ No FCM token for: ${user.name} — push skipped`);
      return;
    }

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