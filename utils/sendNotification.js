const admin = require("../firebaseAdmin");

const sendNotification = async (fcmToken, title, body) => {
  try {
    const message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
    };

    const response = await admin.messaging().send(message);
    console.log("✅ Notification sent:", response);
  } catch (error) {
    console.error("❌ Error sending notification:", error.message);
  }
};

module.exports = sendNotification;
