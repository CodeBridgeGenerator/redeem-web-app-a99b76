# Voucher Detail Page Component

A detailed page that displays comprehensive information about a selected voucher, allowing users to view all details and redeem the voucher.

## Features

- **Dynamic Voucher Loading**: Automatically loads voucher details based on URL parameters
- **Comprehensive Information Display**: Shows all voucher details including terms and conditions
- **Multiple Redeem Options**: Both small and large redeem buttons for different contexts
- **Responsive Design**: Optimized for all device sizes
- **Breadcrumb Navigation**: Easy navigation back to categories and vouchers
- **Loading States**: Handles loading and error states gracefully
- **Interactive Elements**: Hover effects and smooth transitions

## URL Structure

The page uses dynamic routing with the following pattern:
```
/voucher/:voucherId/:categoryId/:categoryName
```

Examples:
- `/voucher/1/1/dining` - Dining voucher with ID 1
- `/voucher/7/2/travel` - Travel voucher with ID 7
- `/voucher/9/3/shopping` - Shopping voucher with ID 9

## Components

### Header
- Branded logo with "Banking Client" branding
- Navigation menu with links to other pages
- User profile link

### Breadcrumb Navigation
- Shows current location: Rewards > [Category] > Voucher Details
- Clickable links back to categories and category detail pages

### Voucher Main Content
- **Voucher Image**: High-quality image of the offer
- **Voucher Title**: Clear name of the voucher
- **Description**: Detailed explanation of the offer
- **Small Redeem Button**: Quick redeem option

### Voucher Information Section
- **Value**: What the voucher offers (e.g., "20% off")
- **Points Required**: Points needed for redemption
- **Valid Until**: Expiration date
- **Terms & Conditions**: Complete terms and conditions

### Action Buttons
- **Main Redeem Button**: Large, prominent redeem button
- **Back Button**: Navigation back to category page

## Voucher Data Structure

Each voucher includes:
- **id**: Unique voucher identifier
- **title**: Voucher name
- **description**: Detailed description
- **image**: High-quality image URL
- **points**: Points required for redemption
- **discount**: Discount value
- **value**: Display value
- **validUntil**: Expiration date
- **terms**: Terms and conditions
- **category**: Category name

## Sample Vouchers

### Dining Category
- **20% off at The Italian Place** (500 points)
- **Free appetizer at The Steakhouse** (300 points)
- **15% off at The Sushi Bar** (400 points)

### Travel Category
- **Hotel Discount - 25% off** (1000 points)

### Shopping Category
- **Amazon Gift Card** (800 points)

## Navigation Flow

1. **Landing Page** → Click "Categories" → **Categories Page**
2. **Categories Page** → Click category card → **Category Detail Page**
3. **Category Detail Page** → Click voucher card → **Voucher Detail Page**
4. **Voucher Detail Page** → Click "Back to [Category]" → **Category Detail Page**
5. **Voucher Detail Page** → Click "Redeem" → Voucher redemption process

## Interaction Handlers

- **handleRedeemVoucher**: Handles voucher redemption with success alert
- **handleBackToCategory**: Navigates back to the category detail page
- **Voucher Loading**: Automatically loads voucher data based on URL parameters

## Error Handling

- **Loading State**: Shows spinner while loading voucher data
- **Voucher Not Found**: Shows empty state with option to go back
- **Invalid Parameters**: Graceful fallback to default voucher data
- **Navigation Errors**: Proper fallback navigation

## Styling

The component uses:
- Tailwind CSS for utility classes
- Custom CSS for responsive design and animations
- PrimeIcons for iconography
- Google Fonts (Public Sans, Noto Sans)

## Responsive Breakpoints

- **Desktop**: Full layout with side-by-side image and details
- **Tablet (768px)**: Adjusted layout and spacing
- **Mobile (480px)**: Single column layout with stacked elements

## Customization

To customize the voucher detail page:

1. Update the `vouchersData` object with your voucher information
2. Modify voucher data structure as needed
3. Add new categories and their corresponding vouchers
4. Adjust styling in the CSS file
5. Update navigation links and branding
6. Customize redemption logic in `handleRedeemVoucher`

## Accessibility Features

- **Focus States**: Proper focus indicators for all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Semantic HTML structure
- **Color Contrast**: High contrast ratios for readability

## Dependencies

- React Router DOM for navigation and URL parameters
- PrimeIcons for icons
- Tailwind CSS for styling
- React hooks (useState, useEffect) for state management

## Performance Considerations

- **Lazy Loading**: Images load as needed
- **Efficient State Management**: Minimal re-renders
- **Optimized CSS**: Efficient styling with minimal overhead
- **Error Boundaries**: Graceful error handling 