const BASE_URL = "http://127.0.0.1:5000";

// 1. Featured Section Logic
async function loadFeatured() {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;
    const res = await fetch(`${BASE_URL}/products/all`);
    const products = await res.json();
    const featured = products.slice(0, 3); // Top 3 items
    
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
}

// 2. Fixed User Registration
async function handleRegister(e) {
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
        alert("Account Created!"); window.location.href = "login.html";
    } else {
        alert("Registration failed. Email might exist.");
    }
}

// 3. Load Orders for Dashboard
async function loadUserDashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) window.location.href = "login.html";
    document.getElementById('welcome-msg').innerText = `Hello, ${user.name}`;

    const res = await fetch(`${BASE_URL}/orders/user/${user.id}`);
    const orders = await res.json();
    document.getElementById('order-history').innerHTML = orders.map(o => `
        <tr>
            <td>#${o.id}</td>
            <td>${new Date(o.created_at).toLocaleDateString()}</td>
            <td class="price">₹${o.total_amount}</td>
            <td>${o.status}</td>
        </tr>
    `).join('');
}

// Add Cart Helper
function addToCart(id, title, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({ deal_id: id, title, price, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert("Added to bag!");
}