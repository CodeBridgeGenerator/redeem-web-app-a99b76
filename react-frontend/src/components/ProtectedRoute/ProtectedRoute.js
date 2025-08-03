import React from 'react';
import { connect } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ 
  children, 
  isLoggedIn, 
  user, 
  requiredRole = null, 
  fallbackPath = '/login' 
}) => {
  const location = useLocation();

  console.log("🔍 Debug - ProtectedRoute props:", { isLoggedIn, user, requiredRole, fallbackPath });
  console.log("🔍 Debug - ProtectedRoute current location:", location.pathname);

  // Check if user is logged in
  if (!isLoggedIn) {
    console.log("🔍 Debug - User not logged in, redirecting to:", fallbackPath);
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // If no specific role required, just check authentication
  if (!requiredRole) {
    return children;
  }

  // Check user role
  const getUserRole = () => {
    console.log("🔍 Debug - ProtectedRoute getUserRole called");
    console.log("🔍 Debug - user:", user);
    
    if (!user || !user.email) {
      console.log("🔍 Debug - No user or email, defaulting to user");
      return 'user';
    }
    
    // Check if this is the specific admin email
    if (user.email.toLowerCase() === 'khalidah.t4@gmail.com') {
      console.log("🔍 Debug - Admin email detected in ProtectedRoute");
      return 'admin';
    }
    
    console.log("🔍 Debug - Regular user email in ProtectedRoute");
    return 'user';
  };

  const userRole = getUserRole();
  console.log("🔍 Debug - ProtectedRoute userRole:", userRole);
  console.log("🔍 Debug - ProtectedRoute requiredRole:", requiredRole);

  // Check if user has required role
  if (userRole !== requiredRole) {
    // Redirect to appropriate page based on user role
    if (userRole === 'admin') {
      return <Navigate to="/DashboardAdminControl" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

const mapState = (state) => ({
  isLoggedIn: state.auth.isLoggedIn,
  user: state.auth.user
});

export default connect(mapState)(ProtectedRoute); 