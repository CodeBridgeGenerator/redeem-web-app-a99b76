# Landing Page Component

A modern, responsive landing page for the CodeBridge Rewards application built with React and Tailwind CSS.

## Features

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design with smooth animations
- **Search Functionality**: Header and main search bars for finding rewards
- **Featured Rewards**: Horizontal scrollable section showcasing featured offers
- **Category Navigation**: Grid layout of reward categories
- **Navigation Links**: Seamless integration with existing app routes

## Components

### Header
- Logo and branding
- Navigation menu (Featured, Categories, My Rewards)
- Search bar with icon
- User profile link

### Hero Section
- Eye-catching background image with overlay
- Compelling headline and description
- Call-to-action button linking to dashboard

### Search Section
- Full-width search bar for finding rewards
- Integrated with search functionality

### Featured Rewards
- Horizontal scrollable cards
- Reward images, titles, and descriptions
- Hover effects and smooth transitions

### Categories
- Grid layout of reward categories
- Category images and labels
- Hover animations

## Usage

The landing page is automatically displayed at the root route (`/`) and provides navigation to:

- `/login` - User authentication
- `/dashboard` - Main application dashboard

## Styling

The component uses:
- Tailwind CSS for utility classes
- Custom CSS for responsive design and animations
- PrimeIcons for iconography
- Google Fonts (Public Sans, Noto Sans)

## Responsive Breakpoints

- **Desktop**: Full layout with all features
- **Tablet (768px)**: Adjusted padding and sizing
- **Mobile (480px)**: Optimized for smaller screens

## Customization

To customize the landing page:

1. Update the `featuredRewards` array with your reward data
2. Modify the `categories` array for different categories
3. Change background images in the hero section
4. Adjust colors and styling in the CSS file
5. Update navigation links as needed

## Dependencies

- React Router DOM for navigation
- PrimeIcons for icons
- Tailwind CSS for styling 