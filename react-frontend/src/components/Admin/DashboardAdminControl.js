import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import client from '../../services/restClient';
import './DashboardAdminControl.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardAdminControl = (props) => {
  const [categories, setCategories] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const toastRef = React.useRef(null);
  
  // Category management
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryData, setCategoryData] = useState({
    name: '',
    isActive: true
  });
  
  // Voucher management
  const [voucherDialog, setVoucherDialog] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [voucherData, setVoucherData] = useState({
    id: '', // Required field
    title: '',
    description: '',
    points: 0,
    categoryId: '',
    image: '',
    termsAndCondition: '',
    isLatest: false,
    isActive: true
  });
  
  // User management
  const [userDialog, setUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    isActive: true
  });

  // Cart Items management (Admin can view all cart items)
  const [cartItems, setCartItems] = useState([]);
  const [cartItemDialog, setCartItemDialog] = useState(false);
  const [editingCartItem, setEditingCartItem] = useState(null);
  const [cartItemData, setCartItemData] = useState({
    quantity: 1,
    isActive: true
  });

  // Cart Item History management
  const [cartItemHistory, setCartItemHistory] = useState([]);
  
  // Analytics state
  const [analyticsData, setAnalyticsData] = useState({
    chartData: null,
    totalRedeemed: 0,
    totalPoints: 0
  });

  useEffect(() => {
    console.log("🔍 Debug - DashboardAdminControl mounted");
    console.log("🔍 Debug - Current user:", props.user);
    console.log("🔍 Debug - Is logged in:", props.isLoggedIn);
    
    if (props.isLoggedIn && props.user) {
      loadData();
    } else {
      console.log("🔍 Debug - User not logged in or missing user data");
    }
  }, [props.isLoggedIn, props.user]);

  // Monitor analyticsData changes
  useEffect(() => {
    console.log("🔍 Debug - analyticsData changed:", analyticsData);
  }, [analyticsData]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Check if user is authenticated
      try {
        const authResult = await client.reAuthenticate();
        console.log("🔍 Debug - Authentication check:", authResult);
      } catch (authError) {
        console.error("🔍 Debug - Authentication failed:", authError);
        showToast("error", "Authentication Error", "Please login again");
        window.location.href = '/login';
        return;
      }
      
      // Load categories
      const categoriesResponse = await client.service("category").find({
        query: { $limit: 1000 }
      });
      setCategories(categoriesResponse.data || []);
      
      // Load cart item history for analytics
      const historyResponse = await client.service("cartItemHistory").find({
        query: { 
          status: 'redeemed',
          $limit: 1000 
        }
      });
      setCartItemHistory(historyResponse.data || []);
      
      // Load vouchers
      const vouchersResponse = await client.service("voucher").find({
        query: { $limit: 1000 }
      });
      setVouchers(vouchersResponse.data || []);
      
      // Process analytics data
      console.log("🔍 Debug - About to process analytics data");
      console.log("🔍 Debug - History data:", historyResponse.data);
      console.log("🔍 Debug - Categories data:", categoriesResponse.data);
      console.log("🔍 Debug - Vouchers data:", vouchersResponse.data);
      
      processAnalyticsData(historyResponse.data || [], categoriesResponse.data || [], vouchersResponse.data || []);

      // Load users
      const usersResponse = await client.service("users").find({
        query: { $limit: 1000 }
      });
      console.log("🔍 Debug - Loaded users:", usersResponse.data);
      setUsers(usersResponse.data || []);

      // Load cart items
      const cartItemsResponse = await client.service("cartItems").find({
        query: { $limit: 1000 }
      });
      setCartItems(cartItemsResponse.data || []);

      // Load cart item history
      const cartItemHistoryResponse = await client.service("cartItemHistory").find({
        query: { $limit: 1000 }
      });
      
      console.log("🔍 Debug - Raw cart item history data:", cartItemHistoryResponse.data);
      
      // Enhance cart item history with voucher details
      const cartItemHistoryWithVouchers = await Promise.all(
        cartItemHistoryResponse.data.map(async (historyItem) => {
          console.log("🔍 Debug - Processing history item:", historyItem);
          
          try {
            // Try to get voucher details for title
            const voucherResponse = await client.service("voucher").find({
              query: {
                $or: [
                  { _id: historyItem.voucherId },
                  { id: historyItem.voucherId }
                ],
                $limit: 1,
              },
            });
            
            console.log("🔍 Debug - Voucher response:", voucherResponse);
            
            const voucher = voucherResponse.data[0] || {};
            
            const enhancedItem = {
              ...historyItem,
              pointsUsed: historyItem.pointsUsed || 0, // Use existing pointsUsed field
              voucherTitle: voucher.title || 'Unknown Voucher'
            };
            
            console.log("🔍 Debug - Enhanced item:", enhancedItem);
            return enhancedItem;
          } catch (error) {
            console.error('Error fetching voucher details:', error);
            return {
              ...historyItem,
              pointsUsed: 0,
              voucherTitle: 'Unknown Voucher'
            };
          }
        })
      );
      
      console.log("🔍 Debug - Final cart item history with vouchers:", cartItemHistoryWithVouchers);
      setCartItemHistory(cartItemHistoryWithVouchers || []);
    } catch (error) {
      console.error("🔍 Debug - Error loading data:", error);
      showToast("error", "Error", "Failed to load data");
    }
    setLoading(false);
  };

  const showToast = (severity, summary, detail) => {
    toastRef.current.show({
      severity,
      summary,
      detail,
      life: 3000
    });
  };

  const processAnalyticsData = (historyData, categoriesData, vouchersData) => {
    console.log("🔍 Debug - Processing analytics data");
    console.log("🔍 Debug - History data length:", historyData.length);
    console.log("🔍 Debug - Categories data length:", categoriesData.length);
    console.log("🔍 Debug - Vouchers data length:", vouchersData.length);
    
    // Group redeemed vouchers by category
    const categoryStats = {};
    let totalRedeemed = 0;
    let totalPoints = 0;

    historyData.forEach(item => {
      // Find the voucher using voucherId
      const voucher = vouchersData.find(v => 
        v._id === item.voucherId || 
        v._id.toString() === item.voucherId || 
        v.id === item.voucherId
      );
      
      if (voucher && voucher.categoryId) {
        const categoryId = voucher.categoryId;
        const category = categoriesData.find(cat => 
          cat._id === categoryId || 
          cat._id.toString() === categoryId || 
          cat.id === categoryId
        );
        const categoryName = category ? category.name : 'Unknown Category';
        
        if (!categoryStats[categoryName]) {
          categoryStats[categoryName] = {
            count: 0,
            points: 0
          };
        }
        
        categoryStats[categoryName].count += item.quantity || 1;
        categoryStats[categoryName].points += (voucher.points || 0) * (item.quantity || 1);
        totalRedeemed += item.quantity || 1;
        totalPoints += (voucher.points || 0) * (item.quantity || 1);
      }
    });

    // Create chart data
    const labels = Object.keys(categoryStats);
    const data = labels.map(category => categoryStats[category].count);
    const backgroundColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
      '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
      '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
    ];

    const chartData = {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderColor: backgroundColors.slice(0, labels.length).map(color => color + '80'),
          borderWidth: 2,
          hoverBackgroundColor: backgroundColors.slice(0, labels.length).map(color => color + 'CC'),
        }
      ]
    };

    console.log("🔍 Debug - Final analytics data:", {
      totalRedeemed,
      totalPoints,
      chartLabels: chartData.labels,
      chartData: chartData.datasets[0].data
    });

    setAnalyticsData({
      chartData,
      totalRedeemed,
      totalPoints
    });
  };

  // Category CRUD Operations
  const handleCategoryAdd = () => {
    setEditingCategory(null);
    setCategoryData({
      id: '', // Required field
      name: ''
    });
    setCategoryDialog(true);
  };

  const handleCategoryEdit = (category) => {
    setEditingCategory(category);
    setCategoryData({
      id: category.id || '',
      name: category.name || ''
    });
    setCategoryDialog(true);
  };

  const handleCategoryDelete = async (category) => {
    try {
      await client.service("category").remove(category._id);
      showToast("success", "Success", "Category deleted successfully");
      loadData();
    } catch (error) {
      showToast("error", "Error", "Failed to delete category");
    }
  };

  const handleCategorySave = async () => {
    try {
      console.log("🔍 Debug - Category data being saved:", categoryData);
      
      if (editingCategory) {
        await client.service("category").patch(editingCategory._id, categoryData);
        showToast("success", "Success", "Category updated successfully");
      } else {
        await client.service("category").create(categoryData);
        showToast("success", "Success", "Category created successfully");
      }
      setCategoryDialog(false);
      loadData();
    } catch (error) {
      console.error("Category save error:", error);
      showToast("error", "Error", "Failed to save category");
    }
  };

  // Voucher CRUD Operations
  const handleVoucherAdd = () => {
    setEditingVoucher(null);
    setVoucherData({
      id: '', // Required field
      title: '',
      description: '',
      points: 0,
      categoryId: '',
      image: '',
      termsAndCondition: '',
      isLatest: false,
      isActive: true
    });
    setVoucherDialog(true);
  };

  const handleVoucherEdit = (voucher) => {
    setEditingVoucher(voucher);
    setVoucherData({
      id: voucher.id || '',
      title: voucher.title || '',
      description: voucher.description || '',
      points: voucher.points || 0,
      categoryId: voucher.categoryId || '',
      image: voucher.image || '',
      termsAndCondition: voucher.termsAndCondition || '',
      isLatest: voucher.isLatest || false,
      isActive: voucher.isActive !== false
    });
    setVoucherDialog(true);
  };

  const handleVoucherDelete = async (voucher) => {
    try {
      await client.service("voucher").remove(voucher._id);
      showToast("success", "Success", "Voucher deleted successfully");
      loadData();
    } catch (error) {
      showToast("error", "Error", "Failed to delete voucher");
    }
  };

  const handleVoucherSave = async () => {
    try {
      console.log("🔍 Debug - Voucher data being saved:", voucherData);
      
      if (editingVoucher) {
        await client.service("voucher").patch(editingVoucher._id, voucherData);
        showToast("success", "Success", "Voucher updated successfully");
      } else {
        console.log("🔍 Debug - Creating voucher with data:", voucherData);
        await client.service("voucher").create(voucherData);
        showToast("success", "Success", "Voucher created successfully");
      }
      setVoucherDialog(false);
      loadData();
    } catch (error) {
      console.error("Voucher save error:", error);
      showToast("error", "Error", "Failed to save voucher");
    }
  };

  // User CRUD Operations
  const handleUserEdit = (user) => {
    setEditingUser(user);
    setUserData({
      username: user.username || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      password: user.password || '',
      profileImage: user.profileImage || '',
      points: user.points || 0,
      address: user.address || '',
      aboutMe: user.aboutMe || '',
      isActive: user.isActive !== false
    });
    setUserDialog(true);
  };

  const handleUserDelete = async (user) => {
    try {
      await client.service("users").remove(user._id);
      showToast("success", "Success", "User deleted successfully");
      loadData();
    } catch (error) {
      showToast("error", "Error", "Failed to delete user");
    }
  };

  const handleUserSave = async () => {
    try {
      console.log("🔍 Debug - Saving user data:", userData);
      console.log("🔍 Debug - Editing user ID:", editingUser._id);
      
      await client.service("users").patch(editingUser._id, userData);
      
      console.log("🔍 Debug - User saved successfully");
      showToast("success", "Success", "User updated successfully");
      setUserDialog(false);
      loadData();
    } catch (error) {
      console.error("🔍 Debug - User save error:", error);
      showToast("error", "Error", "Failed to update user");
    }
  };

  const handleUserToggleStatus = async (user) => {
    try {
      const newStatus = !user.isActive;
      
      await client.service("users").patch(user._id, {
        isActive: newStatus
      });
      
      showToast("success", "Success", `User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      loadData();
    } catch (error) {
      showToast("error", "Error", "Failed to update user status");
    }
  };

  // Cart Item CRUD Operations
  const handleCartItemEdit = (cartItem) => {
    setEditingCartItem(cartItem);
    setCartItemData({
      quantity: cartItem.quantity || 1,
      isActive: cartItem.isActive !== false
    });
    setCartItemDialog(true);
  };

  const handleCartItemDelete = async (cartItem) => {
    try {
      await client.service("cartItems").remove(cartItem._id);
      showToast("success", "Success", "Cart item deleted successfully");
      loadData();
    } catch (error) {
      showToast("error", "Error", "Failed to delete cart item");
    }
  };

  const handleCartItemSave = async () => {
    try {
      await client.service("cartItems").patch(editingCartItem._id, cartItemData);
      showToast("success", "Success", "Cart item updated successfully");
      setCartItemDialog(false);
      loadData();
    } catch (error) {
      showToast("error", "Error", "Failed to save cart item");
    }
  };

  // Action buttons
  const categoryActions = (rowData) => (
    <div className="action-buttons">
      <Button 
        icon="pi pi-pencil" 
        className="p-button-sm p-button-text mobile-action-btn" 
        onClick={() => handleCategoryEdit(rowData)}
        tooltip="Edit"
        aria-label="Edit category"
      />
      <Button 
        icon="pi pi-trash" 
        className="p-button-sm p-button-text p-button-danger mobile-action-btn" 
        onClick={() => handleCategoryDelete(rowData)}
        tooltip="Delete"
        aria-label="Delete category"
      />
    </div>
  );

  const voucherActions = (rowData) => (
    <div className="action-buttons">
      <Button 
        icon="pi pi-pencil" 
        className="p-button-sm p-button-text mobile-action-btn" 
        onClick={() => handleVoucherEdit(rowData)}
        tooltip="Edit"
        aria-label="Edit voucher"
      />
      <Button 
        icon="pi pi-trash" 
        className="p-button-sm p-button-text p-button-danger mobile-action-btn" 
        onClick={() => handleVoucherDelete(rowData)}
        tooltip="Delete"
        aria-label="Delete voucher"
      />
    </div>
  );

  const userActions = (rowData) => {
    return (
      <div className="action-buttons">
        <Button 
          icon="pi pi-pencil" 
          className="p-button-sm p-button-text mobile-action-btn" 
          onClick={() => handleUserEdit(rowData)}
          tooltip="Edit"
          aria-label="Edit user"
        />
        <Button 
          icon={rowData.isActive ? "pi pi-toggle-off" : "pi pi-toggle-on"} 
          className={`p-button-sm p-button-text mobile-action-btn ${rowData.isActive ? 'p-button-warning' : 'p-button-success'}`}
          onClick={() => handleUserToggleStatus(rowData)}
          title={rowData.isActive ? 'Deactivate User' : 'Activate User'}
          aria-label={rowData.isActive ? 'Deactivate user' : 'Activate user'}
        />
        <Button 
          icon="pi pi-trash" 
          className="p-button-sm p-button-text p-button-danger mobile-action-btn" 
          onClick={() => handleUserDelete(rowData)}
          tooltip="Delete"
          aria-label="Delete user"
        />
      </div>
    );
  };

  return (
    <div className="dashboard-admin">
      <Toast ref={toastRef} />
      
      <div className="dashboard-header" style={{ textAlign: 'center' }}>
        <h1>Admin Dashboard</h1>
        <p>Manage categories, vouchers, and users</p>
      </div>

      <div className="dashboard-content">
        {/* Analytics Section */}
        <Card title="📊 Analytics Dashboard" className="dashboard-card analytics-card">
          <div className="analytics-content">
            <div className="chart-container">
              <h4 style={{ 
                color: '#3B82F6', 
                textAlign: 'center', 
                marginBottom: '1rem', 
                fontSize: '1.5rem', 
                fontWeight: '700',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                padding: '0.5rem',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                marginTop: '0'
              }}>
                Redeemed Vouchers by Category
              </h4>
              {analyticsData.chartData && analyticsData.chartData.labels.length > 0 ? (
                <div className="pie-chart-wrapper">
                  <div className="chart-responsive">
                    <Pie 
                      data={analyticsData.chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              padding: 20,
                              usePointStyle: true,
                              font: {
                                size: 12
                              }
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="no-data">
                  <div className="no-data-icon">📊</div>
                  <p>No redemption data available</p>
                  <p style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.5rem' }}>
                    When users redeem vouchers, analytics will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Categories Section */}
        <Card title="Category" className="dashboard-card">
          <div className="card-header">
            <div className="mobile-search-container">
              <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <input 
                  type="text" 
                  placeholder="Search categories..." 
                  className="mobile-search-input"
                  onChange={(e) => {
                    // Add search functionality here
                    console.log('Search:', e.target.value);
                  }}
                />
              </span>
            </div>
            <Button 
              label="Add Category" 
              icon="pi pi-plus" 
              onClick={handleCategoryAdd}
              className="mobile-add-btn"
            />
          </div>
          <DataTable 
            value={categories} 
            loading={loading}
            paginator 
            rows={10}
            className="dashboard-table"
            responsiveLayout="stack"
            breakpoint="960px"
            showGridlines
            stripedRows
          >
            <Column field="id" header="ID" sortable />
            <Column field="name" header="Name" sortable />
            <Column header="Actions" body={categoryActions} style={{ width: '100px' }} />
          </DataTable>
        </Card>

        {/* Vouchers Section */}
        <Card title="Voucher" className="dashboard-card">
          <div className="card-header">
            <Button 
              label="Add Voucher" 
              icon="pi pi-plus" 
              onClick={handleVoucherAdd}
            />
          </div>
          <DataTable 
            value={vouchers} 
            loading={loading}
            paginator 
            rows={10}
            className="dashboard-table"
            responsiveLayout="stack"
            breakpoint="960px"
            showGridlines
            stripedRows
          >
            <Column field="title" header="Title" sortable className="mobile-visible" />
            <Column field="description" header="Description" className="mobile-hidden" />
            <Column field="points" header="Points" sortable className="mobile-visible" />
            <Column field="id" header="Voucher ID" sortable className="mobile-hidden" />
            <Column field="categoryId" header="Category ID" sortable className="mobile-hidden" />
            <Column field="categoryId" header="Category" 
              body={(rowData) => {
                const category = categories.find(cat => cat.id === rowData.categoryId);
                return category ? category.name : rowData.categoryId;
              }}
              className="mobile-visible"
            />
            <Column field="image" header="Image URL" 
              body={(rowData) => (
                <span className="image-url" title={rowData.image}>
                  {rowData.image ? (rowData.image.length > 30 ? rowData.image.substring(0, 30) + '...' : rowData.image) : 'N/A'}
                </span>
              )}
              className="mobile-hidden"
            />
            <Column field="termsAndCondition" header="Terms & Conditions" 
              body={(rowData) => (
                <span className="terms-text" title={rowData.termsAndCondition}>
                  {rowData.termsAndCondition ? (rowData.termsAndCondition.length > 50 ? rowData.termsAndCondition.substring(0, 50) + '...' : rowData.termsAndCondition) : 'N/A'}
                </span>
              )}
              className="mobile-hidden"
            />
            <Column field="isLatest" header="Is Latest" 
              body={(rowData) => (
                <span className={`status-badge ${rowData.isLatest ? 'active' : 'inactive'}`}>
                  {rowData.isLatest ? 'Yes' : 'No'}
                </span>
              )}
              className="mobile-visible"
            />
            <Column field="isActive" header="Status" 
              body={(rowData) => (
                <span className={`status-badge ${rowData.isActive ? 'active' : 'inactive'}`}>
                  {rowData.isActive ? 'Active' : 'Inactive'}
                </span>
              )}
              className="mobile-visible"
            />
            <Column header="Actions" body={voucherActions} style={{ width: '100px' }} />
          </DataTable>
        </Card>

        {/* Users Section */}
        <Card title="User" className="dashboard-card">
          <DataTable 
            value={users} 
            loading={loading}
            paginator 
            rows={10}
            className="dashboard-table"
            responsiveLayout="stack"
            breakpoint="960px"
            showGridlines
            stripedRows
          >
            <Column field="username" header="Username" sortable />
            <Column field="email" header="Email" sortable />
            <Column field="phoneNumber" header="Phone Number" />
            <Column field="password" header="Password" 
              body={(rowData) => (
                <span className="password-field">
                  {rowData.password ? '••••••••' : 'OAuth User'}
                </span>
              )}
            />
            <Column field="profileImage" header="Profile Image" 
              body={(rowData) => {
                if (!rowData.profileImage) {
                  return (
                    <div className="profile-image-placeholder">
                      <i className="pi pi-user" style={{ fontSize: '1.5rem', color: '#ccc' }}></i>
                    </div>
                  );
                }
                
                return (
                  <div className="profile-image-container">
                    <img 
                      src={rowData.profileImage} 
                      alt="Profile" 
                      className="profile-image-thumbnail"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="profile-image-placeholder" style={{ display: 'none' }}>
                      <i className="pi pi-user" style={{ fontSize: '1.5rem', color: '#ccc' }}></i>
                    </div>
                  </div>
                );
              }}
            />
            <Column field="isActive" header="Is Active" 
              body={(rowData) => (
                <span className={`status-badge ${rowData.isActive ? 'active' : 'inactive'}`}>
                  {rowData.isActive ? 'Active' : 'Inactive'}
                </span>
              )}
            />
            <Column field="points" header="Points" sortable />
            <Column field="address" header="Address" 
              body={(rowData) => {
                if (!rowData.address) return 'N/A';
                if (typeof rowData.address === 'string') {
                  return rowData.address || 'N/A';
                }
                const addr = rowData.address;
                return `${addr.street || ''} ${addr.city || ''} ${addr.state || ''} ${addr.country || ''} ${addr.zipCode || ''}`.trim() || 'N/A';
              }}
            />
            <Column field="aboutMe" header="About Me" 
              body={(rowData) => {
                if (!rowData.aboutMe) return 'N/A';
                try {
                  const aboutMe = JSON.parse(rowData.aboutMe);
                  return (
                    <span className="about-me-text" title={rowData.aboutMe}>
                      {rowData.aboutMe.length > 50 ? rowData.aboutMe.substring(0, 50) + '...' : rowData.aboutMe}
                    </span>
                  );
                } catch (error) {
                  return (
                    <span className="about-me-text" title={rowData.aboutMe}>
                      {rowData.aboutMe.length > 50 ? rowData.aboutMe.substring(0, 50) + '...' : rowData.aboutMe}
                    </span>
                  );
                }
              }}
            />
            <Column header="Actions" body={userActions} style={{ width: '100px' }} />
          </DataTable>
        </Card>

        {/* Cart Item History Section */}
        <Card title="Cart Item History" className="dashboard-card">
          <DataTable 
            value={cartItemHistory} 
            loading={loading}
            paginator 
            rows={10}
            className="dashboard-table"
            responsiveLayout="stack"
            breakpoint="960px"
            showGridlines
            stripedRows
          >
            <Column field="_id" header="ID" 
              body={(rowData) => {
                // Display the first 8 characters of the _id for readability
                const id = rowData._id || rowData.id || 'N/A';
                return id.length > 8 ? id.substring(0, 8) + '...' : id;
              }}
              sortable 
            />
            <Column field="userId" header="User ID" />
            <Column field="voucherId" header="Voucher ID" />
            <Column field="quantity" header="Quantity" sortable />
            <Column field="pointsUsed" header="Points Used" 
              body={(rowData) => {
                const points = rowData.pointsUsed || 0;
                return points.toLocaleString();
              }}
              sortable 
            />
            <Column field="voucherTitle" header="Voucher Title" />
            <Column field="completedDate" header="Completed Date" 
              body={(rowData) => {
                // Use completedDate if available, otherwise fall back to createdAt
                const dateToUse = rowData.completedDate || rowData.createdAt;
                if (!dateToUse) {
                  return 'Date not available';
                }
                
                try {
                  const date = new Date(dateToUse);
                  if (isNaN(date.getTime())) {
                    return 'Invalid Date';
                  }
                  return date.toLocaleDateString();
                } catch (error) {
                  console.error('Error formatting date:', error);
                  return 'Date not available';
                }
              }}
              sortable
            />
            <Column field="status" header="Status" 
              body={(rowData) => (
                <span className={`status-badge ${rowData.status === 'completed' ? 'active' : 'inactive'}`}>
                  {rowData.status}
                </span>
              )}
            />
          </DataTable>
        </Card>
      </div>

      {/* Category Dialog */}
      <Dialog 
        header={editingCategory ? "Edit Category" : "Add Category"} 
        visible={categoryDialog} 
        onHide={() => setCategoryDialog(false)}
        style={{ width: '500px' }}
      >
        <div className="dialog-content">
          <div className="field">
            <label>ID</label>
            <InputText 
              value={categoryData.id} 
              onChange={(e) => setCategoryData({...categoryData, id: e.target.value})}
              placeholder="Enter category ID"
            />
          </div>
          <div className="field">
            <label>Name</label>
            <InputText 
              value={categoryData.name} 
              onChange={(e) => setCategoryData({...categoryData, name: e.target.value})}
              placeholder="Enter category name"
            />
          </div>
        </div>
        <div className="dialog-footer">
          <Button label="Cancel" icon="pi pi-times" onClick={() => setCategoryDialog(false)} className="p-button-text" />
          <Button label="Save" icon="pi pi-check" onClick={handleCategorySave} autoFocus />
        </div>
      </Dialog>

      {/* Voucher Dialog */}
      <Dialog 
        header={editingVoucher ? "Edit Voucher" : "Add Voucher"} 
        visible={voucherDialog} 
        onHide={() => setVoucherDialog(false)}
        style={{ width: '600px' }}
      >
        <div className="dialog-content">
          <div className="field">
            <label>ID</label>
            <InputText 
              value={voucherData.id} 
              onChange={(e) => setVoucherData({...voucherData, id: e.target.value})}
              placeholder="Enter voucher ID"
            />
          </div>
          <div className="field">
            <label>Title</label>
            <InputText 
              value={voucherData.title} 
              onChange={(e) => setVoucherData({...voucherData, title: e.target.value})}
              placeholder="Enter voucher title"
            />
          </div>
          <div className="field">
            <label>Description</label>
            <InputTextarea 
              value={voucherData.description} 
              onChange={(e) => setVoucherData({...voucherData, description: e.target.value})}
              rows={3}
              placeholder="Enter voucher description"
            />
          </div>
          <div className="field">
            <label>Points</label>
            <InputNumber 
              value={voucherData.points} 
              onValueChange={(e) => setVoucherData({...voucherData, points: e.value})}
            />
          </div>
          <div className="field">
            <label>Category *</label>
            <Dropdown 
              value={voucherData.categoryId} 
              options={categories.map(cat => ({label: cat.name, value: cat.id}))}
              onChange={(e) => setVoucherData({...voucherData, categoryId: e.value})}
              placeholder="Select Category (Required)"
            />
            {categories.length === 0 && (
              <small className="p-error">Please create categories first before adding vouchers</small>
            )}
          </div>
          <div className="field">
            <label>Image URL</label>
            <InputText 
              value={voucherData.image} 
              onChange={(e) => setVoucherData({...voucherData, image: e.target.value})}
              placeholder="Enter image URL"
            />
          </div>
          <div className="field">
            <label>Terms and Conditions</label>
            <InputTextarea 
              value={voucherData.termsAndCondition} 
              onChange={(e) => setVoucherData({...voucherData, termsAndCondition: e.target.value})}
              rows={3}
              placeholder="Enter terms and conditions"
            />
          </div>
          <div className="field">
            <label>Is Latest</label>
            <Dropdown 
              value={voucherData.isLatest} 
              options={[{label: 'Yes', value: true}, {label: 'No', value: false}]}
              onChange={(e) => setVoucherData({...voucherData, isLatest: e.value})}
            />
          </div>
          <div className="field">
            <label>Status</label>
            <Dropdown 
              value={voucherData.isActive} 
              options={[{label: 'Active', value: true}, {label: 'Inactive', value: false}]}
              onChange={(e) => setVoucherData({...voucherData, isActive: e.value})}
            />
          </div>
        </div>
        <div className="dialog-footer">
          <Button label="Cancel" icon="pi pi-times" onClick={() => setVoucherDialog(false)} className="p-button-text" />
          <Button label="Save" icon="pi pi-check" onClick={handleVoucherSave} autoFocus />
        </div>
      </Dialog>

      {/* User Dialog */}
      <Dialog 
        header="Edit User" 
        visible={userDialog} 
        onHide={() => setUserDialog(false)}
        style={{ width: '600px' }}
      >
        <div className="dialog-content">
          <div className="field">
            <label>Username</label>
            <InputText 
              value={userData.username} 
              onChange={(e) => setUserData({...userData, username: e.target.value})}
              placeholder="Enter username"
            />
          </div>
          <div className="field">
            <label>Email</label>
            <InputText 
              value={userData.email} 
              disabled
            />
          </div>
          <div className="field">
            <label>Phone Number</label>
            <InputText 
              value={userData.phoneNumber} 
              onChange={(e) => setUserData({...userData, phoneNumber: e.target.value})}
              placeholder="Enter phone number"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <InputText 
              type="password"
              value={userData.password || ''} 
              onChange={(e) => setUserData({...userData, password: e.target.value})}
              placeholder="Enter password (leave empty for OAuth users)"
            />
            <small>Leave empty for OAuth users</small>
          </div>
          <div className="field">
            <label>Profile Image URL</label>
            <InputText 
              value={userData.profileImage || ''} 
              onChange={(e) => setUserData({...userData, profileImage: e.target.value})}
              placeholder="Enter profile image URL"
            />
          </div>
          <div className="field">
            <label>Points</label>
            <InputNumber 
              value={userData.points || 0} 
              onValueChange={(e) => setUserData({...userData, points: e.value})}
              min={0}
            />
          </div>
          <div className="field">
            <label>Address</label>
            <InputTextarea 
              value={userData.address || ''} 
              onChange={(e) => setUserData({...userData, address: e.target.value})}
              rows={2}
              placeholder="Enter address"
            />
          </div>
          <div className="field">
            <label>About Me</label>
            <InputTextarea 
              value={userData.aboutMe || ''} 
              onChange={(e) => setUserData({...userData, aboutMe: e.target.value})}
              rows={3}
              placeholder="Enter about me description"
            />
          </div>
          <div className="field">
            <label>Status</label>
            <Dropdown 
              value={userData.isActive} 
              options={[{label: 'Active', value: true}, {label: 'Inactive', value: false}]}
              onChange={(e) => setUserData({...userData, isActive: e.value})}
            />
          </div>
        </div>
        <div className="dialog-footer">
          <Button label="Cancel" icon="pi pi-times" onClick={() => setUserDialog(false)} className="p-button-text" />
          <Button label="Save" icon="pi pi-check" onClick={handleUserSave} autoFocus />
        </div>
      </Dialog>

      {/* Cart Item Dialog */}
      <Dialog 
        header="Edit Cart Item" 
        visible={cartItemDialog} 
        onHide={() => setCartItemDialog(false)}
        style={{ width: '400px' }}
      >
        <div className="dialog-content">
          <div className="field">
            <label>Quantity</label>
            <InputNumber 
              value={cartItemData.quantity} 
              onValueChange={(e) => setCartItemData({...cartItemData, quantity: e.value})}
              min={1}
            />
          </div>
          <div className="field">
            <label>Status</label>
            <Dropdown 
              value={cartItemData.isActive} 
              options={[{label: 'Active', value: true}, {label: 'Inactive', value: false}]}
              onChange={(e) => setCartItemData({...cartItemData, isActive: e.value})}
            />
          </div>
        </div>
        <div className="dialog-footer">
          <Button label="Cancel" icon="pi pi-times" onClick={() => setCartItemDialog(false)} className="p-button-text" />
          <Button label="Save" icon="pi pi-check" onClick={handleCartItemSave} autoFocus />
        </div>
      </Dialog>

      {/* Add CSS for profile images */}
      <style jsx>{`
        .profile-image-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .profile-image-thumbnail {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e0e0e0;
        }
        
        .profile-image-placeholder {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #e0e0e0;
        }
      `}</style>
    </div>
  );
};

const mapState = (state) => ({
  user: state.auth.user,
  isLoggedIn: state.auth.isLoggedIn
});

export default connect(mapState)(DashboardAdminControl); 