// Main application logic and initialization

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Initialize all components
function initApp() {
    // Initialize theme (must be first to avoid flash)
    initTheme();
    setupThemeToggle();
    
    // Initialize tab navigation
    setupTabNavigation();
    
    // Initialize menu
    initMenu();
    
    // Initialize cart
    initCart();
    
    // Initialize invoices
    initInvoices();
    setupInvoiceHandlers();
    
    // Initialize reports
    initReports();
    
    // Setup generate invoice button
    const generateInvoiceBtn = document.getElementById('generate-invoice-btn');
    if (generateInvoiceBtn) {
        generateInvoiceBtn.addEventListener('click', generateInvoice);
    }
}

// Setup tab navigation
function setupTabNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab, .mobile-nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');

            // Remove active class from all tabs and contents
            navTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const targetContent = document.getElementById(`${targetTab}-section`);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            // Refresh data when switching tabs
            if (targetTab === 'cart') {
                updateCartDisplay();
            } else if (targetTab === 'invoices') {
                loadInvoices();
            } else if (targetTab === 'manage') {
                refreshManageMenu();
            } else if (targetTab === 'reports') {
                const dailyBtn = document.querySelector('[data-type="daily"]');
                if (dailyBtn && dailyBtn.classList.contains('active')) {
                    const dateInput = document.getElementById('report-date');
                    if (dateInput) {
                        loadDailyReport(new Date(dateInput.value || new Date()));
                    }
                } else {
                    const monthInput = document.getElementById('report-month');
                    if (monthInput) {
                        loadMonthlyReport(monthInput.value || getCurrentMonth());
                    }
                }
            }
        });
    });
}

