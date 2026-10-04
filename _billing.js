(function () {
  "use strict";

  const KEY_INVOICES = "hotelInvoices";
  const KEY_BOOKINGS = "hotelBookings";
  const KEY_GUESTS = "hotelGuests";
  const KEY_RESTAURANT = "restaurantOrders";

  function getInvoices() {
    return HotelApp.getStorage(KEY_INVOICES, []);
  }

  function saveInvoices(data) {
    HotelApp.setStorage(KEY_INVOICES, data);
  }

  function getBookings() {
    return HotelApp.getStorage(KEY_BOOKINGS, []);
  }

  function getGuests() {
    return HotelApp.getStorage(KEY_GUESTS, []);
  }

  function getRestaurantOrders() {
    return HotelApp.getStorage(KEY_RESTAURANT, []);
  }

  function money(value) {
    return HotelApp.formatCurrency(Number(value) || 0);
  }

  function safe(value) {
    return HotelApp.escapeHtml(
      value == null ? "" : String(value)
    );
  }

  function today() {
    return new Date().toISOString().split("T")[0];
  }

  function getInvoice(invoiceId) {
    return getInvoices().find(
      invoice => invoice.id === invoiceId
    );
  }

  function getBooking(bookingId) {
    return getBookings().find(
      booking => booking.id === bookingId
    );
  }

  function getGuest(guestId) {
    return getGuests().find(
      guest => guest.id === guestId
    );
  }

  function calculateInvoiceTotals(invoice) {
    const roomAmount =
      Number(invoice.roomAmount) || 0;

    const restaurantAmount =
      Number(invoice.restaurantAmount) || 0;

    const otherAmount =
      Number(invoice.otherAmount) || 0;

    const discount =
      Number(invoice.discount) || 0;

    const gst =
      Number(invoice.gst) || 0;

    invoice.subtotal =
      roomAmount +
      restaurantAmount +
      otherAmount;

    invoice.taxableAmount =
      Math.max(
        0,
        invoice.subtotal - discount
      );

    invoice.total =
      invoice.taxableAmount + gst;

    invoice.paidAmount =
      Number(invoice.paidAmount) || 0;

    invoice.balanceAmount =
      Math.max(
        0,
        invoice.total - invoice.paidAmount
      );

    invoice.status =
      invoice.balanceAmount <= 0
        ? "Paid"
        : "Pending";

    return invoice;
  }

  function syncRestaurantCharges(invoice) {
    const orders = getRestaurantOrders();

    const roomNumber =
      String(invoice.roomNumber || "");

    const bookingId =
      invoice.bookingId;

    let restaurantTotal = 0;

    orders.forEach(function (order) {

      const sameBooking =
        bookingId &&
        order.bookingId === bookingId;

      const sameRoom =
        roomNumber &&
        String(order.roomNumber || "") === roomNumber;

      if (!sameBooking && !sameRoom) {
        return;
      }

      /*
       * Sirf Room Charge / Unpaid orders
       * hotel invoice me add honge.
       *
       * Restaurant par paid order dobara
       * hotel invoice me nahi aayega.
       */

      const isRoomCharge =
        order.paymentType === "Room Charge" ||
        order.chargeToRoom === true ||
        order.status === "Room Charge";

      const isPaid =
        order.paymentStatus === "Paid" ||
        order.status === "Paid" ||
        order.paid === true;

      if (isRoomCharge && !isPaid) {
        restaurantTotal +=
          Number(
            order.total ||
            order.grandTotal ||
            order.amount ||
            0
          );
      }

    });

    invoice.restaurantAmount =
      restaurantTotal;

    calculateInvoiceTotals(invoice);

    return invoice;
  }

  function render(container) {
    let invoices = getInvoices();

    invoices = invoices.map(function (invoice) {
      syncRestaurantCharges(invoice);
      return invoice;
    });

    saveInvoices(invoices);

    const total =
      invoices.reduce(
        (sum, invoice) =>
          sum + Number(invoice.total || 0),
        0
      );

    const paid =
      invoices.reduce(
        (sum, invoice) =>
          sum + Number(invoice.paidAmount || 0),
        0
      );

    const outstanding =
      invoices.reduce(
        (sum, invoice) =>
          sum + Number(invoice.balanceAmount || 0),
        0
      );

    container.innerHTML = `
      <div class="page-header">

        <div>
          <h2>Billing & Invoices</h2>
          <p>
            Hotel room, restaurant charge,
            payments aur final invoice manage karein.
          </p>
        </div>

        <button
          class="btn btn-primary"
          onclick="Billing.refreshInvoices()"
        >
          Refresh
        </button>

      </div>

      <div class="stats-grid">

        <div class="stat-card">
          <div class="stat-label">
            Total Invoice Value
          </div>
          <div class="stat-value">
            ${money(total)}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">
            Total Paid
          </div>
          <div class="stat-value">
            ${money(paid)}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">
            Outstanding
          </div>
          <div class="stat-value">
            ${money(outstanding)}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">
            Invoices
          </div>
          <div class="stat-value">
            ${invoices.length}
          </div>
        </div>

      </div>

      <div class="card">

        <div class="toolbar">

          <input
            type="text"
            id="billingSearch"
            class="form-control"
            placeholder="Search invoice, guest, mobile, room..."
            oninput="Billing.filterInvoices()"
          />

          <select
            id="billingStatus"
            class="form-control"
            onchange="Billing.filterInvoices()"
          >
            <option value="">
              All Status
            </option>

            <option value="Paid">
              Paid
            </option>

            <option value="Pending">
              Pending
            </option>
          </select>

          <button
            class="btn btn-secondary"
            onclick="Billing.filterToday()"
          >
            Today's Invoices
          </button>

        </div>

        <div id="billingTableArea"></div>

      </div>
    `;

    renderTable(invoices);
  }

  function renderTable(invoices) {
    const area =
      document.getElementById(
        "billingTableArea"
      );

    if (!area) {
      return;
    }

    if (!invoices.length) {
      area.innerHTML = `
        <div class="empty-state">
          <h3>No invoices found</h3>
          <p>
            Booking create karte hi invoice automatically
            generate hota hai.
          </p>
        </div>
      `;

      return;
    }

    area.innerHTML = `
      <div class="table-responsive">

        <table class="data-table">

          <thead>
            <tr>
              <th>Invoice</th>
              <th>Guest</th>
              <th>Room</th>
              <th>Room</th>
              <th>Restaurant</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            ${invoices.map(function (invoice) {

              const statusClass =
                invoice.status === "Paid"
                  ? "success"
                  : "warning";

              return `
                <tr>

                  <td>
                    <strong>
                      ${safe(
                        invoice.invoiceNumber ||
                        invoice.id
                      )}
                    </strong>
                  </td>

                  <td>
                    ${safe(invoice.guestName)}
                  </td>

                  <td>
                    Room ${safe(invoice.roomNumber)}
                  </td>

                  <td>
                    ${money(invoice.roomAmount)}
                  </td>

                  <td>
                    ${money(invoice.restaurantAmount)}
                  </td>

                  <td>
                    <strong>
                      ${money(invoice.total)}
                    </strong>
                  </td>

                  <td>
                    ${money(invoice.paidAmount)}
                  </td>

                  <td>
                    ${money(invoice.balanceAmount)}
                  </td>

                  <td>
                    <span class="badge ${statusClass}">
                      ${safe(invoice.status)}
                    </span>
                  </td>

                  <td>

                    <div class="action-buttons">

                      <button
                        class="btn btn-sm btn-secondary"
                        onclick="Billing.viewInvoice('${invoice.id}')"
                      >
                        View
                      </button>

                      ${
                        Number(invoice.balanceAmount || 0) > 0
                          ? `
                            <button
                              class="btn btn-sm btn-primary"
                              onclick="Billing.addPayment('${invoice.id}')"
                            >
                              Pay
                            </button>
                          `
                          : ""
                      }

                      <button
                        class="btn btn-sm btn-secondary"
                        onclick="Billing.printInvoice('${invoice.id}')"
                      >
                        Print
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

  function filterInvoices() {
    const search =
      (
        document.getElementById(
          "billingSearch"
        )?.value || ""
      )
        .toLowerCase()
        .trim();

    const status =
      document.getElementById(
        "billingStatus"
      )?.value || "";

    const invoices = getInvoices();

    const filtered =
      invoices.filter(function (invoice) {

        const searchable = [
          invoice.id,
          invoice.invoiceNumber,
          invoice.guestName,
          invoice.roomNumber
        ]
          .join(" ")
          .toLowerCase();

        const searchMatch =
          !search ||
          searchable.includes(search);

        const statusMatch =
          !status ||
          invoice.status === status;

        return (
          searchMatch &&
          statusMatch
        );

      });

    renderTable(filtered);
  }

  function filterToday() {
    const invoices = getInvoices();

    const filtered =
      invoices.filter(function (invoice) {

        const date =
          invoice.createdAt
            ? invoice.createdAt
                .split("T")[0]
            : "";

        return date === today();

      });

    renderTable(filtered);
  }

  function refreshInvoices() {
    const invoices = getInvoices();

    invoices.forEach(function (invoice) {
      syncRestaurantCharges(invoice);
      calculateInvoiceTotals(invoice);
    });

    saveInvoices(invoices);

    render(
      document.getElementById(
        "pageContainer"
      )
    );

    HotelApp.showToast(
      "Invoices refresh ho gaye.",
      "success"
    );
  }

  function viewInvoice(invoiceId) {
    const invoices = getInvoices();

    const invoice =
      invoices.find(
        item => item.id === invoiceId
      );

    if (!invoice) {
      HotelApp.showToast(
        "Invoice nahi mili.",
        "error"
      );

      return;
    }

    syncRestaurantCharges(invoice);
    calculateInvoiceTotals(invoice);

    saveInvoices(invoices);

    const booking =
      getBooking(invoice.bookingId);

    const guest =
      getGuest(invoice.guestId);

    const payments =
      invoice.payments || [];

    HotelApp.openModal(
      "Invoice Details",
      `
        <div class="invoice-preview">

          <div class="invoice-header">

            <div>
              <h2>HOTEL INVOICE</h2>
              <p>
                Invoice:
                <strong>
                  ${safe(invoice.invoiceNumber)}
                </strong>
              </p>
            </div>

            <div>
              <strong>
                ${safe(invoice.status)}
              </strong>
            </div>

          </div>

          <hr>

          <div class="details-grid">

            <div>
              <strong>Guest</strong>
              <span>
                ${safe(
                  invoice.guestName ||
                  guest?.fullName ||
                  ""
                )}
              </span>
            </div>

            <div>
              <strong>Mobile</strong>
              <span>
                ${safe(guest?.mobile || "")}
              </span>
            </div>

            <div>
              <strong>Room</strong>
              <span>
                Room ${safe(invoice.roomNumber)}
              </span>
            </div>

            <div>
              <strong>Booking</strong>
              <span>
                ${safe(
                  booking?.bookingNumber || ""
                )}
              </span>
            </div>

            <div>
              <strong>Check-In</strong>
              <span>
                ${safe(
                  booking?.checkIn || ""
                )}
              </span>
            </div>

            <div>
              <strong>Check-Out</strong>
              <span>
                ${safe(
                  booking?.checkOut || ""
                )}
              </span>
            </div>

          </div>

          <br>

          <table class="data-table">

            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>Room Charges</td>
                <td>
                  ${money(invoice.roomAmount)}
                </td>
              </tr>

              <tr>
                <td>
                  Restaurant / Room Charges
                </td>
                <td>
                  ${money(
                    invoice.restaurantAmount
                  )}
                </td>
              </tr>

              ${
                Number(invoice.otherAmount || 0) > 0
                  ? `
                    <tr>
                      <td>Other Charges</td>
                      <td>
                        ${money(
                          invoice.otherAmount
                        )}
                      </td>
                    </tr>
                  `
                  : ""
              }

              ${
                Number(invoice.discount || 0) > 0
                  ? `
                    <tr>
                      <td>Discount</td>
                      <td>
                        -${money(
                          invoice.discount
                        )}
                      </td>
                    </tr>
                  `
                  : ""
              }

              ${
                Number(invoice.gst || 0) > 0
                  ? `
                    <tr>
                      <td>GST</td>
                      <td>
                        ${money(
                          invoice.gst
                        )}
                      </td>
                    </tr>
                  `
                  : ""
              }

              <tr>
                <td>
                  <strong>Total</strong>
                </td>
                <td>
                  <strong>
                    ${money(invoice.total)}
                  </strong>
                </td>
              </tr>

              <tr>
                <td>Paid</td>
                <td>
                  ${money(
                    invoice.paidAmount
                  )}
                </td>
              </tr>

              <tr>
                <td>
                  <strong>Outstanding</strong>
                </td>
                <td>
                  <strong>
                    ${money(
                      invoice.balanceAmount
                    )}
                  </strong>
                </td>
              </tr>

            </tbody>

          </table>

          <br>

          <h3>Payment History</h3>

          ${
            payments.length
              ? `
                <table class="data-table">

                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Note</th>
                    </tr>
                  </thead>

                  <tbody>

                    ${payments.map(
                      function (payment) {

                        return `
                          <tr>

                            <td>
                              ${safe(
                                payment.date
                                  ? payment.date
                                      .split("T")[0]
                                  : ""
                              )}
                            </td>

                            <td>
                              ${money(
                                payment.amount
                              )}
                            </td>

                            <td>
                              ${safe(
                                payment.method
                              )}
                            </td>

                            <td>
                              ${safe(
                                payment.note
                              )}
                            </td>

                          </tr>
                        `;

                      }
                    ).join("")}

                  </tbody>

                </table>
              `
              : `
                <p>
                  No payment recorded.
                </p>
              `
          }

        </div>

        <div class="form-actions">

          ${
            Number(invoice.balanceAmount || 0) > 0
              ? `
                <button
                  class="btn btn-primary"
                  onclick="Billing.addPayment('${invoice.id}')"
                >
                  Add Payment
                </button>
              `
              : ""
          }

          <button
            class="btn btn-secondary"
            onclick="Billing.printInvoice('${invoice.id}')"
          >
            Print Invoice
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

  function addPayment(invoiceId) {
    const invoice =
      getInvoice(invoiceId);

    if (!invoice) {
      HotelApp.showToast(
        "Invoice nahi mili.",
        "error"
      );

      return;
    }

    syncRestaurantCharges(invoice);
    calculateInvoiceTotals(invoice);

    const balance =
      Number(invoice.balanceAmount || 0);

    if (balance <= 0) {
      HotelApp.showToast(
        "Invoice already fully paid hai.",
        "info"
      );

      return;
    }

    HotelApp.openModal(
      "Add Payment",
      `
        <form id="billingPaymentForm">

          <div class="form-group">

            <label>
              Outstanding Amount
            </label>

            <input
              class="form-control"
              readonly
              value="${balance}"
            />

          </div>

          <div class="form-group">

            <label>
              Payment Amount *
            </label>

            <input
              type="number"
              id="billingPaymentAmount"
              class="form-control"
              min="1"
              max="${balance}"
              required
            />

          </div>

          <div class="form-group">

            <label>
              Payment Method *
            </label>

            <select
              id="billingPaymentMethod"
              class="form-control"
              required
            >

              <option value="Cash">
                Cash
              </option>

              <option value="UPI">
                UPI
              </option>

              <option value="Card">
                Card
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>

          <div class="form-group">

            <label>
              Payment Note
            </label>

            <input
              type="text"
              id="billingPaymentNote"
              class="form-control"
              placeholder="Optional"
            />

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
              Save Payment
            </button>

          </div>

        </form>
      `,
      {
        size: "medium"
      }
    );

    document
      .getElementById(
        "billingPaymentForm"
      )
      .addEventListener(
        "submit",
        function (event) {

          event.preventDefault();

          const amount =
            Number(
              document.getElementById(
                "billingPaymentAmount"
              ).value
            ) || 0;

          const method =
            document.getElementById(
              "billingPaymentMethod"
            ).value;

          const note =
            document.getElementById(
              "billingPaymentNote"
            ).value.trim();

          if (
            amount <= 0 ||
            amount > balance
          ) {
            HotelApp.showToast(
              "Payment amount invalid hai.",
              "error"
            );

            return;
          }

          invoice.paidAmount =
            Number(
              invoice.paidAmount || 0
            ) + amount;

          invoice.balanceAmount =
            Math.max(
              0,
              Number(invoice.total || 0) -
              invoice.paidAmount
            );

          invoice.status =
            invoice.balanceAmount <= 0
              ? "Paid"
              : "Pending";

          invoice.payments =
            invoice.payments || [];

          invoice.payments.push({
            id:
              HotelApp.generateId(
                "PAY"
              ),

            date:
              new Date().toISOString(),

            amount,
            method,

            note:
              note ||
              "Invoice payment"
          });

          invoice.updatedAt =
            new Date().toISOString();

          saveInvoices(
            getInvoices()
          );

          HotelApp.closeModal();

          HotelApp.showToast(
            "Payment invoice me successfully add ho gaya.",
            "success"
          );

          render(
            document.getElementById(
              "pageContainer"
            )
          );

        }
      );
  }

  function printInvoice(invoiceId) {
    const invoice =
      getInvoice(invoiceId);

    if (!invoice) {
      HotelApp.showToast(
        "Invoice nahi mili.",
        "error"
      );

      return;
    }

    syncRestaurantCharges(invoice);
    calculateInvoiceTotals(invoice);

    saveInvoices(
      getInvoices()
    );

    const booking =
      getBooking(invoice.bookingId);

    const guest =
      getGuest(invoice.guestId);

    /*
     * IMPORTANT:
     * Print invoice me QR code intentionally
     * nahi dikhaya ja raha.
     */

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=900,height=700"
      );

    if (!printWindow) {
      HotelApp.showToast(
        "Popup blocked hai. Browser me popup allow karein.",
        "error"
      );

      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>

      <html>

      <head>

        <title>
          ${safe(invoice.invoiceNumber)}
        </title>

        <style>

          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            color: #222;
          }

          .invoice {
            max-width: 800px;
            margin: auto;
          }

          h1, h2, h3 {
            margin-bottom: 6px;
          }

          .header {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #222;
            padding-bottom: 15px;
          }

          .details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin: 20px 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th, td {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: left;
          }

          th {
            background: #f5f5f5;
          }

          .total {
            font-size: 18px;
            font-weight: bold;
          }

          .footer {
            margin-top: 30px;
            text-align: center;
          }

          @media print {

            body {
              padding: 0;
            }

          }

        </style>

      </head>

      <body>

        <div class="invoice">

          <div class="header">

            <div>

              <h1>HOTEL INVOICE</h1>

              <div>
                Invoice:
                <strong>
                  ${safe(invoice.invoiceNumber)}
                </strong>
              </div>

            </div>

            <div>
              <strong>
                ${safe(invoice.status)}
              </strong>
            </div>

          </div>

          <div class="details">

            <div>
              <strong>Guest:</strong><br>
              ${safe(
                invoice.guestName ||
                guest?.fullName ||
                ""
              )}
            </div>

            <div>
              <strong>Mobile:</strong><br>
              ${safe(
                guest?.mobile || ""
              )}
            </div>

            <div>
              <strong>Room:</strong><br>
              ${safe(
                invoice.roomNumber
              )}
            </div>

            <div>
              <strong>Booking:</strong><br>
              ${safe(
                booking?.bookingNumber || ""
              )}
            </div>

            <div>
              <strong>Check-In:</strong><br>
              ${safe(
                booking?.checkIn || ""
              )}
            </div>

            <div>
              <strong>Check-Out:</strong><br>
              ${safe(
                booking?.checkOut || ""
              )}
            </div>

          </div>

          <table>

            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>Room Charges</td>
                <td>
                  ${money(invoice.roomAmount)}
                </td>
              </tr>

              <tr>
                <td>
                  Restaurant Charges
                </td>
                <td>
                  ${money(
                    invoice.restaurantAmount
                  )}
                </td>
              </tr>

              <tr>
                <td>
                  Other Charges
                </td>
                <td>
                  ${money(
                    invoice.otherAmount
                  )}
                </td>
              </tr>

              <tr>
                <td>
                  Discount
                </td>
                <td>
                  -${money(
                    invoice.discount
                  )}
                </td>
              </tr>

              <tr>
                <td>
                  GST
                </td>
                <td>
                  ${money(invoice.gst)}
                </td>
              </tr>

              <tr class="total">
                <td>
                  Total
                </td>
                <td>
                  ${money(invoice.total)}
                </td>
              </tr>

              <tr>
                <td>
                  Paid
                </td>
                <td>
                  ${money(
                    invoice.paidAmount
                  )}
                </td>
              </tr>

              <tr class="total">
                <td>
                  Outstanding
                </td>
                <td>
                  ${money(
                    invoice.balanceAmount
                  )}
                </td>
              </tr>

            </tbody>

          </table>

          <div class="footer">

            <p>
              Thank you for staying with us.
            </p>

          </div>

        </div>

        <script>
          window.onload = function () {
            window.print();
          };
        <\/script>

      </body>

      </html>
    `);

    printWindow.document.close();
  }

  window.Billing = {
    render,
    filterInvoices,
    filterToday,
    refreshInvoices,
    viewInvoice,
    addPayment,
    printInvoice
  };

})();