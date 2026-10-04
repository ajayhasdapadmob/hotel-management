// js/renewal.js

(function () {
  "use strict";

  const UPI_ID = "9353689775@upi";
  const UPI_NAME = "Hotel Management";

  const PLANS = {
    monthly: {
      id: "monthly",
      name: "Monthly Plan",
      days: 30,
      amount: 299
    },
    yearly: {
      id: "yearly",
      name: "Yearly Plan",
      days: 365,
      amount: 1999
    }
  };

  function getQueryPlan() {
    const params =
      new URLSearchParams(window.location.search);

    return params.get("plan") || "monthly";
  }

  function getSelectedPlan() {
    const select =
      document.getElementById("renewalPlan");

    const id =
      select ? select.value : getQueryPlan();

    return PLANS[id] || PLANS.monthly;
  }

  function getLicense() {
    return HotelApp.getStorage(
      "hotelLicense",
      {
        licenseId: "DEMO-HOTEL-001",
        customerName: "",
        mobile: ""
      }
    );
  }

  function getRequests() {
    return HotelApp.getStorage(
      "hotelRenewalRequests",
      []
    );
  }

  function saveRequests(data) {
    HotelApp.setStorage(
      "hotelRenewalRequests",
      data
    );
  }

  function escape(value) {
    return HotelApp.escapeHtml(
      String(value || "")
    );
  }

  function showQR() {
    const plan = getSelectedPlan();

    const qrArea =
      document.getElementById("renewalQrArea");

    const qrContainer =
      document.getElementById("renewalQr");

    if (!qrArea || !qrContainer) return;

    qrContainer.innerHTML = "";

    if (
      typeof QRCode === "undefined"
    ) {
      qrContainer.innerHTML = `
        <div class="alert alert-warning">
          QR library could not be loaded.
          Please use the UPI ID:
          <strong>${UPI_ID}</strong>
        </div>
      `;

      qrArea.style.display = "block";
      return;
    }

    const upiUrl =
      "upi://pay" +
      "?pa=" +
      encodeURIComponent(UPI_ID) +
      "&pn=" +
      encodeURIComponent(UPI_NAME) +
      "&am=" +
      encodeURIComponent(
        plan.amount.toFixed(2)
      ) +
      "&cu=INR" +
      "&tn=" +
      encodeURIComponent(
        "Hotel Software Renewal - " +
        plan.name
      );

    new QRCode(qrContainer, {
      text: upiUrl,
      width: 220,
      height: 220,
      correctLevel: QRCode.CorrectLevel.M
    });

    document.getElementById(
      "renewalQrAmount"
    ).textContent =
      "₹" +
      plan.amount.toLocaleString("en-IN");

    document.getElementById(
      "renewalUpiId"
    ).textContent = UPI_ID;

    qrArea.style.display = "block";
  }

  function submitRenewal() {
    const customerName =
      document.getElementById(
        "customerName"
      ).value.trim();

    const customerMobile =
      document.getElementById(
        "customerMobile"
      ).value.trim();

    const licenseId =
      document.getElementById(
        "licenseId"
      ).value.trim();

    const plan =
      getSelectedPlan();

    const transactionId =
      document.getElementById(
        "transactionId"
      ).value.trim();

    const paymentDate =
      document.getElementById(
        "paymentDate"
      ).value;

    const paymentNote =
      document.getElementById(
        "paymentNote"
      ).value.trim();

    if (!customerName) {
      HotelApp.showToast(
        "Please enter customer name.",
        "error"
      );
      return;
    }

    if (!customerMobile) {
      HotelApp.showToast(
        "Please enter mobile number.",
        "error"
      );
      return;
    }

    if (!/^[0-9]{10}$/.test(
      customerMobile.replace(/\D/g, "")
    )) {
      HotelApp.showToast(
        "Please enter a valid 10 digit mobile number.",
        "error"
      );
      return;
    }

    if (!licenseId) {
      HotelApp.showToast(
        "Please enter License ID.",
        "error"
      );
      return;
    }

    if (!transactionId) {
      HotelApp.showToast(
        "Please enter UTR / Transaction ID.",
        "error"
      );
      return;
    }

    if (!paymentDate) {
      HotelApp.showToast(
        "Please select payment date.",
        "error"
      );
      return;
    }

    const request = {
      id: HotelApp.generateId("REN"),
      customerName,
      customerMobile,
      licenseId,
      plan: plan.id,
      planName: plan.name,
      amount: plan.amount,
      days: plan.days,
      transactionId,
      utr: transactionId,
      paymentDate,
      paymentNote,
      paymentMethod: "UPI",
      upiId: UPI_ID,
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    const requests =
      getRequests();

    requests.push(request);

    saveRequests(requests);

    // Current license/customer details save
    const license = getLicense();

    HotelApp.setStorage(
      "hotelLicense",
      {
        ...license,
        customerName,
        mobile: customerMobile,
        licenseId
      }
    );

    const result =
      document.getElementById(
        "renewalResult"
      );

    if (result) {
      result.innerHTML = `
        <div class="alert alert-success">

          <h3>
            Renewal Request Submitted
          </h3>

          <p>
            Your payment details have been submitted
            successfully.
          </p>

          <p>
            <strong>Request ID:</strong>
            ${escape(request.id)}
          </p>

          <p>
            <strong>Plan:</strong>
            ${escape(plan.name)}
          </p>

          <p>
            <strong>Amount:</strong>
            ₹${plan.amount.toLocaleString("en-IN")}
          </p>

          <p>
            <strong>UTR:</strong>
            ${escape(transactionId)}
          </p>

          <p>
            <strong>Status:</strong>
            Pending Verification
          </p>

          <hr>

          <p>
            Admin payment verify karne ke baad
            license activate/extend karega.
          </p>

          <button
            class="btn btn-primary"
            id="backDashboardBtn"
          >
            Back to Software
          </button>

        </div>
      `;

      document
        .getElementById(
          "backDashboardBtn"
        )
        .addEventListener(
          "click",
          function () {
            window.location.href =
              "./index.html";
          }
        );
    }

    HotelApp.showToast(
      "Renewal request submitted successfully.",
      "success"
    );

    // Form disable
    const submitButton =
      document.getElementById(
        "submitRenewalBtn"
      );

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent =
        "Request Submitted";
    }
  }

  function initialize() {
    const license =
      getLicense();

    const nameInput =
      document.getElementById(
        "customerName"
      );

    const mobileInput =
      document.getElementById(
        "customerMobile"
      );

    const licenseInput =
      document.getElementById(
        "licenseId"
      );

    const planSelect =
      document.getElementById(
        "renewalPlan"
      );

    if (nameInput && !nameInput.value) {
      nameInput.value =
        license.customerName || "";
    }

    if (
      mobileInput &&
      !mobileInput.value
    ) {
      mobileInput.value =
        license.mobile || "";
    }

    if (
      licenseInput &&
      !licenseInput.value
    ) {
      licenseInput.value =
        license.licenseId || "";
    }

    const queryPlan =
      getQueryPlan();

    if (
      planSelect &&
      PLANS[queryPlan]
    ) {
      planSelect.value =
        queryPlan;
    }

    const paymentDate =
      document.getElementById(
        "paymentDate"
      );

    if (paymentDate) {
      paymentDate.value =
        new Date()
          .toISOString()
          .slice(0, 10);
    }

    const plan =
      getSelectedPlan();

    const amountElement =
      document.getElementById(
        "renewalAmount"
      );

    if (amountElement) {
      amountElement.textContent =
        "₹" +
        plan.amount.toLocaleString("en-IN");
    }

    const upiElement =
      document.getElementById(
        "renewalUpiId"
      );

    if (upiElement) {
      upiElement.textContent =
        UPI_ID;
    }

    const qrButton =
      document.getElementById(
        "showRenewalQrBtn"
      );

    if (qrButton) {
      qrButton.addEventListener(
        "click",
        showQR
      );
    }

    if (planSelect) {
      planSelect.addEventListener(
        "change",
        function () {
          const selected =
            getSelectedPlan();

          if (amountElement) {
            amountElement.textContent =
              "₹" +
              selected.amount.toLocaleString(
                "en-IN"
              );
          }

          // QR ko hide kar do so that
          // new amount ka QR dobara generate ho
          const qrArea =
            document.getElementById(
              "renewalQrArea"
            );

          if (qrArea) {
            qrArea.style.display =
              "none";
          }
        }
      );
    }

    const submitButton =
      document.getElementById(
        "submitRenewalBtn"
      );

    if (submitButton) {
      submitButton.addEventListener(
        "click",
        submitRenewal
      );
    }
  }

  // Page load
  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initialize
    );
  } else {
    initialize();
  }

  window.Renewal = {
    showQR,
    submitRenewal,
    getSelectedPlan,
    PLANS
  };

})();