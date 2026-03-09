const BASE_URL = "http://127.0.0.1:5000";

// 1. FIX: Fetch Products for the Shop Page
async function loadProducts() {
    const productGrid = document.getElementById('product-list');
    if (!productGrid) return;

    try {
        // Note: Your app.py uses url_prefix='/products'
        const response = await fetch(`${BASE_URL}/products/all`); 
        const products = await response.json();

        productGrid.innerHTML = products.map(p => `
            <div class="card">
                <img src="https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=500" alt="Fashion">
                <div class="card-info">
                    <h3>${p.title}</h3>
                    <p>${p.category_name}</p>
                    <p class="price">₹${p.discount_price}</p>
                    <button class="btn" onclick="addToCart(${p.id}, '${p.title}', ${p.discount_price})">ADD TO BAG</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        productGrid.innerHTML = "<p>Unable to load products. Is the backend running?</p>";
    }
}

// 2. FIX: Registration Logic
const registrationForm = document.getElementById('register-form');
if (registrationForm) {
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        try {
            const response = await fetch(`${BASE_URL}/api/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }) 
            });

            if (response.status === 201) {
                alert("Account created! Please login.");
                window.location.href = "login.html";
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Registration failed");
            }
        } catch (error) {
            alert("Backend connection failed.");
        }
    });
}