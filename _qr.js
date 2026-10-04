// js/qr.js

(function () {
  "use strict";

  const DEFAULT_UPI_ID = "9353689775@upi";
  const DEFAULT_PAYEE = "Hotel Management";

  function getSettings() {
    return HotelApp.getStorage(
      "hotelSettings",
      {}
    );
  }

  function getUpiId() {
    const settings = getSettings();

    return (
      settings.upiId ||
      DEFAULT_UPI_ID
    );
  }

  function getPayeeName() {
    const settings = getSettings();

    return (
      settings.upiName ||
      settings.hotelName ||
      DEFAULT_PAYEE
    );
  }

  function buildUpiUrl(options) {
    options = options || {};

    const upiId =
      options.upiId ||
      getUpiId();

    const payee =
      options.payeeName ||
      getPayeeName();

    const amount =
      Number(options.amount) || 0;

    const note =
      options.note ||
      "Hotel Payment";

    let url =
      "upi://pay" +
      "?pa=" +
      encodeURIComponent(upiId) +
      "&pn=" +
      encodeURIComponent(payee) +
      "&cu=INR";

    if (amount > 0) {
      url +=
        "&am=" +
        encodeURIComponent(
          amount.toFixed(2)
        );
    }

    if (note) {
      url +=
        "&tn=" +
        encodeURIComponent(note);
    }

    return url;
  }

  function create(container, options) {
    if (!container) return false;

    options = options || {};

    const amount =
      Number(options.amount) || 0;

    const upiId =
      options.upiId ||
      getUpiId();

    const payeeName =
      options.payeeName ||
      getPayeeName();

    const size =
      Number(options.size) || 220;

    container.innerHTML = "";

    if (
      typeof QRCode === "undefined"
    ) {
      container.innerHTML = `
        <div class="alert alert-warning">
          QR code library is not loaded.
          Please use UPI ID:
          <strong>
            ${HotelApp.escapeHtml(upiId)}
          </strong>
        </div>
      `;

      return false;
    }

    const upiUrl =
      buildUpiUrl({
        amount,
        upiId,
        payeeName,
        note:
          options.note ||
          "Hotel Payment"
      });

    new QRCode(container, {
      text: upiUrl,
      width: size,
      height: size,
      correctLevel:
        QRCode.CorrectLevel.M
    });

    return true;
  }

  function showPaymentQR(options) {
    options = options || {};

    const amount =
      Number(options.amount) || 0;

    if (amount <= 0) {
      HotelApp.showToast(
        "Invalid payment amount.",
        "error"
      );
      return;
    }

    HotelApp.openModal(
      "Scan & Pay",
      `
        <div class="qr-payment-box">

          <div class="qr-amount">
            Pay
            <strong>
              ₹${amount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </strong>
          </div>

          <div
            id="dynamicPaymentQr"
            class="qr-code"
          ></div>

          <div class="qr-details">

            <p>
              <strong>UPI ID:</strong>
              <span id="dynamicPaymentUpi">
                ${HotelApp.escapeHtml(
                  options.upiId ||
                  getUpiId()
                )}
              </span>
            </p>

            <p>
              <strong>Payee:</strong>
              ${HotelApp.escapeHtml(
                options.payeeName ||
                getPayeeName()
              )}
            </p>

            <p class="qr-note">
              UPI app se exact amount pay karein.
            </p>

          </div>

          <div class="form-actions">

            <button
              class="btn btn-secondary"
              onclick="HotelApp.closeModal()"
            >
              Close
            </button>

          </div>

        </div>
      `
    );

    const qrContainer =
      document.getElementById(
        "dynamicPaymentQr"
      );

    create(qrContainer, {
      amount,
      upiId:
        options.upiId ||
        getUpiId(),
      payeeName:
        options.payeeName ||
        getPayeeName(),
      note:
        options.note ||
        "Hotel Payment",
      size: 220
    });
  }

  function showOutstandingQR(invoice) {
    if (!invoice) return;

    const total =
      Number(invoice.total) || 0;

    const paid =
      Number(invoice.paidAmount) ||
      Number(invoice.paid) ||
      (
        Array.isArray(invoice.payments)
          ? invoice.payments.reduce(
              (sum, payment) =>
                sum +
                (Number(payment.amount) || 0),
              0
            )
          : 0
      );

    const outstanding =
      Math.max(
        0,
        total - paid
      );

    if (outstanding <= 0) {
      HotelApp.showToast(
        "This invoice has no outstanding amount.",
        "info"
      );
      return;
    }

    showPaymentQR({
      amount: outstanding,
      note:
        "Hotel Invoice " +
        (invoice.invoiceNumber ||
          invoice.id ||
          "")
    });
  }

  // Helper for restaurant payment
  function showRestaurantQR(order) {
    if (!order) return;

    const amount =
      Number(order.total) ||
      Number(order.grandTotal) ||
      Number(order.amount) ||
      0;

    if (amount <= 0) {
      HotelApp.showToast(
        "Invalid restaurant amount.",
        "error"
      );
      return;
    }

    showPaymentQR({
      amount,
      note:
        "Restaurant Order " +
        (order.orderNumber ||
          order.id ||
          "")
    });
  }

  window.HotelQR = {
    buildUpiUrl,
    create,
    showPaymentQR,
    showOutstandingQR,
    showRestaurantQR,
    getUpiId,
    getPayeeName
  };

})();