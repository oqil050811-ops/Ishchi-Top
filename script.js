let masters = [

    {
        id: 1,
        name: "Jasur Karimov",
        service: "Elektrik",
        location: "Chilonzor",
        experience: "5 yil",
        rating: "4.9",
        orders: 124,
        price: "50 000",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },

    {
        id: 2,
        name: "Azizbek Aliyev",
        service: "Santexnik",
        location: "Yunusobod",
        experience: "7 yil",
        rating: "5.0",
        orders: 180,
        price: "60 000",
        avatar: "https://randomuser.me/api/portraits/men/44.jpg"
    },

    {
        id: 3,
        name: "Madina Rahimova",
        service: "Uy tozalash",
        location: "Sergeli",
        experience: "4 yil",
        rating: "4.8",
        orders: 96,
        price: "80 000",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },

    {
        id: 4,
        name: "Bekzod Xasanov",
        service: "Konditsioner",
        location: "Mirzo Ulug'bek",
        experience: "6 yil",
        rating: "4.9",
        orders: 143,
        price: "100 000",
        avatar: "https://randomuser.me/api/portraits/men/52.jpg"
    },

    {
        id: 5,
        name: "Sardor Tursunov",
        service: "Elektrik",
        location: "Yakkasaroy",
        experience: "8 yil",
        rating: "4.7",
        orders: 210,
        price: "55 000",
        avatar: "https://randomuser.me/api/portraits/men/68.jpg"
    },

    {
        id: 6,
        name: "Dilnoza Karimova",
        service: "Uy tozalash",
        location: "Chilonzor",
        experience: "3 yil",
        rating: "4.9",
        orders: 87,
        price: "75 000",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg"
    },

    {
        id: 7,
        name: "Rustam Sobirov",
        service: "Remont",
        location: "Yunusobod",
        experience: "10 yil",
        rating: "4.9",
        orders: 320,
        price: "120 000",
        avatar: "https://randomuser.me/api/portraits/men/75.jpg"
    },

    {
        id: 8,
        name: "Otabek Ergashev",
        service: "Mebel",
        location: "Sergeli",
        experience: "6 yil",
        rating: "4.8",
        orders: 115,
        price: "70 000",
        avatar: "https://randomuser.me/api/portraits/men/81.jpg"
    }

];


let selectedMaster = null;

// ro'yxatdan o'tgan ustalarni ham qo'shamiz
masters = masters.concat(JSON.parse(localStorage.getItem("customMasters") || "[]"));


/* =========================
   MODAL
========================= */

function closeModal() {

    let modals =
        document.querySelectorAll(".modal");

    modals.forEach(function(modal) {

        modal.style.display = "none";

    });

}


function openLogin() {

    closeModal();

    let modal =
        document.getElementById("loginModal");

    if (modal) {
        modal.style.display = "flex";
    }

}


function openRegister() {

    closeModal();

    let modal =
        document.getElementById("registerModal");

    if (modal) {
        modal.style.display = "flex";
    }

}


/* =========================
   AUTH (haridor / usta)
========================= */

function getUsers() { return JSON.parse(localStorage.getItem("users")) || []; }

function currentUser() {
    let id = localStorage.getItem("currentUserId");
    return getUsers().find(function(u) { return String(u.id) === id; }) || null;
}

function homeFor(u) { return u.role === "master" ? "master-orders" : "masters"; }

function toggleRole() {
    let r = document.querySelector('input[name="role"]:checked').value;
    document.getElementById("masterFields").style.display = r === "master" ? "block" : "none";
}

function register() {

    let name = document.getElementById("registerName").value.trim();
    let phone = document.getElementById("registerPhone").value.trim();
    let password = document.getElementById("registerPassword").value;
    let role = document.querySelector('input[name="role"]:checked').value;

    if (!name || !phone || !password) {
        alert("Iltimos, barcha joylarni to'ldiring!");
        return;
    }

    let users = getUsers();

    if (users.some(function(u) { return u.name.toLowerCase() === name.toLowerCase(); })) {
        alert("Bu ism band, boshqa ism tanlang!");
        return;
    }

    let user = { id: Date.now(), name: name, phone: phone, password: password, role: role };

    if (role === "master") {

        let m = {
            id: user.id, name: name,
            service: document.getElementById("regService").value,
            location: document.getElementById("regLocation").value,
            experience: "Yangi", rating: "5.0", orders: 0,
            price: "50 000", avatar: "https://randomuser.me/api/portraits/men/86.jpg"
        };

        let custom = JSON.parse(localStorage.getItem("customMasters") || "[]");
        custom.push(m);
        localStorage.setItem("customMasters", JSON.stringify(custom));
        masters.push(m);
        user.masterId = m.id;
    }

    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUserId", user.id);

    closeModal();
    updateAuthUI();
    showPage(homeFor(user));
}

function login() {

    let name = document.getElementById("loginName").value.trim().toLowerCase();
    let password = document.getElementById("loginPassword").value;

    let user = getUsers().find(function(u) {
        return u.name.toLowerCase() === name && u.password === password;
    });

    if (!user) {
        alert("❌ Ism yoki parol noto'g'ri!");
        return;
    }

    localStorage.setItem("currentUserId", user.id);
    closeModal();
    updateAuthUI();

    if (user.role === "master") {
        let unread = getMasterNotifications(user.masterId).filter(function(n) { return !n.read; });

        if (unread.length > 0) {
            showNewOrderToast(unread[unread.length - 1]);
        }
    }

    showPage(homeFor(user));
}

function logout() {
    localStorage.removeItem("currentUserId");
    updateAuthUI();
    showPage("home");
}

function requireCustomer() {
    let u = currentUser();

    if (!u) {
        alert("Avval ro'yxatdan o'ting yoki tizimga kiring!");
        openLogin();
        return false;
    }

    // Usta ham boshqa ustani tanlab buyurtma bera oladi.
    return true;
}

function renderNav(u) {

    let items = [["home", "Bosh sahifa"]];

    if (!u) {
        items.push(["services", "Xizmatlar"], ["masters", "Ustalar"]);
    } else if (u.role === "customer") {
        items.push(["services", "Xizmatlar"], ["masters", "Ustalar"]);
        items.push(["orders", "Buyurtmalarim"]);
    } else {
        // Usta ham boshqa ustalardan xizmat buyurtma qila oladi.
        items.push(["services", "Xizmatlar"], ["masters", "Ustalar"]);
        items.push(["orders", "Buyurtmalarim"]);
        items.push(["master-orders", "Usta paneli"]);
    }

    document.getElementById("mainNav").innerHTML = items.map(function(i) {
        return '<a href="#' + i[0] + '" data-page="' + i[0] + '">' + i[1] + '</a>';
    }).join("");
}

function updateAuthUI() {

    let u = currentUser();

    document.getElementById("authButtons").style.display = u ? "none" : "inline";

    let box = document.getElementById("userBox");
    box.style.display = u ? "flex" : "none";

    if (u) {
        box.innerHTML =
            '<div class="user-chip"><span class="user-avatar"><img src="' +
                (u.role === "master" ? "https://randomuser.me/api/portraits/men/86.jpg" : "https://randomuser.me/api/portraits/women/50.jpg") +
                '" alt="Profil"></span>' +
            '<div><b>' + u.name + '</b><small>' + (u.role === "master" ? "Usta" : "Haridor") + '</small></div></div>' +
            '<button class="logout-button" onclick="logout()">Chiqish</button>';
    }

    renderNav(u);
    renderNotifications();
}


/* =========================
   HOME SEARCH
========================= */

function homeSearch() {

    let search =
        document.getElementById("homeSearch");

    let location =
        document.getElementById("homeLocation");


    let searchValue =
        search.value;

    let locationValue =
        location.value;


    localStorage.setItem(
        "masterSearch",
        searchValue
    );

    localStorage.setItem(
        "masterLocation",
        locationValue
    );


    showPage("masters");

}


/* =========================
   SERVICE
========================= */

function goService(service) {

    localStorage.setItem(
        "selectedService",
        service
    );

    showPage("masters");

}


function findServiceMasters(service) {

    localStorage.setItem(
        "selectedService",
        service
    );

    showPage("masters");

}


function searchServices() {

    let input =
        document.getElementById("serviceSearch");

    let cards =
        document.querySelectorAll(
            ".big-service-card"
        );


    let value =
        input.value.toLowerCase();


    cards.forEach(function(card) {

        let name =
            card.dataset.name.toLowerCase();


        if (name.includes(value)) {

            card.style.display = "block";

        } else {

            card.style.display = "none";

        }

    });

}


/* =========================
   MASTERS
========================= */

function showMasters() {

    let list =
        document.getElementById("mastersList");


    if (!list) {
        return;
    }


    let savedService =
        localStorage.getItem(
            "selectedService"
        );


    let savedSearch =
        localStorage.getItem(
            "masterSearch"
        );


    let savedLocation =
        localStorage.getItem(
            "masterLocation"
        );


    if (savedService) {

        document.getElementById(
            "masterService"
        ).value = savedService;

    }


    if (savedSearch) {

        document.getElementById(
            "masterSearch"
        ).value = savedSearch;

    }


    if (savedLocation) {

        document.getElementById(
            "masterLocation"
        ).value = savedLocation;

    }


    filterMastersPage();


    localStorage.removeItem(
        "selectedService"
    );

    localStorage.removeItem(
        "masterSearch"
    );

    localStorage.removeItem(
        "masterLocation"
    );

}


function filterMastersPage() {

    let list =
        document.getElementById("mastersList");


    if (!list) {
        return;
    }


    let search =
        document.getElementById("masterSearch")
        .value
        .toLowerCase();


    let location =
        document.getElementById("masterLocation")
        .value;


    let service =
        document.getElementById("masterService")
        .value;


    let filtered =
        masters.filter(function(master) {

            let name =
                master.name.toLowerCase();

            let masterService =
                master.service.toLowerCase();


            let searchMatch =
                name.includes(search) ||
                masterService.includes(search);


            let locationMatch =
                location == "all" ||
                master.location == location;


            let serviceMatch =
                service == "all" ||
                master.service == service;


            return (
                searchMatch &&
                locationMatch &&
                serviceMatch
            );

        });


    displayMasters(filtered);

}


function displayMasters(list) {

    let container =
        document.getElementById("mastersList");


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (list.length == 0) {

        container.innerHTML = `

            <div class="empty-orders">

                <div>🔍</div>

                <h3>
                    Usta topilmadi
                </h3>

                <p>
                    Qidiruvni o'zgartirib
                    ko'ring.
                </p>

            </div>

        `;

        return;

    }


    list.forEach(function(master) {

        container.innerHTML += `

            <div class="master-card">

                <div class="master-top">

                    <div class="master-avatar">
                        <img src="${master.avatar}" alt="${master.name}">
                    </div>

                    <div class="master-name">

                        <h3>
                            ${master.name}
                            <span style="color:#2563eb">
                                ✓
                            </span>
                        </h3>

                        <p>
                            ${master.service}
                        </p>

                    </div>

                    <span class="online"></span>

                </div>


                <div class="master-data">

                    <div>
                        <strong>
                            ⭐ ${master.rating}
                        </strong>
                        Reyting
                    </div>

                    <div>
                        <strong>
                            💼 ${master.experience}
                        </strong>
                        Tajriba
                    </div>

                    <div>
                        <strong>
                            📍 ${master.location}
                        </strong>
                        Hudud
                    </div>

                    <div>
                        <strong>
                            ${master.price} so'm
                        </strong>
                        Boshlang'ich
                    </div>

                </div>


                <div class="master-actions">

                    <button
                        class="profile-button"
                        onclick="showProfile(${master.id})">

                        Profil

                    </button>


                    <button
                        class="call-button"
                        onclick="openOrder(${master.id})">

                        🔧 Chaqirish

                    </button>

                </div>

            </div>

        `;

    });

}


/* =========================
   MASTER PROFILE
========================= */

function showProfile(id) {

    let master =
        masters.find(function(item) {

            return item.id == id;

        });


    if (!master) {
        return;
    }


    alert(

        "USTA PROFILI\n\n" +

        "👤 " +
        master.name +

        "\n🔧 " +
        master.service +

        "\n⭐ Reyting: " +
        master.rating +

        "\n💼 Tajriba: " +
        master.experience +

        "\n📍 Hudud: " +
        master.location +

        "\n📋 Buyurtmalar: " +
        master.orders +

        "\n💰 Narx: " +
        master.price +
        " so'm"

    );

}


/* =========================
   ORDER
========================= */

function openOrder(id) {

    if (!requireCustomer()) { return; }

    let master =
        masters.find(function(item) {

            return item.id == id;

        });


    if (!master) {
        return;
    }


    selectedMaster = master;

    let cu = currentUser();
    document.getElementById("orderName").value = cu ? cu.name : "";
    document.getElementById("orderPhone").value = cu ? cu.phone : "";


    let name =
        document.getElementById(
            "orderMasterName"
        );


    if (name) {

        name.innerText =
            master.name +
            " — " +
            master.service;

    }


    let modal =
        document.getElementById(
            "orderModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }

}


function createOrder() {

    if (!requireCustomer()) { return; }

    let cName = document.getElementById("orderName").value.trim();
    let cPhone = document.getElementById("orderPhone").value.trim();

    if (!cName || !cPhone) {
        alert("Ism va telefon raqamingizni kiriting!");
        return;
    }

    if (!selectedMaster) {

        alert(
            "Usta tanlanmagan!"
        );

        return;

    }


    let address =
        document.getElementById(
            "orderAddress"
        ).value;


    let date =
        document.getElementById(
            "orderDate"
        ).value;


    let time =
        document.getElementById(
            "orderTime"
        ).value;


    let comment =
        document.getElementById(
            "orderComment"
        ).value;


    if (address == "") {

        alert(
            "Manzilni kiriting!"
        );

        return;

    }


    if (date == "") {

        alert(
            "Sanani tanlang!"
        );

        return;

    }


    let confirmOrder =
        confirm(

            "Buyurtmani tasdiqlaysizmi?\n\n" +

            "🔧 Usta: " +
            selectedMaster.name +

            "\n🛠 Xizmat: " +
            selectedMaster.service +

            "\n📍 Manzil: " +
            address +

            "\n📅 Sana: " +
            date +

            "\n⏰ Vaqt: " +
            time

        );


    if (!confirmOrder) {
        return;
    }


    let orders =
        JSON.parse(
            localStorage.getItem("orders")
        ) || [];


    let newOrder = {

        id: Date.now(),

        masterId:
            selectedMaster.id,

        customerId: currentUser() ? currentUser().id : "guest",
        customerName: cName,
        customerPhone: cPhone,

        master:
            selectedMaster.name,

        service:
            selectedMaster.service,

        address:
            address,

        date:
            date,

        time:
            time,

        comment:
            comment,

        status:
            "Yangi buyurtma"

    };


    orders.push(newOrder);


    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );

    addOrderNotification(newOrder);

    alert(
        "🎉 Buyurtma muvaffaqiyatli qabul qilindi!"
    );


    closeModal();


    selectedMaster = null;


    showPage("orders");

}


/* =========================
   ORDERS
========================= */

function allOrders() {
    return JSON.parse(localStorage.getItem("orders")) || [];
}

function getOrders() {
    let u = currentUser();
    return allOrders().filter(function(o) {
        return o.customerId === (u ? u.id : "guest");
    });
}


function displayOrdersPage(type) {

    let container =
        document.getElementById(
            "ordersPageList"
        );


    if (!container) {
        return;
    }


    let orders =
        getOrders();


    if (type == "active") {

        orders =
            orders.filter(function(order) {

                return order.status !=
                    "Bekor qilindi";

            });

    }


    if (type == "cancelled") {

        orders =
            orders.filter(function(order) {

                return order.status ==
                    "Bekor qilindi";

            });

    }


    container.innerHTML = "";


    if (orders.length == 0) {

        container.innerHTML = `

            <div class="empty-orders">

                <div>
                    📋
                </div>

                <h3>
                    Buyurtmalar topilmadi
                </h3>

                <p>
                    Bu bo'limda hozircha
                    buyurtmalar yo'q.
                </p>

            </div>

        `;

        return;

    }


    orders
        .slice()
        .reverse()
        .forEach(function(order) {

            let cancelled =
                order.status ==
                "Bekor qilindi";


            container.innerHTML += `

                <div class="order-card">

                    <div>

                        <h3>
                            ${order.service}
                        </h3>

                        <p>
                            🔧 Usta:
                            ${order.master}
                        </p>

                        <p>
                            📍 ${order.address}
                        </p>

                        <p>
                            📅 ${order.date}
                            ·
                            ⏰ ${order.time}
                        </p>

                        ${
                            order.comment
                            ?
                            `
                            <p>
                                📝 ${order.comment}
                            </p>
                            `
                            :
                            ""
                        }

                    </div>


                    <div class="order-right">

                        <span
                            class="order-status"
                            style="
                                ${
                                    cancelled
                                    ?
                                    "background:#fff0f0;color:#e53935;"
                                    :
                                    ""
                                }
                            ">

                            ${
                                cancelled
                                ?
                                "🔴 Bekor qilindi"
                                :
                                "🟢 " +
                                order.status
                            }

                        </span>


                        ${
                            !cancelled
                            ?
                            `
                            <button
                                class="cancel-order-list-btn"
                                onclick="
                                    cancelOrder(${order.id})
                                ">

                                ❌ Bekor qilish

                            </button>
                            `
                            :
                            ""
                        }

                    </div>

                </div>

            `;

        });

}


function showOrders(type, button) {

    let buttons =
        document.querySelectorAll(
            ".order-tab"
        );


    buttons.forEach(function(btn) {

        btn.classList.remove(
            "active"
        );

    });


    if (button) {

        button.classList.add(
            "active"
        );

    }


    displayOrdersPage(type);

}


function cancelOrder(id) {

    let orders =
        allOrders();


    let order =
        orders.find(function(item) {

            return item.id == id;

        });


    if (!order) {
        return;
    }


    let confirmCancel =
        confirm(

            "Bu buyurtmani bekor qilmoqchimisiz?\n\n" +

            "🛠 Xizmat: " +
            order.service +

            "\n🔧 Usta: " +
            order.master +

            "\n📅 Sana: " +
            order.date +

            "\n⏰ Vaqt: " +
            order.time

        );


    if (!confirmCancel) {
        return;
    }


    orders =
        orders.map(function(item) {

            if (item.id == id) {

                item.status =
                    "Bekor qilindi";

            }

            return item;

        });


    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );


    displayOrdersPage("all");


    alert(
        "✅ Buyurtma bekor qilindi!"
    );

}


/* =========================
   SAHIFALAR (sahifa yangilanmasdan almashadi)
========================= */

const PAGES = ["home", "services", "masters", "orders", "master-orders"];

function showPage(name, push) {

    let u = currentUser();

    if (name === "orders" && u && u.role === "master") { name = "master-orders"; }
    if (name === "master-orders" && !u) { name = "home"; }
    if (name === "master-orders" && u && u.role !== "master") { name = "orders"; }

    if (PAGES.indexOf(name) === -1) {
        name = "home";
    }

    document.querySelectorAll(".page-section").forEach(function(sec) {
        sec.classList.toggle("active", sec.id === name);
    });

    document.querySelectorAll(".nav a").forEach(function(a) {
        a.classList.toggle("active", a.dataset.page === name);
    });

    if (name === "services") { displayServices(); }
    if (name === "masters")  { showMasters(); }
    if (name === "orders")   { displayOrdersPage("all"); resetOrderTabs(); }
    if (name === "master-orders") { renderMasterPage(); }

    if (push !== false) {
        history.pushState({ page: name }, "", "#" + name);
    }

    window.scrollTo(0, 0);
}

function resetOrderTabs() {
    document.querySelectorAll(".order-tab").forEach(function(t, i) {
        t.classList.toggle("active", i === 0);
    });
}

function getPageFromHash() {
    return location.hash.replace("#", "") || "home";
}

// <a href="#..."> bosilganda sahifa qayta yuklanmasin
document.addEventListener("click", function(e) {

    let link = e.target.closest('a[href^="#"]');

    if (!link) { return; }

    e.preventDefault();

    showPage(link.getAttribute("href").replace("#", ""));
});

window.addEventListener("popstate", function() {
    showPage(getPageFromHash(), false);
});


/* =========================
   XIZMATLAR SAHIFASI
========================= */

const SERVICES = [
    { name: "Uy tozalash",  icon: "🧹", text: "Uy va xonalarni professional tozalash" },
    { name: "Elektrik",     icon: "⚡", text: "Elektr tarmoqlarini tuzatish" },
    { name: "Santexnik",    icon: "🚰", text: "Quvur, kran va suv tizimlari" },
    { name: "Konditsioner", icon: "❄️", text: "O'rnatish va ta'mirlash" },
    { name: "Remont",       icon: "🔨", text: "Uy va ofislarni ta'mirlash" },
    { name: "Mebel",        icon: "🪑", text: "Mebel yig'ish va ta'mirlash" }
];

function displayServices() {

    let box = document.getElementById("servicesList");

    if (!box) { return; }

    box.innerHTML = SERVICES.map(function(s) {

        let count = masters.filter(function(m) {
            return m.service === s.name;
        }).length;

        return `
            <div class="big-service-card" data-name="${s.name}"
                 onclick="goService('${s.name}')">
                <div style="font-size:34px;margin-bottom:14px">${s.icon}</div>
                <h2>${s.name}</h2>
                <p>${s.text}</p>
                <span>${count} ta usta →</span>
            </div>
        `;
    }).join("");

    searchServices();
}


/* =========================
   USTALAR UCHUN: KELGAN BUYURTMALAR
========================= */

function renderMasterPage() {

    let u = currentUser();

    let box = document.querySelector("#master-orders .master-panel");
    if (box) { box.style.display = "none"; }

    let h = document.querySelector("#master-orders h1");
    if (h && u) { h.textContent = "Salom, " + u.name + "! 👋"; }

    displayMasterIncomingOrders();
}

function displayMasterIncomingOrders() {

    let u = currentUser();
    let container = document.getElementById("masterIncomingList");

    if (!u || !container) { return; }

    let list = allOrders().filter(function(o) { return o.masterId === u.masterId; });

    let fresh = list.filter(function(o) { return o.status === "Qabul qilindi" || o.status === "Yangi buyurtma"; }).length;
    let done = list.filter(function(o) { return o.status === "Usta tasdiqladi"; }).length;

    let stats = `
        <div class="stat-row">
            <div><strong>${list.length}</strong><span>Jami</span></div>
            <div><strong>${fresh}</strong><span>Yangi</span></div>
            <div><strong>${done}</strong><span>Tasdiqlangan</span></div>
        </div>`;

    if (list.length === 0) {
        container.innerHTML = stats + `
            <div class="empty-orders"><div>📭</div><h3>Buyurtmalar yo'q</h3>
            <p>Haridorlar sizni chaqirganda buyurtmalar shu yerda paydo bo'ladi.</p></div>`;
        return;
    }

    container.innerHTML = stats + list.slice().reverse().map(function(o) {

        let actions = (o.status === "Qabul qilindi" || o.status === "Yangi buyurtma")
            ? `<button class="accept-btn" onclick="setOrderStatus(${o.id}, 'Usta tasdiqladi')">✅ Qabul qilish</button>
               <button class="cancel-order-list-btn" onclick="setOrderStatus(${o.id}, 'Bekor qilindi')">❌ Rad etish</button>`
            : `<span class="order-status">${o.status === "Bekor qilindi" ? "🔴" : "🟢"} ${o.status}</span>`;

        return `
            <div class="order-card">
                <div>
                    <h3>${o.service}</h3>
                    <p>👤 Mijoz: ${o.customerName || "—"} ${o.customerPhone ? "· 📞 " + o.customerPhone : ""}</p>
                    <p>📍 Manzil: ${o.address}</p>
                    <p>📅 ${o.date} · ⏰ ${o.time || "—"}</p>
                    ${o.comment ? "<p>📝 " + o.comment + "</p>" : ""}
                </div>
                <div class="order-right">${actions}</div>
            </div>`;
    }).join("");
}

function setOrderStatus(id, status) {

    let orders = allOrders().map(function(o) {
        if (o.id == id) { o.status = status; }
        return o;
    });

    localStorage.setItem("orders", JSON.stringify(orders));
    displayMasterIncomingOrders();
}



/* =========================
   BILDIRISHNOMALAR
========================= */

function getNotifications() {
    return JSON.parse(localStorage.getItem("notifications") || "[]");
}

function saveNotifications(list) {
    localStorage.setItem("notifications", JSON.stringify(list));
}

function addOrderNotification(order) {
    let list = getNotifications();

    list.push({
        id: Date.now(),
        masterId: order.masterId,
        orderId: order.id,
        title: "Yangi buyurtma!",
        text: order.customerName + " sizni " + order.service + " xizmatiga chaqirdi.",
        address: order.address,
        date: order.date,
        time: order.time || "Vaqt ko'rsatilmagan",
        read: false
    });

    saveNotifications(list);
}

function getMasterNotifications(masterId) {
    return getNotifications().filter(function(n) {
        return String(n.masterId) === String(masterId);
    });
}

function renderNotifications() {
    let u = currentUser();
    let box = document.getElementById("notificationBox");
    let count = document.getElementById("notificationCount");
    let panel = document.getElementById("notificationPanel");

    if (!u || u.role !== "master") {
        if (box) box.style.display = "none";
        return;
    }

    if (box) box.style.display = "block";

    let list = getMasterNotifications(u.masterId);
    let unread = list.filter(function(n) { return !n.read; }).length;

    if (count) {
        count.textContent = unread;
        count.style.display = unread > 0 ? "flex" : "none";
    }

    if (!panel) return;

    if (list.length === 0) {
        panel.innerHTML = '<div class="no-notifications">🔔 Hozircha bildirishnoma yo\'q</div>';
        return;
    }

    panel.innerHTML = list.slice().reverse().slice(0, 8).map(function(n) {
        return `
            <div class="notification-item ${n.read ? "" : "unread"}">
                <div class="notification-icon">🔧</div>
                <div>
                    <strong>${n.title}</strong>
                    <p>${n.text}</p>
                    <small>📍 ${n.address} · 📅 ${n.date} · ⏰ ${n.time}</small>
                </div>
            </div>
        `;
    }).join("");
}

function toggleNotifications() {
    let panel = document.getElementById("notificationPanel");
    if (!panel) return;

    let isOpen = panel.classList.toggle("show");

    if (isOpen) {
        let u = currentUser();

        if (u && u.role === "master") {
            let list = getNotifications().map(function(n) {
                if (String(n.masterId) === String(u.masterId)) {
                    n.read = true;
                }
                return n;
            });

            saveNotifications(list);
            renderNotifications();
            panel.classList.add("show");
        }
    }
}

function showNewOrderToast(order) {
    let old = document.getElementById("orderToast");
    if (old) old.remove();

    let toast = document.createElement("div");
    toast.id = "orderToast";
    toast.className = "order-toast";

    toast.innerHTML = `
        <div class="toast-icon">🔔</div>
        <div>
            <strong>Yangi buyurtma!</strong>
            <p>${order.customerName} sizni ${order.service} xizmatiga chaqirdi.</p>
            <small>📍 ${order.address}</small>
        </div>
        <button onclick="this.parentElement.remove()">×</button>
    `;

    document.body.appendChild(toast);

    setTimeout(function() {
        if (toast) toast.remove();
    }, 7000);
}

/* =========================
   DARK MODE
========================= */

function applyTheme(theme) {

    document.body.classList.toggle("dark", theme === "dark");

    let btn = document.querySelector(".theme-button");

    if (btn) {
        btn.textContent = theme === "dark" ? "☀️" : "🌙";
        btn.title = theme === "dark" ? "Light mode" : "Dark mode";
    }
}

function toggleTheme() {

    let next = document.body.classList.contains("dark") ? "light" : "dark";

    localStorage.setItem("theme", next);

    applyTheme(next);
}


/* =========================
   PAGE LOAD
========================= */

document.addEventListener("DOMContentLoaded", function() {

    applyTheme(localStorage.getItem("theme") || "light");
    updateAuthUI();

    document.querySelectorAll(".modal").forEach(function(modal) {
        modal.addEventListener("click", function(e) {
            if (e.target === modal) { closeModal(); }
        });
    });

    showPage(getPageFromHash(), false);
});