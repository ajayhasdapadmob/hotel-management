/* =========================================================
   HOTEL MANAGEMENT SOFTWARE
   Dashboard Module
   ========================================================= */

(function () {
    "use strict";

    window.Dashboard = {

        render: function (container) {
            if (!container) {
                return;
            }

            const bookings =
                HotelApp.getStorage("hotelBookings", []);

            const guests =
                HotelApp.getStorage("hotelGuests", []);

            const rooms =
                HotelApp.getStorage("hotelRooms", []);

            const invoices =
                HotelApp.getStorage("hotelInvoices", []);

            const restaurantOrders =
                HotelApp.getStorage(
                    "restaurantOrders",
                    []
                );

            const expenses =
                HotelApp.getStorage(
                    "hotelExpenses",
                    []
                );

            const today =
                this.getTodayString();

            const todayBookings =
                bookings.filter(function (booking) {
                    return (
                        booking.createdAt &&
                        booking.createdAt.substring(0, 10) === today
                    );
                });

            const occupiedRooms =
                rooms.filter(function (room) {
                    return (
                        String(room.status).toLowerCase() ===
                        "occupied"
                    );
                });

            const availableRooms =
                rooms.filter(function (room) {
                    return (
                        String(room.status).toLowerCase() ===
                        "available"
                    );
                });

            const roomRevenue =
                this.getRoomRevenue(
                    invoices,
                    today
                );

            const restaurantRevenue =
                this.getRestaurantRevenue(
                    restaurantOrders,
                    today
                );

            const totalRevenue =
                roomRevenue + restaurantRevenue;

            const totalOutstanding =
                this.getOutstanding(
                    invoices
                );

            const todayExpenses =
                this.getExpenses(
                    expenses,
                    today
                );

            container.innerHTML = `
                <div class="page-header">
                    <div>
                        <h2>Dashboard</h2>
                        <p class="muted">
                            Hotel business overview
                        </p>
                    </div>

                    <div class="page-header-actions">
                        <button
                            class="btn btn-primary"
                            onclick="HotelApp.loadPage('bookings')">
                            + New Booking
                        </button>

                        <button
                            class="btn btn-success"
                            onclick="HotelApp.loadPage('billing')">
                            + New Bill
                        </button>
                    </div>
                </div>

                <!-- STAT CARDS -->

                <div class="stats-grid">

                    <div class="stat-card">
                        <div class="stat-card-top">
                            <span class="stat-label">
                                Total Rooms
                            </span>

                            <div class="stat-icon">
                                🏨
                            </div>
                        </div>

                        <div class="stat-value">
                            ${rooms.length}
                        </div>

                        <small class="muted">
                            Hotel rooms
                        </small>
                    </div>


                    <div class="stat-card">
                        <div class="stat-card-top">
                            <span class="stat-label">
                                Occupied
                            </span>

                            <div class="stat-icon">
                                🛏️
                            </div>
                        </div>

                        <div class="stat-value">
                            ${occupiedRooms.length}
                        </div>

                        <small class="muted">
                            Currently occupied
                        </small>
                    </div>


                    <div class="stat-card">
                        <div class="stat-card-top">
                            <span class="stat-label">
                                Today's Revenue
                            </span>

                            <div class="stat-icon">
                                💰
                            </div>
                        </div>

                        <div class="stat-value">
                            ${HotelApp.formatCurrency(
                                totalRevenue
                            )}
                        </div>

                        <small class="muted">
                            Room + Restaurant
                        </small>
                    </div>


                    <div class="stat-card">
                        <div class="stat-card-top">
                            <span class="stat-label">
                                Outstanding
                            </span>

                            <div class="stat-icon">
                                ⚠️
                            </div>
                        </div>

                        <div class="stat-value">
                            ${HotelApp.formatCurrency(
                                totalOutstanding
                            )}
                        </div>

                        <small class="muted">
                            Pending payments
                        </small>
                    </div>

                </div>


                <!-- SECOND ROW -->

                <div class="stats-grid">

                    <div class="stat-card">
                        <div class="stat-card-top">
                            <span class="stat-label">
                                Available Rooms
                            </span>

                            <div class="stat-icon">
                                ✅
                            </div>
                        </div>

                        <div class="stat-value">
                            ${availableRooms.length}
                        </div>

                        <small class="muted">
                            Ready for booking
                        </small>
                    </div>


                    <div class="stat-card">
                        <div class="stat-card-top">
                            <span class="stat-label">
                                Today's Bookings
                            </span>

                            <div class="stat-icon">
                                📋
                            </div>
                        </div>

                        <div class="stat-value">
                            ${todayBookings.length}
                        </div>

                        <small class="muted">
                            New bookings today
                        </small>
                    </div>


                    <div class="stat-card">
                        <div class="stat-card-top">
                            <span class="stat-label">
                                Guests
                            </span>

                            <div class="stat-icon">
                                👤
                            </div>
                        </div>

                        <div class="stat-value">
                            ${guests.length}
                        </div>

                        <small class="muted">
                            Registered guests
                        </small>
                    </div>


                    <div class="stat-card">
                        <div class="stat-card-top">
                            <span class="stat-label">
                                Today's Expenses
                            </span>

                            <div class="stat-icon">
                                💸
                            </div>
                        </div>

                        <div class="stat-value">
                            ${HotelApp.formatCurrency(
                                todayExpenses
                            )}
                        </div>

                        <small class="muted">
                            Outgoing today
                        </small>
                    </div>

                </div>


                <!-- DASHBOARD GRID -->

                <div class="dashboard-grid">

                    <!-- ROOM STATUS -->

                    <div class="card">

                        <div class="card-header">
                            <h3>
                                Room Status
                            </h3>

                            <button
                                class="btn btn-sm btn-outline"
                                onclick="HotelApp.loadPage('rooms')">
                                View Rooms
                            </button>
                        </div>

                        <div class="card-body">

                            ${this.renderRoomStatus(
                                rooms
                            )}

                        </div>

                    </div>


                    <!-- TODAY SUMMARY -->

                    <div class="card">

                        <div class="card-header">
                            <h3>
                                Today's Summary
                            </h3>
                        </div>

                        <div class="card-body">

                            <div class="payment-summary">

                                <div class="payment-box">
                                    <div class="payment-box-label">
                                        Room Revenue
                                    </div>

                                    <div class="payment-box-value">
                                        ${HotelApp.formatCurrency(
                                            roomRevenue
                                        )}
                                    </div>
                                </div>


                                <div class="payment-box">
                                    <div class="payment-box-label">
                                        Restaurant
                                    </div>

                                    <div class="payment-box-value">
                                        ${HotelApp.formatCurrency(
                                            restaurantRevenue
                                        )}
                                    </div>
                                </div>


                                <div class="payment-box">
                                    <div class="payment-box-label">
                                        Expenses
                                    </div>

                                    <div class="payment-box-value">
                                        ${HotelApp.formatCurrency(
                                            todayExpenses
                                        )}
                                    </div>
                                </div>

                            </div>


                            <div class="mt-20">

                                <div
                                    class="payment-box"
                                    style="margin-bottom:10px;">

                                    <div class="payment-box-label">
                                        Total Revenue
                                    </div>

                                    <div class="payment-box-value">
                                        ${HotelApp.formatCurrency(
                                            totalRevenue
                                        )}
                                    </div>

                                </div>


                                <div class="payment-box">

                                    <div class="payment-box-label">
                                        Net Today
                                    </div>

                                    <div class="payment-box-value">
                                        ${HotelApp.formatCurrency(
                                            totalRevenue -
                                            todayExpenses
                                        )}
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- RECENT BOOKINGS -->

                <div class="card mt-20">

                    <div class="card-header">

                        <h3>
                            Recent Bookings
                        </h3>

                        <button
                            class="btn btn-sm btn-outline"
                            onclick="HotelApp.loadPage('bookings')">
                            View All
                        </button>

                    </div>

                    <div class="card-body">

                        ${this.renderRecentBookings(
                            bookings
                        )}

                    </div>

                </div>

            `;
        },


        /* =================================================
           TODAY
           ================================================= */

        getTodayString: function () {

            const today = new Date();

            const year =
                today.getFullYear();

            const month =
                String(
                    today.getMonth() + 1
                ).padStart(2, "0");

            const day =
                String(
                    today.getDate()
                ).padStart(2, "0");

            return (
                year +
                "-" +
                month +
                "-" +
                day
            );
        },


        /* =================================================
           ROOM STATUS
           ================================================= */

        renderRoomStatus: function (rooms) {

            if (!rooms.length) {

                return `
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            🏨
                        </div>

                        <h3>
                            No rooms found
                        </h3>

                        <p>
                            Add rooms from the Rooms section.
                        </p>

                        <button
                            class="btn btn-primary mt-10"
                            onclick="HotelApp.loadPage('rooms')">
                            Add Rooms
                        </button>
                    </div>
                `;
            }

            const statusCounts = {
                available: 0,
                occupied: 0,
                cleaning: 0,
                maintenance: 0,
                other: 0
            };

            rooms.forEach(function (room) {

                const status =
                    String(
                        room.status || "available"
                    ).toLowerCase();

                if (
                    statusCounts.hasOwnProperty(status)
                ) {
                    statusCounts[status]++;
                } else {
                    statusCounts.other++;
                }
            });


            return `
                <div class="payment-summary">

                    <div class="payment-box">

                        <div class="payment-box-label">
                            Available
                        </div>

                        <div class="payment-box-value">
                            ${statusCounts.available}
                        </div>

                        <span class="badge badge-success">
                            Ready
                        </span>

                    </div>


                    <div class="payment-box">

                        <div class="payment-box-label">
                            Occupied
                        </div>

                        <div class="payment-box-value">
                            ${statusCounts.occupied}
                        </div>

                        <span class="badge badge-danger">
                            Guest In
                        </span>

                    </div>


                    <div class="payment-box">

                        <div class="payment-box-label">
                            Cleaning
                        </div>

                        <div class="payment-box-value">
                            ${statusCounts.cleaning}
                        </div>

                        <span class="badge badge-warning">
                            Cleaning
                        </span>

                    </div>

                </div>
            `;
        },


        /* =================================================
           RECENT BOOKINGS
           ================================================= */

        renderRecentBookings: function (bookings) {

            if (!bookings.length) {

                return `
                    <div class="empty-state">

                        <div class="empty-state-icon">
                            📋
                        </div>

                        <h3>
                            No bookings yet
                        </h3>

                        <p>
                            Create your first hotel booking.
                        </p>

                        <button
                            class="btn btn-primary mt-10"
                            onclick="HotelApp.loadPage('bookings')">
                            New Booking
                        </button>

                    </div>
                `;
            }


            const recent =
                bookings
                    .slice()
                    .sort(function (a, b) {

                        return (
                            new Date(
                                b.createdAt || 0
                            ) -
                            new Date(
                                a.createdAt || 0
                            )
                        );

                    })
                    .slice(0, 5);


            return `
                <div class="table-wrapper">

                    <table class="data-table">

                        <thead>
                            <tr>
                                <th>
                                    Booking
                                </th>

                                <th>
                                    Guest
                                </th>

                                <th>
                                    Room
                                </th>

                                <th>
                                    Check-in
                                </th>

                                <th>
                                    Status
                                </th>
                            </tr>
                        </thead>

                        <tbody>

                            ${recent.map(function (booking) {

                                const status =
                                    String(
                                        booking.status ||
                                        "Booked"
                                    );

                                let badge =
                                    "badge-primary";

                                if (
                                    status.toLowerCase() ===
                                    "checked-in"
                                ) {
                                    badge =
                                        "badge-success";
                                }

                                if (
                                    status.toLowerCase() ===
                                    "cancelled"
                                ) {
                                    badge =
                                        "badge-danger";
                                }

                                return `
                                    <tr>

                                        <td>
                                            <strong>
                                                ${HotelApp.escapeHtml(
                                                    booking.bookingId ||
                                                    booking.id ||
                                                    "-"
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                            ${HotelApp.escapeHtml(
                                                booking.guestName ||
                                                booking.customerName ||
                                                "-"
                                            )}
                                        </td>

                                        <td>
                                            ${HotelApp.escapeHtml(
                                                booking.roomNumber ||
                                                booking.room ||
                                                "-"
                                            )}
                                        </td>

                                        <td>
                                            ${HotelApp.formatDate(
                                                booking.checkIn
                                            )}
                                        </td>

                                        <td>
                                            <span
                                                class="badge ${badge}">
                                                ${HotelApp.escapeHtml(
                                                    status
                                                )}
                                            </span>
                                        </td>

                                    </tr>
                                `;

                            }).join("")}

                        </tbody>

                    </table>

                </div>
            `;
        },


        /* =================================================
           ROOM REVENUE
           ================================================= */

        getRoomRevenue: function (
            invoices,
            today
        ) {

            return invoices.reduce(
                function (total, invoice) {

                    const date =
                        invoice.paidAt ||
                        invoice.createdAt ||
                        "";

                    if (
                        date.substring(0, 10) !==
                        today
                    ) {
                        return total;
                    }

                    const roomAmount =
                        Number(
                            invoice.roomAmount ||
                            invoice.roomTotal ||
                            invoice.roomRevenue ||
                            0
                        );

                    /*
                     * If invoice has no separate room amount,
                     * use total only when invoice type is room.
                     */

                    if (
                        roomAmount > 0
                    ) {
                        return total + roomAmount;
                    }

                    if (
                        invoice.type === "room"
                    ) {
                        return (
                            total +
                            Number(
                                invoice.total ||
                                invoice.grandTotal ||
                                0
                            )
                        );
                    }

                    return total;

                },
                0
            );
        },


        /* =================================================
           RESTAURANT REVENUE
           ================================================= */

        getRestaurantRevenue: function (
            orders,
            today
        ) {

            return orders.reduce(
                function (total, order) {

                    const date =
                        order.paidAt ||
                        order.createdAt ||
                        "";

                    if (
                        date.substring(0, 10) !==
                        today
                    ) {
                        return total;
                    }

                    /*
                     * Room-charge restaurant orders are
                     * still part of hotel revenue.
                     */

                    return (
                        total +
                        Number(
                            order.paidAmount ||
                            order.total ||
                            order.grandTotal ||
                            0
                        )
                    );

                },
                0
            );
        },


        /* =================================================
           OUTSTANDING
           ================================================= */

        getOutstanding: function (
            invoices
        ) {

            return invoices.reduce(
                function (total, invoice) {

                    const outstanding =
                        Number(
                            invoice.outstanding ||
                            invoice.balance ||
                            invoice.dueAmount ||
                            0
                        );

                    return total + outstanding;

                },
                0
            );
        },


        /* =================================================
           EXPENSES
           ================================================= */

        getExpenses: function (
            expenses,
            today
        ) {

            return expenses.reduce(
                function (total, expense) {

                    const date =
                        expense.date ||
                        expense.createdAt ||
                        "";

                    if (
                        date.substring(0, 10) !==
                        today
                    ) {
                        return total;
                    }

                    return (
                        total +
                        Number(
                            expense.amount ||
                            expense.total ||
                            0
                        )
                    );

                },
                0
            );
        }

    };

})();