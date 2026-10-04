const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// Middleware
// ==========================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// Data Folder
// ==========================================

const dataDir = path.join(__dirname, "data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// ==========================================
// Routes
// ==========================================

const renewalRoutes = require("./routes/renewal");
const licenseRoutes = require("./routes/license");
const paymentRoutes = require("./routes/payments");
const notificationRoutes = require("./routes/notifications");

app.use("/api/renewal", renewalRoutes);
app.use("/api/licenses", licenseRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);

// ==========================================
// Health Check
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Hotel Management API is running",
    service: "hotel-management-server",
    version: "1.0.0"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "online",
    time: new Date().toISOString()
  });
});

// ==========================================
// API Information
// ==========================================

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Hotel Management API",
    
    endpoints: {
      health: "/api/health",
      renewal: "/api/renewal",
      licenses: "/api/licenses",
      payments: "/api/payments",
      notifications: "/api/notifications"
    }
  });
});

// ==========================================
// 404 Handler
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found."
  });
});

// ==========================================
// Error Handler
// ==========================================

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  
  res.status(500).json({
    success: false,
    message: "Internal server error."
  });
});

// ==========================================
// Start Server
// ==========================================

app.listen(PORT, () => {
  console.log(
    `Hotel Management API running on port ${PORT}`
  );
});