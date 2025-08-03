import React, { useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import { Badge } from 'primereact/badge';
import { Toast } from 'primereact/toast';

const RoleBasedNavigation = (props) => {
  const navigate = useNavigate();
  const [menu, setMenu] = React.useState(null);
  const toastRef = React.useRef(null);
  
  const getUserRole = useCallback(() => {
    if (!props.user || !props.user.email) return 'user';
    
    // Role is determined by email only
    return props.user.email === 'khalidah.t4@gmail.com' ? 'admin' : 'user';
  }, [props.user]);
  
  const isProfileComplete = useCallback(() => {
    if (!props.user) return false;
    
    // Check if user has basic profile info
    return props.user.username && props.user.phoneNumber;
  }, [props.user]);
  
  const userRole = getUserRole();
  const profileComplete = isProfileComplete();
  
  const adminMenuItems = useMemo(() => [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      command: () => navigate('/DashboardAdminControl')
    },
    {
      label: 'User Management',
      icon: 'pi pi-users',
      command: () => navigate('/users')
    },
    {
      label: 'Email Roles',
      icon: 'pi pi-envelope',
      command: () => navigate('/email-roles')
    },
    {
      label: 'Company Data',
      icon: 'pi pi-building',
      command: () => navigate('/companies')
    },
    {
      label: 'System Settings',
      icon: 'pi pi-cog',
      command: () => navigate('/profiles')
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
    {
      label: 'My Vouchers',
      icon: 'pi pi-ticket',
      command: () => navigate('/vouchers')
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
  
  return (
    <div className="role-based-navigation">
      <Toast ref={toastRef} />
      
      <div className="nav-header">
        <div className="nav-brand">
          <h2>Redeem App</h2>
        </div>
        
        <div className="nav-user">
          {!profileComplete && (
            <Badge 
              value="!" 
              severity="warning" 
              className="profile-incomplete-badge"
              title="Complete your profile"
            />
          )}
          
          <Button
            className="profile-button"
            onClick={handleProfileClick}
            text
            rounded
          >
            <div className="profile-info">
              <Avatar 
                image={props.user?.profileImage} 
                shape="circle" 
                size="normal"
                className="user-avatar"
              />
              <div className="user-details">
                <span className="username">{props.user?.username || 'User'}</span>
                <span className={`role-badge ${userRole}`}>
                  {userRole.toUpperCase()}
                </span>
              </div>
            </div>
          </Button>
          
          <Menu 
            model={menuItems} 
            popup 
            ref={setMenu}
            className="user-menu"
          />
        </div>
      </div>
      
      <div className="nav-content">
        {userRole === 'admin' ? (
          <div className="admin-dashboard">
            <h3>Admin Dashboard</h3>
            <div className="admin-stats">
              <div className="stat-card">
                <h4>Total Users</h4>
                <span className="stat-number">1,234</span>
              </div>
              <div className="stat-card">
                <h4>Active Vouchers</h4>
                <span className="stat-number">567</span>
              </div>
              <div className="stat-card">
                <h4>Total Redeemed</h4>
                <span className="stat-number">890</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="user-dashboard">
            <h3>Welcome back, {props.user?.username || 'User'}!</h3>
            <div className="user-stats">
              <div className="stat-card">
                <h4>Your Points</h4>
                <span className="stat-number">{props.user?.points || 0}</span>
              </div>
              <div className="stat-card">
                <h4>Vouchers Redeemed</h4>
                <span className="stat-number">12</span>
              </div>
              <div className="stat-card">
                <h4>Available Vouchers</h4>
                <span className="stat-number">45</span>
              </div>
            </div>
          </div>
        )}
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
});

export default connect(mapState, mapDispatch)(RoleBasedNavigation); 