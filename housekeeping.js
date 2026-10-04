// js/housekeeping.js

(function () {
  "use strict";

  const KEY = "hotelHousekeeping";

  const defaultRecord = {
    status: "Clean",
    lastCleaned: "",
    note: "",
    updatedAt: ""
  };

  function getRooms() {
    return HotelApp.getStorage("hotelRooms", []);
  }

  function getHousekeeping() {
    return HotelApp.getStorage(KEY, []);
  }

  function saveHousekeeping(data) {
    HotelApp.setStorage(KEY, data);
  }

  function getRecord(roomId) {
    const data = getHousekeeping();
    let record = data.find(x => x.roomId === roomId);

    if (!record) {
      record = {
        roomId,
        ...defaultRecord
      };
      data.push(record);
      saveHousekeeping(data);
    }

    return record;
  }

  function updateRecord(roomId, changes) {
    const data = getHousekeeping();
    let index = data.findIndex(x => x.roomId === roomId);

    if (index === -1) {
      data.push({
        roomId,
        ...defaultRecord,
        ...changes
      });
    } else {
      data[index] = {
        ...data[index],
        ...changes
      };
    }

    saveHousekeeping(data);
  }

  function getStatusClass(status) {
    return String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  function formatDateTime(value) {
    if (!value) return "—";

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) return "—";

    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function changeStatus(room, status) {
    const now = new Date().toISOString();

    updateRecord(room.id, {
      status,
      updatedAt: now,
      lastCleaned:
        status === "Clean" || status === "Inspected"
          ? now
          : getRecord(room.id).lastCleaned
    });

    // Room status ke saath housekeeping ko sync karna
    const rooms = getRooms();
    const index = rooms.findIndex(r => r.id === room.id);

    if (index !== -1) {
      if (status === "Cleaning") {
        if (rooms[index].status !== "occupied") {
          rooms[index].status = "cleaning";
        }
      }

      if (
        status === "Clean" ||
        status === "Inspected"
      ) {
        if (rooms[index].status === "cleaning") {
          rooms[index].status = "available";
        }
      }

      HotelApp.setStorage("hotelRooms", rooms);
    }

    render(document.getElementById("pageContainer"));

    HotelApp.showToast(
      `Room ${room.roomNumber} marked as ${status}.`,
      "success"
    );
  }

  function openNoteModal(room) {
    const record = getRecord(room.id);

    HotelApp.openModal(
      `Housekeeping Note - Room ${room.roomNumber}`,
      `
        <div class="form-group">
          <label>Room</label>
          <input type="text" value="${HotelApp.escapeHtml(
            room.roomNumber
          )}" disabled>
        </div>

        <div class="form-group">
          <label>Housekeeping Status</label>
          <select id="hkNoteStatus">
            ${[
              "Clean",
              "Dirty",
              "Cleaning",
              "Inspected",
              "Maintenance"
            ]
              .map(
                s => `
                  <option value="${s}" ${
                    record.status === s ? "selected" : ""
                  }>
                    ${s}
                  </option>
                `
              )
              .join("")}
          </select>
        </div>

        <div class="form-group">
          <label>Note</label>
          <textarea
            id="hkNote"
            rows="4"
            placeholder="Enter housekeeping note..."
          >${HotelApp.escapeHtml(record.note || "")}</textarea>
        </div>

        <div class="form-actions">
          <button class="btn btn-secondary"
                  onclick="HotelApp.closeModal()">
            Cancel
          </button>

          <button class="btn btn-primary"
                  id="saveHkNoteBtn">
            Save
          </button>
        </div>
      `
    );

    document
      .getElementById("saveHkNoteBtn")
      .addEventListener("click", function () {
        const status =
          document.getElementById("hkNoteStatus").value;

        const note =
          document.getElementById("hkNote").value.trim();

        updateRecord(room.id, {
          status,
          note,
          updatedAt: new Date().toISOString(),
          lastCleaned:
            status === "Clean" || status === "Inspected"
              ? new Date().toISOString()
              : record.lastCleaned
        });

        // Room status sync
        const rooms = getRooms();
        const index = rooms.findIndex(r => r.id === room.id);

        if (index !== -1) {
          if (
            status === "Cleaning" &&
            rooms[index].status !== "occupied"
          ) {
            rooms[index].status = "cleaning";
          }

          if (
            (status === "Clean" || status === "Inspected") &&
            rooms[index].status === "cleaning"
          ) {
            rooms[index].status = "available";
          }

          if (status === "Maintenance") {
            rooms[index].status = "maintenance";
          }

          HotelApp.setStorage("hotelRooms", rooms);
        }

        HotelApp.closeModal();
        render(document.getElementById("pageContainer"));
        HotelApp.showToast("Housekeeping details saved.", "success");
      });
  }

  function render(container) {
    if (!container) return;

    let rooms = getRooms();

    // Housekeeping records automatically create karo
    rooms.forEach(room => getRecord(room.id));

    const housekeeping = getHousekeeping();

    const floors = [
      ...new Set(
        rooms
          .map(r => r.floor)
          .filter(v => v !== undefined && v !== null && v !== "")
      )
    ].sort((a, b) => Number(a) - Number(b));

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>Housekeeping</h2>
          <p>Manage room cleaning, inspection and maintenance.</p>
        </div>
      </div>

      <div class="filter-bar">

        <div class="form-group">
          <label>Search Room</label>
          <input
            type="text"
            id="hkSearch"
            placeholder="Room number..."
          >
        </div>

        <div class="form-group">
          <label>Status</label>
          <select id="hkStatusFilter">
            <option value="">All Status</option>
            <option value="Clean">Clean</option>
            <option value="Dirty">Dirty</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Inspected">Inspected</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        <div class="form-group">
          <label>Floor</label>
          <select id="hkFloorFilter">
            <option value="">All Floors</option>
            ${floors
              .map(
                floor =>
                  `<option value="${HotelApp.escapeHtml(
                    String(floor)
                  )}">Floor ${HotelApp.escapeHtml(
                    String(floor)
                  )}</option>`
              )
              .join("")}
          </select>
        </div>

      </div>

      <div id="housekeepingGrid" class="rooms-grid"></div>
    `;

    const grid = document.getElementById("housekeepingGrid");

    function draw() {
      const search =
        document.getElementById("hkSearch").value
          .trim()
          .toLowerCase();

      const status =
        document.getElementById("hkStatusFilter").value;

      const floor =
        document.getElementById("hkFloorFilter").value;

      const filtered = rooms.filter(room => {
        const record = housekeeping.find(
          x => x.roomId === room.id
        ) || defaultRecord;

        const matchesSearch =
          !search ||
          String(room.roomNumber)
            .toLowerCase()
            .includes(search);

        const matchesStatus =
          !status || record.status === status;

        const matchesFloor =
          !floor || String(room.floor) === String(floor);

        return (
          matchesSearch &&
          matchesStatus &&
          matchesFloor
        );
      });

      if (!filtered.length) {
        grid.innerHTML = `
          <div class="empty-state">
            <h3>No rooms found</h3>
            <p>Try changing the search or filters.</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = filtered
        .map(room => {
          const record =
            housekeeping.find(x => x.roomId === room.id) ||
            defaultRecord;

          return `
            <div class="room-card">

              <div class="room-card-header">
                <div>
                  <h3>Room ${HotelApp.escapeHtml(
                    String(room.roomNumber)
                  )}</h3>

                  <small>
                    ${HotelApp.escapeHtml(
                      room.type || "Room"
                    )}
                    ${
                      room.floor !== undefined &&
                      room.floor !== ""
                        ? ` • Floor ${HotelApp.escapeHtml(
                            String(room.floor)
                          )}`
                        : ""
                    }
                  </small>
                </div>

                <span class="status-badge ${getStatusClass(
                  record.status
                )}">
                  ${HotelApp.escapeHtml(record.status)}
                </span>
              </div>

              <div class="room-info">

                <div>
                  <strong>Room Status</strong>
                  <span>
                    ${HotelApp.escapeHtml(
                      room.status || "available"
                    )}
                  </span>
                </div>

                <div>
                  <strong>Last Cleaned</strong>
                  <span>
                    ${formatDateTime(
                      record.lastCleaned
                    )}
                  </span>
                </div>

                <div>
                  <strong>Updated</strong>
                  <span>
                    ${formatDateTime(
                      record.updatedAt
                    )}
                  </span>
                </div>

                ${
                  record.note
                    ? `
                      <div>
                        <strong>Note</strong>
                        <span>
                          ${HotelApp.escapeHtml(
                            record.note
                          )}
                        </span>
                      </div>
                    `
                    : ""
                }

              </div>

              <div class="room-actions">

                <button
                  class="btn btn-sm btn-warning"
                  data-action="cleaning"
                  data-id="${HotelApp.escapeHtml(
                    room.id
                  )}">
                  Cleaning
                </button>

                <button
                  class="btn btn-sm btn-success"
                  data-action="clean"
                  data-id="${HotelApp.escapeHtml(
                    room.id
                  )}">
                  Mark Clean
                </button>

                <button
                  class="btn btn-sm btn-secondary"
                  data-action="inspect"
                  data-id="${HotelApp.escapeHtml(
                    room.id
                  )}">
                  Inspect
                </button>

                <button
                  class="btn btn-sm btn-danger"
                  data-action="maintenance"
                  data-id="${HotelApp.escapeHtml(
                    room.id
                  )}">
                  Maintenance
                </button>

                <button
                  class="btn btn-sm btn-primary"
                  data-action="note"
                  data-id="${HotelApp.escapeHtml(
                    room.id
                  )}">
                  Note
                </button>

              </div>

            </div>
          `;
        })
        .join("");

      grid
        .querySelectorAll("[data-action]")
        .forEach(button => {
          button.addEventListener("click", function () {
            const room = rooms.find(
              r => r.id === this.dataset.id
            );

            if (!room) return;

            const action = this.dataset.action;

            if (action === "note") {
              openNoteModal(room);
              return;
            }

            const statusMap = {
              cleaning: "Cleaning",
              clean: "Clean",
              inspect: "Inspected",
              maintenance: "Maintenance"
            };

            if (statusMap[action]) {
              changeStatus(
                room,
                statusMap[action]
              );
            }
          });
        });
    }

    document
      .getElementById("hkSearch")
      .addEventListener("input", draw);

    document
      .getElementById("hkStatusFilter")
      .addEventListener("change", draw);

    document
      .getElementById("hkFloorFilter")
      .addEventListener("change", draw);

    draw();
  }

  window.Housekeeping = {
    render
  };

})();