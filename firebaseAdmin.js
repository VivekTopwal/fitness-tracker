const admin = require("firebase-admin");

// ✅ Prevent "duplicate-app" error by checking if already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("./firebase-service-account.json")), // 🔐 Path to your service account key
  });
}

module.exports = admin;
