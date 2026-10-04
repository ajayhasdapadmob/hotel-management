/* =========================================================
   HOTEL MANAGEMENT SOFTWARE
   Main Application Controller
   ========================================================= */

(function () {
    "use strict";

    /* =====================================================
       GLOBAL APP OBJECT
       ===================================================== */

    window.HotelApp = {
        currentPage: "dashboard",

        settings: {
            hotelName: "My Hotel",
            currency: "₹",
            taxPercent: 0,
            apiBaseUrl: ""
        },

        state: {
            loggedIn: false,
            currentUser: null,
            licenseStatus: "ACTIVE",
            licenseExpiry: null
        }
    };

    /* =====================================================
       DOM HELPERS
       ===================================================== */

    function $(selector) {
        return document.querySelector(selector);
    }

    function $all(selector) {
        return document.querySelectorAll(selector);
    }

    function showElement(element) {
        if (element) {
            element.classList.remove("hidden");
        }
    }

    function hideElement(element) {
        if (element) {
            element.classList.add("hidden");
        }
    }

    /* =====================================================
       LOCAL STORAGE
       ===================================================== */

    function getStorage(key, defaultValue) {
        try {
            const value = localStorage.getItem(key);

            if (value === null) {
                return defaultValue;
            }

            return JSON.parse(value);
        } catch (error) {
            return defaultValue;
        }
    }

    function setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error("Storage error:", error);
            return false;
        }
    }

    function removeStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error("Storage remove error:", error);
        }
    }

    /* =====================================================
       INITIAL SETTINGS
       ===================================================== */

    function loadSettings() {
        const savedSettings = getStorage("hotelSettings", {});

        HotelApp.settings = {
            ...HotelApp.settings,
            ...savedSettings
        };
    }

    /* =====================================================
       LOGIN
       ===================================================== */

    function checkLogin() {
        const session = getStorage("hotelSession", null);

        if (session && session.loggedIn === true) {
            HotelApp.state.loggedIn = true;
            HotelApp.state.currentUser = session.username || "Admin";

            showApplication();
        } else {
            showLogin();
        }
    }

    function showLogin() {
        const loginScreen = $("#loginScreen");
        const appScreen = $("#appScreen");

        showElement(loginScreen);
        hideElement(appScreen);
    }

    function showApplication() {
        const loginScreen = $("#loginScreen");
        const appScreen = $("#appScreen");

        hideElement(loginScreen);
        showElement(appScreen);

        updateUserDisplay();
        updateLicenseDisplay();

        loadPage(HotelApp.currentPage);
    }

    function login(username, password) {
        /*
         * Demo login:
         * Username: admin
         * Password: admin123
         *
         * Later this can be connected to server/API.
         */

        if (username === "admin" && password === "admin123") {
            const session = {
                loggedIn: true,
                username: username,
                loginTime: new Date().toISOString()
            };

            setStorage("hotelSession", session);

            HotelApp.state.loggedIn = true;
            HotelApp.state.currentUser = username;

            showApplication();

            showToast("Login successful", "success");

            return true;
        }

        showToast("Invalid username or password", "error");

        return false;
    }

    function logout() {
        removeStorage("hotelSession");

        HotelApp.state.loggedIn = false;
        HotelApp.state.currentUser = null;

        showLogin();

        showToast("Logged out successfully", "success");
    }

    /* =====================================================
       LOGIN FORM
       ===================================================== */

    function setupLogin() {
        const loginForm = $("#loginForm");

        if (!loginForm) {
            return;
        }

        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const usernameElement = $("#username");
            const passwordElement = $("#password");

            const username = usernameElement
                ? usernameElement.value.trim()
                : "";

            const password = passwordElement
                ? passwordElement.value
                : "";

            login(username, password);
        });
    }

    /* =====================================================
       USER DISPLAY
       ===================================================== */

    function updateUserDisplay() {
        const elements = $all("[data-user-name]");

        elements.forEach(function (element) {
            element.textContent =
                HotelApp.state.currentUser || "Admin";
        });
    }

    /* =====================================================
       LICENSE
       ===================================================== */

    function loadLicense() {
        const license = getStorage("hotelLicense", null);

        if (!license) {
            /*
             * Demo license for initial installation.
             * Later subscription.js will manage this.
             */
            const expiry = new Date();

            expiry.setDate(expiry.getDate() + 30);

            HotelApp.state.licenseStatus = "ACTIVE";
            HotelApp.state.licenseExpiry = expiry.toISOString();

            return;
        }

        HotelApp.state.licenseStatus =
            license.status || "ACTIVE";

        HotelApp.state.licenseExpiry =
            license.expiry || null;
    }

    function getDaysRemaining() {
        if (!HotelApp.state.licenseExpiry) {
            return 0;
        }

        const expiry = new Date(
            HotelApp.state.licenseExpiry
        );

        const today = new Date();

        const difference =
            expiry.getTime() - today.getTime();

        return Math.ceil(
            difference / (1000 * 60 * 60 * 24)
        );
    }

    function updateLicenseDisplay() {
        loadLicense();

        const statusElements =
            $all("[data-license-status]");

        const expiryElements =
            $all("[data-license-expiry]");

        const daysRemaining =
            getDaysRemaining();

        let status = HotelApp.state.licenseStatus;

        if (daysRemaining <= 0) {
            status = "EXPIRED";
        } else if (daysRemaining <= 7) {
            status = "EXPIRING SOON";
        } else {
            status = "ACTIVE";
        }

        statusElements.forEach(function (element) {
            element.textContent = status;

            element.classList.remove(
                "expired",
                "warning"
            );

            if (status === "EXPIRED") {
                element.classList.add("expired");
            }

            if (status === "EXPIRING SOON") {
                element.classList.add("warning");
            }
        });

        expiryElements.forEach(function (element) {
            if (HotelApp.state.licenseExpiry) {
                element.textContent =
                    formatDate(
                        HotelApp.state.licenseExpiry
                    );
            } else {
                element.textContent = "-";
            }
        });

        const daysElements =
            $all("[data-license-days]");

        daysElements.forEach(function (element) {
            element.textContent =
                Math.max(daysRemaining, 0);
        });
    }

    /* =====================================================
       PAGE LOADING
       ===================================================== */

    function loadPage(pageName) {
        HotelApp.currentPage = pageName;

        updateNavigation(pageName);

        const pageContainer = $("#pageContainer");

        if (!pageContainer) {
            return;
        }

        /*
         * Page modules will be connected here.
         * Until their files are added, this shows a
         * clean temporary page.
         */

        switch (pageName) {
            case "dashboard":
                if (
                    window.Dashboard &&
                    typeof window.Dashboard.render === "function"
                ) {
                    window.Dashboard.render(pageContainer);
                } else {
                    renderDefaultPage(
                        pageContainer,
                        "Dashboard",
                        "Dashboard module is ready to be connected."
                    );
                }
                break;

            case "rooms":
                if (
                    window.Rooms &&
                    typeof window.Rooms.render === "function"
                ) {
                    window.Rooms.render(pageContainer);
                } else {
                    renderDefaultPage(
                        pageContainer,
                        "Rooms",
                        "Rooms module will be loaded here."
                    );
                }
                break;

            case "bookings":
                if (
                    window.Bookings &&
                    typeof window.Bookings.render === "function"
                ) {
                    window.Bookings.render(pageContainer);
                } else {
                    renderDefaultPage(
                        pageContainer,
                        "Bookings",
                        "Bookings module will be loaded here."
                    );
                }
                break;

            case "guests":
                if (
                    window.Guests &&
                    typeof window.Guests.render === "function"
                ) {
                    window.Guests.render(pageContainer);
                } else {
                    renderDefaultPage(
                        pageContainer,
                        "Guests / KYC",
                        "Guest and KYC module will be loaded here."
                    );
                }
                break;

            case "billing":
                if (
                    window.Billing &&
                    typeof window.Billing.render === "function"
                ) {
                    window.Billing.render(pageContainer);
                } else {
                    renderDefaultPage(
                        pageContainer,
                        "Billing",
                        "Billing and invoice module will be loaded here."
                    );
                }
                break;

            case "restaurant":
                if (
                    window.Restaurant &&
                    typeof window.Restaurant.render === "function"
                ) {
                    window.Restaurant.render(pageContainer);
                } else {
                    renderDefaultPage(
                        pageContainer,
                        "Restaurant / POS",
                        "Restaurant module will be loaded here."
                    );
                }
                break;

            case "housekeeping":
                if (
                    window.Housekeeping &&
                    typeof window.Housekeeping.render === "function"
                ) {
                    window.Housekeeping.render(pageContainer);
                } else {
                    renderDefaultPage(
                        pageContainer,
                        "Housekeeping",
                        "Housekeeping module will be loaded here."
                    );
                }
                break;

            case "reports":
                if (
                    window.Reports &&
                    typeof window.Reports.render === "function"
                ) {
                    window.Reports.render(pageContainer);
                } else {
                    renderDefaultPage(
                        pageContainer,
                        "Reports",
                        "Reports module will be loaded here."
                    );
                }
                break;

            case "subscription":
                if (
                    window.Subscription &&
                    typeof window.Subscription.render === "function"
                ) {
                    window.Subscription.render(pageContainer);
                } else {
                    renderDefaultPage(
                        pageContainer,
                        "Subscription / Renewal",
                        "Subscription module will be loaded here."
                    );
                }
                break;

            case "settings":
                if (
                    window.Settings &&
                    typeof window.Settings.render === "function"
                ) {
                    window.Settings.render(pageContainer);
                } else {
                    renderDefaultPage(
                        pageContainer,
                        "Settings",
                        "Settings module will be loaded here."
                    );
                }
                break;

            default:
                renderDefaultPage(
                    pageContainer,
                    "Dashboard",
                    "Welcome to Hotel Management Software."
                );
        }
    }

    function renderDefaultPage(container, title, message) {
        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h2>${escapeHtml(title)}</h2>
                </div>
            </div>

            <div class="card">
                <div class="card-body">
                    <div class="empty-state">
                        <div class="empty-state-icon">🏨</div>

                        <h3>${escapeHtml(title)}</h3>

                        <p>
                            ${escapeHtml(message)}
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    /* =====================================================
       NAVIGATION
       ===================================================== */

    function setupNavigation() {
        $all("[data-page]").forEach(function (button) {
            button.addEventListener("click", function () {
                const page =
                    button.getAttribute("data-page");

                if (!page) {
                    return;
                }

                closeMobileSidebar();

                loadPage(page);
            });
        });
    }

    function updateNavigation(activePage) {
        $all("[data-page]").forEach(function (item) {
            const page =
                item.getAttribute("data-page");

            item.classList.toggle(
                "active",
                page === activePage
            );
        });

        const pageTitle = $("[data-page-title]");

        if (pageTitle) {
            const titles = {
                dashboard: "Dashboard",
                rooms: "Rooms",
                bookings: "Bookings",
                guests: "Guests / KYC",
                billing: "Billing",
                restaurant: "Restaurant / POS",
                housekeeping: "Housekeeping",
                reports: "Reports",
                subscription: "Subscription",
                settings: "Settings"
            };

            pageTitle.textContent =
                titles[activePage] || "Hotel Management";
        }
    }

    /* =====================================================
       MOBILE SIDEBAR
       ===================================================== */

    function setupMobileMenu() {
        const menuButton = $("#mobileMenuButton");
        const sidebar = $("#sidebar");

        if (!menuButton || !sidebar) {
            return;
        }

        menuButton.addEventListener("click", function () {
            sidebar.classList.toggle("mobile-open");
        });
    }

    function closeMobileSidebar() {
        const sidebar = $("#sidebar");

        if (sidebar) {
            sidebar.classList.remove("mobile-open");
        }
    }

    /* =====================================================
       LOGOUT BUTTON
       ===================================================== */

    function setupLogout() {
        const logoutButton = $("#logoutButton");

        if (!logoutButton) {
            return;
        }

        logoutButton.addEventListener("click", function () {
            const confirmed =
                window.confirm(
                    "Are you sure you want to logout?"
                );

            if (confirmed) {
                logout();
            }
        });
    }

    /* =====================================================
       RENEWAL BUTTON
       ===================================================== */

    function setupRenewalButton() {
        const buttons =
            $all("[data-open-renewal]");

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                window.location.href =
                    "./renewal.html";
            });
        });
    }

    /* =====================================================
       MODAL
       ===================================================== */

    function openModal(title, content, options) {
        const modalOverlay = $("#globalModal");

        if (!modalOverlay) {
            return;
        }

        options = options || {};

        const modalTitle =
            modalOverlay.querySelector(
                "[data-modal-title]"
            );

        const modalBody =
            modalOverlay.querySelector(
                "[data-modal-body]"
            );

        if (modalTitle) {
            modalTitle.textContent =
                title || "Details";
        }

        if (modalBody) {
            modalBody.innerHTML =
                content || "";
        }

        modalOverlay.classList.add("show");

        if (options.large) {
            const modal =
                modalOverlay.querySelector(".modal");

            if (modal) {
                modal.classList.add("modal-lg");
            }
        }
    }

    function closeModal() {
        const modalOverlay = $("#globalModal");

        if (!modalOverlay) {
            return;
        }

        modalOverlay.classList.remove("show");
    }

    function setupModal() {
        const modalOverlay = $("#globalModal");

        if (!modalOverlay) {
            return;
        }

        const closeButtons =
            modalOverlay.querySelectorAll(
                "[data-modal-close]"
            );

        closeButtons.forEach(function (button) {
            button.addEventListener(
                "click",
                closeModal
            );
        });

        modalOverlay.addEventListener(
            "click",
            function (event) {
                if (
                    event.target === modalOverlay
                ) {
                    closeModal();
                }
            }
        );

        document.addEventListener(
            "keydown",
            function (event) {
                if (event.key === "Escape") {
                    closeModal();
                }
            }
        );
    }

    /* =====================================================
       TOAST
       ===================================================== */

    function showToast(message, type) {
        const container =
            $("#toastContainer");

        if (!container) {
            return;
        }

        type = type || "info";

        const toast =
            document.createElement("div");

        toast.className =
            "toast " + type;

        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(function () {
            toast.remove();
        }, 3500);
    }

    /* =====================================================
       DATE / CURRENCY
       ===================================================== */

    function formatDate(value) {
        if (!value) {
            return "-";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    }

    function formatDateTime(value) {
        if (!value) {
            return "-";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }

    function formatCurrency(amount) {
        const number =
            Number(amount) || 0;

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2
            }
        ).format(number);
    }

    /* =====================================================
       HTML SECURITY
       ===================================================== */

    function escapeHtml(value) {
        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* =====================================================
       UNIQUE ID
       ===================================================== */

    function generateId(prefix) {
        prefix = prefix || "ID";

        const timestamp =
            Date.now().toString(36).toUpperCase();

        const random =
            Math.random()
                .toString(36)
                .substring(2, 7)
                .toUpperCase();

        return prefix + "-" + timestamp + "-" + random;
    }

    /* =====================================================
       GLOBAL HELPERS
       ===================================================== */

    window.HotelApp.login = login;
    window.HotelApp.logout = logout;
    window.HotelApp.loadPage = loadPage;
    window.HotelApp.showToast = showToast;
    window.HotelApp.openModal = openModal;
    window.HotelApp.closeModal = closeModal;
    window.HotelApp.formatDate = formatDate;
    window.HotelApp.formatDateTime = formatDateTime;
    window.HotelApp.formatCurrency = formatCurrency;
    window.HotelApp.escapeHtml = escapeHtml;
    window.HotelApp.generateId = generateId;
    window.HotelApp.getStorage = getStorage;
    window.HotelApp.setStorage = setStorage;
    window.HotelApp.removeStorage = removeStorage;
    window.HotelApp.getDaysRemaining =
        getDaysRemaining;

    /* =====================================================
       CURRENT DATE
       ===================================================== */

    function updateCurrentDate() {
        const elements =
            $all("[data-current-date]");

        const today = new Date();

        const formatted =
            today.toLocaleDateString(
                "en-IN",
                {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );

        elements.forEach(function (element) {
            element.textContent = formatted;
        });
    }

    /* =====================================================
       INITIALIZE
       ===================================================== */

    function init() {
        loadSettings();

        setupLogin();
        setupNavigation();
        setupMobileMenu();
        setupLogout();
        setupRenewalButton();
        setupModal();

        updateCurrentDate();

        checkLogin();
    }

    /* =====================================================
       START APP
       ===================================================== */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    } else {
        init();
    }

})();