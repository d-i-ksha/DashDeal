const BASE_URL = "http://127.0.0.1:5000";
let localInventory = []; // Stores products for instant filtering

// 1. Core Page Loader
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

// 2. Product Loading & Filtering
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
    const category = document.getElementById('category-filter').value;
    const sortOrder = document.getElementById('price-sort').value;
    
    let filtered = [...localInventory];
    
    if (category !== 'all') {
        // Matches 'category' field from your SQL JOIN alias
        filtered = filtered.filter(p => p.category === category);
    }
    
    if (sortOrder === 'low-high') {
        filtered.sort((a, b) => a.discount_price - b.discount_price);
    } else if (sortOrder === 'high-low') {
        filtered.sort((a, b) => b.discount_price - a.discount_price);
    }
    
    renderProducts(filtered);
}

function renderProducts(products) {
    const grid = document.getElementById('product-list');
    if (products.length === 0) {
        grid.innerHTML = "<p>No products found in this category.</p>";
        return;
    }
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
}

// 3. Voice Payment & Checkout
function speak(text) {
    const msg = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(msg);
}

async function processCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        speak("Please login to proceed with your payment.");
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    if (cart.length === 0) return alert("Bag is empty!");

    speak("Redirecting you to our secure payment gateway.");
    window.location.href = "payment.html"; 
}

