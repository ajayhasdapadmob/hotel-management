const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");

const {
  findLicense,
  activateLicense,
  calculateExpiryDate
} = require("../services/license");

const {
  findPayment,
  verifyPayment
} = require("../services/payment");

const {
  sendRenewalNotification
} = require("../services/email");

const DATA_FILE = path.join(__dirname, "../data/renewal-requests.json");

function readRenewals() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, "[]");
    }

    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (error) {
    console.error("Renewal read error:", error);
    return [];
  }
}

function saveRenewals(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get all renewal requests
router.get("/", (req, res) => {
  const renewals = readRenewals();

  res.json({
    success: true,
    count: renewals.length,
    data: renewals
  });
});

// Get one renewal request
router.get("/:id", (req, res) => {
  const renewals = readRenewals();

  const renewal = renewals.find(
    item => item.id === req.params.id
  );

  if (!renewal) {
    return res.status(404).json({
      success: false,
      message: "Renewal request not found."
    });
  }

  res.json({
    success: true,
    data: renewal
  });
});

// Customer submits renewal request
router.post("/", async (req, res) => {
  const {
    customerName,
    mobile,
    email,
    licenseId,
    transactionId,
    amount,
    plan,
    hotelName
  } = req.body;

  if (!customerName || !licenseId || !transactionId) {
    return res.status(400).json({
      success: false,
      message:
        "customerName, licenseId and transactionId are required."
    });
  }

  const renewals = readRenewals();

  // Duplicate UTR prevention
  const duplicate = renewals.find(
    item =>
      String(item.transactionId).trim().toLowerCase() ===
      String(transactionId).trim().toLowerCase()
  );

  if (duplicate) {
    return res.status(409).json({
      success: false,
      message: "This transaction ID / UTR has already been submitted."
    });
  }

  const renewal = {
    id: `REN-${Date.now()}`,
    customerName,
    mobile: mobile || "",
    email: email || "",
    hotelName: hotelName || "",
    licenseId,
    transactionId,
    amount: Number(amount || 0),
    plan: plan || "30 Days",
    status: "Pending",
    submittedAt: new Date().toISOString(),
    verifiedAt: null,
    verifiedBy: null,
    rejectionReason: ""
  };

  renewals.push(renewal);
  saveRenewals(renewals);

  // Admin notification
  try {
    await sendRenewalNotification(renewal);
  } catch (error) {
    console.error("Renewal email notification failed:", error.message);
  }

  res.status(201).json({
    success: true,
    message:
      "Renewal request submitted successfully. Admin will verify the payment.",
    data: renewal
  });
});

// Verify renewal + payment + activate license
router.patch("/:id/verify", async (req, res) => {
  const renewals = readRenewals();

  const renewal = renewals.find(
    item => item.id === req.params.id
  );

  if (!renewal) {
    return res.status(404).json({
      success: false,
      message: "Renewal request not found."
    });
  }

  if (renewal.status === "Verified") {
    return res.status(400).json({
      success: false,
      message: "This renewal has already been verified."
    });
  }

  const license = findLicense(renewal.licenseId);

  if (!license) {
    return res.status(404).json({
      success: false,
      message: "License not found."
    });
  }

  // If payment record exists, verify it too
  const payment = findPayment(renewal.transactionId);

  if (payment && payment.status !== "Verified") {
    const paymentResult = verifyPayment(
      payment.id,
      req.body.verifiedBy || "Admin"
    );

    if (!paymentResult.success) {
      return res.status(400).json(paymentResult);
    }
  }

  // Calculate new expiry
  const days =
    renewal.plan === "1 Year"
      ? 365
      : renewal.plan === "6 Months"
        ? 180
        : renewal.plan === "3 Months"
          ? 90
          : 30;

  const newExpiryDate = calculateExpiryDate(
    license.expiryDate,
    days
  );

  const activationResult = activateLicense(
    renewal.licenseId,
    newExpiryDate,
    req.body.verifiedBy || "Admin"
  );

  if (!activationResult.success) {
    return res.status(400).json(activationResult);
  }

  renewal.status = "Verified";
  renewal.verifiedAt = new Date().toISOString();
  renewal.verifiedBy = req.body.verifiedBy || "Admin";
  renewal.expiryDate = newExpiryDate;

  saveRenewals(renewals);

  res.json({
    success: true,
    message: "Payment verified and license activated successfully.",
    data: {
      renewal,
      license: activationResult.data
    }
  });
});

// Reject renewal
router.patch("/:id/reject", (req, res) => {
  const renewals = readRenewals();

  const renewal = renewals.find(
    item => item.id === req.params.id
  );

  if (!renewal) {
    return res.status(404).json({
      success: false,
      message: "Renewal request not found."
    });
  }

  renewal.status = "Rejected";
  renewal.rejectionReason =
    req.body.reason || "Payment could not be verified.";
  renewal.verifiedBy = req.body.rejectedBy || "Admin";
  renewal.verifiedAt = new Date().toISOString();

  saveRenewals(renewals);

  res.json({
    success: true,
    message: "Renewal request rejected.",
    data: renewal
  });
});

module.exports = router;