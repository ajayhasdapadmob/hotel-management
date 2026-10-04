const nodemailer = require("nodemailer");

const EMAIL_ENABLED =
  String(process.env.EMAIL_ENABLED).toLowerCase() === "true";

let transporter = null;

function createTransporter() {
  if (!EMAIL_ENABLED) {
    return null;
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn(
      "Email is enabled but SMTP settings are missing."
    );
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure:
      String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

function getTransporter() {
  if (!transporter) {
    transporter = createTransporter();
  }

  return transporter;
}

// Generic email
async function sendEmail({
  to,
  subject,
  text,
  html
}) {
  if (!EMAIL_ENABLED) {
    console.log(
      `[EMAIL DISABLED] To: ${to || "unknown"} | Subject: ${subject}`
    );

    return {
      success: true,
      sent: false,
      message: "Email sending is disabled."
    };
  }

  const mailer = getTransporter();

  if (!mailer) {
    return {
      success: false,
      sent: false,
      message: "SMTP email configuration is incomplete."
    };
  }

  try {
    const info = await mailer.sendMail({
      from:
        process.env.EMAIL_FROM ||
        process.env.SMTP_USER,
      to,
      subject,
      text,
      html
    });

    return {
      success: true,
      sent: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error("Email sending error:", error);

    return {
      success: false,
      sent: false,
      message: error.message
    };
  }
}

// Renewal notification to admin
async function sendRenewalNotification(renewal) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    return {
      success: false,
      sent: false,
      message: "ADMIN_EMAIL is not configured."
    };
  }

  const subject =
    `New Renewal Request - ${renewal.licenseId}`;

  const text = `
New Hotel Software Renewal Request

Customer Name: ${renewal.customerName}
Hotel Name: ${renewal.hotelName || "-"}
Mobile: ${renewal.mobile || "-"}
Email: ${renewal.email || "-"}
License ID: ${renewal.licenseId}

Plan: ${renewal.plan}
Amount: ₹${renewal.amount}
Transaction ID / UTR: ${renewal.transactionId}

Request ID: ${renewal.id}
Submitted At: ${renewal.submittedAt}

Please verify the payment and activate the license from the admin panel.
`;

  const html = `
    <h2>New Renewal Request</h2>

    <p><strong>Customer Name:</strong>
    ${renewal.customerName}</p>

    <p><strong>Hotel Name:</strong>
    ${renewal.hotelName || "-"}</p>

    <p><strong>Mobile:</strong>
    ${renewal.mobile || "-"}</p>

    <p><strong>Email:</strong>
    ${renewal.email || "-"}</p>

    <p><strong>License ID:</strong>
    ${renewal.licenseId}</p>

    <p><strong>Plan:</strong>
    ${renewal.plan}</p>

    <p><strong>Amount:</strong>
    ₹${renewal.amount}</p>

    <p><strong>Transaction ID / UTR:</strong>
    ${renewal.transactionId}</p>

    <p><strong>Request ID:</strong>
    ${renewal.id}</p>

    <hr>

    <p>
      Please verify the payment and activate the license
      from the admin panel.
    </p>
  `;

  return sendEmail({
    to: adminEmail,
    subject,
    text,
    html
  });
}

module.exports = {
  sendEmail,
  sendRenewalNotification
};