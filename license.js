const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(
  __dirname,
  "../data/licenses.json"
);

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]");
  }
}

function readLicenses() {
  ensureDataFile();

  try {
    return JSON.parse(
      fs.readFileSync(DATA_FILE, "utf8")
    );
  } catch (error) {
    console.error("License data read error:", error);
    return [];
  }
}

function saveLicenses(licenses) {
  ensureDataFile();

  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(licenses, null, 2)
  );
}

function findLicense(licenseId) {
  const licenses = readLicenses();

  return licenses.find(
    license => license.licenseId === licenseId
  );
}

function calculateExpiryDate(
  currentExpiryDate,
  days = 30
) {
  const now = new Date();

  let startDate = now;

  if (currentExpiryDate) {
    const currentExpiry = new Date(currentExpiryDate);

    if (
      !Number.isNaN(currentExpiry.getTime()) &&
      currentExpiry > now
    ) {
      startDate = currentExpiry;
    }
  }

  const expiry = new Date(startDate);

  expiry.setDate(
    expiry.getDate() + Number(days)
  );

  return expiry.toISOString();
}

function createLicense(data) {
  const licenses = readLicenses();

  if (!data.licenseId) {
    return {
      success: false,
      message: "licenseId is required."
    };
  }

  if (findLicense(data.licenseId)) {
    return {
      success: false,
      message: "License already exists."
    };
  }

  const license = {
    licenseId: data.licenseId,
    customerName: data.customerName || "",
    hotelName: data.hotelName || "",
    mobile: data.mobile || "",
    email: data.email || "",
    status: "Active",
    createdAt: new Date().toISOString(),
    activatedAt: new Date().toISOString(),
    expiryDate:
      data.expiryDate ||
      calculateExpiryDate(null, data.days || 30),
    activatedBy: data.activatedBy || "System"
  };

  licenses.push(license);
  saveLicenses(licenses);

  return {
    success: true,
    message: "License created successfully.",
    data: license
  };
}

function activateLicense(
  licenseId,
  expiryDate,
  activatedBy = "Admin"
) {
  const licenses = readLicenses();

  const index = licenses.findIndex(
    license => license.licenseId === licenseId
  );

  if (index === -1) {
    return {
      success: false,
      message: "License not found."
    };
  }

  const license = licenses[index];

  license.status = "Active";
  license.expiryDate = expiryDate;
  license.activatedAt =
    new Date().toISOString();
  license.activatedBy = activatedBy;

  saveLicenses(licenses);

  return {
    success: true,
    message: "License activated successfully.",
    data: license
  };
}

function suspendLicense(
  licenseId,
  suspendedBy = "Admin"
) {
  const licenses = readLicenses();

  const index = licenses.findIndex(
    license => license.licenseId === licenseId
  );

  if (index === -1) {
    return {
      success: false,
      message: "License not found."
    };
  }

  licenses[index].status = "Suspended";
  licenses[index].suspendedAt =
    new Date().toISOString();
  licenses[index].suspendedBy = suspendedBy;

  saveLicenses(licenses);

  return {
    success: true,
    message: "License suspended successfully.",
    data: licenses[index]
  };
}

function getLicenseStatus(licenseId) {
  const license = findLicense(licenseId);

  if (!license) {
    return {
      success: false,
      message: "License not found."
    };
  }

  const now = new Date();
  const expiry = new Date(license.expiryDate);

  let status = license.status;

  if (
    !Number.isNaN(expiry.getTime()) &&
    expiry < now
  ) {
    status = "Expired";
  }

  const remainingDays = Math.max(
    0,
    Math.ceil(
      (expiry - now) /
        (1000 * 60 * 60 * 24)
    )
  );

  return {
    success: true,
    data: {
      ...license,
      calculatedStatus: status,
      remainingDays
    }
  };
}

module.exports = {
  readLicenses,
  saveLicenses,
  findLicense,
  calculateExpiryDate,
  createLicense,
  activateLicense,
  suspendLicense,
  getLicenseStatus
};