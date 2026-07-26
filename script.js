// ==============================
// SUPABASE CONFIGURATION
// ==============================

const SUPABASE_URL = "https://yokdshtjbjlhqmmrnpxh.supabase.co";

const SUPABASE_KEY = "sb_publishable_2ZDoGT6xIclKRzqbE78Vnw_Uwp7BRdK";

const sb = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// ==============================
// TEST CONNECTION
// ==============================

async function testConnection() {

    const { data, error } = await sb
        .from("cars")
        .select("*");

    if (error) {
        console.log(error);
    } else {
        console.log("✅ Supabase Connected");
        console.log(data);
    }

}

// ==============================
// CUSTOMER NOTIFY OFFICE
// ==============================

async function notifyOffice() {

    const qr = document.getElementById("qrID").value.trim();

    if (qr === "") {

        document.getElementById("msg").innerHTML =
        "❌ Please enter QR ID.";

        return;

    }

    const { error } = await sb
    .from("notifications")
    .insert([

        {
            qr_id: qr,
            car_number: "",
            message: "Vehicle is blocking another vehicle.",
            status: "NEW"
        }

    ]);

    if (error) {

        console.log(error);

        document.getElementById("msg").innerHTML =
        "❌ " + error.message;

    }

    else {

        document.getElementById("msg").innerHTML =
        "✅ Parking Office has been notified.";

        document.getElementById("qrID").value = "";

    }

}

// ==============================
// OPERATOR LOAD NOTIFICATIONS
// ==============================

async function loadNotifications() {

    const table = document.getElementById("notificationTable");

    if (!table) return;

    table.innerHTML = "";

    const { data, error } = await sb
    .from("notifications")
    .select("*")
    .order("id",{ascending:false});

    if(error){

        console.log(error);
        return;

    }

    data.forEach(function(item){

        table.innerHTML += `
        <tr>
            <td>${item.id}</td>
            <td>${item.qr_id}</td>
            <td>${item.message}</td>
            <td>${item.status}</td>
        </tr>
        `;

    });

}

// ==============================
// AUTO START
// ==============================

window.onload = function(){

    testConnection();

    loadNotifications();

    setInterval(loadNotifications,3000);

};
