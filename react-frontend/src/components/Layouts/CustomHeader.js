import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { connect } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import { Badge } from 'primereact/badge';
import client from '../../services/restClient';
import './CustomHeader.css';

const CustomHeader = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menu, setMenu] = useState(null);
  const [userRole, setUserRole] = useState('user');
  const [loading, setLoading] = useState(true);
  
  const getUserRole = useCallback(async () => {
    console.log("🔍 Debug - CustomHeader getUserRole called");
    console.log("🔍 Debug - props.user:", props.user);
    
    if (!props.user || !props.user.email) {
      console.log("🔍 Debug - No user or email, defaulting to user");
      return 'user';
    }
    
    try {
      // Check emailRoles service for role assignment
      const emailRoles = await client.service("emailRoles").find({
        query: {
          email: props.user.email.toLowerCase(),
          isActive: true,
          $limit: 1
        }
      });
      
      if (emailRoles.data && emailRoles.data.length > 0) {
        const role = emailRoles.data[0].role;
        console.log("🔍 Debug - Found email role assignment:", role);
        return role;
      }
      
      // Fallback to hardcoded admin check
              if (props.user.email.toLowerCase() === process.env.REACT_APP_ADMIN_EMAIL) {
        console.log("🔍 Debug - Admin email detected in CustomHeader");
        return 'admin';
      }
      
      console.log("🔍 Debug - No role assignment found, defaulting to user");
      return 'user';
    } catch (error) {
      console.error("🔍 Debug - Error checking email roles:", error);
      
      // Special handling for admin user to prevent logout issues
              if (props.user.email && props.user.email.toLowerCase() === process.env.REACT_APP_ADMIN_EMAIL) {
        console.log("🔍 Debug - Admin user emailRoles check failed, but returning admin role");
        return 'admin';
      }
      
      console.log("🔍 Debug - EmailRoles check failed for regular user, defaulting to user role");
      return 'user';
    }
  }, [props.user]);
  
  // Fetch user role when component mounts or user changes
  useEffect(() => {
    const fetchUserRole = async () => {
      setLoading(true);
      const role = await getUserRole();
      setUserRole(role);
      setLoading(false);
    };
    
    fetchUserRole();
  }, [getUserRole]);

  // Debug user data
  useEffect(() => {
    console.log("🔍 Debug - CustomHeader user data:", {
      user: props.user,
      profileImage: props.user?.profileImage,
      username: props.user?.username,
      email: props.user?.email
    });
  }, [props.user]);

  // Refresh user data when component mounts to ensure we have latest profile info
  useEffect(() => {
    const refreshUserData = async () => {
      if (props.user && props.user._id) {
        try {
          const updatedUser = await client.service("users").get(props.user._id);
          // Update the user data in Redux store
          props.updateUser(updatedUser);
        } catch (error) {
          console.error("Error refreshing user data:", error);
        }
      }
    };
    
    refreshUserData();
  }, [props.user?._id]);
  
  const isProfileComplete = useCallback(() => {
    if (!props.user) return false;
    
    // Check if user has basic profile info
    return props.user.username && props.user.phoneNumber;
  }, [props.user]);
  
  const profileComplete = isProfileComplete();
  
  // Check if we're on an admin route
  const isAdminRoute = location.pathname.includes('/DashboardAdminControl') || 
                      location.pathname.includes('/users') ||
                      location.pathname.includes('/companies') ||
                      location.pathname.includes('/profiles');
  
  console.log("🔍 Debug - CustomHeader userRole:", userRole);
  console.log("🔍 Debug - CustomHeader isAdminRoute:", isAdminRoute);
  
  // Don't show header on login/signup pages
  const isAuthPage = location.pathname.includes('/login') || 
                    location.pathname.includes('/signup') || 
                    location.pathname.includes('/reset');
  
  console.log("🔍 Debug - CustomHeader auth state:", { 
    isAuthPage, 
    isLoggedIn: props.isLoggedIn, 
    user: props.user,
    pathname: location.pathname 
  });
  
  const adminMenuItems = useMemo(() => [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      command: () => navigate('/DashboardAdminControl')
    },
    { separator: true },
    {
      label: 'My Profile',
      icon: 'pi pi-user-edit',
      command: () => navigate('/profile-settings')
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => props.logout()
    }
  ], [navigate, props.logout]);
  
  const userMenuItems = useMemo(() => [
    {
      label: 'Home',
      icon: 'pi pi-home',
      command: () => navigate('/')
    },
    {
      label: 'Categories',
      icon: 'pi pi-tags',
      command: () => navigate('/categories')
    },
    {
      label: 'My Cart',
      icon: 'pi pi-shopping-cart',
      command: () => navigate('/cart')
    },
    { separator: true },
    {
      label: 'My Profile',
      icon: 'pi pi-user-edit',
      command: () => navigate('/profile-settings')
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => props.logout()
    }
  ], [navigate, props.logout]);
  
  const menuItems = userRole === 'admin' ? adminMenuItems : userMenuItems;
  
  const handleProfileClick = (event) => {
    if (menu) {
      menu.toggle(event);
    }
  };
  
  if (isAuthPage || !props.isLoggedIn) {
    console.log("🔍 Debug - CustomHeader returning null");
    return null;
  }
  
  // Show loading state while fetching user role
  if (loading) {
    return (
      <div className="custom-header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo">
              <h2>Redeemo</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="custom-header">
      <div className="header-container">
                  <div className="header-left">
            <div className="logo">
              <h2>Redeemo</h2>
            </div>
          
          <nav className="main-nav">
            {userRole === 'admin' ? (
              <>
                <Button 
                  label="Dashboard" 
                  icon="pi pi-home"
                  className="nav-button"
                  onClick={() => navigate('/DashboardAdminControl')}
                />
              </>
            ) : (
              <>
                <Button 
                  label="Home" 
                  icon="pi pi-home"
                  className="nav-button"
                  onClick={() => navigate('/')}
                />
                <Button 
                  label="Categories" 
                  icon="pi pi-tags"
                  className="nav-button"
                  onClick={() => navigate('/categories')}
                />
                <Button 
                  label="Cart" 
                  icon="pi pi-shopping-cart"
                  className="nav-button"
                  onClick={() => navigate('/cart')}
                />
              </>
            )}
          </nav>
        </div>
        
        <div className="header-right">
          {!profileComplete && (
            <Badge 
              value="!" 
              severity="warning" 
              className="profile-incomplete-badge"
              title="Complete your profile"
            />
          )}
          
          <div className="user-info">
            {userRole !== 'admin' && (
              <span className="points-display">
                {props.user?.points || 0} Points
              </span>
            )}
            
            <Button
              className="profile-button"
              onClick={handleProfileClick}
              text
              rounded
            >
              <div className="profile-info">
                <Avatar 
                  image={props.user?.profileImage || "/default-avatar.png"} 
                  shape="circle" 
                  size="normal"
                  className="user-avatar"
                  onError={(e) => {
                    console.log("🔍 Debug - Avatar image failed to load, using fallback");
                    e.target.src = "/default-avatar.png";
                  }}
                  onLoad={() => {
                    console.log("🔍 Debug - Avatar image loaded successfully:", props.user?.profileImage);
                  }}
                />
                <div className="user-details">
                  <span className="username">{props.user?.username || 'User'}</span>
                  <span className={`role-badge ${userRole}`}>
                    {(userRole || 'user').toUpperCase()}
                  </span>
                </div>
              </div>
            </Button>
            
            <Menu 
              model={menuItems} 
              popup 
              ref={setMenu}
              className="user-menu"
              appendTo={document.body}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const mapState = (state) => {
  const { isLoggedIn, user } = state.auth;
  return { isLoggedIn, user };
};

const mapDispatch = (dispatch) => ({
  logout: () => dispatch.auth.logout(),
  updateUser: (user) => dispatch.auth.updateUser(user),
});

export default connect(mapState, mapDispatch)(CustomHeader); 