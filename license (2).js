const express = require("express");
const router = express.Router();

const {
  readLicenses,
  findLicense,
  createLicense,
  activateLicense,
  getLicenseStatus
} = require("../services/license");

// Get all licenses
router.get("/", (req, res) => {
  const licenses = readLicenses();
  
  res.json({
    success: true,
    count: licenses.length,
    data: licenses
  });
});

// Get one license
router.get("/:licenseId", (req, res) => {
  const license = findLicense(req.params.licenseId);
  
  if (!license) {
    return res.status(404).json({
      success: false,
      message: "License not found."
    });
  }
  
  res.json({
    success: true,
    data: license
  });
});

// Create new license
router.post("/", (req, res) => {
  const result = createLicense(req.body);
  
  if (!result.success) {
    return res.status(400).json(result);
  }
  
  res.status(201).json(result);
});

// Activate / renew license
router.patch("/:licenseId/activate", (req, res) => {
  const { expiryDate } = req.body;
  
  if (!expiryDate) {
    return res.status(400).json({
      success: false,
      message: "expiryDate is required."
    });
  }
  
  const result = activateLicense(
    req.params.licenseId,
    expiryDate,
    req.body.activatedBy || "Admin"
  );
  
  if (!result.success) {
    return res.status(400).json(result);
  }
  
  res.json(result);
});

// Check license status
router.get("/:licenseId/status", (req, res) => {
  const result = getLicenseStatus(req.params.licenseId);
  
  if (!result.success) {
    return res.status(404).json(result);
  }
  
  res.json(result);
});

module.exports = router;