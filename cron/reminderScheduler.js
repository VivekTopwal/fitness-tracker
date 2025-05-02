const cron = require("node-cron");
const { sendReminderNotification } = require("../services/notificationService");
const Reminder = require("../models/Reminder");
const User = require("../models/User");

cron.schedule("0 9 * * *", async () => {
  console.log("⏰ Running daily 9AM reminder cron job...");
  const now = new Date();

  try {
    const reminders = await Reminder.find({ time: { $lte: now }, isSent: false });

    for (const reminder of reminders) {
      const user = await User.findById(reminder.userId);
      if (user) {
        await sendReminderNotification(user._id, reminder.message);
        reminder.isSent = true;
        await reminder.save();
        console.log(`✅ Reminder sent to ${user.name}`);
      }
    }
  } catch (err) {
    console.error("❌ Error in reminder cron job:", err);
  }
});
