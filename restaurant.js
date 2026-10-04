(function () {
  "use strict";

  const KEY_ORDERS = "restaurantOrders";
  const KEY_ROOMS = "hotelRooms";
  const KEY_BOOKINGS = "hotelBookings";
  const KEY_INVOICES = "hotelInvoices";

  function getOrders() {
    return HotelApp.getStorage(KEY_ORDERS, []);
  }

  function saveOrders(data) {
    HotelApp.setStorage(KEY_ORDERS, data);
  }

  function getRooms() {
    return HotelApp.getStorage(KEY_ROOMS, []);
  }

  function getBookings() {
    return HotelApp.getStorage(KEY_BOOKINGS, []);
  }

  function getInvoices() {
    return HotelApp.getStorage(KEY_INVOICES, []);
  }

  function saveInvoices(data) {
    HotelApp.setStorage(KEY_INVOICES, data);
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

  function getActiveBookings() {
    return getBookings().filter(function (booking) {
      return (
        booking.status === "Booked" ||
        booking.status === "Checked-In"
      );
    });
  }

  function findBookingForRoom(roomNumber) {
    const bookings = getActiveBookings();

    return bookings.find(function (booking) {
      return String(booking.roomNumber) ===
        String(roomNumber);
    });
  }

  function calculateTotal(items) {
    return items.reduce(function (sum, item) {
      return (
        sum +
        Number(item.amount || 0)
      );
    }, 0);
  }

  function render(container) {
    const orders = getOrders();

    const todayOrders =
      orders.filter(function (order) {
        return (
          order.createdAt &&
          order.createdAt.split("T")[0] === today()
        );
      });

    const todaySales =
      todayOrders.reduce(function (sum, order) {
        return (
          sum +
          Number(order.total || 0)
        );
      }, 0);

    const unpaidRoomCharges =
      orders.filter(function (order) {
        return (
          order.chargeToRoom === true &&
          order.paymentStatus !== "Paid"
        );
      });

    const outstandingRoomCharges =
      unpaidRoomCharges.reduce(
        function (sum, order) {
          return (
            sum +
            Number(order.total || 0)
          );
        },
        0
      );

    container.innerHTML = `
      <div class="page-header">

        <div>
          <h2>Restaurant / POS</h2>
          <p>
            Restaurant order, direct payment aur
            room charge manage karein.
          </p>
        </div>

        <button
          class="btn btn-primary"
          onclick="Restaurant.showOrderForm()"
        >
          + New Order
        </button>

      </div>

      <div class="stats-grid">

        <div class="stat-card">
          <div class="stat-label">
            Today's Orders
          </div>

          <div class="stat-value">
            ${todayOrders.length}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">
            Today's Sales
          </div>

          <div class="stat-value">
            ${money(todaySales)}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">
            Room Charges
          </div>

          <div class="stat-value">
            ${money(outstandingRoomCharges)}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">
            Total Orders
          </div>

          <div class="stat-value">
            ${orders.length}
          </div>
        </div>

      </div>

      <div class="card">

        <div class="toolbar">

          <input
            type="text"
            id="restaurantSearch"
            class="form-control"
            placeholder="Search order, room, guest..."
            oninput="Restaurant.filterOrders()"
          />

          <select
            id="restaurantPaymentFilter"
            class="form-control"
            onchange="Restaurant.filterOrders()"
          >

            <option value="">
              All Payment Types
            </option>

            <option value="Paid">
              Paid
            </option>

            <option value="Room Charge">
              Room Charge
            </option>

            <option value="Pending">
              Pending
            </option>

          </select>

        </div>

        <div id="restaurantTableArea"></div>

      </div>
    `;

    renderTable(orders);
  }

  function renderTable(orders) {
    const area =
      document.getElementById(
        "restaurantTableArea"
      );

    if (!area) {
      return;
    }

    if (!orders.length) {
      area.innerHTML = `
        <div class="empty-state">

          <h3>No restaurant orders</h3>

          <p>
            New Order button se restaurant order create karein.
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
              <th>Order</th>
              <th>Room / Guest</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Action</th>
            </tr>

          </thead>

          <tbody>

            ${orders.map(function (order) {

              const paymentLabel =
                order.chargeToRoom
                  ? "Room Charge"
                  : order.paymentMethod || "Paid";

              const paymentStatus =
                order.paymentStatus || "Paid";

              const statusClass =
                paymentStatus === "Paid"
                  ? "success"
                  : "warning";

              return `
                <tr>

                  <td>
                    <strong>
                      ${safe(
                        order.orderNumber ||
                        order.id
                      )}
                    </strong>

                    <br>

                    <small>
                      ${
                        order.createdAt
                          ? safe(
                              order.createdAt
                                .replace("T", " ")
                                .substring(0, 16)
                            )
                          : ""
                      }
                    </small>
                  </td>

                  <td>

                    ${
                      order.roomNumber
                        ? `
                          <strong>
                            Room ${safe(
                              order.roomNumber
                            )}
                          </strong>
                        `
                        : "Walk-in"
                    }

                    ${
                      order.guestName
                        ? `
                          <br>
                          <small>
                            ${safe(
                              order.guestName
                            )}
                          </small>
                        `
                        : ""
                    }

                  </td>

                  <td>
                    ${
                      order.items
                        ? order.items.length
                        : 0
                    }
                    item(s)
                  </td>

                  <td>
                    <strong>
                      ${money(order.total)}
                    </strong>
                  </td>

                  <td>
                    ${safe(paymentLabel)}
                  </td>

                  <td>

                    <span class="badge ${statusClass}">
                      ${safe(paymentStatus)}
                    </span>

                  </td>

                  <td>

                    <div class="action-buttons">

                      <button
                        class="btn btn-sm btn-secondary"
                        onclick="Restaurant.viewOrder('${order.id}')"
                      >
                        View
                      </button>

                      ${
                        order.chargeToRoom &&
                        paymentStatus !== "Paid"
                          ? `
                            <button
                              class="btn btn-sm btn-primary"
                              onclick="Restaurant.payRoomCharge('${order.id}')"
                            >
                              Pay
                            </button>
                          `
                          : ""
                      }

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

  function filterOrders() {
    const search =
      (
        document.getElementById(
          "restaurantSearch"
        )?.value || ""
      )
        .toLowerCase()
        .trim();

    const payment =
      document.getElementById(
        "restaurantPaymentFilter"
      )?.value || "";

    const orders = getOrders();

    const filtered =
      orders.filter(function (order) {

        const searchable = [
          order.id,
          order.orderNumber,
          order.roomNumber,
          order.guestName
        ]
          .join(" ")
          .toLowerCase();

        const searchMatch =
          !search ||
          searchable.includes(search);

        const paymentStatus =
          order.chargeToRoom
            ? (
                order.paymentStatus === "Paid"
                  ? "Paid"
                  : "Room Charge"
              )
            : (
                order.paymentStatus || "Paid"
              );

        const paymentMatch =
          !payment ||
          paymentStatus === payment;

        return (
          searchMatch &&
          paymentMatch
        );
      });

    renderTable(filtered);
  }

  function showOrderForm() {
    const rooms = getRooms();

    const activeBookings =
      getActiveBookings();

    HotelApp.openModal(
      "New Restaurant Order",
      `
        <form id="restaurantOrderForm">

          <div class="form-section">

            <h3>Order Details</h3>

            <div class="form-grid">

              <div class="form-group">

                <label>Order Type</label>

                <select
                  id="restaurantOrderType"
                  class="form-control"
                  onchange="Restaurant.updateOrderCustomerFields()"
                >

                  <option value="Walk-in">
                    Walk-in
                  </option>

                  <option value="Room">
                    Hotel Guest / Room
                  </option>

                </select>

              </div>

              <div
                class="form-group"
                id="restaurantRoomGroup"
                style="display:none;"
              >

                <label>Room *</label>

                <select
                  id="restaurantRoom"
                  class="form-control"
                  onchange="Restaurant.loadRoomGuest()"
                >

                  <option value="">
                    Select Room
                  </option>

                  ${rooms.map(function (room) {

                    const booking =
                      activeBookings.find(
                        b =>
                          String(b.roomNumber) ===
                          String(room.number)
                      );

                    return `
                      <option
                        value="${safe(room.number)}"
                        data-booking-id="${
                          booking
                            ? safe(booking.id)
                            : ""
                        }"
                        data-guest-name="${
                          booking
                            ? safe(booking.guestName)
                            : ""
                        }"
                      >
                        Room ${safe(
                          room.number
                        )}
                        ${
                          booking
                            ? " - " +
                              safe(
                                booking.guestName
                              )
                            : ""
                        }
                      </option>
                    `;

                  }).join("")}

                </select>

              </div>

              <div
                class="form-group"
                id="restaurantGuestGroup"
                style="display:none;"
              >

                <label>Guest Name</label>

                <input
                  id="restaurantGuestName"
                  class="form-control"
                  readonly
                />

              </div>

            </div>

          </div>

          <div class="form-section">

            <h3>Food Items</h3>

            <div
              id="restaurantItems"
            ></div>

            <button
              type="button"
              class="btn btn-secondary"
              onclick="Restaurant.addItemRow()"
            >
              + Add Item
            </button>

          </div>

          <div class="form-section">

            <h3>Payment</h3>

            <div class="form-grid">

              <div class="form-group">

                <label>Payment Type *</label>

                <select
                  id="restaurantPaymentType"
                  class="form-control"
                  onchange="Restaurant.updatePaymentFields()"
                >

                  <option value="Paid">
                    Pay Now
                  </option>

                  <option value="Room Charge">
                    Charge to Room
                  </option>

                </select>

              </div>

              <div
                class="form-group"
                id="restaurantPaymentMethodGroup"
              >

                <label>Payment Method</label>

                <select
                  id="restaurantPaymentMethod"
                  class="form-control"
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

                <label>Total</label>

                <input
                  type="number"
                  id="restaurantTotal"
                  class="form-control"
                  readonly
                  value="0"
                />

              </div>

            </div>

            <div id="restaurantPaymentInfo"></div>

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
              Create Order
            </button>

          </div>

        </form>
      `,
      {
        size: "large"
      }
    );

    addItemRow();

    document
      .getElementById(
        "restaurantOrderForm"
      )
      .addEventListener(
        "submit",
        function (event) {

          event.preventDefault();

          saveOrder();

        }
      );
  }

  function updateOrderCustomerFields() {
    const type =
      document.getElementById(
        "restaurantOrderType"
      )?.value;

    const roomGroup =
      document.getElementById(
        "restaurantRoomGroup"
      );

    const guestGroup =
      document.getElementById(
        "restaurantGuestGroup"
      );

    if (!roomGroup || !guestGroup) {
      return;
    }

    if (type === "Room") {

      roomGroup.style.display =
        "block";

      guestGroup.style.display =
        "block";

    } else {

      roomGroup.style.display =
        "none";

      guestGroup.style.display =
        "none";

      document.getElementById(
        "restaurantGuestName"
      ).value = "";

    }
  }

  function loadRoomGuest() {
    const room =
      document.getElementById(
        "restaurantRoom"
      );

    const guest =
      document.getElementById(
        "restaurantGuestName"
      );

    if (!room || !guest) {
      return;
    }

    const selected =
      room.options[
        room.selectedIndex
      ];

    guest.value =
      selected?.dataset?.guestName ||
      "";

    const paymentType =
      document.getElementById(
        "restaurantPaymentType"
      );

    if (
      paymentType &&
      guest.value
    ) {
      paymentType.value =
        "Room Charge";

      updatePaymentFields();
    }
  }

  function addItemRow() {
    const container =
      document.getElementById(
        "restaurantItems"
      );

    if (!container) {
      return;
    }

    const rowId =
      "food_" +
      Date.now() +
      "_" +
      Math.random()
        .toString(36)
        .substring(2, 7);

    const row =
      document.createElement(
        "div"
      );

    row.className =
      "form-grid restaurant-item-row";

    row.dataset.rowId =
      rowId;

    row.innerHTML = `

      <div class="form-group">

        <label>Item</label>

        <input
          type="text"
          class="form-control food-item-name"
          placeholder="e.g. Veg Thali"
          required
        />

      </div>

      <div class="form-group">

        <label>Qty</label>

        <input
          type="number"
          class="form-control food-item-qty"
          min="1"
          value="1"
          required
          oninput="Restaurant.calculateOrderTotal()"
        />

      </div>

      <div class="form-group">

        <label>Rate</label>

        <input
          type="number"
          class="form-control food-item-rate"
          min="0"
          value="0"
          required
          oninput="Restaurant.calculateOrderTotal()"
        />

      </div>

      <div class="form-group">

        <label>Amount</label>

        <input
          type="number"
          class="form-control food-item-amount"
          readonly
          value="0"
        />

      </div>

      <div class="form-group">

        <label>&nbsp;</label>

        <button
          type="button"
          class="btn btn-danger"
          onclick="Restaurant.removeItemRow('${rowId}')"
        >
          Remove
        </button>

      </div>

    `;

    container.appendChild(row);

    calculateOrderTotal();
  }

  function removeItemRow(rowId) {
    const row =
      document.querySelector(
        '[data-row-id="' +
        rowId +
        '"]'
      );

    if (row) {
      row.remove();
    }

    calculateOrderTotal();
  }

  function calculateOrderTotal() {
    const rows =
      document.querySelectorAll(
        ".restaurant-item-row"
      );

    let total = 0;

    rows.forEach(function (row) {

      const qty =
        Number(
          row.querySelector(
            ".food-item-qty"
          )?.value
        ) || 0;

      const rate =
        Number(
          row.querySelector(
            ".food-item-rate"
          )?.value
        ) || 0;

      const amount =
        qty * rate;

      const amountInput =
        row.querySelector(
          ".food-item-amount"
        );

      if (amountInput) {
        amountInput.value =
          amount;
      }

      total += amount;

    });

    const totalInput =
      document.getElementById(
        "restaurantTotal"
      );

    if (totalInput) {
      totalInput.value =
        total;
    }

    updatePaymentFields();
  }

  function updatePaymentFields() {
    const paymentType =
      document.getElementById(
        "restaurantPaymentType"
      )?.value;

    const methodGroup =
      document.getElementById(
        "restaurantPaymentMethodGroup"
      );

    const info =
      document.getElementById(
        "restaurantPaymentInfo"
      );

    if (!methodGroup || !info) {
      return;
    }

    if (paymentType === "Room Charge") {

      methodGroup.style.display =
        "none";

      info.innerHTML = `
        <div class="alert alert-warning">
          Ye amount guest ke room par charge hoga
          aur final hotel invoice me automatically add hoga.
        </div>
      `;

    } else {

      methodGroup.style.display =
        "block";

      info.innerHTML = `
        <div class="alert alert-success">
          Payment restaurant par receive maana jayega.
          Ye amount hotel invoice me outstanding nahi banega.
        </div>
      `;

    }
  }

  function saveOrder() {
    const orderType =
      document.getElementById(
        "restaurantOrderType"
      ).value;

    const roomNumber =
      document.getElementById(
        "restaurantRoom"
      )?.value || "";

    const guestName =
      document.getElementById(
        "restaurantGuestName"
      )?.value || "";

    const paymentType =
      document.getElementById(
        "restaurantPaymentType"
      ).value;

    const paymentMethod =
      document.getElementById(
        "restaurantPaymentMethod"
      ).value;

    const rows =
      document.querySelectorAll(
        ".restaurant-item-row"
      );

    const items = [];

    rows.forEach(function (row) {

      const name =
        row.querySelector(
          ".food-item-name"
        )?.value.trim();

      const qty =
        Number(
          row.querySelector(
            ".food-item-qty"
          )?.value
        ) || 0;

      const rate =
        Number(
          row.querySelector(
            ".food-item-rate"
          )?.value
        ) || 0;

      if (name && qty > 0) {

        items.push({
          name,
          quantity: qty,
          rate,
          amount: qty * rate
        });

      }

    });

    if (!items.length) {
      HotelApp.showToast(
        "Kam se kam ek food item add karein.",
        "error"
      );

      return;
    }

    if (
      orderType === "Room" &&
      !roomNumber
    ) {
      HotelApp.showToast(
        "Room select karein.",
        "error"
      );

      return;
    }

    if (
      paymentType === "Room Charge" &&
      orderType !== "Room"
    ) {
      HotelApp.showToast(
        "Room Charge ke liye hotel room select karna zaroori hai.",
        "error"
      );

      return;
    }

    const total =
      calculateTotal(items);

    if (total <= 0) {
      HotelApp.showToast(
        "Order total zero nahi ho sakta.",
        "error"
      );

      return;
    }

    const orders =
      getOrders();

    const order = {

      id:
        HotelApp.generateId(
          "ORD"
        ),

      orderNumber:
        "ORD-" +
        new Date().getFullYear() +
        "-" +
        String(
          orders.length + 1
        ).padStart(4, "0"),

      orderType,

      roomNumber:
        roomNumber || "",

      guestName:
        guestName || "",

      items,

      total,

      chargeToRoom:
        paymentType === "Room Charge",

      paymentType,

      paymentMethod:
        paymentType === "Paid"
          ? paymentMethod
          : "",

      paymentStatus:
        paymentType === "Paid"
          ? "Paid"
          : "Pending",

      status:
        paymentType === "Paid"
          ? "Paid"
          : "Room Charge",

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()

    };

    /*
     * Room booking ID attach karna.
     * Isse billing invoice ke saath
     * exact restaurant order link rahega.
     */

    if (roomNumber) {

      const booking =
        findBookingForRoom(
          roomNumber
        );

      if (booking) {
        order.bookingId =
          booking.id;
      }

    }

    orders.push(order);

    saveOrders(orders);

    /*
     * Room Charge hai to exact hotel invoice
     * me amount automatically add karo.
     *
     * Restaurant par paid hai to invoice me
     * amount add nahi hoga.
     */

    if (
      order.chargeToRoom &&
      order.bookingId
    ) {

      addRoomChargeToInvoice(
        order
      );

    }

    HotelApp.closeModal();

    HotelApp.showToast(
      paymentType === "Room Charge"
        ? "Restaurant order room invoice me charge ho gaya."
        : "Restaurant payment successfully received.",
      "success"
    );

    render(
      document.getElementById(
        "pageContainer"
      )
    );
  }

  function addRoomChargeToInvoice(order) {
    const invoices =
      getInvoices();

    let invoice =
      invoices.find(function (item) {

        return (
          item.bookingId ===
          order.bookingId
        );

      });

    if (!invoice) {
      return;
    }

    /*
     * Existing room-charge restaurant
     * orders ko dobara count nahi karna.
     */

    const alreadyIncluded =
      invoice.restaurantOrderIds || [];

    if (
      alreadyIncluded.includes(
        order.id
      )
    ) {
      return;
    }

    invoice.restaurantOrderIds =
      alreadyIncluded.concat(
        order.id
      );

    invoice.restaurantAmount =
      Number(
        invoice.restaurantAmount || 0
      ) +
      Number(order.total || 0);

    invoice.subtotal =
      Number(invoice.roomAmount || 0) +
      Number(invoice.restaurantAmount || 0) +
      Number(invoice.otherAmount || 0);

    invoice.taxableAmount =
      Math.max(
        0,
        invoice.subtotal -
        Number(invoice.discount || 0)
      );

    invoice.total =
      invoice.taxableAmount +
      Number(invoice.gst || 0);

    invoice.balanceAmount =
      Math.max(
        0,
        invoice.total -
        Number(invoice.paidAmount || 0)
      );

    invoice.status =
      invoice.balanceAmount <= 0
        ? "Paid"
        : "Pending";

    invoice.items =
      invoice.items || [];

    invoice.items.push({
      type: "restaurant",
      description:
        "Restaurant Order " +
        order.orderNumber,
      quantity: 1,
      rate: Number(order.total || 0),
      amount: Number(order.total || 0)
    });

    invoice.updatedAt =
      new Date().toISOString();

    saveInvoices(invoices);
  }

  function viewOrder(orderId) {
    const order =
      getOrders().find(
        item => item.id === orderId
      );

    if (!order) {
      HotelApp.showToast(
        "Order nahi mila.",
        "error"
      );

      return;
    }

    HotelApp.openModal(
      "Restaurant Order",
      `
        <div class="details-grid">

          <div>
            <strong>Order Number</strong>
            <span>
              ${safe(
                order.orderNumber
              )}
            </span>
          </div>

          <div>
            <strong>Room</strong>
            <span>
              ${
                order.roomNumber
                  ? "Room " +
                    safe(
                      order.roomNumber
                    )
                  : "Walk-in"
              }
            </span>
          </div>

          <div>
            <strong>Guest</strong>
            <span>
              ${safe(
                order.guestName ||
                "-"
              )}
            </span>
          </div>

          <div>
            <strong>Payment</strong>
            <span>
              ${safe(
                order.chargeToRoom
                  ? "Room Charge"
                  : order.paymentMethod
              )}
            </span>
          </div>

        </div>

        <br>

        <table class="data-table">

          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>

            ${(
              order.items || []
            ).map(function (item) {

              return `
                <tr>

                  <td>
                    ${safe(item.name)}
                  </td>

                  <td>
                    ${safe(
                      item.quantity
                    )}
                  </td>

                  <td>
                    ${money(item.rate)}
                  </td>

                  <td>
                    ${money(item.amount)}
                  </td>

                </tr>
              `;

            }).join("")}

            <tr>

              <td colspan="3">
                <strong>Total</strong>
              </td>

              <td>
                <strong>
                  ${money(order.total)}
                </strong>
              </td>

            </tr>

          </tbody>

        </table>

        <div class="form-actions">

          ${
            order.chargeToRoom &&
            order.paymentStatus !== "Paid"
              ? `
                <button
                  class="btn btn-primary"
                  onclick="Restaurant.payRoomCharge('${order.id}')"
                >
                  Receive Payment
                </button>
              `
              : ""
          }

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

  function payRoomCharge(orderId) {
    const orders =
      getOrders();

    const order =
      orders.find(
        item => item.id === orderId
      );

    if (!order) {
      return;
    }

    if (
      !order.chargeToRoom
    ) {
      return;
    }

    const total =
      Number(order.total || 0);

    HotelApp.openModal(
      "Receive Restaurant Payment",
      `
        <form id="restaurantPayForm">

          <div class="form-group">

            <label>
              Amount
            </label>

            <input
              type="number"
              id="restaurantPayAmount"
              class="form-control"
              readonly
              value="${total}"
            />

          </div>

          <div class="form-group">

            <label>
              Payment Method
            </label>

            <select
              id="restaurantPayMethod"
              class="form-control"
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
              Note
            </label>

            <input
              type="text"
              id="restaurantPayNote"
              class="form-control"
              placeholder="Optional"
            />

          </div>

          <div class="alert alert-warning">
            Payment receive karne par restaurant
            order Paid ho jayega aur hotel invoice
            me ye amount outstanding nahi rahega.
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
              Mark Paid
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
        "restaurantPayForm"
      )
      .addEventListener(
        "submit",
        function (event) {

          event.preventDefault();

          const method =
            document.getElementById(
              "restaurantPayMethod"
            ).value;

          const note =
            document.getElementById(
              "restaurantPayNote"
            ).value.trim();

          order.paymentStatus =
            "Paid";

          order.status =
            "Paid";

          order.paymentMethod =
            method;

          order.paidAt =
            new Date().toISOString();

          order.paymentNote =
            note || "Restaurant payment";

          order.updatedAt =
            new Date().toISOString();

          /*
           * Restaurant par payment mil gaya.
           *
           * IMPORTANT:
           * Hotel invoice me is order ka amount
           * outstanding nahi rehna chahiye.
           *
           * Isliye invoice se is restaurant
           * charge ko remove kiya ja raha hai.
           */

          removeRoomChargeFromInvoice(
            order
          );

          saveOrders(orders);

          HotelApp.closeModal();

          HotelApp.showToast(
            "Restaurant payment receive ho gaya.",
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

  function removeRoomChargeFromInvoice(order) {
    if (!order.bookingId) {
      return;
    }

    const invoices =
      getInvoices();

    const invoice =
      invoices.find(
        item =>
          item.bookingId ===
          order.bookingId
      );

    if (!invoice) {
      return;
    }

    invoice.restaurantOrderIds =
      invoice.restaurantOrderIds || [];

    invoice.restaurantOrderIds =
      invoice.restaurantOrderIds.filter(
        id => id !== order.id
      );

    invoice.restaurantAmount =
      Math.max(
        0,
        Number(
          invoice.restaurantAmount || 0
        ) -
        Number(order.total || 0)
      );

    invoice.items =
      (invoice.items || []).filter(
        function (item) {

          return !(
            item.type === "restaurant" &&
            item.description ===
              "Restaurant Order " +
              order.orderNumber
          );

        }
      );

    invoice.subtotal =
      Number(invoice.roomAmount || 0) +
      Number(invoice.restaurantAmount || 0) +
      Number(invoice.otherAmount || 0);

    invoice.taxableAmount =
      Math.max(
        0,
        invoice.subtotal -
        Number(invoice.discount || 0)
      );

    invoice.total =
      invoice.taxableAmount +
      Number(invoice.gst || 0);

    invoice.balanceAmount =
      Math.max(
        0,
        invoice.total -
        Number(invoice.paidAmount || 0)
      );

    invoice.status =
      invoice.balanceAmount <= 0
        ? "Paid"
        : "Pending";

    invoice.updatedAt =
      new Date().toISOString();

    saveInvoices(invoices);
  }

  window.Restaurant = {
    render,
    showOrderForm,
    updateOrderCustomerFields,
    loadRoomGuest,
    addItemRow,
    removeItemRow,
    calculateOrderTotal,
    updatePaymentFields,
    filterOrders,
    viewOrder,
    payRoomCharge
  };

})();