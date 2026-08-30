// ==========================================
// SMART CAR PARKING - SUPABASE CONNECTION
// ==========================================

const SUPABASE_URL = "https://yokdshtjbjlhqmmrnpxh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_2ZDoGT6xIclKRzqbE78Vnw_Uwp7BRdK";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ==========================================
// CUSTOMER PANEL
// ==========================================

async function notifyOffice() {

    const qrInput = document.getElementById("qrID");
    const msg = document.getElementById("msg");

    if (!qrInput || !msg) return;

    const qrID = qrInput.value.trim().toUpperCase();

    if (qrID === "") {
        msg.innerText = "❌ Please enter a QR ID.";
        return;
    }

    msg.innerText = "🔍 Finding vehicle...";

    const { data: car, error: carError } = await db
        .from("cars")
        .select("QR_ID, CAR_NUMBER")
        .eq("QR_ID", qrID)
        .maybeSingle();

    if (carError) {
        console.error("Car search error:", carError);
        msg.innerText = "❌ Error finding vehicle.";
        return;
    }

    if (!car) {
        msg.innerText = "❌ QR ID not found.";
        return;
    }

    const carNumber = car.CAR_NUMBER;

    if (!carNumber) {
        msg.innerText = "❌ Car number not found.";
        return;
    }

    const { error: notificationError } = await db
        .from("notifications")
        .insert([
            {
                qr_id: qrID,
                car_number: carNumber,
                message: "Vehicle may be blocking another vehicle.",
                status: "NEW"
            }
        ]);

    if (notificationError) {
        console.error("Notification error:", notificationError);
        msg.innerText = "❌ Could not send notification.";
        return;
    }

    msg.innerText = "✅ Parking office has been notified!";

    qrInput.value = "";
}


// ==========================================
// OPERATOR PANEL - REGISTER VEHICLE
// ==========================================

async function registerVehicle() {

    const qrID =
        document.getElementById("QR_ID").value.trim().toUpperCase();

    const ownerName =
        document.getElementById("OWNER_NAME").value.trim();

    const carNumber =
        document.getElementById("CAR_NUMBER").value.trim().toUpperCase();

    const phoneNumber =
        document.getElementById("PHONE_NUMBER").value.trim();

    const parkingTime =
        document.getElementById("PARKING_TIME").value;

    const status =
        document.getElementById("STATUS").value;

    const msg =
        document.getElementById("registrationMsg");


    if (
        qrID === "" ||
        ownerName === "" ||
        carNumber === "" ||
        phoneNumber === "" ||
        parkingTime === ""
    ) {
        msg.innerText = "❌ Please fill all fields.";
        return;
    }


    msg.innerText = "⏳ Registering vehicle...";


    const { data, error } = await db
        .from("cars")
        .insert([
            {
                QR_ID: qrID,
                OWNER_NAME: ownerName,
                CAR_NUMBER: carNumber,
                PHONE_NUMBER: phoneNumber,
                PARKING_TIME: Number(parkingTime),
                STATUS: status
            }
        ])
        .select();


    if (error) {
        console.error("Vehicle registration error:", error);
        msg.innerText = "❌ Error: " + error.message;
        return;
    }


    console.log("Vehicle registered:", data);

    msg.innerText = "✅ Vehicle registered successfully!";


    document.getElementById("QR_ID").value = "";
    document.getElementById("OWNER_NAME").value = "";
    document.getElementById("CAR_NUMBER").value = "";
    document.getElementById("PHONE_NUMBER").value = "";
    document.getElementById("PARKING_TIME").value = "";
}


// ==========================================
// OPERATOR PANEL - LOAD NOTIFICATIONS
// ==========================================

async function loadNotifications() {

    const table =
        document.getElementById("notificationTable");

    if (!table) return;


    table.innerHTML =
        "<tr><td colspan='6'>⏳ Loading...</td></tr>";


    const { data, error } = await db
        .from("notifications")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error("Notification loading error:", error);

        table.innerHTML =
            "<tr><td colspan='6'>❌ Error loading notifications</td></tr>";

        return;
    }


    if (!data || data.length === 0) {

        table.innerHTML =
            "<tr><td colspan='6'>No notifications yet.</td></tr>";

        return;
    }


    table.innerHTML = "";


    data.forEach(notification => {

        const row = document.createElement("tr");

        const date =
            notification.created_at
                ? new Date(notification.created_at).toLocaleString()
                : "";


        row.innerHTML = `
            <td>${notification.id || ""}</td>
            <td>${notification.qr_id || ""}</td>
            <td>${notification.car_number || "Not found"}</td>
            <td>${notification.message || ""}</td>
            <td>${notification.status || ""}</td>
            <td>${date}</td>
        `;


        table.appendChild(row);
    });
}


// ==========================================
// AUTOMATIC OPERATOR PANEL REFRESH
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    if (document.getElementById("notificationTable")) {

        loadNotifications();

        setInterval(
            loadNotifications,
            5000
        );
    }

});
