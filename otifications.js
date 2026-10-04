const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const filePath = path.join(dataDir, "notifications.json");

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf8");
  }
}

function readNotifications() {
  ensureDataFile();

  try {
    const data = fs.readFileSync(filePath, "utf8");

    if (!data.trim()) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.error(
      "Notification data read error:",
      error.message
    );

    return [];
  }
}

function saveNotifications(notifications) {
  ensureDataFile();

  fs.writeFileSync(
    filePath,
    JSON.stringify(notifications, null, 2),
    "utf8"
  );
}

// ==========================================
// GET ALL NOTIFICATIONS
// ==========================================

router.get("/", (req, res) => {
  const notifications = readNotifications();

  res.json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

// ==========================================
// GET UNREAD NOTIFICATIONS
// ==========================================

router.get("/unread", (req, res) => {
  const notifications = readNotifications();

  const unread = notifications.filter(
    item => item.read !== true
  );

  res.json({
    success: true,
    count: unread.length,
    data: unread
  });
});

// ==========================================
// CREATE NOTIFICATION
// ==========================================

router.post("/", (req, res) => {
  const notifications = readNotifications();

  const {
    type,
    title,
    message,
    recipient,
    relatedId
  } = req.body;

  if (!title || !message) {
    return res.status(400).json({
      success: false,
      message: "Notification title and message are required."
    });
  }

  const notification = {
    id: `NOT-${Date.now()}`,

    type:
      String(type || "General").trim(),

    title:
      String(title).trim(),

    message:
      String(message).trim(),

    recipient:
      String(recipient || "Admin").trim(),

    relatedId:
      String(relatedId || "").trim(),

    read: false,

    createdAt:
      new Date().toISOString()
  };

  notifications.unshift(notification);

  saveNotifications(notifications);

  res.status(201).json({
    success: true,
    message: "Notification created successfully.",
    data: notification
  });
});

// ==========================================
// MARK AS READ
// ==========================================

router.patch("/:id/read", (req, res) => {
  const notifications = readNotifications();

  const index = notifications.findIndex(
    item => item.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Notification not found."
    });
  }

  notifications[index].read = true;

  notifications[index].readAt =
    new Date().toISOString();

  saveNotifications(notifications);

  res.json({
    success: true,
    message: "Notification marked as read.",
    data: notifications[index]
  });
});

// ==========================================
// MARK ALL AS READ
// ==========================================

router.patch("/read-all", (req, res) => {
  const notifications = readNotifications();

  const now = new Date().toISOString();

  notifications.forEach(item => {
    item.read = true;

    if (!item.readAt) {
      item.readAt = now;
    }
  });

  saveNotifications(notifications);

  res.json({
    success: true,
    message: "All notifications marked as read.",
    data: notifications
  });
});

module.exports = router;