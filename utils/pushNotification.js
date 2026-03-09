
const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = require("../battingapp.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const sendPushNotification = async (user, title, body, data = {}) => {
  try {
    if (!user || user.notificationStatus === "off") return;
    if (!user.fcmToken) return;

    const stringifiedData = {};
    for (const key of Object.keys(data)) {
      stringifiedData[key] = String(data[key]);
    }

    const message = {
      token: user.fcmToken,
      notification: { title, body },
      data: stringifiedData,
      android: {
        priority: "high",
        notification: {
          // channelId: "default",
           channelId: "default_sound",
          priority: "high",
          sound: "default",
        },
      },
      apns: {
        headers: {
          "apns-priority": "10",
        },
        payload: {
          aps: {
            sound: "default",
            badge: 1,
            contentAvailable: true,
          },
        },
      },
    };

    await admin.messaging().send(message);
    console.log("Push sent to user:", user._id);

  } catch (err) {
    if (
      err.code === "messaging/registration-token-not-registered" ||
      err.code === "messaging/invalid-registration-token"
    ) {
      const User = require("../modules/User");
      await User.findByIdAndUpdate(user._id, { fcmToken: null });
    }
    console.error("Push error:", err.message);
  }
};

module.exports = { sendPushNotification };