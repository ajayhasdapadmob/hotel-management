(function () {
  "use strict";

  const KEY_GUESTS = "hotelGuests";
  const KEY_BOOKINGS = "hotelBookings";
  const KEY_INVOICES = "hotelInvoices";

  function getGuests() {
    return HotelApp.getStorage(KEY_GUESTS, []);
  }

  function saveGuests(data) {
    HotelApp.setStorage(KEY_GUESTS, data);
  }

  function getBookings() {
    return HotelApp.getStorage(KEY_BOOKINGS, []);
  }

  function getInvoices() {
    return HotelApp.getStorage(KEY_INVOICES, []);
  }

  function money(value) {
    return HotelApp.formatCurrency(Number(value) || 0);
  }

  function safe(value) {
    return HotelApp.escapeHtml(
      value == null ? "" : String(value)
    );
  }

  function generateId(prefix) {
    return HotelApp.generateId(prefix);
  }

  function getGuest(guestId) {
    return getGuests().find(function (guest) {
      return guest.id === guestId;
    });
  }

  function render(container) {
    const guests = getGuests();

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>Guests / KYC</h2>
          <p>Guest details, KYC aur booking history manage karein.</p>
        </div>

        <button
          class="btn btn-primary"
          onclick="Guests.showGuestForm()"
        >
          + New Guest
        </button>
      </div>

      <div class="stats-grid">

        <div class="stat-card">
          <div class="stat-label">Total Guests</div>
          <div class="stat-value">${guests.length}</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">With Mobile</div>
          <div class="stat-value">
            ${guests.filter(g => g.mobile).length}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">KYC Complete</div>
          <div class="stat-value">
            ${
              guests.filter(
                g =>
                  g.fullName &&
                  g.mobile &&
                  g.idType &&
                  g.idNumber &&
                  g.address
              ).length
            }
          </div>
        </div>

      </div>

      <div class="card">

        <div class="toolbar">

          <input
            type="text"
            id="guestSearch"
            class="form-control"
            placeholder="Search name, mobile, ID number..."
            oninput="Guests.filterGuests()"
          />

          <button
            class="btn btn-secondary"
            onclick="Guests.showGuestForm()"
          >
            + Add Guest
          </button>

        </div>

        <div id="guestTableArea"></div>

      </div>
    `;

    renderTable(guests);
  }

  function renderTable(guests) {
    const area =
      document.getElementById("guestTableArea");

    if (!area) {
      return;
    }

    if (!guests.length) {
      area.innerHTML = `
        <div class="empty-state">
          <h3>No guests found</h3>
          <p>New Guest button se guest add karein.</p>
        </div>
      `;
      return;
    }

    area.innerHTML = `
      <div class="table-responsive">

        <table class="data-table">

          <thead>
            <tr>
              <th>Guest</th>
              <th>Mobile</th>
              <th>ID Type</th>
              <th>ID Number</th>
              <th>Address</th>
              <th>Bookings</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            ${guests.map(function (guest) {

              const bookings =
                getBookings().filter(
                  booking =>
                    booking.guestId === guest.id
                );

              return `
                <tr>

                  <td>
                    <strong>
                      ${safe(
                        guest.fullName ||
                        guest.name
                      )}
                    </strong>
                  </td>

                  <td>
                    ${safe(guest.mobile)}
                  </td>

                  <td>
                    ${safe(guest.idType)}
                  </td>

                  <td>
                    ${safe(guest.idNumber)}
                  </td>

                  <td>
                    ${safe(guest.address)}
                  </td>

                  <td>
                    ${bookings.length}
                  </td>

                  <td>

                    <div class="action-buttons">

                      <button
                        class="btn btn-sm btn-secondary"
                        onclick="Guests.viewGuest('${guest.id}')"
                      >
                        View
                      </button>

                      <button
                        class="btn btn-sm btn-primary"
                        onclick="Guests.editGuest('${guest.id}')"
                      >
                        Edit
                      </button>

                    </div>

                  </td>

                </tr>
              `;

            }).join("")}

          </tbody>

        </table>

      </div>
    `;
  }

  function filterGuests() {
    const search =
      (
        document.getElementById("guestSearch")?.value ||
        ""
      )
        .toLowerCase()
        .trim();

    const guests = getGuests();

    const filtered = guests.filter(function (guest) {

      const searchable = [
        guest.id,
        guest.fullName,
        guest.name,
        guest.mobile,
        guest.idType,
        guest.idNumber,
        guest.address
      ]
        .join(" ")
        .toLowerCase();

      return !search ||
        searchable.includes(search);
    });

    renderTable(filtered);
  }

  function showGuestForm(guestId) {
    const existing =
      guestId ? getGuest(guestId) : null;

    const isEdit = !!existing;

    HotelApp.openModal(
      isEdit ? "Edit Guest / KYC" : "New Guest / KYC",
      `
        <form id="guestForm">

          <div class="form-section">

            <h3>Guest Details</h3>

            <div class="form-grid">

              <div class="form-group">

                <label>Full Name *</label>

                <input
                  type="text"
                  id="guestFullName"
                  class="form-control"
                  required
                  value="${safe(
                    existing?.fullName ||
                    existing?.name ||
                    ""
                  )}"
                />

              </div>

              <div class="form-group">

                <label>Mobile Number *</label>

                <input
                  type="tel"
                  id="guestMobile"
                  class="form-control"
                  required
                  maxlength="15"
                  value="${safe(
                    existing?.mobile || ""
                  )}"
                />

              </div>

              <div class="form-group">

                <label>ID Type *</label>

                <select
                  id="guestIdType"
                  class="form-control"
                  required
                >

                  <option value="">
                    Select ID Type
                  </option>

                  <option value="Aadhaar">
                    Aadhaar
                  </option>

                  <option value="Passport">
                    Passport
                  </option>

                  <option value="Driving Licence">
                    Driving Licence
                  </option>

                  <option value="Voter ID">
                    Voter ID
                  </option>

                  <option value="PAN">
                    PAN
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

              <div class="form-group">

                <label>ID Number *</label>

                <input
                  type="text"
                  id="guestIdNumber"
                  class="form-control"
                  required
                  value="${safe(
                    existing?.idNumber || ""
                  )}"
                />

              </div>

              <div class="form-group full-width">

                <label>Full Address *</label>

                <textarea
                  id="guestAddress"
                  class="form-control"
                  rows="4"
                  required
                >${safe(
                  existing?.address || ""
                )}</textarea>

              </div>

            </div>

          </div>

          <div class="form-actions">

            <button
              type="button"
              class="btn btn-secondary"
              onclick="HotelApp.closeModal()"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="btn btn-primary"
            >
              ${isEdit ? "Update Guest" : "Save Guest"}
            </button>

          </div>

        </form>
      `,
      {
        size: "large"
      }
    );

    const idType =
      document.getElementById("guestIdType");

    if (idType && existing) {
      idType.value =
        existing.idType || "";
    }

    document
      .getElementById("guestForm")
      .addEventListener(
        "submit",
        function (event) {
          event.preventDefault();

          saveGuest(
            guestId || null
          );
        }
      );
  }

  function saveGuest(guestId) {
    const fullName =
      document
        .getElementById("guestFullName")
        .value
        .trim();

    const mobile =
      document
        .getElementById("guestMobile")
        .value
        .trim();

    const idType =
      document.getElementById(
        "guestIdType"
      ).value;

    const idNumber =
      document
        .getElementById("guestIdNumber")
        .value
        .trim();

    const address =
      document
        .getElementById("guestAddress")
        .value
        .trim();

    if (
      !fullName ||
      !mobile ||
      !idType ||
      !idNumber ||
      !address
    ) {
      HotelApp.showToast(
        "Please sabhi KYC fields complete karein.",
        "error"
      );

      return;
    }

    const guests = getGuests();

    /*
     * Same mobile number wale guest ko
     * duplicate create hone se rokna.
     */

    const duplicate =
      guests.find(function (guest) {

        return (
          guest.mobile === mobile &&
          guest.id !== guestId
        );

      });

    if (duplicate) {

      HotelApp.showToast(
        "Is mobile number se guest already registered hai.",
        "error"
      );

      return;
    }

    if (guestId) {

      const guest =
        guests.find(
          item => item.id === guestId
        );

      if (!guest) {
        HotelApp.showToast(
          "Guest nahi mila.",
          "error"
        );

        return;
      }

      guest.fullName = fullName;
      guest.name = fullName;
      guest.mobile = mobile;
      guest.idType = idType;
      guest.idNumber = idNumber;
      guest.address = address;
      guest.updatedAt =
        new Date().toISOString();

      saveGuests(guests);

      HotelApp.closeModal();

      HotelApp.showToast(
        "Guest details update ho gayi.",
        "success"
      );

    } else {

      const guest = {

        id: generateId("GST"),

        fullName,
        name: fullName,
        mobile,

        idType,
        idNumber,
        address,

        city: "",
        state: "",
        country: "India",

        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString()

      };

      guests.push(guest);

      saveGuests(guests);

      HotelApp.closeModal();

      HotelApp.showToast(
        "New Guest successfully add ho gaya.",
        "success"
      );
    }

    render(
      document.getElementById(
        "pageContainer"
      )
    );
  }

  function viewGuest(guestId) {
    const guest =
      getGuest(guestId);

    if (!guest) {
      HotelApp.showToast(
        "Guest nahi mila.",
        "error"
      );

      return;
    }

    const bookings =
      getBookings().filter(
        booking =>
          booking.guestId === guest.id
      );

    const invoices =
      getInvoices().filter(
        invoice =>
          invoice.guestId === guest.id
      );

    const totalSpent =
      invoices.reduce(
        function (sum, invoice) {
          return (
            sum +
            Number(invoice.total || 0)
          );
        },
        0
      );

    const totalPaid =
      invoices.reduce(
        function (sum, invoice) {
          return (
            sum +
            Number(invoice.paidAmount || 0)
          );
        },
        0
      );

    HotelApp.openModal(
      "Guest Details",
      `
        <div class="details-grid">

          <div>
            <strong>Full Name</strong>
            <span>
              ${safe(
                guest.fullName ||
                guest.name
              )}
            </span>
          </div>

          <div>
            <strong>Mobile</strong>
            <span>
              ${safe(guest.mobile)}
            </span>
          </div>

          <div>
            <strong>ID Type</strong>
            <span>
              ${safe(guest.idType)}
            </span>
          </div>

          <div>
            <strong>ID Number</strong>
            <span>
              ${safe(guest.idNumber)}
            </span>
          </div>

          <div class="full-width">
            <strong>Full Address</strong>
            <span>
              ${safe(guest.address)}
            </span>
          </div>

          <div>
            <strong>Total Bookings</strong>
            <span>
              ${bookings.length}
            </span>
          </div>

          <div>
            <strong>Total Hotel Value</strong>
            <span>
              ${money(totalSpent)}
            </span>
          </div>

          <div>
            <strong>Total Paid</strong>
            <span>
              ${money(totalPaid)}
            </span>
          </div>

        </div>

        <hr>

        <h3>Booking History</h3>

        ${
          bookings.length
            ? `
              <div class="table-responsive">

                <table class="data-table">

                  <thead>
                    <tr>
                      <th>Booking</th>
                      <th>Room</th>
                      <th>Check-In</th>
                      <th>Check-Out</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    ${bookings.map(
                      function (booking) {

                        return `
                          <tr>

                            <td>
                              ${safe(
                                booking.bookingNumber
                              )}
                            </td>

                            <td>
                              Room ${safe(
                                booking.roomNumber
                              )}
                            </td>

                            <td>
                              ${safe(
                                booking.checkIn
                              )}
                            </td>

                            <td>
                              ${safe(
                                booking.checkOut
                              )}
                            </td>

                            <td>
                              ${money(
                                booking.roomAmount
                              )}
                            </td>

                            <td>
                              ${safe(
                                booking.status
                              )}
                            </td>

                          </tr>
                        `;

                      }
                    ).join("")}

                  </tbody>

                </table>

              </div>
            `
            : `
              <div class="empty-state">
                <p>
                  Is guest ki abhi koi booking nahi hai.
                </p>
              </div>
            `
        }

        <div class="form-actions">

          <button
            class="btn btn-primary"
            onclick="Guests.editGuest('${guest.id}')"
          >
            Edit Guest
          </button>

          <button
            class="btn btn-secondary"
            onclick="HotelApp.closeModal()"
          >
            Close
          </button>

        </div>
      `,
      {
        size: "large"
      }
    );
  }

  function editGuest(guestId) {
    HotelApp.closeModal();

    setTimeout(function () {
      showGuestForm(guestId);
    }, 100);
  }

  window.Guests = {
    render,
    showGuestForm,
    filterGuests,
    viewGuest,
    editGuest
  };

})();