const BASE_URL = "http://127.0.0.1:5000";
let localInventory = []; 

// 1. Unified Page Loader
window.onload = () => {
    if (document.getElementById('featured-grid')) loadFeatured();
    if (document.getElementById('product-list')) loadProducts();
    if (document.getElementById('cart-items')) displayCart();
    if (document.getElementById('login-form')) initAuthListeners();
    initAuthListeners();
    checkUserStatus();
};

function checkUserStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    const authLink = document.querySelector('nav a[href="login.html"]');
    if (user && authLink) {
        authLink.innerText = "Logout";
        authLink.href = "#";
        authLink.onclick = (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            location.reload();
        };
    }
}

// Global Voice Synthesis Function
function speak(text) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 0.9;
    window.speechSynthesis.speak(msg);
}

function showToast(msg) {
    const toast = document.getElementById('toast') || createToastElement();
    toast.innerText = msg;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 3000);
}

function createToastElement() {
    const t = document.createElement('div');
    t.id = 'toast';
    document.body.appendChild(t);
    return t;
}

// 2. Product Loading & Filtering
async function loadProducts() {
    const grid = document.getElementById('product-list');
    if (!grid) return;
    try {
        const res = await fetch(`${BASE_URL}/products/all`);
        const data = await res.json();
        
        // Ensure we are working with numbers for sorting
        localInventory = data.map(p => ({
            ...p,
            discount_price: parseFloat(p.discount_price)
        }));

        renderProducts(localInventory);
    } catch (err) { 
        console.error("Error loading products", err); 
    }
}

async function loadProducts() {
    const grid = document.getElementById('product-list');
    if (!grid) return;
    try {
        const res = await fetch(`${BASE_URL}/products/all`);
        localInventory = await res.json();
        renderProducts(localInventory);
    } catch (err) { console.error("Error loading products", err); }
}

function filterAndSort() {
    const categoryName = document.getElementById('category-select').value;
    const sortOrder = document.getElementById('price-sort').value;
    
    // 1. Always start from the full localInventory
    let filtered = [...localInventory];
    
    // 2. Filter by category
    if (categoryName !== 'all') {
        filtered = filtered.filter(p => 
            p.category && p.category.trim().toLowerCase() === categoryName.trim().toLowerCase()
        );
    }
    
    // 3. Sort by price (Numbers-based)
    if (sortOrder === 'low') {
        filtered.sort((a, b) => a.discount_price - b.discount_price);
    } else if (sortOrder === 'high') {
        filtered.sort((a, b) => b.discount_price - a.discount_price);
    }
    
    renderProducts(filtered);
}

// 3. Cart & Checkout Logic
function addToCart(id, title, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({ deal_id: id, title: title, price: price, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    showToast(`✨ ${title} added to bag!`);
}

function displayCart() {
    const cartItems = document.getElementById('cart-items');
    const totalDisplay = document.getElementById('cart-total');
    if (!cartItems) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p style='text-align:center;'>Your bag is empty.</p>";
        totalDisplay.innerText = "₹0";
        return;
    }

    cartItems.innerHTML = cart.map((item, index) => {
        total += parseFloat(item.price);
        return `
            <div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:20px; margin-bottom:10px;">
                <span>${item.title}</span>
                <span class="price">₹${item.price}</span>
                <button onclick="removeFromCart(${index})" style="background:none; border:none; color:red; cursor:pointer;">Remove</button>
            </div>`;
    }).join('');
    totalDisplay.innerText = `₹${total}`;
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

async function processCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        showToast("Please login to place an order.");
        setTimeout(() => window.location.href = "login.html", 1500);
        return;
    }

    if (cart.length === 0) {
        showToast("Your bag is empty!");
        return;
    }

    window.location.href = "checkout.html"; 
}

// Final Order Database Insertion
async function completeOrderExecution() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const user = JSON.parse(localStorage.getItem('user'));
    const shipping = JSON.parse(localStorage.getItem('shippingDetails')); 
    
    if (!user || !shipping) {
        showToast("Missing shipping or session information.");
        return;
    }

    const total = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);

    const orderData = {
        user_id: user.id,
        items: cart,
        total_amount: total,
        // NEW: Include shipping details in the request
        shipping_address: `${shipping.address}, ${shipping.city} - ${shipping.pincode}`,
        contact_number: shipping.phone,
        delivery_method: shipping.method
    };

    try {
        const response = await fetch(`${BASE_URL}/orders/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.status === 201) {
            showToast("Transaction Successful!");
            speak("Thank you for your purchase. Your order has been placed successfully.");
            localStorage.removeItem('cart');
            localStorage.removeItem('shippingDetails'); // Clean up
            setTimeout(() => window.location.href = "dashboard.html", 2000);
        } else {
            showToast("Payment Authorization Failed.");
            speak("I am sorry, the payment could not be processed.");
        }
    } catch (err) {
        console.error("Final Order Error:", err);
        showToast("Server error during payment.");
    }
}

async function finalizePayment() {
    const cardInput = document.getElementById('card-number');
    if (!cardInput) return;
    
    const card = cardInput.value;
    if(card.length < 16) return alert("Please enter a 16-digit card number.");
    
    speak("Processing your payment.");

    try {
        await completeOrderExecution(); 
    } catch (err) {
        showToast("Payment failed: " + err.message);
    }
}

// Helper Rendering Functions
function renderProducts(products) {
    const grid = document.getElementById('product-list');
    renderIntoGrid(grid, products);
}

function renderIntoGrid(grid, products) {
    if (!grid) return;
    if (products.length === 0) {
        grid.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>No products found in this category.</p>";
        return;
    }
    grid.innerHTML = products.map(p => `
    <div class="card">
        <img 
            src="${p.image_url}" 
            alt="${p.title}" 
            onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600';"
        >
        <div class="card-info">
            <h3>${p.title}</h3>
            <p class="price">₹${p.discount_price}</p>
            <button class="btn" onclick="addToCart(${p.id}, '${p.title.replace(/'/g, "\\'")}', ${p.discount_price})">Add to Bag</button>
        </div>
    </div>
`).join('');
}


// 4. Auth Initialization
function initAuthListeners() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const res = await fetch(`${BASE_URL}/api/users/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    showToast("Login Successful!");
                    setTimeout(() => window.location.href = "index.html", 1000);
                } else {
                    showToast(data.error || "Invalid Credentials");
                }
            } catch (err) {
                showToast("Server unreachable.");
            }
        };
    }
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.onsubmit = async (e) => {
            e.preventDefault();
            // Pulling values using the IDs from your login.html
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;

            try {
                const res = await fetch(`${BASE_URL}/api/users/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await res.json();
                if (res.ok) {
                    showToast("Registration Successful! Please Login.");
                    // Switch view back to login section
                    if (typeof toggleAuth === "function") toggleAuth(); 
                } else {
                    showToast(data.error || "Registration failed.");
                }
            } catch (err) {
                showToast("Server unreachable.");
            }
        };
    }
}
async function loadUserDashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    const orderTableBody = document.getElementById('order-history');
    const welcomeMsg = document.getElementById('welcome-msg');

    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    if (welcomeMsg) welcomeMsg.innerText = `Welcome, ${user.name}`;
    if (!orderTableBody) return;

    try {
        // Fetch orders using the user_id from localStorage
        const res = await fetch(`${BASE_URL}/orders/user/${user.id}`);
        const orders = await res.json();

        if (orders.length === 0) {
            orderTableBody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>No orders found.</td></tr>";
            return;
        }

        orderTableBody.innerHTML = orders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                <td>₹${order.total_amount}</td>
                <td style="font-size: 0.85rem; color: #666;">
                    ${order.shipping_address || 'N/A'}<br>
                    <small>📞 ${order.contact_number || ''}</small>
                </td>
                <td style="color: ${order.status === 'Pending' ? 'orange' : 'green'}; font-weight: bold;">
                    ${order.status}
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Dashboard error:", err);
        orderTableBody.innerHTML = "<tr><td colspan='4'>Error loading order history.</td></tr>";
    }
}