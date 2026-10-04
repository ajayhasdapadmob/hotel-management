/* =========================================================
   HOTEL MANAGEMENT SOFTWARE
   Rooms Module
   ========================================================= */

(function () {
    "use strict";

    window.Rooms = {

        render: function (container) {
            if (!container) return;

            this.container = container;

            this.renderPage();
        },

        /* =================================================
           STORAGE
           ================================================= */

        getRooms: function () {
            return HotelApp.getStorage(
                "hotelRooms",
                []
            );
        },

        saveRooms: function (rooms) {
            HotelApp.setStorage(
                "hotelRooms",
                rooms
            );
        },

        /* =================================================
           PAGE
           ================================================= */

        renderPage: function () {
            const rooms = this.getRooms();

            const available =
                rooms.filter(
                    r => this.getStatus(r) === "available"
                ).length;

            const occupied =
                rooms.filter(
                    r => this.getStatus(r) === "occupied"
                ).length;

            const cleaning =
                rooms.filter(
                    r => this.getStatus(r) === "cleaning"
                ).length;

            const maintenance =
                rooms.filter(
                    r => this.getStatus(r) === "maintenance"
                ).length;

            this.container.innerHTML = `

                <div class="page-header">

                    <div>
                        <h2>Rooms</h2>
                        <p class="muted">
                            Manage rooms and availability
                        </p>
                    </div>

                    <div class="page-header-actions">

                        <button
                            class="btn btn-primary"
                            onclick="Rooms.openAddRoom()">
                            + Add Room
                        </button>

                    </div>

                </div>


                <!-- ROOM SUMMARY -->

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

                    </div>


                    <div class="stat-card">

                        <div class="stat-card-top">
                            <span class="stat-label">
                                Available
                            </span>

                            <div class="stat-icon">
                                ✅
                            </div>
                        </div>

                        <div class="stat-value">
                            ${available}
                        </div>

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
                            ${occupied}
                        </div>

                    </div>


                    <div class="stat-card">

                        <div class="stat-card-top">
                            <span class="stat-label">
                                Cleaning / Maintenance
                            </span>

                            <div class="stat-icon">
                                🧹
                            </div>
                        </div>

                        <div class="stat-value">
                            ${cleaning + maintenance}
                        </div>

                    </div>

                </div>


                <!-- FILTER -->

                <div class="card mt-20">

                    <div class="card-body">

                        <div class="filter-bar">

                            <div class="filter-item">
                                <label>
                                    Search Room
                                </label>

                                <input
                                    type="text"
                                    id="roomSearch"
                                    class="form-control"
                                    placeholder="Room number..."
                                    oninput="Rooms.refreshTable()">
                            </div>


                            <div class="filter-item">

                                <label>
                                    Status
                                </label>

                                <select
                                    id="roomStatusFilter"
                                    class="form-select"
                                    onchange="Rooms.refreshTable()">

                                    <option value="">
                                        All Status
                                    </option>

                                    <option value="available">
                                        Available
                                    </option>

                                    <option value="occupied">
                                        Occupied
                                    </option>

                                    <option value="cleaning">
                                        Cleaning
                                    </option>

                                    <option value="maintenance">
                                        Maintenance
                                    </option>

                                </select>

                            </div>


                            <div class="filter-item">

                                <label>
                                    Room Type
                                </label>

                                <select
                                    id="roomTypeFilter"
                                    class="form-select"
                                    onchange="Rooms.refreshTable()">

                                    <option value="">
                                        All Types
                                    </option>

                                    <option value="Standard">
                                        Standard
                                    </option>

                                    <option value="Deluxe">
                                        Deluxe
                                    </option>

                                    <option value="Super Deluxe">
                                        Super Deluxe
                                    </option>

                                    <option value="Suite">
                                        Suite
                                    </option>

                                </select>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- ROOMS -->

                <div class="card mt-20">

                    <div class="card-header">

                        <h3>
                            Room List
                        </h3>

                        <span class="muted">
                            ${rooms.length} rooms
                        </span>

                    </div>

                    <div
                        class="card-body"
                        id="roomsTableContainer">

                    </div>

                </div>

            `;

            this.refreshTable();
        },


        /* =================================================
           TABLE
           ================================================= */

        refreshTable: function () {

            const container =
                document.getElementById(
                    "roomsTableContainer"
                );

            if (!container) return;

            const rooms = this.getRooms();

            const search =
                (
                    document.getElementById(
                        "roomSearch"
                    )?.value || ""
                )
                    .trim()
                    .toLowerCase();

            const status =
                document.getElementById(
                    "roomStatusFilter"
                )?.value || "";

            const type =
                document.getElementById(
                    "roomTypeFilter"
                )?.value || "";


            const filtered =
                rooms.filter(function (room) {

                    const roomNumber =
                        String(
                            room.roomNumber || ""
                        ).toLowerCase();

                    const roomType =
                        String(
                            room.type || ""
                        );

                    const roomStatus =
                        String(
                            room.status || "available"
                        ).toLowerCase();


                    const searchMatch =
                        !search ||
                        roomNumber.includes(search);

                    const statusMatch =
                        !status ||
                        roomStatus === status;

                    const typeMatch =
                        !type ||
                        roomType === type;


                    return (
                        searchMatch &&
                        statusMatch &&
                        typeMatch
                    );

                });


            if (!filtered.length) {

                container.innerHTML = `

                    <div class="empty-state">

                        <div class="empty-state-icon">
                            🏨
                        </div>

                        <h3>
                            No rooms found
                        </h3>

                        <p>
                            Add a room or change your filters.
                        </p>

                    </div>

                `;

                return;
            }


            container.innerHTML = `

                <div class="room-grid">

                    ${filtered.map(
                        room => this.roomCard(room)
                    ).join("")}

                </div>

            `;
        },


        /* =================================================
           ROOM CARD
           ================================================= */

        roomCard: function (room) {

            const status =
                this.getStatus(room);

            let badgeClass =
                "badge-success";

            let statusText =
                "Available";

            if (status === "occupied") {
                badgeClass =
                    "badge-danger";

                statusText =
                    "Occupied";
            }

            if (status === "cleaning") {
                badgeClass =
                    "badge-warning";

                statusText =
                    "Cleaning";
            }

            if (status === "maintenance") {
                badgeClass =
                    "badge-secondary";

                statusText =
                    "Maintenance";
            }


            const guestName =
                room.guestName ||
                room.currentGuest ||
                "";


            return `

                <div class="room-card ${status}">

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            align-items:center;
                            gap:10px;
                        ">

                        <div class="room-number">
                            ${HotelApp.escapeHtml(
                                room.roomNumber
                            )}
                        </div>

                        <span
                            class="badge ${badgeClass}">
                            ${statusText}
                        </span>

                    </div>


                    <div class="room-type">

                        ${HotelApp.escapeHtml(
                            room.type || "Standard"
                        )}

                    </div>


                    <div class="muted">

                        ₹${Number(
                            room.rate || 0
                        ).toLocaleString("en-IN")}

                        / night

                    </div>


                    ${
                        guestName
                            ? `
                                <div
                                    class="mt-10"
                                    style="
                                        padding:8px;
                                        background:#f8fafc;
                                        border-radius:6px;
                                    ">

                                    <small class="muted">
                                        Guest
                                    </small>

                                    <br>

                                    <strong>
                                        ${HotelApp.escapeHtml(
                                            guestName
                                        )}
                                    </strong>

                                </div>
                              `
                            : ""
                    }


                    <div
                        class="actions mt-10"
                        style="
                            display:flex;
                            gap:6px;
                            flex-wrap:wrap;
                        ">

                        <button
                            class="btn btn-sm btn-outline"
                            onclick="Rooms.openEditRoom('${this.safeId(room.id)}')">
                            Edit
                        </button>


                        <button
                            class="btn btn-sm btn-light"
                            onclick="Rooms.changeStatus('${this.safeId(room.id)}')">
                            Status
                        </button>


                        ${
                            status === "occupied"
                                ? `
                                    <button
                                        class="btn btn-sm btn-warning"
                                        onclick="Rooms.releaseRoom('${this.safeId(room.id)}')">
                                        Release
                                    </button>
                                  `
                                : ""
                        }


                        <button
                            class="btn btn-sm btn-danger"
                            onclick="Rooms.deleteRoom('${this.safeId(room.id)}')">
                            Delete
                        </button>

                    </div>

                </div>

            `;
        },


        /* =================================================
           ADD ROOM
           ================================================= */

        openAddRoom: function () {

            const content = `

                <form
                    id="roomForm"
                    onsubmit="Rooms.saveRoom(event)">

                    <input
                        type="hidden"
                        id="roomId"
                        value="">


                    <div class="form-row">

                        <div class="form-group">

                            <label>
                                Room Number
                                <span class="required">*</span>
                            </label>

                            <input
                                type="text"
                                id="roomNumber"
                                class="form-control"
                                placeholder="101"
                                required>

                        </div>


                        <div class="form-group">

                            <label>
                                Room Type
                                <span class="required">*</span>
                            </label>

                            <select
                                id="roomType"
                                class="form-select"
                                required>

                                <option value="Standard">
                                    Standard
                                </option>

                                <option value="Deluxe">
                                    Deluxe
                                </option>

                                <option value="Super Deluxe">
                                    Super Deluxe
                                </option>

                                <option value="Suite">
                                    Suite
                                </option>

                            </select>

                        </div>

                    </div>


                    <div class="form-row">

                        <div class="form-group">

                            <label>
                                Room Rate / Night
                                <span class="required">*</span>
                            </label>

                            <input
                                type="number"
                                id="roomRate"
                                class="form-control"
                                min="0"
                                step="0.01"
                                placeholder="1500"
                                required>

                        </div>


                        <div class="form-group">

                            <label>
                                Floor
                            </label>

                            <input
                                type="text"
                                id="roomFloor"
                                class="form-control"
                                placeholder="Ground / 1st / 2nd">

                        </div>

                    </div>


                    <div class="form-group">

                        <label>
                            Room Description
                        </label>

                        <textarea
                            id="roomDescription"
                            class="form-textarea"
                            placeholder="AC, TV, Wi-Fi, attached bathroom..."></textarea>

                    </div>


                    <div class="modal-footer"
                         style="
                            margin:0 -20px -20px;
                         ">

                        <button
                            type="button"
                            class="btn btn-light"
                            data-modal-close>
                            Cancel
                        </button>

                        <button
                            type="submit"
                            class="btn btn-primary">
                            Save Room
                        </button>

                    </div>

                </form>

            `;

            HotelApp.openModal(
                "Add Room",
                content
            );
        },


        /* =================================================
           EDIT ROOM
           ================================================= */

        openEditRoom: function (id) {

            const rooms =
                this.getRooms();

            const room =
                rooms.find(
                    r => String(r.id) === String(id)
                );

            if (!room) {

                HotelApp.showToast(
                    "Room not found",
                    "error"
                );

                return;
            }


            const content = `

                <form
                    id="roomForm"
                    onsubmit="Rooms.saveRoom(event)">

                    <input
                        type="hidden"
                        id="roomId"
                        value="${this.safeId(room.id)}">


                    <div class="form-row">

                        <div class="form-group">

                            <label>
                                Room Number
                                <span class="required">*</span>
                            </label>

                            <input
                                type="text"
                                id="roomNumber"
                                class="form-control"
                                value="${HotelApp.escapeHtml(
                                    room.roomNumber || ""
                                )}"
                                required>

                        </div>


                        <div class="form-group">

                            <label>
                                Room Type
                            </label>

                            <select
                                id="roomType"
                                class="form-select">

                                ${this.typeOption(
                                    "Standard",
                                    room.type
                                )}

                                ${this.typeOption(
                                    "Deluxe",
                                    room.type
                                )}

                                ${this.typeOption(
                                    "Super Deluxe",
                                    room.type
                                )}

                                ${this.typeOption(
                                    "Suite",
                                    room.type
                                )}

                            </select>

                        </div>

                    </div>


                    <div class="form-row">

                        <div class="form-group">

                            <label>
                                Room Rate / Night
                            </label>

                            <input
                                type="number"
                                id="roomRate"
                                class="form-control"
                                min="0"
                                step="0.01"
                                value="${Number(
                                    room.rate || 0
                                )}"
                                required>

                        </div>


                        <div class="form-group">

                            <label>
                                Floor
                            </label>

                            <input
                                type="text"
                                id="roomFloor"
                                class="form-control"
                                value="${HotelApp.escapeHtml(
                                    room.floor || ""
                                )}">

                        </div>

                    </div>


                    <div class="form-group">

                        <label>
                            Description
                        </label>

                        <textarea
                            id="roomDescription"
                            class="form-textarea">${HotelApp.escapeHtml(
                                room.description || ""
                            )}</textarea>

                    </div>


                    <div class="modal-footer"
                         style="
                            margin:0 -20px -20px;
                         ">

                        <button
                            type="button"
                            class="btn btn-light"
                            data-modal-close>
                            Cancel
                        </button>

                        <button
                            type="submit"
                            class="btn btn-primary">
                            Update Room
                        </button>

                    </div>

                </form>

            `;

            HotelApp.openModal(
                "Edit Room",
                content
            );
        },


        /* =================================================
           SAVE ROOM
           ================================================= */

        saveRoom: function (event) {

            event.preventDefault();

            const id =
                document.getElementById(
                    "roomId"
                )?.value.trim();

            const roomNumber =
                document.getElementById(
                    "roomNumber"
                )?.value.trim();

            const type =
                document.getElementById(
                    "roomType"
                )?.value;

            const rate =
                Number(
                    document.getElementById(
                        "roomRate"
                    )?.value || 0
                );

            const floor =
                document.getElementById(
                    "roomFloor"
                )?.value.trim();

            const description =
                document.getElementById(
                    "roomDescription"
                )?.value.trim();


            if (!roomNumber) {

                HotelApp.showToast(
                    "Room number is required",
                    "error"
                );

                return;
            }


            const rooms =
                this.getRooms();


            /*
             * Duplicate room number check.
             */

            const duplicate =
                rooms.find(function (room) {

                    return (
                        String(room.roomNumber)
                            .toLowerCase() ===
                        roomNumber.toLowerCase() &&
                        String(room.id) !==
                        String(id)
                    );

                });


            if (duplicate) {

                HotelApp.showToast(
                    "This room number already exists",
                    "error"
                );

                return;
            }


            if (id) {

                const index =
                    rooms.findIndex(
                        r =>
                            String(r.id) ===
                            String(id)
                    );

                if (index === -1) {

                    HotelApp.showToast(
                        "Room not found",
                        "error"
                    );

                    return;
                }


                rooms[index] = {
                    ...rooms[index],

                    roomNumber,
                    type,
                    rate,
                    floor,
                    description,

                    updatedAt:
                        new Date().toISOString()
                };


                this.saveRooms(rooms);

                HotelApp.closeModal();

                HotelApp.showToast(
                    "Room updated successfully",
                    "success"
                );

            } else {

                const room = {

                    id:
                        HotelApp.generateId(
                            "ROOM"
                        ),

                    roomNumber,

                    type:
                        type || "Standard",

                    rate,

                    floor,

                    description,

                    status:
                        "available",

                    guestName:
                        "",

                    bookingId:
                        "",

                    createdAt:
                        new Date().toISOString(),

                    updatedAt:
                        new Date().toISOString()

                };


                rooms.push(room);

                this.saveRooms(rooms);

                HotelApp.closeModal();

                HotelApp.showToast(
                    "Room added successfully",
                    "success"
                );
            }


            this.renderPage();
        },


        /* =================================================
           CHANGE STATUS
           ================================================= */

        changeStatus: function (id) {

            const rooms =
                this.getRooms();

            const room =
                rooms.find(
                    r =>
                        String(r.id) ===
                        String(id)
                );

            if (!room) {

                HotelApp.showToast(
                    "Room not found",
                    "error"
                );

                return;
            }


            const currentStatus =
                this.getStatus(room);


            const content = `

                <div class="form-group">

                    <label>
                        Select Room Status
                    </label>

                    <select
                        id="newRoomStatus"
                        class="form-select">

                        <option
                            value="available"
                            ${
                                currentStatus ===
                                "available"
                                    ? "selected"
                                    : ""
                            }>
                            Available
                        </option>

                        <option
                            value="occupied"
                            ${
                                currentStatus ===
                                "occupied"
                                    ? "selected"
                                    : ""
                            }>
                            Occupied
                        </option>

                        <option
                            value="cleaning"
                            ${
                                currentStatus ===
                                "cleaning"
                                    ? "selected"
                                    : ""
                            }>
                            Cleaning
                        </option>

                        <option
                            value="maintenance"
                            ${
                                currentStatus ===
                                "maintenance"
                                    ? "selected"
                                    : ""
                            }>
                            Maintenance
                        </option>

                    </select>

                </div>


                <div class="modal-footer"
                     style="
                        margin:0 -20px -20px;
                     ">

                    <button
                        type="button"
                        class="btn btn-light"
                        data-modal-close>
                        Cancel
                    </button>

                    <button
                        type="button"
                        class="btn btn-primary"
                        onclick="Rooms.saveStatus('${this.safeId(id)}')">
                        Update Status
                    </button>

                </div>

            `;

            HotelApp.openModal(
                "Change Room Status",
                content
            );
        },


        saveStatus: function (id) {

            const status =
                document.getElementById(
                    "newRoomStatus"
                )?.value;

            if (!status) return;


            const rooms =
                this.getRooms();

            const room =
                rooms.find(
                    r =>
                        String(r.id) ===
                        String(id)
                );

            if (!room) return;


            room.status =
                status;

            room.updatedAt =
                new Date().toISOString();


            /*
             * If room is manually changed to available,
             * clear old guest/booking information.
             */

            if (status === "available") {

                room.guestName = "";
                room.bookingId = "";
            }


            this.saveRooms(rooms);

            HotelApp.closeModal();

            HotelApp.showToast(
                "Room status updated",
                "success"
            );

            this.renderPage();
        },


        /* =================================================
           RELEASE ROOM
           ================================================= */

        releaseRoom: function (id) {

            const confirmed =
                window.confirm(
                    "Release this room and mark it available?"
                );

            if (!confirmed) return;


            const rooms =
                this.getRooms();

            const room =
                rooms.find(
                    r =>
                        String(r.id) ===
                        String(id)
                );

            if (!room) return;


            room.status =
                "available";

            room.guestName =
                "";

            room.bookingId =
                "";

            room.updatedAt =
                new Date().toISOString();


            this.saveRooms(rooms);

            HotelApp.showToast(
                "Room released successfully",
                "success"
            );

            this.renderPage();
        },


        /* =================================================
           DELETE ROOM
           ================================================= */

        deleteRoom: function (id) {

            const rooms =
                this.getRooms();

            const room =
                rooms.find(
                    r =>
                        String(r.id) ===
                        String(id)
                );

            if (!room) return;


            if (
                this.getStatus(room) ===
                "occupied"
            ) {

                HotelApp.showToast(
                    "Occupied room cannot be deleted",
                    "error"
                );

                return;
            }


            const confirmed =
                window.confirm(
                    "Delete room " +
                    room.roomNumber +
                    "?"
                );

            if (!confirmed) return;


            const filtered =
                rooms.filter(
                    r =>
                        String(r.id) !==
                        String(id)
                );


            this.saveRooms(filtered);

            HotelApp.showToast(
                "Room deleted successfully",
                "success"
            );

            this.renderPage();
        },


        /* =================================================
           STATUS
           ================================================= */

        getStatus: function (room) {

            const status =
                String(
                    room.status ||
                    "available"
                ).toLowerCase();

            const allowed = [
                "available",
                "occupied",
                "cleaning",
                "maintenance"
            ];

            if (
                allowed.includes(status)
            ) {
                return status;
            }

            return "available";
        },


        /* =================================================
           SELECT OPTION
           ================================================= */

        typeOption: function (
            value,
            selected
        ) {

            return `
                <option
                    value="${HotelApp.escapeHtml(value)}"
                    ${
                        String(value) ===
                        String(selected)
                            ? "selected"
                            : ""
                    }>
                    ${HotelApp.escapeHtml(value)}
                </option>
            `;
        },


        /* =================================================
           SAFE ID
           ================================================= */

        safeId: function (id) {

            return String(id || "")
                .replace(/\\/g, "\\\\")
                .replace(/'/g, "\\'");
        }

    };

})();