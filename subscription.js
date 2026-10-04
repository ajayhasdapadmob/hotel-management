// js/subscription.js

(function () {
  "use strict";

  const PLANS = [
    {
      id: "monthly",
      name: "Monthly Plan",
      days: 30,
      price: 299
    },
    {
      id: "yearly",
      name: "Yearly Plan",
      days: 365,
      price: 1999
    }
  ];

  function getLicense() {
    return HotelApp.getStorage("hotelLicense", {
      licenseId: "DEMO-HOTEL-001",
      customerName: "Demo Hotel",
      mobile: "",
      status: "Active",
      startDate: new Date().toISOString(),
      expiryDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString()
    });
  }

  function saveLicense(license) {
    HotelApp.setStorage("hotelLicense", license);
  }

  function getRenewalRequests() {
    return HotelApp.getStorage(
      "hotelRenewalRequests",
      []
    );
  }

  function getDaysRemaining(expiryDate) {
    const expiry = new Date(expiryDate);
    const now = new Date();

    const diff =
      expiry.getTime() - now.getTime();

    return Math.ceil(
      diff / (1000 * 60 * 60 * 24)
    );
  }

  function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function getStatus(license) {
    if (!license || !license.expiryDate) {
      return "Unknown";
    }

    const days =
      getDaysRemaining(license.expiryDate);

    if (days < 0) return "Expired";
    if (days <= 7) return "Expiring Soon";

    return "Active";
  }

  function statusClass(status) {
    if (status === "Active") {
      return "status-success";
    }

    if (status === "Expiring Soon") {
      return "status-warning";
    }

    if (status === "Expired") {
      return "status-danger";
    }

    return "status-secondary";
  }

  function openRenewal() {
    window.location.href = "./renewal.html";
  }

  function render(container) {
    if (!container) return;

    const license = getLicense();

    const status =
      getStatus(license);

    const daysRemaining =
      getDaysRemaining(
        license.expiryDate
      );

    const requests =
      getRenewalRequests();

    const pendingRequests =
      requests.filter(
        request =>
          request.status === "Pending"
      );

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>Subscription & License</h2>
          <p>
            Manage your hotel software license and renewal.
          </p>
        </div>

        <button
          class="btn btn-primary"
          id="renewNowBtn"
        >
          Renew Online
        </button>
      </div>

      ${
        status === "Expired"
          ? `
            <div class="alert alert-danger">
              <strong>Software License Expired.</strong>
              Please renew your subscription to continue using
              the software.
            </div>
          `
          : status === "Expiring Soon"
          ? `
            <div class="alert alert-warning">
              <strong>License Expiring Soon.</strong>
              Only ${Math.max(
                0,
                daysRemaining
              )} day(s) remaining.
            </div>
          `
          : ""
      }

      <div class="stats-grid">

        <div class="stat-card">
          <div class="stat-label">
            License Status
          </div>

          <div class="stat-value">
            <span class="status-badge ${statusClass(
              status
            )}">
              ${HotelApp.escapeHtml(status)}
            </span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">
            Days Remaining
          </div>

          <div class="stat-value">
            ${Math.max(0, daysRemaining)}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">
            License ID
          </div>

          <div class="stat-value">
            ${HotelApp.escapeHtml(
              license.licenseId || "—"
            )}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">
            Expiry Date
          </div>

          <div class="stat-value">
            ${formatDate(
              license.expiryDate
            )}
          </div>
        </div>

      </div>

      <div class="card">
        <div class="card-header">
          <h3>Current License</h3>
        </div>

        <div class="summary-list">

          <div class="summary-row">
            <span>Customer</span>
            <strong>
              ${HotelApp.escapeHtml(
                license.customerName ||
                "—"
              )}
            </strong>
          </div>

          <div class="summary-row">
            <span>Mobile</span>
            <strong>
              ${HotelApp.escapeHtml(
                license.mobile || "—"
              )}
            </strong>
          </div>

          <div class="summary-row">
            <span>License ID</span>
            <strong>
              ${HotelApp.escapeHtml(
                license.licenseId || "—"
              )}
            </strong>
          </div>

          <div class="summary-row">
            <span>Start Date</span>
            <strong>
              ${formatDate(
                license.startDate
              )}
            </strong>
          </div>

          <div class="summary-row">
            <span>Expiry Date</span>
            <strong>
              ${formatDate(
                license.expiryDate
              )}
            </strong>
          </div>

        </div>
      </div>

      <div class="card">

        <div class="card-header">
          <h3>Renewal Plans</h3>
        </div>

        <div class="plans-grid">

          ${PLANS.map(
            plan => `
              <div class="plan-card">

                <h3>
                  ${HotelApp.escapeHtml(
                    plan.name
                  )}
                </h3>

                <div class="plan-price">
                  ₹${plan.price}
                </div>

                <p>
                  Valid for ${plan.days} days
                </p>

                <button
                  class="btn btn-primary"
                  data-plan="${plan.id}"
                >
                  Select Plan
                </button>

              </div>
            `
          ).join("")}

        </div>

      </div>

      <div class="card">

        <div class="card-header">
          <h3>Online Renewal Process</h3>
        </div>

        <div class="steps-list">

          <div class="step-item">
            <strong>1. Select Plan</strong>
            <span>
              Choose monthly or yearly renewal.
            </span>
          </div>

          <div class="step-item">
            <strong>2. Pay by UPI</strong>
            <span>
              Pay using the displayed QR code or UPI ID.
            </span>
          </div>

          <div class="step-item">
            <strong>3. Enter UTR</strong>
            <span>
              Submit your UTR / transaction ID.
            </span>
          </div>

          <div class="step-item">
            <strong>4. Verification</strong>
            <span>
              Admin verifies the payment.
            </span>
          </div>

          <div class="step-item">
            <strong>5. Activation</strong>
            <span>
              License expiry is extended after verification.
            </span>
          </div>

        </div>

        <button
          class="btn btn-primary"
          id="renewProcessBtn"
        >
          Start Renewal
        </button>

      </div>

      <div class="card">

        <div class="card-header">
          <h3>Renewal Requests</h3>

          ${
            pendingRequests.length
              ? `
                <span class="status-badge status-warning">
                  ${pendingRequests.length} Pending
                </span>
              `
              : ""
          }
        </div>

        ${
          requests.length
            ? `
              <div class="table-responsive">
                <table class="data-table">

                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Plan</th>
                      <th>Amount</th>
                      <th>UTR</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    ${requests
                      .slice()
                      .reverse()
                      .map(
                        request => `
                          <tr>

                            <td>
                              ${formatDate(
                                request.createdAt
                              )}
                            </td>

                            <td>
                              ${HotelApp.escapeHtml(
                                request.planName ||
                                request.plan ||
                                "—"
                              )}
                            </td>

                            <td>
                              ₹${Number(
                                request.amount || 0
                              ).toLocaleString("en-IN")}
                            </td>

                            <td>
                              ${HotelApp.escapeHtml(
                                request.transactionId ||
                                request.utr ||
                                "—"
                              )}
                            </td>

                            <td>
                              <span class="status-badge ${statusClass(
                                request.status ===
                                  "Approved"
                                  ? "Active"
                                  : request.status ===
                                    "Rejected"
                                  ? "Expired"
                                  : "Expiring Soon"
                              )}">
                                ${HotelApp.escapeHtml(
                                  request.status ||
                                  "Pending"
                                )}
                              </span>
                            </td>

                          </tr>
                        `
                      )
                      .join("")}
                  </tbody>

                </table>
              </div>
            `
            : `
              <div class="empty-state">
                <h3>No Renewal Requests</h3>
                <p>
                  Your renewal requests will appear here.
                </p>
              </div>
            `
        }

      </div>
    `;

    document
      .getElementById("renewNowBtn")
      .addEventListener(
        "click",
        openRenewal
      );

    document
      .getElementById("renewProcessBtn")
      .addEventListener(
        "click",
        openRenewal
      );

    document
      .querySelectorAll("[data-plan]")
      .forEach(button => {
        button.addEventListener(
          "click",
          function () {
            const planId =
              this.dataset.plan;

            window.location.href =
              "./renewal.html?plan=" +
              encodeURIComponent(planId);
          }
        );
      });
  }

  window.Subscription = {
    render,
    getLicense,
    saveLicense,
    getStatus,
    PLANS
  };

})();