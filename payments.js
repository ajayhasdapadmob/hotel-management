const express = require("express");
const router = express.Router();

const {
  readPayments,
  createPayment,
  findPayment,
  verifyPayment,
  rejectPayment,
  getPaymentStatus
} = require("../services/payment");

// ==========================================
// GET ALL PAYMENTS
// ==========================================

router.get("/", (req, res) => {
  const payments = readPayments();
  
  res.json({
    success: true,
    count: payments.length,
    data: payments
  });
});

// ==========================================
// GET SINGLE PAYMENT
// ==========================================

router.get("/:id", (req, res) => {
  const payment = findPayment(req.params.id);
  
  if (!payment) {
    return res.status(404).json({
      success: false,
      message: "Payment not found."
    });
  }
  
  res.json({
    success: true,
    data: payment
  });
});

// ==========================================
// CREATE PAYMENT
// ==========================================

router.post("/", (req, res) => {
  const result = createPayment(req.body);
  
  if (!result.success) {
    return res.status(400).json(result);
  }
  
  res.status(201).json(result);
});

// ==========================================
// VERIFY PAYMENT
// ==========================================

router.patch("/:id/verify", (req, res) => {
  const result = verifyPayment(
    req.params.id,
    req.body.verifiedBy || "Admin"
  );
  
  if (!result.success) {
    return res.status(400).json(result);
  }
  
  res.json(result);
});

// ==========================================
// REJECT PAYMENT
// ==========================================

router.patch("/:id/reject", (req, res) => {
  const result = rejectPayment(
    req.params.id,
    req.body.rejectedBy || "Admin",
    req.body.reason || ""
  );
  
  if (!result.success) {
    return res.status(400).json(result);
  }
  
  res.json(result);
});

// ==========================================
// PAYMENT STATUS
// ==========================================

router.get("/:id/status", (req, res) => {
  const result = getPaymentStatus(
    req.params.id
  );
  
  if (!result.success) {
    return res.status(404).json(result);
  }
  
  res.json(result);
});

module.exports = router;