const admin = require("firebase-admin");
const path = require("path");
const User = require("../models/User"); // make sure the path matches your project structure

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Sends a push notification to a given device token
const sendPushNotification = async (token, message) => {
  const messagePayload = {
    notification: {
      title: "Fitness Tracker Reminder",
      body: message,
    },
    token,
  };

  try {
    const response = await admin.messaging().send(messagePayload);
    console.log("✅ Successfully sent message:", response);
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
  }
};

// Finds user by ID and sends notification if they have a valid FCM token
const sendReminderNotification = async (userId, message) => {
  try {
    const user = await User.findById(userId);
    if (user && user.fcmToken) {
      await sendPushNotification(user.fcmToken, message);
    } else {
      console.log("🚫 User doesn't have a valid FCM token.");
    }
  } catch (err) {
    console.error("❌ Error in sendReminderNotification:", err);
  }
};

module.exports = { sendPushNotification, sendReminderNotification };
