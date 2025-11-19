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
    render7DaySalesChart();
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
    const dailySummary = document.getElementById('daily-summary');
    if (!dailySummary) return;

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

    dailySummary.innerHTML = html;
    // Render chart for daily best-selling items
    const ctx = document.getElementById('sales-chart');
    if (ctx && window.Chart) {
        if (window.salesChartInstance) window.salesChartInstance.destroy();
        if (data.bestSelling.length > 0) {
            window.salesChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.bestSelling.map(i => i.name),
                    datasets: [{
                        label: 'Quantity Sold',
                        data: data.bestSelling.map(i => i.quantity),
                        backgroundColor: 'rgba(80,200,120,0.7)',
                        borderColor: 'rgba(80,200,120,1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: 'Best Selling Items (Today)' }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        } else {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        }
    }
}

// Render 7-day sales trend chart
function render7DaySalesChart() {
    const invoices = getSavedInvoices();
    const today = new Date();
    const days = [];
    const sales = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = formatDate(d);
        days.push(d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
        const dayTotal = invoices
            .filter(inv => formatDate(new Date(inv.date)) === dateStr)
            .reduce((sum, inv) => sum + inv.total, 0);
        sales.push(dayTotal);
    }
    const ctx = document.getElementById('sales-chart');
    if (ctx && window.Chart) {
        if (window.salesChartInstance) window.salesChartInstance.destroy();
        window.salesChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Total Sales (₹)',
                    data: sales,
                    fill: true,
                    backgroundColor: 'rgba(80,200,120,0.15)',
                    borderColor: 'rgba(80,200,120,1)',
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Sales Trend (Last 7 Days)' }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
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

    // Render chart for monthly sales (daily revenue)
    setTimeout(() => {
        const ctx = document.getElementById('sales-chart');
        if (ctx && window.Chart) {
            if (window.salesChartInstance) window.salesChartInstance.destroy();
            const sortedDays = Object.keys(data.dailyBreakdown).sort((a, b) => a - b);
            window.salesChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: sortedDays.map(day => `Day ${day}`),
                    datasets: [{
                        label: 'Revenue',
                        data: sortedDays.map(day => data.dailyBreakdown[day].revenue),
                        backgroundColor: 'rgba(74,144,226,0.2)',
                        borderColor: 'rgba(74,144,226,1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: true },
                        title: { display: true, text: 'Daily Revenue (This Month)' }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }
    }, 100);

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

