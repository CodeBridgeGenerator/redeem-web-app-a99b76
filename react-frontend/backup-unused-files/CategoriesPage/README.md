# Categories Page Component

A dedicated categories page for the CodeBridge Rewards application that allows users to browse and select reward categories for redemption.

## Features

- **Category Grid Layout**: Clean grid display of all available reward categories
- **Interactive Cards**: Clickable category cards with hover effects
- **Responsive Design**: Optimized for all device sizes
- **Navigation Integration**: Seamless navigation between pages
- **Visual Feedback**: Hover animations and active states

## Categories Included

1. **Travel** - Vacation packages and travel rewards
2. **Experiences** - Unique adventures and activities
3. **Merchandise** - Physical products and items
4. **Gift Cards** - Digital and physical gift cards
5. **Cash Back** - Direct cash rewards
6. **Dining** - Restaurant rewards and experiences
7. **Shopping** - Retail and shopping rewards
8. **Entertainment** - Leisure and entertainment activities

## Components

### Header
- Branded logo with "Spark Rewards" branding
- Navigation menu with active state indicators
- User profile link

### Page Title
- Clear "Redeem" title section
- Consistent with design system

### Categories Grid
- Responsive grid layout
- Category images with labels
- Hover effects and click interactions

### Info Section
- Helpful information about redemption process
- Styled information box

## Usage

The categories page is accessible via:
- Direct URL: `/categories`
- Navigation link from landing page
- "Redeem" link in header navigation

## Navigation

The page includes navigation to:
- **Home** (`/`) - Return to landing page
- **Rewards** (`/dashboard`) - Main rewards dashboard
- **Redeem** (`/categories`) - Current page (active)
- **Help** - Help section (placeholder)

## Styling

The component uses:
- Tailwind CSS for utility classes
- Custom CSS for responsive design and animations
- PrimeIcons for iconography
- Google Fonts (Public Sans, Noto Sans)

## Responsive Breakpoints

- **Desktop**: Full grid layout with all categories
- **Tablet (768px)**: Adjusted grid and spacing
- **Mobile (480px)**: 2-column grid for better mobile experience

## Customization

To customize the categories page:

1. Update the `categories` array with your category data
2. Modify category images and descriptions
3. Add or remove categories as needed
4. Adjust styling in the CSS file
5. Update navigation links and branding

## Interaction

- **Category Selection**: Click on any category card to select it
- **Hover Effects**: Cards lift and show shadow on hover
- **Active States**: Navigation shows current page
- **Responsive**: Layout adapts to screen size

## Dependencies

- React Router DOM for navigation
- PrimeIcons for icons
- Tailwind CSS for styling 