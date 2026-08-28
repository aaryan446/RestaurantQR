// =====================================================
// RestaurantQR - Main App
// =====================================================

const SUPABASE_URL =
    "https://ffzxyycnqdzkfwklzasz.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_0whZYgrVhvnJw1s9DnP--Q_UcbceYDn";


// =====================================================
// SUPABASE CONNECTION
// =====================================================

let db = null;

if (
    window.supabase &&
    SUPABASE_URL.startsWith("https://") &&
    SUPABASE_ANON_KEY.startsWith("sb_publishable_")
) {
    db = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );
}


// =====================================================
// COMMON HELPERS
// =====================================================

function showMessage(
    elementId,
    message,
    type = ""
) {
    const element =
        document.getElementById(elementId);

    if (!element) return;

    element.textContent = message;

    element.className =
        "message " + type;
}


function checkSupabase() {

    if (!db) {

        alert(
            "Supabase connection नहीं है।"
        );

        return false;
    }

    return true;
}


function escapeHTML(value) {

    return String(
        value ?? ""
    ).replace(
        /[&<>"']/g,
        function (character) {

            const map = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return map[character];
        }
    );
}


// =====================================================
// ADMIN LOGIN
// =====================================================

async function adminLogin(event) {

    event.preventDefault();

    if (!checkSupabase()) return;


    const email =
        document
            .getElementById("email")
            .value
            .trim();


    const password =
        document
            .getElementById("password")
            .value;


    const loginButton =
        document.getElementById(
            "loginBtn"
        );


    if (loginButton) {

        loginButton.disabled = true;

        loginButton.textContent =
            "Login हो रहा है...";
    }


    showMessage(
        "loginMessage",
        ""
    );


    try {

        const result =
            await db.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (result.error) {

            throw result.error;
        }


        const user =
            result.data.user;


        if (!user) {

            throw new Error(
                "User नहीं मिला।"
            );
        }


        const adminResult =
            await db
                .from("admin_profiles")
                .select(
                    "id,user_id"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .maybeSingle();


        if (adminResult.error) {

            throw adminResult.error;
        }


        if (!adminResult.data) {

            await db.auth.signOut();

            throw new Error(
                "यह account Admin नहीं है।"
            );
        }


        window.location.href =
            "admin.html";


    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );


        showMessage(
            "loginMessage",
            error.message ||
            "Login failed"
        );


    } finally {

        if (loginButton) {

            loginButton.disabled =
                false;

            loginButton.textContent =
                "Login";
        }
    }
}


// =====================================================
// LOGOUT
// =====================================================

async function logout() {

    if (db) {

        await db.auth.signOut();
    }


    window.location.href =
        "index.html";
}


// =====================================================
// CURRENT USER
// =====================================================

async function getCurrentUser() {

    if (!checkSupabase()) {

        return null;
    }


    const result =
        await db.auth.getUser();


    if (result.error) {

        console.error(
            result.error
        );

        return null;
    }


    return result.data.user;
}


// =====================================================
// ADMIN PAGE PROTECTION
// =====================================================

async function protectAdminPage() {

    if (!checkSupabase()) {

        return false;
    }


    const user =
        await getCurrentUser();


    if (!user) {

        window.location.href =
            "index.html";

        return false;
    }


    const result =
        await db
            .from("admin_profiles")
            .select(
                "id,user_id"
            )
            .eq(
                "user_id",
                user.id
            )
            .maybeSingle();


    if (
        result.error ||
        !result.data
    ) {

        await db.auth.signOut();

        window.location.href =
            "index.html";

        return false;
    }


    return true;
}


// =====================================================
// PAGE START
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const loginForm =
            document.getElementById(
                "loginForm"
            );


        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                adminLogin
            );
        }

    }
);
