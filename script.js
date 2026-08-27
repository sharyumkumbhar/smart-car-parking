// ==========================================
// SMART CAR PARKING - SUPABASE CONNECTION
// ==========================================

const SUPABASE_URL = "xxxxxxxxxxxxxxxxxxxxxxxxxxx";
const SUPABASE_ANON_KEY = "xxxxxxxxxxxxxxxxxxxxxxxxxxxx";

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

    if (!qrInput || !msg) {
        return;
    }

    const qrID = qrInput.value.trim();

    if (qrID === "") {
        msg.innerText = "❌ Please enter a QR ID.";
        return;
    }

    msg.innerText = "Checking vehicle...";

    // ------------------------------------------
    // Find car using QR ID
    // ------------------------------------------

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

    // ------------------------------------------
    // Create notification
    // ------------------------------------------

    const { error: notificationError } = await db
        .from("notifications")
        .insert([
            {
                qr_id: qrID,
                car_number: car.CAR_NUMBER,
                message: "Vehicle may be blocking another vehicle.",
                status: "NEW"
            }
        ]);

    if (notificationError) {
        console.error(
            "Notification error:",
            notificationError
        );

        msg.innerText =
            "❌ Could not send notification.";
        return;
    }

    msg.innerText =
        "✅ Parking office has been notified!";

    qrInput.value = "";
}


// ==========================================
// OPERATOR PANEL
// ==========================================

async function loadNotifications() {

    const table =
        document.getElementById("notificationTable");

    if (!table) {
        return;
    }

    table.innerHTML =
        "<tr><td colspan='4'>Loading...</td></tr>";

    const { data, error } = await db
        .from("notifications")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {

        console.error(
            "Notification loading error:",
            error
        );

        table.innerHTML =
            "<tr><td colspan='4'>❌ Error loading notifications</td></tr>";

        return;
    }

    if (!data || data.length === 0) {

        table.innerHTML =
            "<tr><td colspan='4'>No notifications yet.</td></tr>";

        return;
    }

    table.innerHTML = "";

    data.forEach(notification => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${notification.id}</td>

            <td>${notification.qr_id || ""}</td>

            <td>
                ${notification.message || ""}
                <br>
                <strong>
                    Car:
                    ${notification.car_number || "Not found"}
                </strong>
            </td>

            <td>${notification.status || ""}</td>
        `;

        table.appendChild(row);
    });
}


// ==========================================
// AUTOMATICALLY LOAD OPERATOR PANEL
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            document.getElementById(
                "notificationTable"
            )
        ) {
            loadNotifications();

            // Refresh every 5 seconds
            setInterval(
                loadNotifications,
                5000
            );
        }

    }
);
