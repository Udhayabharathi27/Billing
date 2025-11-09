// Menu items data and management
// Default menu items
const defaultMenuItems = [
    {
        id: 1,
        name: 'Chicken Rice',
        price: 150,
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop'
    },
    {
        id: 2,
        name: 'Goat Soup',
        price: 200,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop'
    },
    {
        id: 3,
        name: 'Chilly Chicken',
        price: 180,
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop'
    },
    {
        id: 4,
        name: 'Egg',
        price: 50,
        image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop'
    },
    {
        id: 5,
        name: 'Chicken Liver',
        price: 120,
        image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop'
    }
];

// Get menu items from localStorage or use defaults
function getMenuItems() {
    const saved = localStorage.getItem('billingMenuItems');
    if (saved) {
        return JSON.parse(saved);
    }
    // Save defaults to localStorage
    saveMenuItems(defaultMenuItems);
    return defaultMenuItems;
}

// Save menu items to localStorage
function saveMenuItems(items) {
    localStorage.setItem('billingMenuItems', JSON.stringify(items));
}

// Get menu items
let menuItems = getMenuItems();

// Initialize menu display
function initMenu() {
    menuItems = getMenuItems();
    refreshMenuDisplay();
    initManageMenu();
    setupMenuFormHandlers();
}

// Refresh menu display
function refreshMenuDisplay() {
    const menuGrid = document.getElementById('menu-grid');
    if (!menuGrid) return;

    menuGrid.innerHTML = '';

    menuItems.forEach(item => {
        const menuItemCard = createMenuItemCard(item);
        menuGrid.appendChild(menuItemCard);
    });
}

// Create menu item card element
function createMenuItemCard(item) {
    const card = document.createElement('div');
    card.className = 'menu-item';
    card.setAttribute('data-item-id', item.id);

    // Create image with fallback
    const img = document.createElement('img');
    img.className = 'menu-item-image';
    img.src = item.image;
    img.alt = item.name;
    img.loading = 'lazy'; // Lazy load images for better performance
    img.onerror = function() {
        // Fallback to colored div if image doesn't load
        this.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = 'menu-item-image';
        fallback.style.background = getColorForItem(item.id);
        fallback.style.display = 'flex';
        fallback.style.alignItems = 'center';
        fallback.style.justifyContent = 'center';
        fallback.style.color = 'white';
        fallback.style.fontSize = '2rem';
        fallback.textContent = item.name.charAt(0);
        card.insertBefore(fallback, card.firstChild);
    };

    const name = document.createElement('div');
    name.className = 'menu-item-name';
    name.textContent = item.name;

    const price = document.createElement('div');
    price.className = 'menu-item-price';
    price.textContent = `₹${item.price.toFixed(2)}`;

    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(price);

    // Add click handler to add item to cart
    card.addEventListener('click', () => {
        addItemToCart(item);
        showNotification(`${item.name} added to cart!`);
    });

    return card;
}

// Get color for menu item fallback image
function getColorForItem(id) {
    const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    return colors[(id - 1) % colors.length];
}

// Get menu item by ID
function getMenuItemById(id) {
    return menuItems.find(item => item.id === id);
}

// Add new menu item
function addMenuItem(name, price, image) {
    const newId = menuItems.length > 0 ? Math.max(...menuItems.map(i => i.id)) + 1 : 1;
    const newItem = {
        id: newId,
        name: name.trim(),
        price: parseFloat(price),
        image: image.trim() || ''
    };
    menuItems.push(newItem);
    saveMenuItems(menuItems);
    refreshMenuDisplay();
    refreshManageMenu();
    showNotification(`${newItem.name} added to menu!`);
    return newItem;
}

// Update menu item
function updateMenuItem(id, name, price, image) {
    const item = menuItems.find(i => i.id === id);
    if (item) {
        item.name = name.trim();
        item.price = parseFloat(price);
        if (image.trim()) {
            item.image = image.trim();
        }
        saveMenuItems(menuItems);
        refreshMenuDisplay();
        refreshManageMenu();
        showNotification(`${item.name} updated!`);
        return item;
    }
    return null;
}

// Delete menu item
function deleteMenuItem(id) {
    const item = menuItems.find(i => i.id === id);
    if (item) {
        menuItems = menuItems.filter(i => i.id !== id);
        saveMenuItems(menuItems);
        refreshMenuDisplay();
        refreshManageMenu();
        showNotification(`${item.name} deleted from menu!`);
        return true;
    }
    return false;
}

// Initialize manage menu section
function initManageMenu() {
    refreshManageMenu();
}

// Refresh manage menu display
function refreshManageMenu() {
    const manageList = document.getElementById('manage-menu-list');
    if (!manageList) return;

    manageList.innerHTML = '';

    if (menuItems.length === 0) {
        manageList.innerHTML = '<p class="empty-cart">No menu items. Add your first item!</p>';
        return;
    }

    menuItems.forEach(item => {
        const itemCard = createManageItemCard(item);
        manageList.appendChild(itemCard);
    });
}

// Create manage menu item card
function createManageItemCard(item) {
    const card = document.createElement('div');
    card.className = 'manage-item-card';
    card.setAttribute('data-item-id', item.id);

    const info = document.createElement('div');
    info.className = 'manage-item-info';

    const name = document.createElement('div');
    name.className = 'manage-item-name';
    name.textContent = item.name;

    const price = document.createElement('div');
    price.className = 'manage-item-price';
    price.textContent = `₹${item.price.toFixed(2)}`;

    info.appendChild(name);
    info.appendChild(price);

    const actions = document.createElement('div');
    actions.className = 'manage-item-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-secondary';
    editBtn.textContent = 'Edit';
    editBtn.style.cssText = 'width: auto; margin: 0; padding: 0.5rem 1rem; font-size: 0.9rem;';
    editBtn.addEventListener('click', () => openMenuForm(item));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-cancel';
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.cssText = 'width: auto; margin: 0; padding: 0.5rem 1rem; font-size: 0.9rem;';
    deleteBtn.addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
            deleteMenuItem(item.id);
        }
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(info);
    card.appendChild(actions);

    return card;
}

// Open menu form for adding/editing
let currentEditItemId = null;

function openMenuForm(item = null) {
    const modal = document.getElementById('menu-item-modal');
    const formTitle = document.getElementById('menu-form-title');
    const nameInput = document.getElementById('item-name');
    const priceInput = document.getElementById('item-price');
    const imageInput = document.getElementById('item-image');
    const previewDiv = document.getElementById('item-preview');
    const previewContent = document.getElementById('item-preview-content');

    if (item) {
        // Edit mode
        currentEditItemId = item.id;
        formTitle.textContent = 'Edit Menu Item';
        nameInput.value = item.name;
        priceInput.value = item.price;
        imageInput.value = item.image || '';
    } else {
        // Add mode
        currentEditItemId = null;
        formTitle.textContent = 'Add Menu Item';
        nameInput.value = '';
        priceInput.value = '';
        imageInput.value = '';
    }

    // Update preview if image URL exists
    if (imageInput.value.trim()) {
        previewDiv.style.display = 'block';
        previewContent.innerHTML = `
            <img src="${imageInput.value}" 
                 style="width: 100%; height: 150px; object-fit: cover; border-radius: 6px;" 
                 onerror="this.parentElement.innerHTML='<div style=\\'padding: 2rem; text-align: center; color: #999;\\'>Invalid image URL</div>'"
                 alt="Preview">
        `;
    } else {
        previewDiv.style.display = 'none';
    }

    modal.classList.add('active');
}

// Close menu form
function closeMenuForm() {
    const modal = document.getElementById('menu-item-modal');
    modal.classList.remove('active');
    currentEditItemId = null;
    
    // Reset form
    document.getElementById('item-name').value = '';
    document.getElementById('item-price').value = '';
    document.getElementById('item-image').value = '';
    document.getElementById('item-preview').style.display = 'none';
}

// Setup menu form handlers
function setupMenuFormHandlers() {
    const addBtn = document.getElementById('add-item-btn');
    const addNewBtn = document.getElementById('add-new-item-btn');
    const saveBtn = document.getElementById('save-item-btn');
    const cancelBtn = document.getElementById('cancel-item-btn');
    const closeBtn = document.querySelector('.close-menu-modal');
    const modal = document.getElementById('menu-item-modal');
    const imageInput = document.getElementById('item-image');
    const previewDiv = document.getElementById('item-preview');
    const previewContent = document.getElementById('item-preview-content');

    // Setup image preview handler (only once)
    if (imageInput) {
        imageInput.addEventListener('input', () => {
            if (imageInput.value.trim()) {
                previewDiv.style.display = 'block';
                previewContent.innerHTML = `
                    <img src="${imageInput.value}" 
                         style="width: 100%; height: 150px; object-fit: cover; border-radius: 6px;" 
                         onerror="this.parentElement.innerHTML='<div style=\\'padding: 2rem; text-align: center; color: #999;\\'>Invalid image URL</div>'"
                         alt="Preview">
                `;
            } else {
                previewDiv.style.display = 'none';
            }
        });
    }

    if (addBtn) {
        addBtn.addEventListener('click', () => openMenuForm());
    }

    if (addNewBtn) {
        addNewBtn.addEventListener('click', () => openMenuForm());
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const name = document.getElementById('item-name').value;
            const price = document.getElementById('item-price').value;
            const image = document.getElementById('item-image').value;

            if (!name.trim()) {
                alert('Please enter item name');
                return;
            }

            if (!price || parseFloat(price) <= 0) {
                alert('Please enter a valid price');
                return;
            }

            if (currentEditItemId) {
                updateMenuItem(currentEditItemId, name, price, image);
            } else {
                addMenuItem(name, price, image);
            }

            closeMenuForm();
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeMenuForm);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeMenuForm);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeMenuForm();
            }
        });
    }
}

// Show notification (simple toast)
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4a90e2;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    if (!document.getElementById('notification-styles')) {
        style.id = 'notification-styles';
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

