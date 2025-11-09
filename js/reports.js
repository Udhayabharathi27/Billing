// Sales reports and analytics

// Initialize reports
function initReports() {
    setupReportHandlers();
    loadDailyReport(new Date());
}

// Setup report handlers
function setupReportHandlers() {
    const dailyBtn = document.querySelector('[data-type="daily"]');
    const monthlyBtn = document.querySelector('[data-type="monthly"]');
    const dateInput = document.getElementById('report-date');
    const monthInput = document.getElementById('report-month');

    if (dailyBtn) {
        dailyBtn.addEventListener('click', () => {
            dailyBtn.classList.add('active');
            monthlyBtn.classList.remove('active');
            dateInput.style.display = 'block';
            monthInput.style.display = 'none';
            const date = dateInput.value ? new Date(dateInput.value) : new Date();
            loadDailyReport(date);
        });
    }

    if (monthlyBtn) {
        monthlyBtn.addEventListener('click', () => {
            monthlyBtn.classList.add('active');
            dailyBtn.classList.remove('active');
            dateInput.style.display = 'none';
            monthInput.style.display = 'block';
            const monthValue = monthInput.value || getCurrentMonth();
            loadMonthlyReport(monthValue);
        });
    }

    if (dateInput) {
        dateInput.value = formatDateForInput(new Date());
        dateInput.addEventListener('change', () => {
            loadDailyReport(new Date(dateInput.value));
        });
    }

    if (monthInput) {
        monthInput.value = getCurrentMonth();
        monthInput.addEventListener('change', () => {
            loadMonthlyReport(monthInput.value);
        });
    }
}

// Load daily report
function loadDailyReport(date) {
    const invoices = getSavedInvoices();
    const dateStr = formatDate(date);
    
    const dayInvoices = invoices.filter(inv => {
        const invDate = formatDate(new Date(inv.date));
        return invDate === dateStr;
    });

    const reportData = calculateDailyReport(dayInvoices);
    displayDailyReport(reportData, date);
}

// Load monthly report
function loadMonthlyReport(monthValue) {
    const invoices = getSavedInvoices();
    const [year, month] = monthValue.split('-').map(Number);
    
    const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.date);
        return invDate.getFullYear() === year && invDate.getMonth() === month - 1;
    });

    const reportData = calculateMonthlyReport(monthInvoices, year, month);
    displayMonthlyReport(reportData, year, month);
}

// Calculate daily report data
function calculateDailyReport(invoices) {
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const invoiceCount = invoices.length;
    
    // Calculate best selling items
    const itemStats = {};
    invoices.forEach(invoice => {
        invoice.items.forEach(item => {
            if (!itemStats[item.name]) {
                itemStats[item.name] = {
                    name: item.name,
                    quantity: 0,
                    revenue: 0
                };
            }
            itemStats[item.name].quantity += item.quantity;
            itemStats[item.name].revenue += item.total;
        });
    });

    const bestSelling = Object.values(itemStats)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    return {
        totalRevenue,
        invoiceCount,
        bestSelling
    };
}

// Calculate monthly report data
function calculateMonthlyReport(invoices, year, month) {
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const invoiceCount = invoices.length;
    
    // Daily breakdown
    const dailyBreakdown = {};
    invoices.forEach(invoice => {
        const date = new Date(invoice.date);
        const day = date.getDate();
        if (!dailyBreakdown[day]) {
            dailyBreakdown[day] = { revenue: 0, count: 0 };
        }
        dailyBreakdown[day].revenue += invoice.total;
        dailyBreakdown[day].count += 1;
    });

    // Best selling items
    const itemStats = {};
    invoices.forEach(invoice => {
        invoice.items.forEach(item => {
            if (!itemStats[item.name]) {
                itemStats[item.name] = {
                    name: item.name,
                    quantity: 0,
                    revenue: 0
                };
            }
            itemStats[item.name].quantity += item.quantity;
            itemStats[item.name].revenue += item.total;
        });
    });

    const bestSelling = Object.values(itemStats)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    return {
        totalRevenue,
        invoiceCount,
        dailyBreakdown,
        bestSelling
    };
}

// Display daily report
function displayDailyReport(data, date) {
    const reportsContent = document.getElementById('reports-content');
    if (!reportsContent) return;

    const dateStr = date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let html = `
        <div class="report-summary">
            <div class="report-card">
                <div class="report-card-label">Total Revenue</div>
                <div class="report-card-value">₹${data.totalRevenue.toFixed(2)}</div>
            </div>
            <div class="report-card">
                <div class="report-card-label">Number of Invoices</div>
                <div class="report-card-value">${data.invoiceCount}</div>
            </div>
            <div class="report-card">
                <div class="report-card-label">Average per Invoice</div>
                <div class="report-card-value">₹${data.invoiceCount > 0 ? (data.totalRevenue / data.invoiceCount).toFixed(2) : '0.00'}</div>
            </div>
        </div>
    `;

    if (data.bestSelling.length > 0) {
        html += `
            <div class="best-selling-items">
                <h3>Best Selling Items - ${dateStr}</h3>
                <div style="background: var(--bg-color); border-radius: 8px; padding: 1rem;">
        `;
        
        data.bestSelling.forEach((item, index) => {
            html += `
                <div class="item-stat">
                    <span><strong>${index + 1}.</strong> ${item.name}</span>
                    <span>Qty: ${item.quantity} | Revenue: ₹${item.revenue.toFixed(2)}</span>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    } else {
        html += `<p style="text-align: center; color: #999; margin-top: 2rem;">No sales data for ${dateStr}</p>`;
    }

    reportsContent.innerHTML = html;
}

// Display monthly report
function displayMonthlyReport(data, year, month) {
    const reportsContent = document.getElementById('reports-content');
    if (!reportsContent) return;

    const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    let html = `
        <div class="report-summary">
            <div class="report-card">
                <div class="report-card-label">Total Revenue</div>
                <div class="report-card-value">₹${data.totalRevenue.toFixed(2)}</div>
            </div>
            <div class="report-card">
                <div class="report-card-label">Number of Invoices</div>
                <div class="report-card-value">${data.invoiceCount}</div>
            </div>
            <div class="report-card">
                <div class="report-card-label">Average per Invoice</div>
                <div class="report-card-value">₹${data.invoiceCount > 0 ? (data.totalRevenue / data.invoiceCount).toFixed(2) : '0.00'}</div>
            </div>
        </div>
    `;

    // Daily breakdown
    if (Object.keys(data.dailyBreakdown).length > 0) {
        html += `
            <div style="margin-top: 2rem;">
                <h3 style="margin-bottom: 1rem; color: var(--primary-color);">Daily Breakdown - ${monthName}</h3>
                <div style="background: var(--bg-color); border-radius: 8px; padding: 1rem;">
        `;

        const sortedDays = Object.keys(data.dailyBreakdown).sort((a, b) => a - b);
        sortedDays.forEach(day => {
            html += `
                <div class="item-stat">
                    <span><strong>Day ${day}</strong></span>
                    <span>₹${data.dailyBreakdown[day].revenue.toFixed(2)} (${data.dailyBreakdown[day].count} invoices)</span>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }

    // Best selling items
    if (data.bestSelling.length > 0) {
        html += `
            <div class="best-selling-items">
                <h3>Best Selling Items - ${monthName}</h3>
                <div style="background: var(--bg-color); border-radius: 8px; padding: 1rem;">
        `;
        
        data.bestSelling.forEach((item, index) => {
            html += `
                <div class="item-stat">
                    <span><strong>${index + 1}.</strong> ${item.name}</span>
                    <span>Qty: ${item.quantity} | Revenue: ₹${item.revenue.toFixed(2)}</span>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    } else {
        html += `<p style="text-align: center; color: #999; margin-top: 2rem;">No sales data for ${monthName}</p>`;
    }

    reportsContent.innerHTML = html;
}

// Helper functions
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateForInput(date) {
    return formatDate(date);
}

function getCurrentMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

// Get saved invoices (from invoice.js)
function getSavedInvoices() {
    const saved = localStorage.getItem('billingInvoices');
    return saved ? JSON.parse(saved) : [];
}

