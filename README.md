# Billing Web Application

A clean, modern billing system for restaurants and shops with menu management, cart functionality, invoice generation, and sales reporting.

## Features

- **Menu Display**: Visual menu with images for all items (Chicken Rice, Goat Soup, Chilly Chicken, Egg, Chicken Liver)
- **Shopping Cart**: Add items with adjustable quantities, real-time total calculation
- **Discount System**: Apply fixed amount or percentage discounts
- **Invoice Generation**: Generate printable invoices with shop name, date/time, itemized list, and totals
- **Invoice Management**: Save, view, and delete invoices stored in browser localStorage
- **Sales Reports**: 
  - Daily reports with revenue, invoice count, and best-selling items
  - Monthly reports with daily breakdown and analytics
- **Mobile Responsive**: Optimized for tablets and phones with touch-friendly interface

## Setup

1. Clone or download this repository
2. Open `index.html` in a web browser
3. No server or installation required - works directly from the file system

## Usage

### Adding Items to Cart
- Click on any menu item to add it to the cart
- Use the +/- buttons to adjust quantities
- Click "Remove" to delete an item from the cart

### Applying Discounts
- Enter discount amount in the discount field
- Select discount type: Fixed (₹) or Percentage (%)
- Total updates automatically

### Generating Invoices
1. Add items to cart
2. Apply discount if needed
3. Click "Generate Invoice"
4. Review invoice in the preview modal
5. Click "Print Invoice" to print or "Save Invoice" to save

### Viewing Reports
- Navigate to the "Reports" tab
- Select Daily or Monthly report
- Choose date/month to view
- See revenue, invoice count, and best-selling items

### Managing Invoices
- Go to "Invoices" tab to view all saved invoices
- Click "View" to see invoice details and print
- Click "Delete" to remove an invoice

## File Structure

```
Billing/
├── index.html          # Main application page
├── css/
│   └── styles.css      # All styling (mobile-responsive)
├── js/
│   ├── app.js          # Main application logic
│   ├── menu.js         # Menu items data and management
│   ├── cart.js         # Cart operations and calculations
│   ├── invoice.js      # Invoice generation and printing
│   └── reports.js      # Sales reports and analytics
├── images/
│   └── menu/           # Menu item images
└── README.md           # This file
```

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

## Data Storage

All data is stored in browser localStorage:
- Cart items
- Saved invoices
- Shop settings

**Note**: Data is stored locally in your browser. Clearing browser data will remove all saved invoices.

## Customization

### Changing Shop Name
Edit the shop name in `index.html` or modify the `getShopName()` function in `invoice.js`.

### Adding Menu Items
Edit the `menuItems` array in `js/menu.js`:
```javascript
{
    id: 6,
    name: 'New Item',
    price: 100,
    image: 'images/menu/new-item.jpg'
}
```

### Adding Menu Images
Place images in the `images/menu/` folder and update the image paths in `menu.js`. If images are missing, colored placeholders will be displayed automatically.

## Print Settings

Invoices are optimized for printing. Use your browser's print dialog (Ctrl+P / Cmd+P) when viewing an invoice.

## Future Enhancements

- User authentication
- Backend API integration
- Database migration
- Export reports to PDF/Excel
- Multiple shop support

## License

Free to use and modify for your business needs.

"# Billing" 
