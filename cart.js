// Global click listener for Buy Now buttons (Event Delegation)
// Placed outside DOMContentLoaded to ensure immediate registration
document.addEventListener('click', (event) => {
    const buyBtn = event.target.closest('.buy');
    if (buyBtn) {
        window.location.href = './payment.html';
    }
});

// Global Wishlist Functions
function isInWishlist(productImg) {
    let wishlist = JSON.parse(localStorage.getItem('myWishlist')) || [];
    return wishlist.some(item => item.image === productImg);
}

function setHeartRed(element) {
    element.classList.remove('fa-regular');
    element.classList.add('fa-solid');
    element.style.color = 'red';
}

function setHeartBlack(element) {
    element.classList.remove('fa-solid');
    element.classList.add('fa-regular');
    element.style.color = 'black';
}

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    const existingIndex = cart.findIndex(item => item.name === product.name && item.image === product.image);

    if (existingIndex > -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
        product.quantity = 1;
        cart.push(product);
    }

    localStorage.setItem('myCart', JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
}

function updateQuantity(index, delta) {
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    if (cart[index]) {
        cart[index].quantity = (cart[index].quantity || 1) + delta;
        if (cart[index].quantity < 1) {
            cart.splice(index, 1);
        }
        localStorage.setItem('myCart', JSON.stringify(cart));
        displayCartItems();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Check for buy buttons
    const buyButtons = document.querySelectorAll('.buy');
    buyButtons.forEach(btn => {
        btn.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = './payment.html';
        };
    });

    const cartBuyBtn = document.getElementById('cart-buy-now');
    if (cartBuyBtn) {
        cartBuyBtn.onclick = function () {
            const cart = JSON.parse(localStorage.getItem('myCart')) || [];
            if (cart.length === 0) {
                alert('Your cart is empty!');
            } else {
                window.location.href = './payment.html';
            }
        };
    }

    // Check if we are on a product page with 'Add to Cart' buttons
    const addToCartButtons = document.querySelectorAll('.atc');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const productCard = event.target.closest('div[id^="card"]');
            if (productCard) {
                const productName = productCard.querySelector('.heading').textContent;
                const productPriceStr = productCard.querySelector('.amt').textContent;
                const productImg = productCard.querySelector('img').src;
                const productPrice = parseInt(productPriceStr.replace(/[^0-9]/g, ''));

                const product = {
                    name: productName,
                    price: productPrice,
                    image: productImg,
                    id: Date.now()
                };
                addToCart(product);
            }
        });
    });

    // Wishlist Logic
    const wishlistButtons = document.querySelectorAll('.fa-heart');
    wishlistButtons.forEach(button => {
        // Initialize state
        const productCard = button.closest('div[id^="card"]');
        if (productCard) {
            const productImg = productCard.querySelector('img').src;
            if (isInWishlist(productImg)) {
                setHeartRed(button);
            }
        }

        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const productCard = event.target.closest('div[id^="card"]');

            if (productCard) {
                const productName = productCard.querySelector('.heading').textContent;
                const productPriceStr = productCard.querySelector('.amt').textContent;
                const productImg = productCard.querySelector('img').src;

                // Extract numeric price
                const productPrice = parseInt(productPriceStr.replace(/[^0-9]/g, ''));

                const product = {
                    name: productName,
                    price: productPrice,
                    image: productImg,
                    id: Date.now()
                };

                toggleWishlist(product, event.target);
            }
        });
    });



    // Check if we are on the cart page
    const cartContainer = document.getElementById('cart-items-container');
    if (cartContainer) {
        displayCartItems();
    }

    // Check if we are on the wishlist page
    const wishlistContainer = document.getElementById('wishlist-items-container');
    if (wishlistContainer) {
        displayWishlistItems();
    }
});

function displayCartItems() {
    const cartContainer = document.getElementById('cart-items-container');
    const totalPriceElement = document.getElementById('total-price');
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];

    cartContainer.innerHTML = ''; // Clear previous content
    let total = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align:center; font-size:1.2em; padding: 20px;">Your cart is empty.</p>';
    } else {
        cart.forEach((item, index) => {
            const quantity = item.quantity || 1;
            const itemTotal = item.price * quantity;
            total += itemTotal;

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.style.borderBottom = '1px solid #eee';
            itemElement.style.padding = '15px 0';
            itemElement.style.display = 'flex';
            itemElement.style.alignItems = 'center';
            itemElement.style.justifyContent = 'space-between';

            itemElement.innerHTML = `
                <div style="display:flex; align-items:center; gap: 20px;">
                    <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 100px; object-fit: cover; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <div>
                        <h4 style="margin: 0; font-size: 1.1em; color: #333;">${item.name}</h4>
                        <p style="margin: 5px 0; font-weight: bold; color: #28a745;">Rs.${item.price}</p>
                        <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                            <button onclick="updateQuantity(${index}, -1)" style="width: 25px; height: 25px; border-radius: 50%; border: 1px solid #ccc; background: white; cursor: pointer;">-</button>
                            <span style="font-weight: bold;">${quantity}</span>
                            <button onclick="updateQuantity(${index}, 1)" style="width: 25px; height: 25px; border-radius: 50%; border: 1px solid #ccc; background: white; cursor: pointer;">+</button>
                        </div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #333;">Rs.${itemTotal}</p>
                    <button onclick="removeFromCart(${index})" style="background-color: #ff4444; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; transition: background 0.3s; font-family: cursive;">Remove</button>
                </div>
            `;

            cartContainer.appendChild(itemElement);
        });
    }

    if (totalPriceElement) {
        totalPriceElement.textContent = `Total Amount: Rs.${total}`;
    }
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('myCart', JSON.stringify(cart));
    displayCartItems(); // Refresh display
}

// Wishlist Functions
function toggleWishlist(product, heartElement) {
    let wishlist = JSON.parse(localStorage.getItem('myWishlist')) || [];
    // Use image as unique identifier because names are duplicated
    const existingIndex = wishlist.findIndex(item => item.image === product.image);

    if (existingIndex > -1) {
        // Remove
        wishlist.splice(existingIndex, 1);
        setHeartBlack(heartElement);
        // alert(`${product.name} removed from wishlist!`);
    } else {
        // Add
        wishlist.push(product);
        setHeartRed(heartElement);
        alert(`${product.name} added to wishlist!`);
    }
    localStorage.setItem('myWishlist', JSON.stringify(wishlist));
}

// These functions are already defined globally above

function displayWishlistItems() {
    const wishlistContainer = document.getElementById('wishlist-items-container');
    let wishlist = JSON.parse(localStorage.getItem('myWishlist')) || [];

    wishlistContainer.innerHTML = ''; // Clear previous content

    if (wishlist.length === 0) {
        wishlistContainer.innerHTML = '<p style="text-align:center; font-size:1.2em; padding: 20px;">Your wishlist is empty.</p>';
    } else {
        wishlist.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'wishlist-item';
            itemElement.style.borderBottom = '1px solid #eee';
            itemElement.style.padding = '15px 0';
            itemElement.style.display = 'flex';
            itemElement.style.alignItems = 'center';
            itemElement.style.justifyContent = 'space-between';

            itemElement.innerHTML = `
                <div style="display:flex; align-items:center; gap: 20px;">
                    <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 100px; object-fit: cover; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <div>
                        <h4 style="margin: 0; font-size: 1.1em; color: #333;">${item.name}</h4>
                        <p style="margin: 5px 0; font-weight: bold; color: #28a745;">Rs.${item.price}</p>
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                     <button onclick="moveFromWishlistToCart(${index})" style="background-color: #28a745; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-family: cursive;">Add to Cart</button>
                    <button onclick="removeFromWishlist(${index})" style="background-color: #ff4444; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-family: cursive;">Remove</button>
                </div>
            `;

            wishlistContainer.appendChild(itemElement);
        });
    }
}

function removeFromWishlist(index) {
    let wishlist = JSON.parse(localStorage.getItem('myWishlist')) || [];
    wishlist.splice(index, 1);
    localStorage.setItem('myWishlist', JSON.stringify(wishlist));
    displayWishlistItems();
}

function moveFromWishlistToCart(index) {
    let wishlist = JSON.parse(localStorage.getItem('myWishlist')) || [];
    const product = wishlist[index];
    addToCart(product);
    removeFromWishlist(index);
}
