# Category Detail Page Component

A detailed page that displays all vouchers for a selected category, allowing users to browse and redeem rewards.

## Features

- **Dynamic Category Loading**: Automatically loads vouchers based on selected category
- **Voucher Grid Display**: Clean card layout showing all available vouchers
- **Interactive Vouchers**: Clickable voucher cards with redemption functionality
- **Responsive Design**: Optimized for all device sizes
- **Breadcrumb Navigation**: Easy navigation back to categories
- **Points System**: Shows points required for each voucher
- **Empty State**: Handles categories with no available vouchers

## URL Structure

The page uses dynamic routing with the following pattern:
```
/category/:categoryId/:categoryName
```

Examples:
- `/category/1/dining` - Dining category
- `/category/2/travel` - Travel category
- `/category/3/shopping` - Shopping category

## Components

### Header
- Branded logo with "VoucherRedeem" branding
- Navigation menu with links to other pages
- Notification bell icon
- User profile link

### Breadcrumb Navigation
- Shows current location: Categories > [Category Name]
- Clickable link back to categories page

### Category Information
- Category icon and name
- Category description
- Dynamic content based on selected category

### Vouchers Grid
- Responsive grid layout of voucher cards
- Each card shows:
  - Voucher image
  - Title and description
  - Discount badge
  - Points required
  - Redeem button

### Empty State
- Displayed when no vouchers are available
- Encourages users to browse other categories

## Voucher Card Features

### Visual Elements
- **Voucher Image**: High-quality restaurant/product images
- **Title**: Clear voucher name
- **Description**: Detailed explanation of the offer
- **Discount Badge**: Highlighted discount information
- **Points Display**: Points required for redemption
- **Redeem Button**: Call-to-action for voucher redemption

### Interactions
- **Hover Effects**: Cards lift and show enhanced shadows
- **Click Actions**: Opens voucher details or initiates redemption
- **Redeem Button**: Separate click handler for immediate redemption

## Sample Data

### Categories Available
1. **Dining** - Restaurant rewards and dining experiences
2. **Travel** - Vacation packages and travel rewards
3. **Shopping** - Retail and shopping rewards
4. **Experiences** - Unique adventures and activities
5. **Gift Cards** - Digital and physical gift cards
6. **Cash Back** - Direct cash rewards
7. **Entertainment** - Entertainment and leisure activities
8. **Merchandise** - Physical products and items

### Sample Vouchers (Dining Category)
- 20% off at The Italian Place (500 points)
- Free appetizer at The Steakhouse (300 points)
- 15% off at The Sushi Bar (400 points)
- Complimentary dessert at The French Bistro (250 points)
- 10% off at The Mexican Cantina (200 points)
- Free drink at The Irish Pub (150 points)

## Navigation Flow

1. **Landing Page** → Click "Categories" → **Categories Page**
2. **Categories Page** → Click category card → **Category Detail Page**
3. **Category Detail Page** → Click "Back to Categories" → **Categories Page**
4. **Category Detail Page** → Click "Redeem" → Voucher redemption process

## Styling

The component uses:
- Tailwind CSS for utility classes
- Custom CSS for responsive design and animations
- PrimeIcons for iconography
- Google Fonts (Public Sans, Noto Sans)

## Responsive Breakpoints

- **Desktop**: 3-column grid layout
- **Tablet (768px)**: 2-column grid layout
- **Mobile (480px)**: Single column layout

## Customization

To customize the category detail page:

1. Update the `categories` array with your category data
2. Modify the `vouchersData` object with your voucher information
3. Add new categories and their corresponding vouchers
4. Adjust styling in the CSS file
5. Update navigation links and branding

## Interaction Handlers

- **handleVoucherClick**: Handles voucher card clicks
- **handleRedeemVoucher**: Handles redeem button clicks
- **Category Selection**: Automatically loads vouchers based on URL parameters

## Dependencies

- React Router DOM for navigation and URL parameters
- PrimeIcons for icons
- Tailwind CSS for styling
- React hooks (useState, useEffect) for state management

## Error Handling

- **Loading State**: Shows spinner while loading category data
- **Invalid Category**: Defaults to Dining category if category not found
- **Empty Vouchers**: Shows empty state with call-to-action
- **Navigation Errors**: Graceful fallback to categories page 