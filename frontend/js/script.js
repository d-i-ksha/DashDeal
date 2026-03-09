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
        return `
            <div class="card" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; margin-bottom: 10px;">
                <div>
                    <h4 style="margin:0;">${item.title}</h4>
                    <small>Quantity: 1</small>
                </div>
                <div style="text-align: right;">
                    <p class="price" style="margin:0;">₹${item.price}</p>
                    <button onclick="removeFromCart(${index})" style="color: red; background: none; border: none; cursor: pointer; font-size: 0.8rem;">Remove</button>
                </div>
            </div>
        `;
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

    if (!user) {
        alert("Please login to complete your purchase.");
        window.location.href = "login.html";
        return;
    }

    if (cart.length === 0) return alert("Your bag is empty!");

    const total = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);

    const orderData = {
        user_id: user.id,
        total_amount: total,
        items: cart
    };

    try {
        const response = await fetch(`${BASE_URL}/orders/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.status === 201) {
            alert("Order Placed Successfully! ✨");
            localStorage.removeItem('cart');
            window.location.href = "dashboard.html";
        } else {
            alert("Checkout failed. Please try again.");
        }
    } catch (err) {
        console.error("Checkout Error:", err);
    }
}

