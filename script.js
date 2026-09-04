<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Parking Operator Dashboard</title>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<style>
    * {
        box-sizing: border-box;
    }

    body {
        margin: 0;
        font-family: Arial, sans-serif;
        background: #f2f4f7;
        color: #222;
    }

    header {
        background: #172b4d;
        color: white;
        padding: 20px;
        text-align: center;
    }

    header h1 {
        margin: 0;
        font-size: 26px;
    }

    .container {
        max-width: 1200px;
        margin: 20px auto;
        padding: 0 15px;
    }

    .card {
        background: white;
        padding: 20px;
        margin-bottom: 20px;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }

    h2 {
        margin-top: 0;
        color: #172b4d;
    }

    .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
    }

    label {
        font-weight: bold;
        display: block;
        margin-bottom: 6px;
    }

    input,
    select {
        width: 100%;
        padding: 12px;
        border: 1px solid #ccc;
        border-radius: 7px;
        font-size: 16px;
    }

    button {
        border: none;
        border-radius: 7px;
        padding: 12px 20px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
    }

    .register-btn {
        background: #198754;
        color: white;
        margin-top: 18px;
        width: 100%;
    }

    .register-btn:hover {
        background: #157347;
    }

    .message {
        margin-top: 15px;
        padding: 12px;
        border-radius: 7px;
        display: none;
    }

    .success {
        background: #d1e7dd;
        color: #0f5132;
    }

    .error {
        background: #f8d7da;
        color: #842029;
    }

    .table-container {
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        min-width: 800px;
    }

    th,
    td {
        padding: 12px;
        border-bottom: 1px solid #ddd;
        text-align: left;
    }

    th {
        background: #172b4d;
        color: white;
    }

    .occupied {
        color: #dc3545;
        font-weight: bold;
    }

    .available {
        color: #198754;
        font-weight: bold;
    }

    .expired {
        color: #dc3545;
        font-weight: bold;
    }

    .notification-new {
        background: #fff3cd;
    }

    .small {
        font-size: 13px;
        color: #666;
    }

    @media (max-width: 700px) {
        .form-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
</head>

<body>

<header>
    <h1>🚗 Smart Car Parking - Operator Dashboard</h1>
</header>

<div class="container">

    <!-- VEHICLE REGISTRATION -->
    <div class="card">

        <h2>🚘 Register Vehicle</h2>

        <div class="form-grid">

            <div>
                <label for="qr_id">QR ID</label>
                <input
                    type="text"
                    id="qr_id"
                    placeholder="Example: QR001"
                >
            </div>

            <div>
                <label for="owner_name">Owner Name</label>
                <input
                    type="text"
                    id="owner_name"
                    placeholder="Owner name"
                >
            </div>

            <div>
                <label for="car_number">Car Number</label>
                <input
                    type="text"
                    id="car_number"
                    placeholder="Example: GA01AB1234"
                >
            </div>

            <div>
                <label for="phone_number">Phone Number</label>
                <input
                    type="text"
                    id="phone_number"
                    placeholder="Example: +919876543210"
                >
            </div>

            <div>
                <label for="parking_time">
                    Parking Time
                </label>

                <input
                    type="number"
                    id="parking_time"
                    min="1"
                    placeholder="Example: 10"
                >

                <div class="small">
                    Demo: 1 entered minute = 1 real second
                </div>
            </div>

            <div>
                <label for="slot_number">Slot Number</label>

                <select id="slot_number">
                    <option value="">Select Slot</option>
                    <option value="1">Slot 1</option>
                    <option value="2">Slot 2</option>
                    <option value="3">Slot 3</option>
                    <option value="4">Slot 4</option>
                    <option value="5">Slot 5</option>
                </select>
            </div>

            <div>
                <label for="status">Status</label>

                <select id="status">
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="AVAILABLE">AVAILABLE</option>
                </select>
            </div>

        </div>

        <button
            type="button"
            class="register-btn"
            id="registerButton"
            onclick="registerVehicle()"
        >
            🚗 Register Vehicle
        </button>

        <div id="message" class="message"></div>

    </div>


    <!-- REGISTERED VEHICLES -->
    <div class="card">

        <h2>📋 Registered Vehicles</h2>

        <div class="table-container">

            <table>

                <thead>
                    <tr>
                        <th>QR ID</th>
                        <th>Owner</th>
                        <th>Car Number</th>
                        <th>Slot</th>
                        <th>Status</th>
                        <th>Remaining Time</th>
                    </tr>
                </thead>

                <tbody id="vehiclesTableBody">
                </tbody>

            </table>

        </div>

    </div>


    <!-- LIVE NOTIFICATIONS -->
    <div class="card">

        <h2>🔔 Live Notifications</h2>

        <div class="table-container">

            <table>

                <thead>
                    <tr>
                        <th>ID</th>
                        <th>QR ID</th>
                        <th>Car Number</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Time</th>
                    </tr>
                </thead>

                <tbody id="notificationsTableBody">
                </tbody>

            </table>

        </div>

    </div>

</div>


<script>

/* =====================================================
   DATABASE CONNECTION
   ===================================================== */

const SUPABASE_URL = "https://yokdshtjbjlhqmmrnpxh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_2ZDoGT6xIclKRzqbE78Vnw_Uwp7BRdK";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


/* =====================================================
   PAGE START
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    console.log("Operator Dashboard Loaded");

    loadVehicles();
    loadNotifications();

    // Refresh vehicle list every 2 seconds
    setInterval(loadVehicles, 2000);

    // Refresh notifications every 2 seconds
    setInterval(loadNotifications, 2000);

});


/* =====================================================
   MESSAGE
   ===================================================== */

function showMessage(text, type) {

    const message = document.getElementById("message");

    message.innerText = text;

    message.className = "message " + type;

    message.style.display = "block";
}


/* =====================================================
   REGISTER VEHICLE
   ===================================================== */

async function registerVehicle() {

    console.log("REGISTER VEHICLE BUTTON CLICKED");

    const qrInput = document.getElementById("qr_id");
    const ownerInput = document.getElementById("owner_name");
    const carInput = document.getElementById("car_number");
    const phoneInput = document.getElementById("phone_number");
    const timeInput = document.getElementById("parking_time");
    const slotInput = document.getElementById("slot_number");
    const statusInput = document.getElementById("status");

    const qr_id = qrInput.value.trim();
    const owner_name = ownerInput.value.trim();
    const car_number = carInput.value.trim();
    const phone_number = phoneInput.value.trim();

    const parking_time = Number(timeInput.value);
    const slot_number = Number(slotInput.value);

    const status = statusInput.value;


    /* -------------------------------------------------
       VALIDATION
       ------------------------------------------------- */

    if (qr_id === "") {
        showMessage("❌ Please enter QR ID.", "error");
        qrInput.focus();
        return;
    }

    if (owner_name === "") {
        showMessage("❌ Please enter Owner Name.", "error");
        ownerInput.focus();
        return;
    }

    if (car_number === "") {
        showMessage("❌ Please enter Car Number.", "error");
        carInput.focus();
        return;
    }

    if (phone_number === "") {
        showMessage("❌ Please enter Phone Number.", "error");
        phoneInput.focus();
        return;
    }

    if (!parking_time || parking_time <= 0) {
        showMessage("❌ Please enter valid Parking Time.", "error");
        timeInput.focus();
        return;
    }

    if (!slot_number || slot_number < 1 || slot_number > 5) {
        showMessage("❌ Please select Slot Number.", "error");
        slotInput.focus();
        return;
    }


    /* -------------------------------------------------
       CHECK DUPLICATE QR ID
       ------------------------------------------------- */

    const { data: existingQR, error: qrError } = await db
        .from("cars")
        .select("qr_id")
        .eq("qr_id", qr_id)
        .maybeSingle();

    if (qrError) {

        console.error("QR CHECK ERROR:", qrError);

        showMessage(
            "❌ QR check error: " + qrError.message,
            "error"
        );

        return;
    }

    if (existingQR) {

        showMessage(
            "❌ This QR ID is already registered.",
            "error"
        );

        return;
    }


    /* -------------------------------------------------
       CHECK SLOT
       ------------------------------------------------- */

    const { data: existingSlot, error: slotError } = await db
        .from("cars")
        .select("qr_id, car_number, status")
        .eq("slot_number", slot_number)
        .eq("status", "OCCUPIED")
        .limit(1);

    if (slotError) {

        console.error("SLOT CHECK ERROR:", slotError);

        showMessage(
            "❌ Slot check error: " + slotError.message,
            "error"
        );

        return;
    }

    if (existingSlot && existingSlot.length > 0) {

        showMessage(
            "❌ Slot " + slot_number + " is already occupied.",
            "error"
        );

        return;
    }


    /* -------------------------------------------------
       PARKING TIME
       ------------------------------------------------- */

    const parking_start = new Date();

    /*
       EXHIBITION DEMO:
       1 entered minute = 1 real second
    */

    const parking_end = new Date(
        parking_start.getTime() +
        parking_time * 1000
    );


    /* -------------------------------------------------
       VEHICLE DATA
       ------------------------------------------------- */

    const vehicleData = {

        qr_id: qr_id,

        owner_name: owner_name,

        car_number: car_number,

        phone_number: phone_number,

        parking_time: parking_time,

        status: status,

        slot_number: slot_number,

        parking_start: parking_start.toISOString(),

        parking_end: parking_end.toISOString()

    };


    console.log("Vehicle data:", vehicleData);


    /* -------------------------------------------------
       DISABLE BUTTON
       ------------------------------------------------- */

    const button = document.getElementById("registerButton");

    button.disabled = true;

    button.innerText = "⏳ Registering...";


    /* -------------------------------------------------
       INSERT
       ------------------------------------------------- */

    const { data, error } = await db
        .from("cars")
        .insert([vehicleData])
        .select();


    /* -------------------------------------------------
       ENABLE BUTTON
       ------------------------------------------------- */

    button.disabled = false;

    button.innerText = "🚗 Register Vehicle";


    /* -------------------------------------------------
       DATABASE ERROR
       ------------------------------------------------- */

    if (error) {

        console.error("DATABASE ERROR:", error);

        showMessage(
            "❌ Database Error: " + error.message,
            "error"
        );

        return;
    }


    /* -------------------------------------------------
       SUCCESS
       ------------------------------------------------- */

    console.log("Vehicle registered:", data);

    showMessage(
        "✅ Vehicle registered successfully!",
        "success"
    );


    /* -------------------------------------------------
       CLEAR FORM
       ------------------------------------------------- */

    qrInput.value = "";
    ownerInput.value = "";
    carInput.value = "";
    phoneInput.value = "";
    timeInput.value = "";
    slotInput.value = "";
    statusInput.value = "OCCUPIED";


    /* -------------------------------------------------
       REFRESH TABLE
       ------------------------------------------------- */

    await loadVehicles();

}


/* =====================================================
   LOAD REGISTERED VEHICLES
   ===================================================== */

async function loadVehicles() {

    const { data, error } = await db
        .from("cars")
        .select("*")
        .order("id", { ascending: false });


    if (error) {

        console.error("LOAD VEHICLES ERROR:", error);

        document.getElementById(
            "vehiclesTableBody"
        ).innerHTML =
            `<tr>
                <td colspan="6">
                    ❌ Error loading vehicles:
                    ${escapeHTML(error.message)}
                </td>
            </tr>`;

        return;
    }


    const tableBody =
        document.getElementById("vehiclesTableBody");


    if (!data || data.length === 0) {

        tableBody.innerHTML =
            `<tr>
                <td colspan="6">
                    No registered vehicles.
                </td>
            </tr>`;

        return;
    }


    tableBody.innerHTML = "";


    data.forEach(vehicle => {

        const row = document.createElement("tr");


        let remaining = "--";

        let timeClass = "";


        if (
            vehicle.status === "OCCUPIED" &&
            vehicle.parking_end
        ) {

            const endTime =
                new Date(vehicle.parking_end).getTime();

            const now =
                new Date().getTime();

            let seconds =
                Math.ceil((endTime - now) / 1000);


            if (seconds <= 0) {

                remaining = "00:00";

                timeClass = "expired";

            } else {

                const minutes =
                    Math.floor(seconds / 60);

                const secs =
                    seconds % 60;

                remaining =
                    String(minutes).padStart(2, "0") +
                    ":" +
                    String(secs).padStart(2, "0");

            }

        }


        const statusClass =
            vehicle.status === "OCCUPIED"
                ? "occupied"
                : "available";


        row.innerHTML = `

            <td>${escapeHTML(vehicle.qr_id)}</td>

            <td>${escapeHTML(vehicle.owner_name)}</td>

            <td>${escapeHTML(vehicle.car_number)}</td>

            <td>Slot ${escapeHTML(String(vehicle.slot_number))}</td>

            <td class="${statusClass}">
                ${escapeHTML(vehicle.status)}
            </td>

            <td class="${timeClass}">
                ${remaining}
            </td>

        `;


        tableBody.appendChild(row);

    });

}


/* =====================================================
   LOAD LIVE NOTIFICATIONS
   ===================================================== */

async function loadNotifications() {

    const { data, error } = await db
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });


    if (error) {

        console.error(
            "LOAD NOTIFICATIONS ERROR:",
            error
        );

        document.getElementById(
            "notificationsTableBody"
        ).innerHTML =
            `<tr>
                <td colspan="6">
                    ❌ Error loading notifications:
                    ${escapeHTML(error.message)}
                </td>
            </tr>`;

        return;
    }


    const tableBody =
        document.getElementById(
            "notificationsTableBody"
        );


    if (!data || data.length === 0) {

        tableBody.innerHTML =
            `<tr>
                <td colspan="6">
                    No notifications yet.
                </td>
            </tr>`;

        return;
    }


    tableBody.innerHTML = "";


    data.forEach(notification => {

        const row = document.createElement("tr");


        if (
            notification.status &&
            notification.status.toUpperCase() === "NEW"
        ) {

            row.classList.add("notification-new");

        }


        let formattedTime = "--";


        if (notification.created_at) {

            formattedTime =
                new Date(
                    notification.created_at
                ).toLocaleString();

        }


        row.innerHTML = `

            <td>${escapeHTML(String(notification.id))}</td>

            <td>${escapeHTML(notification.qr_id || "")}</td>

            <td>${escapeHTML(notification.car_number || "")}</td>

            <td>${escapeHTML(notification.message || "")}</td>

            <td>${escapeHTML(notification.status || "")}</td>

            <td>${escapeHTML(formattedTime)}</td>

        `;


        tableBody.appendChild(row);

    });

}


/* =====================================================
   HTML ESCAPE
   ===================================================== */

function escapeHTML(value) {

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

</script>

</body>
</html>
