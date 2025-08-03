# Voucher Redeemed Page Component

A success page that displays when a user successfully redeems a voucher, showing a QR code and redemption details.

## Features

- **Success Confirmation**: Clear indication that the voucher has been redeemed
- **QR Code Display**: Dynamic QR code generation for voucher redemption
- **Voucher Details Summary**: Shows key information about the redeemed voucher
- **Download Functionality**: Option to download the QR code
- **Multiple Navigation Options**: Easy navigation back to different sections
- **Responsive Design**: Optimized for all device sizes
- **Animated Elements**: Smooth animations for better user experience
- **Print Support**: QR code can be printed for offline use

## URL Structure

The page uses dynamic routing with the following pattern:
```
/voucher-redeemed/:voucherId/:categoryId/:categoryName
```

Examples:
- `/voucher-redeemed/1/1/dining` - Redeemed dining voucher with ID 1
- `/voucher-redeemed/7/2/travel` - Redeemed travel voucher with ID 7
- `/voucher-redeemed/9/3/shopping` - Redeemed shopping voucher with ID 9

## Components

### Header
- Branded logo with "Banking Client" branding
- Navigation menu with links to other pages
- User profile link

### Success Message Section
- **Success Icon**: Animated checkmark icon
- **Page Title**: "Voucher Redeemed" with animation
- **Success Message**: Instructions for using the QR code

### QR Code Section
- **QR Code Image**: Dynamically generated QR code
- **QR Code Title**: "Voucher QR Code"
- **Description**: Instructions for scanning
- **Download Button**: Small download option

### Voucher Details Summary
- **Voucher Name**: Title of the redeemed voucher
- **Value**: What the voucher offers
- **Category**: Category of the voucher
- **Points Used**: Points that were deducted

### Action Buttons
- **Download QR Code**: Primary action to download the QR code
- **View Voucher Details**: Secondary action to go back to voucher details

### Navigation Links
- **Back to Categories**: Return to categories page
- **Go to Home**: Return to landing page

## QR Code Generation

The QR code is dynamically generated using the QR Server API with the following data:
```
VOUCHER-{voucherId}-{categoryName}-{timestamp}
```

Example: `VOUCHER-1-DINING-1703123456789`

## Voucher Data Structure

Each redeemed voucher includes:
- **id**: Unique voucher identifier
- **title**: Voucher name
- **description**: Detailed description
- **image**: High-quality image URL
- **points**: Points that were used
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
4. **Voucher Detail Page** → Click "Redeem" → **Voucher Redeemed Page**
5. **Voucher Redeemed Page** → Click "Back to Categories" → **Categories Page**
6. **Voucher Redeemed Page** → Click "View Voucher Details" → **Voucher Detail Page**

## Interaction Handlers

- **handleDownloadQR**: Handles QR code download with success alert
- **handleBackToCategories**: Navigates back to the categories page
- **handleBackToVoucher**: Navigates back to the voucher detail page
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

- **Desktop**: Full layout with side-by-side QR code and details
- **Tablet (768px)**: Adjusted layout and spacing
- **Mobile (480px)**: Single column layout with stacked elements

## Animations

- **Success Icon**: Bounce animation on load
- **Page Title**: Slide in from left animation
- **Success Message**: Fade in up animation
- **Voucher Details**: Fade in animation
- **Button Hover**: Scale and shadow effects

## Accessibility Features

- **Focus States**: Proper focus indicators for all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Semantic HTML structure
- **Color Contrast**: High contrast ratios for readability
- **Reduced Motion**: Respects user's motion preferences

## Print Support

The page includes print styles that:
- Hide navigation elements
- Show QR code with proper borders
- Optimize layout for printing
- Ensure QR code is clearly visible

## Customization

To customize the voucher redeemed page:

1. Update the `vouchersData` object with your voucher information
2. Modify QR code generation logic in the component
3. Adjust styling in the CSS file
4. Update navigation links and branding
5. Customize download logic in `handleDownloadQR`
6. Add additional voucher details as needed

## Dependencies

- React Router DOM for navigation and URL parameters
- PrimeIcons for icons
- Tailwind CSS for styling
- React hooks (useState, useEffect) for state management
- QR Server API for QR code generation

## Performance Considerations

- **Lazy Loading**: QR code loads as needed
- **Efficient State Management**: Minimal re-renders
- **Optimized CSS**: Efficient styling with minimal overhead
- **Error Boundaries**: Graceful error handling
- **Image Optimization**: QR code images are optimized for web

## Security Considerations

- **QR Code Data**: Includes timestamp to prevent replay attacks
- **Voucher Validation**: Server-side validation should be implemented
- **Download Security**: Ensure secure download mechanisms
- **Data Privacy**: Protect user and voucher information 