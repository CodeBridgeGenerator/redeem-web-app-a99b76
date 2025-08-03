import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import './LandingPage.css';

const LandingPage = (props) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const hasNavigated = useRef(false);

  // Check user role and redirect accordingly
  useEffect(() => {
    // Prevent multiple navigations
    if (hasNavigated.current) {
      return;
    }

    const getUserRole = () => {
      console.log("🔍 Debug - LandingPage getUserRole called");
      console.log("🔍 Debug - props.user:", props.user);
      
      if (!props.user || !props.user.email) {
        console.log("🔍 Debug - No user or email found, defaulting to user");
        return 'user';
      }
      
      // Check if this is the specific admin email
      if (props.user.email.toLowerCase() === 'khalidah.t4@gmail.com') {
        console.log("🔍 Debug - Admin email detected, returning admin");
        return 'admin';
      }
      
      console.log("🔍 Debug - Regular user email, returning user");
      return 'user';
    };

    const userRole = getUserRole();
    console.log("🔍 Debug - Final userRole:", userRole);
    
    // Set navigation flag to prevent multiple navigations
    hasNavigated.current = true;
    
    // Redirect based on role
    if (userRole === 'admin') {
      console.log("🔍 Debug - Redirecting to admin dashboard");
      navigate('/DashboardAdminControl');
    } else {
      console.log("🔍 Debug - Redirecting to user dashboard");
      navigate('/user-dashboard');
    }
  }, [props.user, navigate]);

  // Rest of the component remains the same for fallback
  const featuredRewards = [
    {
      id: 20,
      title: "20% off at The Italian Place",
      description: "Enjoy a 20% discount on your entire bill at The Italian Place.",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop",
      points: 500,
      category: "Dining"
    },
    {
      id: 1,
      title: "Hotel Discount - 25% off",
      description: "Get 25% off your next hotel booking at participating locations.",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop",
      points: 1000,
      category: "Travel"
    },
    {
      id: 26,
      title: "Amazon Gift Card - $50",
      description: "Get a $50 Amazon gift card for your shopping needs.",
      image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=200&fit=crop",
      points: 800,
      category: "Shopping"
    }
  ];

  const categories = [
    {
      id: 1,
      name: "Travel",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop"
    },
    {
      id: 2,
      name: "Experiences",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=200&fit=crop"
    },
    {
      id: 3,
      name: "Merchandise",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop"
    },
    {
      id: 4,
      name: "Gift Cards",
      image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=200&fit=crop"
    },
    {
      id: 5,
      name: "Cash Back",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop"
    },
    {
      id: 6,
      name: "Dining",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop"
    },
    {
      id: 7,
      name: "Shopping",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop"
    },
    {
      id: 8,
      name: "Entertainment",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=200&fit=crop"
    }
  ];

  const handleSearch = (query) => {
    console.log('Searching for:', query);
    // Implement search functionality
  };

  const handleCategoryClick = (category) => {
    console.log('Selected category:', category.name);
    // Navigate to category detail page with correct category ID mapping
    const categoryId = category.id;
    navigate(`/category/${categoryId}/${category.name.toLowerCase()}`);
  };

  const handleFeaturedRewardClick = (reward) => {
    console.log('Selected featured reward:', reward.title);
    // Navigate to the specific voucher detail page with correct category ID mapping
    const categoryId = reward.category === "Dining" ? 6 : 
                      reward.category === "Travel" ? 1 : 
                      reward.category === "Shopping" ? 7 : 6;
    navigate(`/voucher/${reward.id}/${categoryId}/${reward.category.toLowerCase()}`);
  };

  return (
    <div className="landing-page">
      {/* Loading state while redirecting */}
      <div className="loading-container">
        <h2>Redirecting to your dashboard...</h2>
        <p>Please wait while we set up your experience.</p>
      </div>
    </div>
  );
};

const mapState = (state) => ({
  user: state.auth.user
});

export default connect(mapState)(LandingPage); 