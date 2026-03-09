const BASE_URL = "http://127.0.0.1:5000";

// 1. Featured Products for Home Page
async function loadFeatured() {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;
    try {
        const res = await fetch(`${BASE_URL}/products/all`);
        const products = await res.json();
        const featured = products.slice(0, 3);
        
        grid.innerHTML = featured.map(p => `
            <div class="card">
                <img src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500" alt="Fashion">
                <div class="card-info">
                    <h3>${p.title}</h3>
                    <p class="price">₹${p.discount_price}</p>
                    <button class="btn" onclick="addToCart(${p.id}, '${p.title}', ${p.discount_price})">Add to Bag</button>
                </div>
            </div>
        `).join('');
    } catch (err) { console.error("Backend unreachable", err); }
}

// 2. Auth Listeners for Login/Register
function initAuthListeners() {
    const regForm = document.getElementById('register-form');
    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;

            const res = await fetch(`${BASE_URL}/api/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            if (res.status === 201) {
                alert("Registration Successful!");
                location.reload(); // Returns to login view
            } else {
                alert("Registration failed. Please try a different email.");
            }
        });
    }
}
    // Ensure the login fetch matches the backend path exactly
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
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
                // Save user data for the Dashboard
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = "index.html"; 
            } else {
                alert(data.error || "Login failed");
            }
        } catch (err) {
            console.error("Login Error:", err);
        }
    });
    
}

// 3. Cart Helper
function addToCart(id, title, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({ deal_id: id, title, price, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${title} added to your bag!`);
}

// New Function: Load all products for the Shop Page
async function loadProducts() {
    const grid = document.getElementById('product-list');
    if (!grid) return;
    try {
        // Matches the url_prefix='/products' in your app.py
        const res = await fetch(`${BASE_URL}/products/all`); 
        const products = await res.json();
        
        grid.innerHTML = products.map(p => `
            <div class="card">
                <img src="https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=500" alt="Fashion">
                <div class="card-info">
                    <h3>${p.title}</h3>
                    <p class="price">₹${p.discount_price}</p>
                    <button class="btn" onclick="addToCart(${p.id}, '${p.title}', ${p.discount_price})">Add to Bag</button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        grid.innerHTML = "<p>Could not load products. Please check if backend is running.</p>";
    }
}