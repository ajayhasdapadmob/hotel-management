// js/reports.js

(function () {
  "use strict";

  const containerId = "pageContainer";

  function getData(key) {
    return HotelApp.getStorage(key, []);
  }

  function toDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function money(value) {
    return HotelApp.formatCurrency(Number(value) || 0);
  }

  function getDateValue(item) {
    return (
      item.date ||
      item.createdAt ||
      item.checkIn ||
      item.checkInDate ||
      item.paymentDate ||
      item.updatedAt ||
      null
    );
  }

  function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function endOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  function getRange(type, customFrom, customTo) {
    const today = startOfDay(new Date());
    let from = new Date(today);
    let to = endOfDay(new Date(today));

    if (type === "yesterday") {
      from.setDate(from.getDate() - 1);
      to = endOfDay(from);
    }

    if (type === "last7") {
      from.setDate(from.getDate() - 6);
    }

    if (type === "thisMonth") {
      from = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
    }

    if (type === "last2Months") {
      from = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );
    }

    if (type === "custom") {
      if (customFrom) {
        from = startOfDay(new Date(customFrom));
      }

      if (customTo) {
        to = endOfDay(new Date(customTo));
      }
    }

    return { from, to };
  }

  function inRange(value, range) {
    const date = toDate(value);
    if (!date) return false;

    return (
      date >= range.from &&
      date <= range.to
    );
  }

  function getInvoiceTotal(invoice) {
    if (invoice.total !== undefined) {
      return Number(invoice.total) || 0;
    }

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

    return (
      roomAmount +
      restaurantAmount +
      otherAmount -
      discount +
      gst
    );
  }

  function getInvoicePaid(invoice) {
    if (invoice.paidAmount !== undefined) {
      return Number(invoice.paidAmount) || 0;
    }

    if (invoice.paid !== undefined) {
      return Number(invoice.paid) || 0;
    }

    if (Array.isArray(invoice.payments)) {
      return invoice.payments.reduce(
        (sum, payment) =>
          sum + (Number(payment.amount) || 0),
        0
      );
    }

    return 0;
  }

  function getExpenseAmount(expense) {
    return (
      Number(expense.amount) ||
      Number(expense.total) ||
      0
    );
  }

  function getRestaurantAmount(order) {
    return (
      Number(order.total) ||
      Number(order.grandTotal) ||
      Number(order.amount) ||
      0
    );
  }

  function render(container) {
    if (!container) return;

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>Reports</h2>
          <p>
            View income, expenses, GST, outstanding and payment details.
          </p>
        </div>
      </div>

      <div class="filter-bar">

        <div class="form-group">
          <label>Report Period</label>

          <select id="reportPeriod">
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7">Last 7 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="last2Months">Last 2 Months</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <div class="form-group" id="customFromGroup" style="display:none;">
          <label>From Date</label>
          <input type="date" id="reportFrom">
        </div>

        <div class="form-group" id="customToGroup" style="display:none;">
          <label>To Date</label>
          <input type="date" id="reportTo">
        </div>

        <div class="form-group">
          <label>&nbsp;</label>
          <button class="btn btn-primary" id="generateReportBtn">
            Generate Report
          </button>
        </div>

      </div>

      <div id="reportContent"></div>
    `;

    const period =
      document.getElementById("reportPeriod");

    const fromGroup =
      document.getElementById("customFromGroup");

    const toGroup =
      document.getElementById("customToGroup");

    period.addEventListener("change", function () {
      const custom = this.value === "custom";

      fromGroup.style.display =
        custom ? "block" : "none";

      toGroup.style.display =
        custom ? "block" : "none";
    });

    document
      .getElementById("generateReportBtn")
      .addEventListener("click", generate);

    generate();
  }

  function generate() {
    const period =
      document.getElementById("reportPeriod").value;

    const customFrom =
      document.getElementById("reportFrom").value;

    const customTo =
      document.getElementById("reportTo").value;

    if (
      period === "custom" &&
      (!customFrom || !customTo)
    ) {
      HotelApp.showToast(
        "Please select both From and To dates.",
        "error"
      );
      return;
    }

    const range = getRange(
      period,
      customFrom,
      customTo
    );

    if (range.from > range.to) {
      HotelApp.showToast(
        "From date cannot be after To date.",
        "error"
      );
      return;
    }

    const bookings =
      getData("hotelBookings");

    const invoices =
      getData("hotelInvoices");

    const orders =
      getData("restaurantOrders");

    const expenses =
      getData("hotelExpenses");

    const guests =
      getData("hotelGuests");

    const filteredInvoices =
      invoices.filter(invoice =>
        inRange(getDateValue(invoice), range)
      );

    const filteredOrders =
      orders.filter(order =>
        inRange(getDateValue(order), range)
      );

    const filteredExpenses =
      expenses.filter(expense =>
        inRange(getDateValue(expense), range)
      );

    const filteredBookings =
      bookings.filter(booking =>
        inRange(getDateValue(booking), range)
      );

    const filteredGuests =
      guests.filter(guest =>
        inRange(getDateValue(guest), range)
      );

    let roomRevenue = 0;
    let restaurantRevenue = 0;
    let gst = 0;
    let outstanding = 0;
    let incoming = 0;

    filteredInvoices.forEach(invoice => {
      const total =
        getInvoiceTotal(invoice);

      const paid =
        getInvoicePaid(invoice);

      roomRevenue +=
        Number(invoice.roomAmount) || 0;

      restaurantRevenue +=
        Number(invoice.restaurantAmount) || 0;

      gst +=
        Number(invoice.gst) || 0;

      incoming += paid;

      outstanding += Math.max(
        0,
        total - paid
      );
    });

    // Direct restaurant payments
    filteredOrders.forEach(order => {
      if (
        order.paymentStatus === "Paid" &&
        !order.chargeToRoom
      ) {
        restaurantRevenue +=
          getRestaurantAmount(order);
      }
    });

    const outgoing =
      filteredExpenses.reduce(
        (sum, expense) =>
          sum + getExpenseAmount(expense),
        0
      );

    const net =
      incoming - outgoing;

    renderReport({
      range,
      filteredBookings,
      filteredGuests,
      filteredInvoices,
      filteredOrders,
      filteredExpenses,
      roomRevenue,
      restaurantRevenue,
      gst,
      incoming,
      outgoing,
      net,
      outstanding
    });
  }

  function renderReport(data) {
    const reportContent =
      document.getElementById("reportContent");

    const fromText =
      data.range.from.toLocaleDateString("en-IN");

    const toText =
      data.range.to.toLocaleDateString("en-IN");

    reportContent.innerHTML = `

      <div class="alert alert-info">
        Report Period:
        <strong>${fromText}</strong>
        to
        <strong>${toText}</strong>
      </div>

      <div class="stats-grid">

        <div class="stat-card">
          <div class="stat-label">Incoming</div>
          <div class="stat-value">
            ${money(data.incoming)}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Outgoing</div>
          <div class="stat-value">
            ${money(data.outgoing)}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Net</div>
          <div class="stat-value">
            ${money(data.net)}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Outstanding</div>
          <div class="stat-value">
            ${money(data.outstanding)}
          </div>
        </div>

      </div>

      <div class="stats-grid">

        <div class="stat-card">
          <div class="stat-label">Room Revenue</div>
          <div class="stat-value">
            ${money(data.roomRevenue)}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Restaurant Revenue</div>
          <div class="stat-value">
            ${money(data.restaurantRevenue)}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">GST</div>
          <div class="stat-value">
            ${money(data.gst)}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Bookings</div>
          <div class="stat-value">
            ${data.filteredBookings.length}
          </div>
        </div>

      </div>

      <div class="card">
        <div class="card-header">
          <h3>Payment / Income Details</h3>
        </div>

        ${
          data.filteredInvoices.length
            ? `
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Paid</th>
                      <th>Balance</th>
                    </tr>
                  </thead>

                  <tbody>
                    ${data.filteredInvoices
                      .map(invoice => {
                        const total =
                          getInvoiceTotal(invoice);

                        const paid =
                          getInvoicePaid(invoice);

                        const balance =
                          Math.max(
                            0,
                            total - paid
                          );

                        return `
                          <tr>
                            <td>
                              ${HotelApp.escapeHtml(
                                invoice.invoiceNumber ||
                                invoice.id ||
                                "—"
                              )}
                            </td>

                            <td>
                              ${toDate(
                                getDateValue(invoice)
                              )?.toLocaleDateString(
                                "en-IN"
                              ) || "—"}
                            </td>

                            <td>${money(total)}</td>
                            <td>${money(paid)}</td>
                            <td>${money(balance)}</td>
                          </tr>
                        `;
                      })
                      .join("")}
                  </tbody>
                </table>
              </div>
            `
            : `
              <div class="empty-state">
                No invoice/payment records found.
              </div>
            `
        }
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Expense / Outgoing Details</h3>
        </div>

        ${
          data.filteredExpenses.length
            ? `
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    ${data.filteredExpenses
                      .map(expense => `
                        <tr>
                          <td>
                            ${toDate(
                              getDateValue(expense)
                            )?.toLocaleDateString(
                              "en-IN"
                            ) || "—"}
                          </td>

                          <td>
                            ${HotelApp.escapeHtml(
                              expense.category ||
                              "General"
                            )}
                          </td>

                          <td>
                            ${HotelApp.escapeHtml(
                              expense.description ||
                              expense.note ||
                              "—"
                            )}
                          </td>

                          <td>
                            ${money(
                              getExpenseAmount(
                                expense
                              )
                            )}
                          </td>
                        </tr>
                      `)
                      .join("")}
                  </tbody>
                </table>
              </div>
            `
            : `
              <div class="empty-state">
                No expense records found.
              </div>
            `
        }
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Restaurant Summary</h3>
        </div>

        <div class="summary-list">

          <div class="summary-row">
            <span>Total Orders</span>
            <strong>
              ${data.filteredOrders.length}
            </strong>
          </div>

          <div class="summary-row">
            <span>Restaurant Revenue</span>
            <strong>
              ${money(data.restaurantRevenue)}
            </strong>
          </div>

          <div class="summary-row">
            <span>Room Charged Orders</span>
            <strong>
              ${
                data.filteredOrders.filter(
                  order => order.chargeToRoom
                ).length
              }
            </strong>
          </div>

          <div class="summary-row">
            <span>Direct Paid Orders</span>
            <strong>
              ${
                data.filteredOrders.filter(
                  order =>
                    order.paymentStatus === "Paid" &&
                    !order.chargeToRoom
                ).length
              }
            </strong>
          </div>

        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Quick Summary</h3>
        </div>

        <div class="summary-list">

          <div class="summary-row">
            <span>Total Guests Added</span>
            <strong>
              ${data.filteredGuests.length}
            </strong>
          </div>

          <div class="summary-row">
            <span>Total Bookings</span>
            <strong>
              ${data.filteredBookings.length}
            </strong>
          </div>

          <div class="summary-row">
            <span>Total Invoices</span>
            <strong>
              ${data.filteredInvoices.length}
            </strong>
          </div>

          <div class="summary-row">
            <span>Total Expenses</span>
            <strong>
              ${data.filteredExpenses.length}
            </strong>
          </div>

        </div>
      </div>

    `;
  }

  window.Reports = {
    render
  };

})();