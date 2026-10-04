const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(
  __dirname,
  "../data/payments.json"
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

function readPayments() {
  ensureDataFile();

  try {
    return JSON.parse(
      fs.readFileSync(DATA_FILE, "utf8")
    );
  } catch (error) {
    console.error("Payment data read error:", error);
    return [];
  }
}

function savePayments(payments) {
  ensureDataFile();

  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(payments, null, 2)
  );
}

function findPayment(paymentId) {
  const payments = readPayments();

  return payments.find(
    payment => payment.id === paymentId
  );
}

function findByTransactionId(transactionId) {
  const payments = readPayments();

  return payments.find(
    payment =>
      String(payment.transactionId)
        .trim()
        .toLowerCase() ===
      String(transactionId)
        .trim()
        .toLowerCase()
  );
}

function createPayment(data) {
  const {
    amount,
    transactionId,
    customerName,
    licenseId,
    purpose,
    paymentMethod
  } = data;

  if (!amount || Number(amount) <= 0) {
    return {
      success: false,
      message: "Valid payment amount is required."
    };
  }

  if (!transactionId) {
    return {
      success: false,
      message: "Transaction ID / UTR is required."
    };
  }

  if (findByTransactionId(transactionId)) {
    return {
      success: false,
      message:
        "This transaction ID / UTR already exists."
    };
  }

  const payments = readPayments();

  const payment = {
    id: `PAY-${Date.now()}`,
    amount: Number(amount),
    transactionId: String(transactionId).trim(),
    customerName: customerName || "",
    licenseId: licenseId || "",
    purpose: purpose || "Renewal",
    paymentMethod:
      paymentMethod || "UPI",
    status: "Pending",
    createdAt: new Date().toISOString(),
    verifiedAt: null,
    verifiedBy: null,
    rejectedAt: null,
    rejectedBy: null,
    rejectionReason: ""
  };

  payments.push(payment);
  savePayments(payments);

  return {
    success: true,
    message: "Payment submitted successfully.",
    data: payment
  };
}

function verifyPayment(
  paymentId,
  verifiedBy = "Admin"
) {
  const payments = readPayments();

  const index = payments.findIndex(
    payment => payment.id === paymentId
  );

  if (index === -1) {
    return {
      success: false,
      message: "Payment not found."
    };
  }

  const payment = payments[index];

  if (payment.status === "Verified") {
    return {
      success: false,
      message: "Payment is already verified."
    };
  }

  payment.status = "Verified";
  payment.verifiedAt =
    new Date().toISOString();
  payment.verifiedBy = verifiedBy;

  savePayments(payments);

  return {
    success: true,
    message: "Payment verified successfully.",
    data: payment
  };
}

function rejectPayment(
  paymentId,
  rejectedBy = "Admin",
  reason = ""
) {
  const payments = readPayments();

  const index = payments.findIndex(
    payment => payment.id === paymentId
  );

  if (index === -1) {
    return {
      success: false,
      message: "Payment not found."
    };
  }

  const payment = payments[index];

  payment.status = "Rejected";
  payment.rejectedAt =
    new Date().toISOString();
  payment.rejectedBy = rejectedBy;
  payment.rejectionReason =
    reason || "Payment could not be verified.";

  savePayments(payments);

  return {
    success: true,
    message: "Payment rejected.",
    data: payment
  };
}

function getPaymentStatus(paymentId) {
  const payment = findPayment(paymentId);

  if (!payment) {
    return {
      success: false,
      message: "Payment not found."
    };
  }

  return {
    success: true,
    data: {
      id: payment.id,
      transactionId: payment.transactionId,
      amount: payment.amount,
      status: payment.status,
      verifiedAt: payment.verifiedAt,
      verifiedBy: payment.verifiedBy
    }
  };
}

module.exports = {
  readPayments,
  savePayments,
  findPayment,
  findByTransactionId,
  createPayment,
  verifyPayment,
  rejectPayment,
  getPaymentStatus
};