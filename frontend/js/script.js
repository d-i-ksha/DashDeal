const BASE_URL = "http://127.0.0.1:5000";
let localInventory = []; 

// 1. Unified Page Loader
window.onload = () => {
    if (document.getElementById('featured-grid')) loadFeatured();
    if (document.getElementById('product-list')) loadProducts();
    if (document.getElementById('cart-items')) displayCart();
    
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
async function loadFeatured() {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;
    try {
        const res = await fetch(`${BASE_URL}/products/all`);
        const products = await res.json();
        renderIntoGrid(grid, products.slice(0, 3));
    } catch (err) { console.error("Featured items error", err); }
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
    
    let filtered = [...localInventory];
    
    if (category !== 'all') {
        filtered = filtered.filter(p => p.category === categoryName);
    }
    
    if (sortOrder === 'low') filtered.sort((a, b) => a.discount_price - b.discount_price);
    if (sortOrder === 'high') filtered.sort((a, b) => b.discount_price - a.discount_price);
    
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

    window.location.href = "payment.html"; 
}

// Final Order Database Insertion
async function completeOrderExecution() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.id) {
        showToast("Session error. Please login again.");
        return;
    }

    const total = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);

    // FIXED: Added missing comma after items array
    const orderData = {
        user_id: user.id,
        items: cart,
        total_amount: total
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
    if (products.length === 0) {
        grid.innerHTML = "<p>No products found.</p>";
        return;
    }
    grid.innerHTML = products.map(p => `
        <div class="card">
            <img src="https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=600" alt="Fashion">
            <div class="card-info">
                <h3>${p.title}</h3>
                <p class="price">₹${p.discount_price}</p>
                <button class="btn" onclick="addToCart(${p.id}, '${p.title}', ${p.discount_price})">Add to Bag</button>
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
}