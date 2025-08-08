# Cart Page Component

A comprehensive cart management page that allows users to view, edit, and manage their voucher selections before redemption.

## Features

- **Cart Management**: View all vouchers added to cart with quantities
- **Quantity Controls**: Increase/decrease quantities with +/- buttons
- **Remove Items**: Delete individual vouchers from cart
- **Total Points Calculation**: Automatic calculation of total points required
- **Bulk Redemption**: Redeem all vouchers at once
- **Empty Cart State**: User-friendly empty cart message
- **Responsive Design**: Optimized for all device sizes
- **Local Storage**: Persistent cart data across sessions

## URL Structure

The cart page is accessible at:
```
/cart
```

## Components

### Header
- Branded logo with "Bank of Financials" branding
- Navigation menu with links to other pages
- Notification bell button
- User profile link

### Breadcrumb Navigation
- Shows current location: Rewards > Manage Vouchers
- Clickable link back to categories

### Cart Items Display
- **Voucher Information**: Title, description, and points per voucher
- **Voucher Image**: High-quality image of each voucher
- **Quantity Controls**: +/- buttons and direct input
- **Remove Button**: Trash icon to delete items
- **Points Display**: Shows points required per voucher

### Cart Summary
- **Total Points**: Calculated total points for all items
- **Action Buttons**: Edit Details and Redeem All options

### Empty Cart State
- **Empty Cart Icon**: Animated shopping cart emoji
- **Empty Message**: Clear indication that cart is empty
- **Continue Shopping**: Button to return to categories

## Cart Data Structure

Each cart item includes:
- **id**: Unique voucher identifier
- **title**: Voucher name
- **description**: Detailed description
- **image**: High-quality image URL
- **points**: Points required per voucher
- **quantity**: Number of vouchers selected
- **categoryId**: Category identifier
- **categoryName**: Category name

## Cart Management Functions

### updateQuantity(itemId, newQuantity)
- Updates the quantity of a specific voucher
- Prevents quantities below 1
- Recalculates total points
- Saves to localStorage

### removeItem(itemId)
- Removes a voucher from the cart
- Recalculates total points
- Updates localStorage

### handleRedeemAll()
- Processes redemption of all vouchers
- Clears the cart after successful redemption
- Shows success message
- Navigates back to categories

### handleEditDetails()
- Navigates back to categories page
- Allows users to modify their selections

### handleContinueShopping()
- Navigates to categories page
- Used when cart is empty

## Local Storage Integration

The cart uses localStorage for persistence:
- **Key**: `voucherCart`
- **Format**: JSON array of cart items
- **Automatic Loading**: Cart loads on component mount
- **Automatic Saving**: Cart saves on every modification

## Sample Cart Items

### Dining Vouchers
- **20% off at The Italian Place** (500 points)
- **Free appetizer at The Steakhouse** (300 points)
- **15% off at The Sushi Bar** (400 points)

### Travel Vouchers
- **Hotel Discount - 25% off** (1000 points)

### Shopping Vouchers
- **Amazon Gift Card** (800 points)

## Navigation Flow

1. **Landing Page** → Click "Categories" → **Categories Page**
2. **Categories Page** → Click category card → **Category Detail Page**
3. **Category Detail Page** → Click voucher card → **Voucher Detail Page**
4. **Voucher Detail Page** → Click "Add to Cart" → **Cart Page** (via navigation)
5. **Cart Page** → Click "Redeem All" → **Categories Page** (after redemption)

## Interaction Handlers

- **Quantity Controls**: +/- buttons and direct input
- **Remove Items**: Trash icon for individual removal
- **Edit Details**: Navigate back to categories
- **Redeem All**: Process all vouchers at once
- **Continue Shopping**: Return to categories when empty

## Error Handling

- **Empty Cart**: Shows empty state with call-to-action
- **Invalid Quantities**: Prevents quantities below 1
- **Missing Data**: Graceful handling of corrupted localStorage
- **Navigation Errors**: Proper fallback navigation

## Styling

The component uses:
- Tailwind CSS for utility classes
- Custom CSS for responsive design and animations
- PrimeIcons for iconography
- Google Fonts (Public Sans, Noto Sans)

## Responsive Breakpoints

- **Desktop**: Full layout with side-by-side content
- **Tablet (768px)**: Adjusted layout and spacing
- **Mobile (480px)**: Single column layout with stacked elements

## Animations

- **Empty Cart Icon**: Bounce animation on load
- **Cart Items**: Fade in up animation with stagger
- **Button Hover**: Scale and shadow effects
- **Quantity Controls**: Smooth transitions

## Accessibility Features

- **Focus States**: Proper focus indicators for all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Semantic HTML structure
- **Color Contrast**: High contrast ratios for readability
- **Reduced Motion**: Respects user's motion preferences

## Customization

To customize the cart page:

1. Update the cart data structure as needed
2. Modify localStorage key and format
3. Adjust styling in the CSS file
4. Update navigation links and branding
5. Customize redemption logic in `handleRedeemAll`
6. Add additional cart management features

## Dependencies

- React Router DOM for navigation
- PrimeIcons for icons
- Tailwind CSS for styling
- React hooks (useState, useEffect) for state management
- localStorage API for data persistence

## Performance Considerations

- **Efficient State Management**: Minimal re-renders
- **Optimized Calculations**: Efficient total points calculation
- **Local Storage**: Fast data access and persistence
- **Lazy Loading**: Images load as needed
- **Error Boundaries**: Graceful error handling

## Security Considerations

- **Data Validation**: Validate cart data from localStorage
- **Input Sanitization**: Sanitize quantity inputs
- **Redemption Validation**: Validate redemption requests
- **Data Integrity**: Ensure cart data consistency 