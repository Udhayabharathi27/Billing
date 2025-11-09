// Cart operations and calculations
let cart = [];
let discount = { amount: 0, type: 'fixed' }; // 'fixed' or 'percent'

// Initialize cart from localStorage
function initCart() {
    const savedCart = localStorage.getItem('billingCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartDisplay();
    setupDiscountHandlers();
}

// Add item to cart
function addItemToCart(menuItem) {
    const existingItem = cart.find(item => item.id === menuItem.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartDisplay();
}

// Remove item from cart
function removeItemFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    updateCartDisplay();
}

// Update item quantity
function updateItemQuantity(itemId, change) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeItemFromCart(itemId);
        } else {
            saveCart();
            updateCartDisplay();
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('billingCart', JSON.stringify(cart));
}

// Update cart display
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        document.getElementById('generate-invoice-btn').disabled = true;
    } else {
        cartItemsContainer.innerHTML = '';
        cart.forEach(item => {
            const cartItem = createCartItemElement(item);
            cartItemsContainer.appendChild(cartItem);
        });
        document.getElementById('generate-invoice-btn').disabled = false;
    }

    updateCartSummary();
}

// Create cart item element
function createCartItemElement(item) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.setAttribute('data-item-id', item.id);

    const info = document.createElement('div');
    info.className = 'cart-item-info';

    const name = document.createElement('div');
    name.className = 'cart-item-name';
    name.textContent = item.name;

    const price = document.createElement('div');
    price.className = 'cart-item-price';
    price.textContent = `₹${item.price.toFixed(2)} each`;

    info.appendChild(name);
    info.appendChild(price);

    const controls = document.createElement('div');
    controls.className = 'cart-item-controls';

    const decreaseBtn = document.createElement('button');
    decreaseBtn.className = 'quantity-btn';
    decreaseBtn.textContent = '-';
    decreaseBtn.addEventListener('click', () => updateItemQuantity(item.id, -1));

    const quantityDisplay = document.createElement('span');
    quantityDisplay.className = 'quantity-display';
    quantityDisplay.textContent = item.quantity;

    const increaseBtn = document.createElement('button');
    increaseBtn.className = 'quantity-btn';
    increaseBtn.textContent = '+';
    increaseBtn.addEventListener('click', () => updateItemQuantity(item.id, 1));

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-item-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => removeItemFromCart(item.id));

    controls.appendChild(decreaseBtn);
    controls.appendChild(quantityDisplay);
    controls.appendChild(increaseBtn);
    controls.appendChild(removeBtn);

    cartItem.appendChild(info);
    cartItem.appendChild(controls);

    return cartItem;
}

// Update cart summary (subtotal, discount, total)
function updateCartSummary() {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount(subtotal);
    const total = subtotal - discountAmount;

    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
}

// Calculate subtotal
function calculateSubtotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Calculate discount
function calculateDiscount(subtotal) {
    if (discount.amount <= 0 || subtotal <= 0) {
        return 0;
    }
    if (discount.type === 'percent') {
        const discountAmount = (subtotal * discount.amount) / 100;
        return Math.min(discountAmount, subtotal); // Don't allow discount more than subtotal
    } else {
        return Math.min(discount.amount, subtotal); // Don't allow discount more than subtotal
    }
}

// Setup discount input handlers
function setupDiscountHandlers() {
    const discountInput = document.getElementById('discount-input');
    const discountType = document.getElementById('discount-type');

    if (!discountInput || !discountType) return;

    discountInput.addEventListener('input', () => {
        const value = parseFloat(discountInput.value);
        discount.amount = (isNaN(value) || value < 0) ? 0 : value;
        if (discount.type === 'percent' && discount.amount > 100) {
            discount.amount = 100;
            discountInput.value = 100;
        }
        updateCartSummary();
    });

    discountType.addEventListener('change', () => {
        discount.type = discountType.value;
        updateCartSummary();
    });
}

// Get cart data for invoice
function getCartData() {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount(subtotal);
    const total = subtotal - discountAmount;

    return {
        items: cart.map(item => ({
            ...item,
            total: item.price * item.quantity
        })),
        subtotal,
        discount: discountAmount,
        discountType: discount.type,
        discountValue: discount.amount,
        total
    };
}

// Clear cart
function clearCart() {
    cart = [];
    discount = { amount: 0, type: 'fixed' };
    saveCart();
    updateCartDisplay();
    
    // Reset discount input
    const discountInput = document.getElementById('discount-input');
    const discountType = document.getElementById('discount-type');
    if (discountInput) discountInput.value = '';
    if (discountType) discountType.value = 'fixed';
}

