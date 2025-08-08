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
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import client from '../../services/restClient';
import './DashboardAdminControl.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

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
    totalRedeemedRecords: 0,  // Number of redemption transactions
    totalRedeemedItems: 0,    // Total quantity of items redeemed
    totalPoints: 0,
    userAnalytics: {
      totalUsers: 0,
      activeUsers: 0,
      newUsersThisMonth: 0,
      userRegistrationTrend: null
    },
    voucherAnalytics: {
      totalVouchers: 0,
      activeVouchers: 0,
      popularVouchers: [],
      redemptionTrend: null,
      pointsDistribution: null
    },
    performanceMetrics: {
      conversionRate: 0,
      averagePointsPerUser: 0,
      topPerformingCategories: []
    }
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
      
      // Load users
      const usersResponse = await client.service("users").find({
        query: { $limit: 1000 }
      });
      console.log("🔍 Debug - Loaded users:", usersResponse.data);
      setUsers(usersResponse.data || []);
      
      // Process analytics data
      console.log("🔍 Debug - About to process analytics data");
      console.log("🔍 Debug - History data:", historyResponse.data);
      console.log("🔍 Debug - Categories data:", categoriesResponse.data);
      console.log("🔍 Debug - Vouchers data:", vouchersResponse.data);
      console.log("🔍 Debug - Users data:", usersResponse.data);
      
      processAnalyticsData(historyResponse.data || [], categoriesResponse.data || [], vouchersResponse.data || [], usersResponse.data || []);

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

  const processAnalyticsData = (historyData, categoriesData, vouchersData, usersData) => {
    console.log("🔍 Debug - Processing analytics data");
    console.log("🔍 Debug - History data length:", historyData.length);
    console.log("🔍 Debug - Categories data length:", categoriesData.length);
    console.log("🔍 Debug - Vouchers data length:", vouchersData.length);
    console.log("🔍 Debug - Users data length:", usersData.length);
    
    // Debug: Show sample history data to understand structure
    if (historyData.length > 0) {
      console.log("🔍 Debug - Sample history item:", historyData[0]);
      console.log("🔍 Debug - History items with quantities:", historyData.map(item => ({
        voucherId: item.voucherId,
        quantity: item.quantity || 1,
        createdAt: item.createdAt
      })));
    }
    
    // Group redeemed vouchers by category
    // We'll track both records and quantities for different analytics
    const categoryStats = {};
    let totalRedeemedRecords = 0;  // Number of redemption transactions
    let totalRedeemedItems = 0;    // Total quantity of items redeemed
    let totalPoints = 0;

    historyData.forEach(item => {
      // Find the voucher using voucherId
      const voucher = vouchersData.find(v => 
        v._id === item.voucherId || 
        v._id.toString() === item.voucherId || 
        v.id === item.voucherId
      );
      
      console.log("🔍 Debug - Processing history item:", {
        item: item,
        voucher: voucher,
        voucherId: item.voucherId,
        voucherCategoryId: voucher?.categoryId
      });
      
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
            items: 0,
            points: 0
          };
        }
        
        // Track both records and quantities
        categoryStats[categoryName].count += 1; // Count redemption records
        categoryStats[categoryName].items += (item.quantity || 1); // Count total items
        categoryStats[categoryName].points += (voucher.points || 0) * (item.quantity || 1);
        totalRedeemedRecords += 1; // Count redemption transactions
        totalRedeemedItems += (item.quantity || 1); // Count total items
        totalPoints += (voucher.points || 0) * (item.quantity || 1);
        
        // Debug logging for this item
        console.log("🔍 Debug - Processing item:", {
          voucherId: item.voucherId,
          quantity: item.quantity || 1,
          voucherPoints: voucher.points || 0,
          categoryName: categoryName,
          categoryStats: categoryStats[categoryName]
        });
      }
    });

    // Create pie chart data for category distribution
    // Use ITEMS count for category distribution (more meaningful for business)
    const labels = Object.keys(categoryStats);
    const data = labels.map(category => categoryStats[category].items);
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

    // User Analytics
    const totalUsers = usersData.length;
    const activeUsers = usersData.filter(user => user.isActive !== false).length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newUsersThisMonth = usersData.filter(user => {
      const userDate = new Date(user.createdAt || user.created);
      return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
    }).length;

    // User registration trend (last 6 months)
    const userRegistrationTrend = {
      labels: [],
      datasets: [{
        label: 'New Users',
        data: [],
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4
      }]
    };

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const monthUsers = usersData.filter(user => {
        const userDate = new Date(user.createdAt || user.created);
        return userDate.getMonth() === date.getMonth() && userDate.getFullYear() === date.getFullYear();
      }).length;
      
      userRegistrationTrend.labels.push(monthName);
      userRegistrationTrend.datasets[0].data.push(monthUsers);
    }

    // Voucher Analytics
    const totalVouchers = vouchersData.length;
    const activeVouchers = vouchersData.filter(voucher => voucher.isActive !== false).length;

    // Popular vouchers (top 5 by redemption count)
    const voucherRedemptionCount = {};
    historyData.forEach(item => {
      const voucher = vouchersData.find(v => 
        v._id === item.voucherId || 
        v._id.toString() === item.voucherId || 
        v.id === item.voucherId
      );
      if (voucher) {
        const voucherTitle = voucher.title || 'Unknown Voucher';
        voucherRedemptionCount[voucherTitle] = (voucherRedemptionCount[voucherTitle] || 0) + (item.quantity || 1); // Count items for popularity
      }
    });

    const popularVouchers = Object.entries(voucherRedemptionCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([title, count]) => ({ title, count }));

    // Redemption trend (last 6 months)
    const redemptionTrend = {
      labels: [],
      datasets: [{
        label: 'Vouchers Redeemed',
        data: [],
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4
      }]
    };

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const monthRedemptions = historyData.filter(item => {
        const itemDate = new Date(item.createdAt || item.created);
        return itemDate.getMonth() === date.getMonth() && itemDate.getFullYear() === date.getFullYear();
      }).length; // Count redemption transactions (records)
      
      redemptionTrend.labels.push(monthName);
      redemptionTrend.datasets[0].data.push(monthRedemptions);
    }

    // Points distribution chart
    const pointsDistribution = {
      labels: ['0-100', '101-500', '501-1000', '1001-2000', '2000+'],
      datasets: [{
        label: 'Users by Points Range',
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
        ]
      }]
    };

    // Calculate points distribution (simplified - would need user points data)
    const userPoints = usersData.length; // Placeholder - would need actual points data
    pointsDistribution.datasets[0].data = [
      Math.floor(userPoints * 0.3),
      Math.floor(userPoints * 0.25),
      Math.floor(userPoints * 0.2),
      Math.floor(userPoints * 0.15),
      Math.floor(userPoints * 0.1)
    ];

    // Performance Metrics
    const conversionRate = totalUsers > 0 ? ((totalRedeemedRecords / totalUsers) * 100).toFixed(1) : 0;
    const averagePointsPerUser = totalUsers > 0 ? (totalPoints / totalUsers).toFixed(0) : 0;
    
    // Top performing categories (by items redeemed)
    const topPerformingCategories = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b.items - a.items)
      .slice(0, 3)
      .map(([name, stats]) => ({ 
        name, 
        records: stats.count, 
        items: stats.items, 
        points: stats.points 
      }));

    console.log("🔍 Debug - Final analytics data:", {
      totalRedeemedRecords: `${totalRedeemedRecords} redemption transactions`,
      totalRedeemedItems: `${totalRedeemedItems} total items redeemed`,
      totalPoints: `${totalPoints} total points`,
      chartLabels: chartData.labels,
      chartData: chartData.datasets[0].data,
      categoryStats: categoryStats,
      userAnalytics: { totalUsers, activeUsers, newUsersThisMonth },
      voucherAnalytics: { totalVouchers, activeVouchers, popularVouchers }
    });

    setAnalyticsData({
      chartData,
      totalRedeemedRecords,
      totalRedeemedItems,
      totalPoints,
      userAnalytics: {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        userRegistrationTrend
      },
      voucherAnalytics: {
        totalVouchers,
        activeVouchers,
        popularVouchers,
        redemptionTrend,
        pointsDistribution
      },
      performanceMetrics: {
        conversionRate,
        averagePointsPerUser,
        topPerformingCategories
      }
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
            
            {/* Key Metrics Row */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">👥</div>
                <div className="metric-content">
                  <h3>{analyticsData.userAnalytics.totalUsers}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">✅</div>
                <div className="metric-content">
                  <h3>{analyticsData.userAnalytics.activeUsers}</h3>
                  <p>Active Users</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">🎫</div>
                <div className="metric-content">
                  <h3>{analyticsData.voucherAnalytics.totalVouchers}</h3>
                  <p>Total Vouchers</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">💰</div>
                <div className="metric-content">
                  <h3>{analyticsData.totalRedeemedItems}</h3>
                  <p>Items Redeemed</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">📋</div>
                <div className="metric-content">
                  <h3>{analyticsData.totalRedeemedRecords}</h3>
                  <p>Redemption Transactions</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">📈</div>
                <div className="metric-content">
                  <h3>{analyticsData.performanceMetrics.conversionRate}%</h3>
                  <p>Conversion Rate</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">⭐</div>
                <div className="metric-content">
                  <h3>{analyticsData.performanceMetrics.averagePointsPerUser}</h3>
                  <p>Avg Points/User</p>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
              
              {/* Category Distribution Chart */}
              <div className="chart-card">
                <h4>Items Redeemed by Category</h4>
                {analyticsData.chartData && analyticsData.chartData.labels.length > 0 ? (
                  <div className="chart-container">
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
                              font: { size: 12 }
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
                ) : (
                  <div className="no-data">
                    <div className="no-data-icon">📊</div>
                    <p>No redemption data available</p>
                  </div>
                )}
              </div>

              {/* User Registration Trend */}
              <div className="chart-card">
                <h4>User Registration Trend (Last 6 Months)</h4>
                {analyticsData.userAnalytics.userRegistrationTrend ? (
                  <div className="chart-container">
                    <Line 
                      data={analyticsData.userAnalytics.userRegistrationTrend}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { font: { size: 12 } }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 }
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="no-data">
                    <div className="no-data-icon">📈</div>
                    <p>No user data available</p>
                  </div>
                )}
              </div>

              {/* Redemption Trend */}
              <div className="chart-card">
                <h4>Redemption Transactions (Last 6 Months)</h4>
                {analyticsData.voucherAnalytics.redemptionTrend ? (
                  <div className="chart-container">
                    <Bar 
                      data={analyticsData.voucherAnalytics.redemptionTrend}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { font: { size: 12 } }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 }
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="no-data">
                    <div className="no-data-icon">📊</div>
                    <p>No redemption data available</p>
                  </div>
                )}
              </div>

              {/* Popular Vouchers */}
              <div className="chart-card">
                <h4>Most Popular Vouchers</h4>
                {analyticsData.voucherAnalytics.popularVouchers.length > 0 ? (
                  <div className="popular-vouchers">
                    {analyticsData.voucherAnalytics.popularVouchers.map((voucher, index) => (
                      <div key={index} className="voucher-item">
                        <div className="voucher-rank">#{index + 1}</div>
                        <div className="voucher-info">
                          <div className="voucher-title">{voucher.title}</div>
                          <div className="voucher-count">{voucher.count} items redeemed</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data">
                    <div className="no-data-icon">🏆</div>
                    <p>No voucher data available</p>
                  </div>
                )}
              </div>

              {/* Top Performing Categories */}
              <div className="chart-card">
                <h4>Top Performing Categories</h4>
                {analyticsData.performanceMetrics.topPerformingCategories.length > 0 ? (
                  <div className="category-performance">
                    {analyticsData.performanceMetrics.topPerformingCategories.map((category, index) => (
                      <div key={index} className="category-item">
                        <div className="category-rank">#{index + 1}</div>
                        <div className="category-info">
                          <div className="category-name">{category.name}</div>
                          <div className="category-stats">
                            {category.items} items • {category.records} transactions • {category.points} points
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data">
                    <div className="no-data-icon">🏅</div>
                    <p>No category data available</p>
                  </div>
                )}
              </div>

              {/* Points Distribution */}
              <div className="chart-card">
                <h4>User Points Distribution</h4>
                {analyticsData.voucherAnalytics.pointsDistribution ? (
                  <div className="chart-container">
                    <Bar 
                      data={analyticsData.voucherAnalytics.pointsDistribution}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { font: { size: 12 } }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="no-data">
                    <div className="no-data-icon">💰</div>
                    <p>No points data available</p>
                  </div>
                )}
              </div>

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