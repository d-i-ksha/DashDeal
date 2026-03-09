const BASE_URL = "http://127.0.0.1:5000";

window.onload = () => {
    if (document.getElementById('featured-grid')) loadFeatured();
    if (document.getElementById('product-list')) loadProducts();
    if (document.getElementById('cart-items')) displayCart();
    
    initAuthListeners();

    const user = JSON.parse(localStorage.getItem('user'));
    const authLink = document.getElementById('auth-link');
    if (user && authLink) {
        authLink.innerText = "Logout";
        authLink.onclick = (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            location.reload();
        };
    }
};

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
    } catch (err) { console.error("Featured items unreachable", err); }
}

async function loadProducts() {
    const grid = document.getElementById('product-list');
    if (!grid) return;
    try {
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
    } catch (err) { console.error("Shop items unreachable", err); }
}

function initAuthListeners() {
    const regForm = document.getElementById('register-form');
    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById('reg-name').value,
                email: document.getElementById('reg-email').value,
                password: document.getElementById('reg-password').value
            };
            const res = await fetch(`${BASE_URL}/api/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.status === 201) {
                alert("Registration Successful!");
                location.reload();
            } else { alert("Registration failed."); }
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const res = await fetch(`${BASE_URL}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = "index.html";
            } else { alert(data.error || "Login failed"); }
        });
    }
}

function addToCart(id, title, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({ deal_id: id, title: title, price: price, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${title} added to your bag! ✨`);
}

function displayCart() {
    const cartItems = document.getElementById('cart-items');
    const totalDisplay = document.getElementById('cart-total');
    if (!cartItems) return;
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let total = 0;
    if (cart.length === 0) {
        cartItems.innerHTML = "<p style='text-align:center;'>Your shopping bag is empty.</p>";
        if (totalDisplay) totalDisplay.innerText = "₹0";
        return;
    }
    cartItems.innerHTML = cart.map((item, index) => {
        total += parseFloat(item.price);
        return `<div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:15px; margin-bottom:10px;">
            <span>${item.title}</span><span class="price">₹${item.price}</span>
            <button onclick="removeFromCart(${index})" style="color:red; background:none; border:none; cursor:pointer;">Remove</button>
        </div>`;
    }).join('');
    if (totalDisplay) totalDisplay.innerText = `₹${total.toFixed(2)}`;
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
    if (!user) { alert("Please login first."); window.location.href = "login.html"; return; }
    if (cart.length === 0) return alert("Bag is empty!");
    const total = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);
    try {
        const res = await fetch(`${BASE_URL}/orders/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, total_amount: total, items: cart })
        });
        if (res.status === 201) {
            alert("Order Placed! ✨");
            localStorage.removeItem('cart');
            window.location.href = "dashboard.html";
        }
    } catch (err) { console.error("Checkout Error:", err); }
}