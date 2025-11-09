// Invoice generation and printing
let currentInvoice = null;

// Initialize invoice management
function initInvoices() {
    loadInvoices();
}

// Generate invoice from cart
function generateInvoice() {
    const cartData = getCartData();
    if (cartData.items.length === 0) {
        alert('Cart is empty!');
        return;
    }

    const invoice = {
        id: 'INV-' + Date.now(),
        date: new Date().toISOString(),
        shopName: getShopName(),
        items: cartData.items,
        subtotal: cartData.subtotal,
        discount: cartData.discount,
        discountType: cartData.discountType,
        discountValue: cartData.discountValue,
        total: cartData.total
    };

    currentInvoice = invoice;
    showInvoicePreview(invoice);
}

// Show invoice preview in modal
function showInvoicePreview(invoice) {
    const modal = document.getElementById('invoice-modal');
    const preview = document.getElementById('invoice-preview');
    
    if (!modal || !preview) return;

    preview.innerHTML = generateInvoiceHTML(invoice);
    modal.classList.add('active');
}

// Generate invoice HTML
function generateInvoiceHTML(invoice) {
    const date = new Date(invoice.date);
    const formattedDate = date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    let html = `
        <div class="invoice-header">
            <h2>${invoice.shopName}</h2>
            <p>Invoice #${invoice.id}</p>
            <p>Date: ${formattedDate}</p>
        </div>
        <div class="invoice-details">
            <div>
                <strong>Invoice ID:</strong> ${invoice.id}
            </div>
            <div>
                <strong>Date & Time:</strong> ${formattedDate}
            </div>
        </div>
        <div class="invoice-items">
            <h3>Items</h3>
            <div class="invoice-item-row" style="font-weight: 600; border-bottom: 2px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
                <span>Item</span>
                <span style="text-align: right;">
                    <span style="margin-right: 2rem;">Qty</span>
                    <span style="margin-right: 2rem;">Price</span>
                    <span>Total</span>
                </span>
            </div>
    `;

    invoice.items.forEach(item => {
        html += `
            <div class="invoice-item-row">
                <span>${item.name}</span>
                <span style="text-align: right;">
                    <span style="margin-right: 2rem;">${item.quantity}</span>
                    <span style="margin-right: 2rem;">₹${item.price.toFixed(2)}</span>
                    <span>₹${item.total.toFixed(2)}</span>
                </span>
            </div>
        `;
    });

    html += `
        </div>
        <div class="invoice-totals">
            <div class="invoice-total-row">
                <span>Subtotal:</span>
                <span>₹${invoice.subtotal.toFixed(2)}</span>
            </div>
    `;

    if (invoice.discount > 0) {
        const discountLabel = invoice.discountType === 'percent' 
            ? `Discount (${invoice.discountValue}%):` 
            : `Discount:`;
        html += `
            <div class="invoice-total-row">
                <span>${discountLabel}</span>
                <span>-₹${invoice.discount.toFixed(2)}</span>
            </div>
        `;
    }

    html += `
            <div class="invoice-final-total">
                <span>Total Payable:</span>
                <span>₹${invoice.total.toFixed(2)}</span>
            </div>
        </div>
        <div style="margin-top: 2rem; text-align: center; color: #666; font-style: italic;">
            Thank you for your business!
        </div>
    `;

    return html;
}

// Print invoice
function printInvoice() {
    window.print();
}

// Save invoice
function saveInvoice() {
    if (!currentInvoice) return;

    let invoices = getSavedInvoices();
    invoices.push(currentInvoice);
    localStorage.setItem('billingInvoices', JSON.stringify(invoices));

    // Clear cart after saving invoice
    clearCart();

    // Close modal
    closeInvoiceModal();

    // Show success message
    if (typeof showNotification === 'function') {
        showNotification('Invoice saved successfully!');
    }

    // Refresh invoices list if on invoices tab
    if (document.getElementById('invoices-section').classList.contains('active')) {
        loadInvoices();
    }
}

// Get saved invoices
function getSavedInvoices() {
    const saved = localStorage.getItem('billingInvoices');
    return saved ? JSON.parse(saved) : [];
}

// Load and display invoices
function loadInvoices() {
    const invoices = getSavedInvoices();
    const invoicesList = document.getElementById('invoices-list');
    
    if (!invoicesList) return;

    if (invoices.length === 0) {
        invoicesList.innerHTML = '<p class="empty-cart">No invoices found</p>';
        return;
    }

    // Sort by date (newest first)
    invoices.sort((a, b) => new Date(b.date) - new Date(a.date));

    invoicesList.innerHTML = '';
    invoices.forEach(invoice => {
        const invoiceCard = createInvoiceCard(invoice);
        invoicesList.appendChild(invoiceCard);
    });
}

// Create invoice card element
function createInvoiceCard(invoice) {
    const card = document.createElement('div');
    card.className = 'invoice-card';

    const date = new Date(invoice.date);
    const formattedDate = date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const info = document.createElement('div');
    info.className = 'invoice-info';

    const id = document.createElement('div');
    id.className = 'invoice-id';
    id.textContent = invoice.id;

    const dateEl = document.createElement('div');
    dateEl.className = 'invoice-date';
    dateEl.textContent = formattedDate;

    info.appendChild(id);
    info.appendChild(dateEl);

    const total = document.createElement('div');
    total.className = 'invoice-total';
    total.textContent = `₹${invoice.total.toFixed(2)}`;

    const actions = document.createElement('div');
    actions.className = 'invoice-actions';

    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn btn-primary';
    viewBtn.textContent = 'View';
    viewBtn.addEventListener('click', () => {
        currentInvoice = invoice;
        showInvoicePreview(invoice);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-cancel';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this invoice?')) {
            deleteInvoice(invoice.id);
        }
    });

    actions.appendChild(viewBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(info);
    card.appendChild(total);
    card.appendChild(actions);

    return card;
}

// Delete invoice
function deleteInvoice(invoiceId) {
    let invoices = getSavedInvoices();
    invoices = invoices.filter(inv => inv.id !== invoiceId);
    localStorage.setItem('billingInvoices', JSON.stringify(invoices));
    loadInvoices();
    
    if (typeof showNotification === 'function') {
        showNotification('Invoice deleted');
    }
}

// Close invoice modal
function closeInvoiceModal() {
    const modal = document.getElementById('invoice-modal');
    if (modal) {
        modal.classList.remove('active');
        currentInvoice = null;
    }
}

// Get shop name from settings
function getShopName() {
    const settings = localStorage.getItem('billingSettings');
    if (settings) {
        const parsed = JSON.parse(settings);
        return parsed.shopName || 'Chicken Chilly Shop';
    }
    return 'Chicken Chilly Shop';
}

// Setup invoice modal handlers
function setupInvoiceHandlers() {
    const modal = document.getElementById('invoice-modal');
    const closeBtn = document.querySelector('.close-modal');
    const printBtn = document.getElementById('print-invoice-btn');
    const saveBtn = document.getElementById('save-invoice-btn');
    const cancelBtn = document.getElementById('cancel-invoice-btn');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeInvoiceModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeInvoiceModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeInvoiceModal();
            }
        });
    }

    if (printBtn) {
        printBtn.addEventListener('click', printInvoice);
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', saveInvoice);
    }
}

