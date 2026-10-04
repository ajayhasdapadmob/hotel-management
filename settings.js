// js/settings.js

(function () {
  "use strict";

  const SETTINGS_KEY = "hotelSettings";

  const DEFAULT_SETTINGS = {
    hotelName: "My Hotel",
    hotelAddress: "",
    hotelPhone: "",
    hotelEmail: "",
    gstNumber: "",
    invoicePrefix: "INV",
    currency: "INR",
    defaultGst: 0,
    checkInTime: "12:00",
    checkOutTime: "11:00",
    receiptFooter:
      "Thank you for staying with us.",
    enableRestaurant: true,
    enableHousekeeping: true,
    enableGst: true
  };

  function getSettings() {
    return HotelApp.getStorage(
      SETTINGS_KEY,
      DEFAULT_SETTINGS
    );
  }

  function saveSettings(settings) {
    HotelApp.setStorage(
      SETTINGS_KEY,
      settings
    );
  }

  function value(id) {
    const element =
      document.getElementById(id);

    return element
      ? element.value.trim()
      : "";
  }

  function checked(id) {
    const element =
      document.getElementById(id);

    return element
      ? element.checked
      : false;
  }

  function setValue(id, val) {
    const element =
      document.getElementById(id);

    if (element) {
      element.value =
        val === undefined ||
        val === null
          ? ""
          : val;
    }
  }

  function setChecked(id, val) {
    const element =
      document.getElementById(id);

    if (element) {
      element.checked = Boolean(val);
    }
  }

  function save() {
    const settings = {
      hotelName:
        value("settingHotelName") ||
        DEFAULT_SETTINGS.hotelName,

      hotelAddress:
        value("settingHotelAddress"),

      hotelPhone:
        value("settingHotelPhone"),

      hotelEmail:
        value("settingHotelEmail"),

      gstNumber:
        value("settingGstNumber"),

      invoicePrefix:
        value("settingInvoicePrefix") ||
        DEFAULT_SETTINGS.invoicePrefix,

      currency:
        value("settingCurrency") ||
        DEFAULT_SETTINGS.currency,

      defaultGst:
        Number(
          value("settingDefaultGst")
        ) || 0,

      checkInTime:
        value("settingCheckInTime") ||
        DEFAULT_SETTINGS.checkInTime,

      checkOutTime:
        value("settingCheckOutTime") ||
        DEFAULT_SETTINGS.checkOutTime,

      receiptFooter:
        value("settingReceiptFooter"),

      enableRestaurant:
        checked("settingEnableRestaurant"),

      enableHousekeeping:
        checked("settingEnableHousekeeping"),

      enableGst:
        checked("settingEnableGst")
    };

    saveSettings(settings);

    HotelApp.showToast(
      "Settings saved successfully.",
      "success"
    );
  }

  function resetSettings() {
    const confirmed =
      window.confirm(
        "Reset all hotel settings to default?"
      );

    if (!confirmed) return;

    saveSettings({
      ...DEFAULT_SETTINGS
    });

    render(
      document.getElementById(
        "pageContainer"
      )
    );

    HotelApp.showToast(
      "Settings reset successfully.",
      "success"
    );
  }

  function clearDemoData() {
    const confirmed =
      window.confirm(
        "This will remove hotel demo data such as rooms, bookings, guests, invoices, restaurant orders and expenses. Continue?"
      );

    if (!confirmed) return;

    const keys = [
      "hotelRooms",
      "hotelBookings",
      "hotelGuests",
      "hotelInvoices",
      "restaurantOrders",
      "hotelExpenses",
      "hotelHousekeeping",
      "hotelRenewalRequests"
    ];

    keys.forEach(key => {
      localStorage.removeItem(key);
    });

    HotelApp.showToast(
      "Hotel data cleared.",
      "success"
    );

    setTimeout(() => {
      window.location.reload();
    }, 700);
  }

  function render(container) {
    if (!container) return;

    const settings = getSettings();

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>Settings</h2>
          <p>
            Manage hotel information, billing and software preferences.
          </p>
        </div>
      </div>

      <div class="card">

        <div class="card-header">
          <h3>Hotel Information</h3>
        </div>

        <div class="form-grid">

          <div class="form-group">
            <label>Hotel Name *</label>
            <input
              type="text"
              id="settingHotelName"
              value="${HotelApp.escapeHtml(
                settings.hotelName
              )}"
              placeholder="Hotel name"
            >
          </div>

          <div class="form-group">
            <label>Phone</label>
            <input
              type="text"
              id="settingHotelPhone"
              value="${HotelApp.escapeHtml(
                settings.hotelPhone
              )}"
              placeholder="Hotel phone number"
            >
          </div>

          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              id="settingHotelEmail"
              value="${HotelApp.escapeHtml(
                settings.hotelEmail
              )}"
              placeholder="Hotel email"
            >
          </div>

          <div class="form-group">
            <label>GST Number</label>
            <input
              type="text"
              id="settingGstNumber"
              value="${HotelApp.escapeHtml(
                settings.gstNumber
              )}"
              placeholder="GSTIN"
            >
          </div>

          <div class="form-group form-full">
            <label>Hotel Address</label>
            <textarea
              id="settingHotelAddress"
              rows="3"
              placeholder="Full hotel address"
            >${HotelApp.escapeHtml(
              settings.hotelAddress
            )}</textarea>
          </div>

        </div>

      </div>

      <div class="card">

        <div class="card-header">
          <h3>Billing & Invoice</h3>
        </div>

        <div class="form-grid">

          <div class="form-group">
            <label>Invoice Prefix</label>
            <input
              type="text"
              id="settingInvoicePrefix"
              value="${HotelApp.escapeHtml(
                settings.invoicePrefix
              )}"
              placeholder="INV"
            >
          </div>

          <div class="form-group">
            <label>Currency</label>
            <select id="settingCurrency">
              <option value="INR"
                ${
                  settings.currency === "INR"
                    ? "selected"
                    : ""
                }>
                INR (₹)
              </option>

              <option value="USD"
                ${
                  settings.currency === "USD"
                    ? "selected"
                    : ""
                }>
                USD ($)
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Default GST %</label>
            <input
              type="number"
              id="settingDefaultGst"
              min="0"
              max="100"
              step="0.01"
              value="${Number(
                settings.defaultGst || 0
              )}"
            >
          </div>

          <div class="form-group">
            <label>Receipt Footer</label>
            <input
              type="text"
              id="settingReceiptFooter"
              value="${HotelApp.escapeHtml(
                settings.receiptFooter
              )}"
              placeholder="Thank you..."
            >
          </div>

        </div>

      </div>

      <div class="card">

        <div class="card-header">
          <h3>Hotel Timing</h3>
        </div>

        <div class="form-grid">

          <div class="form-group">
            <label>Default Check-In Time</label>
            <input
              type="time"
              id="settingCheckInTime"
              value="${HotelApp.escapeHtml(
                settings.checkInTime
              )}"
            >
          </div>

          <div class="form-group">
            <label>Default Check-Out Time</label>
            <input
              type="time"
              id="settingCheckOutTime"
              value="${HotelApp.escapeHtml(
                settings.checkOutTime
              )}"
            >
          </div>

        </div>

      </div>

      <div class="card">

        <div class="card-header">
          <h3>Modules</h3>
        </div>

        <div class="settings-toggle-list">

          <label class="toggle-row">
            <span>
              <strong>Restaurant / POS</strong>
              <small>
                Enable restaurant billing and room food charges.
              </small>
            </span>

            <input
              type="checkbox"
              id="settingEnableRestaurant"
              ${
                settings.enableRestaurant
                  ? "checked"
                  : ""
              }
            >
          </label>

          <label class="toggle-row">
            <span>
              <strong>Housekeeping</strong>
              <small>
                Enable room cleaning and housekeeping management.
              </small>
            </span>

            <input
              type="checkbox"
              id="settingEnableHousekeeping"
              ${
                settings.enableHousekeeping
                  ? "checked"
                  : ""
              }
            >
          </label>

          <label class="toggle-row">
            <span>
              <strong>GST</strong>
              <small>
                Enable GST calculation in billing.
              </small>
            </span>

            <input
              type="checkbox"
              id="settingEnableGst"
              ${
                settings.enableGst
                  ? "checked"
                  : ""
              }
            >
          </label>

        </div>

      </div>

      <div class="card">

        <div class="card-header">
          <h3>Save Settings</h3>
        </div>

        <div class="form-actions">

          <button
            class="btn btn-primary"
            id="saveSettingsBtn"
          >
            Save Settings
          </button>

          <button
            class="btn btn-secondary"
            id="resetSettingsBtn"
          >
            Reset Settings
          </button>

        </div>

      </div>

      <div class="card danger-card">

        <div class="card-header">
          <h3>Data Management</h3>
        </div>

        <p>
          Demo/testing data remove karne ke liye neeche button use karein.
          License aur application settings delete nahi hongi.
        </p>

        <button
          class="btn btn-danger"
          id="clearDemoDataBtn"
        >
          Clear Hotel Demo Data
        </button>

      </div>
    `;

    document
      .getElementById("saveSettingsBtn")
      .addEventListener(
        "click",
        save
      );

    document
      .getElementById("resetSettingsBtn")
      .addEventListener(
        "click",
        resetSettings
      );

    document
      .getElementById("clearDemoDataBtn")
      .addEventListener(
        "click",
        clearDemoData
      );
  }

  window.Settings = {
    render,
    getSettings,
    saveSettings
  };

})();