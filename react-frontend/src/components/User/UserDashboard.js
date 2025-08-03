import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import client from '../../services/restClient';
import './UserDashboard.css';

const UserDashboard = (props) => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [userHistory, setUserHistory] = useState([]);
  const [historyDialog, setHistoryDialog] = useState(false);
  const [redeemedVouchers, setRedeemedVouchers] = useState([]);
  const [voucherDetailsDialog, setVoucherDetailsDialog] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const toastRef = React.useRef(null);

  useEffect(() => {
    loadData();
    loadCartItems();
    loadUserHistory();
    loadRedeemedVouchers();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load categories
      const categoriesResponse = await client.service("category").find({
        query: { $limit: 1000 }
      });
      console.log("Categories response:", categoriesResponse);
      console.log("Categories data:", categoriesResponse.data);
      console.log("Categories count:", categoriesResponse.data?.length || 0);
      setCategories(categoriesResponse.data || []);

      // Load vouchers - only top 6 latest
      const vouchersResponse = await client.service("voucher").find({
        query: { 
          isActive: true, 
          $sort: { createdAt: -1 }, // Sort by creation date, newest first
          $limit: 6 // Only get top 6 latest vouchers
        }
      });
      setVouchers(vouchersResponse.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      showToast("error", "Error", "Failed to load vouchers");
    }
    setLoading(false);
  };

  const loadCartItems = async () => {
    try {
      const cartResponse = await client.service("cartItemHistory").find({
        query: { 
          userId: props.user._id,
          status: 'pending',
          $limit: 1000 
        }
      });
      
      // Load voucher details for each cart item
      const cartItemsWithVouchers = await Promise.all(
        cartResponse.data.map(async (cartItem) => {
          try {
            const voucherResponse = await client.service("voucher").get(cartItem.voucherId);
            return {
              ...cartItem,
              voucher: voucherResponse
            };
          } catch (error) {
            console.error("Error loading voucher details:", error);
            return cartItem;
          }
        })
      );
      
      setCartItems(cartItemsWithVouchers || []);
    } catch (error) {
      console.error("Error loading cart items:", error);
    }
  };

  const loadUserHistory = async () => {
    try {
      const historyResponse = await client.service("cartItemHistory").find({
        query: { 
          userId: props.user._id,
          $limit: 1000 
        }
      });
      
      // Load voucher details for each history item
      const historyWithVouchers = await Promise.all(
        historyResponse.data.map(async (historyItem) => {
          try {
            const voucherResponse = await client.service("voucher").get(historyItem.voucherId);
            return {
              ...historyItem,
              voucher: voucherResponse
            };
          } catch (error) {
            console.error("Error loading voucher details:", error);
            return historyItem;
          }
        })
      );
      
      setUserHistory(historyWithVouchers || []);
    } catch (error) {
      console.error("Error loading user history:", error);
    }
  };

  const loadRedeemedVouchers = async () => {
    try {
      const redeemedResponse = await client.service("cartItemHistory").find({
        query: { 
          userId: props.user._id,
          $limit: 1000 
        }
      });
      
      // Extract voucher IDs that user has already redeemed
      const redeemedVoucherIds = redeemedResponse.data.map(item => item.voucherId);
      setRedeemedVouchers(redeemedVoucherIds);
    } catch (error) {
      console.error("Error loading redeemed vouchers:", error);
    }
  };

  const showToast = (severity, summary, detail) => {
    if (toastRef.current) {
      toastRef.current.show({
        severity,
        summary,
        detail,
        life: 3000
      });
    }
  };

  const handleAddToCart = async (voucher) => {
    try {
      // Check if user is authenticated
      if (!props.user || !props.user._id) {
        showToast("error", "Authentication Error", "Please log in to add items to cart");
        return;
      }
      
      // Check if user has already redeemed this voucher
      const existingRedemption = await client.service("cartItemHistory").find({
        query: {
          userId: props.user._id,
          voucherId: voucher._id,
          $limit: 1
        }
      });

      if (existingRedemption.data && existingRedemption.data.length > 0) {
        showToast("warn", "Already in Cart", "This voucher has already been added to your cart.");
        return;
      }

      // Add voucher to cart
      const cartItem = {
        userId: props.user._id,
        voucherId: voucher._id,
        voucherTitle: voucher.title,
        voucherPoints: voucher.points,
        voucherImage: voucher.image,
        quantity: 1,
        status: 'pending',
        addedAt: new Date()
      };

      await client.service("cartItemHistory").create(cartItem);
      showToast("success", "Added to Cart", `${voucher.title} has been added to your cart successfully!`);
      
      // Navigate to cart page
      navigate('/cart');
      
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast("error", "Error", "Failed to add voucher to cart. Please try again.");
    }
  };



  // Profile Management Functions


  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId || cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const handleVoucherClick = (voucher) => {
    setSelectedVoucher(voucher);
    setVoucherDetailsDialog(true);
  };

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesCategory = !selectedCategory || voucher.categoryId === selectedCategory;
    const matchesSearch = !searchQuery || 
      voucher.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`Voucher: ${voucher.title}, CategoryId: ${voucher.categoryId}, SelectedCategory: ${selectedCategory}, MatchesCategory: ${matchesCategory}`);
    }
    
    return matchesCategory && matchesSearch;
  });



  const voucherCard = (voucher) => (
    <Card key={voucher._id} className="voucher-card">
      <div className="voucher-image">
        <img 
          src={voucher.image || 'https://via.placeholder.com/300x200?text=Voucher'} 
          alt={voucher.title}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Voucher';
          }}
        />
      </div>
      <div className="voucher-content">
        <h3>{voucher.title}</h3>
        <p>{voucher.description}</p>
        <div className="voucher-meta">
          <Badge value={getCategoryName(voucher.categoryId)} severity="info" />
          <Badge value={`${voucher.points} Points`} severity="warning" />
        </div>
        <div className="voucher-actions">
          <Button 
            label="Add to Cart" 
            icon="pi pi-shopping-cart" 
            onClick={() => handleAddToCart(voucher)}
            disabled={props.user.points < voucher.points}
            className="p-button-sm"
          />
        </div>
      </div>
    </Card>
  );



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" style={{fontFamily: '"Public Sans", "Noto Sans", sans-serif'}}>
      <Toast ref={toastRef} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-lg items-start justify-end px-4 pb-10 relative overflow-hidden mb-8" 
             style={{backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop&crop=center")`}}>
          <div className="flex flex-col gap-2 text-left">
            <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
              Welcome, {props.user?.username || 'User'}!
            </h1>
            <h2 className="text-white text-sm font-normal leading-normal">
              Discover and redeem exclusive rewards with your points
            </h2>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <Badge value={`${props.user?.points || 0} Points`} severity="success" className="text-sm" />
            <Badge value={`${cartItems.length} Items in Cart`} severity="info" className="text-sm" />
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <InputText 
                placeholder="Search vouchers..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                style={{minWidth: '200px'}}
              />
              <Dropdown 
                placeholder="All Categories" 
                value={selectedCategory}
                options={[
                  { label: 'All Categories', value: null },
                  ...categories.map(cat => ({ label: cat.name, value: cat.id || cat._id }))
                ]}
                onChange={(e) => setSelectedCategory(e.value)}
                className="w-full sm:w-auto"
                style={{minWidth: '150px'}}
              />

            </div>
            <div className="flex gap-3">
              <Button 
                label="My History" 
                icon="pi pi-history" 
                onClick={() => setHistoryDialog(true)}
                className="p-button-outlined"
              />
            </div>
          </div>
        </div>



        {/* All Vouchers Section */}
        <div className="vouchers-section">
          <div className="section-header-container px-4 pb-6 pt-8">
            <h2 className="section-title text-slate-900 text-[28px] font-bold leading-tight tracking-[-0.015em]">
              {selectedCategory ? `Latest ${getCategoryName(selectedCategory)} Vouchers` : 'Latest Rewards'}
            </h2>
            <p className="section-subtitle text-slate-600 text-sm mt-2">
              Showing the 6 most recent vouchers
            </p>
          </div>
          <div className="vouchers-grid">
            {loading ? (
              <div className="loading-container flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <div className="text-slate-600 text-lg">Loading vouchers...</div>
                </div>
              </div>
            ) : filteredVouchers.length > 0 ? (
              filteredVouchers.map((voucher) => (
                <div 
                  key={voucher._id} 
                  className="voucher-card-item flex flex-col rounded-lg bg-white shadow-sm border border-[#e7edf4] p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div
                    className="voucher-image-container w-full bg-center bg-no-repeat bg-cover rounded-lg mb-3 cursor-pointer"
                    style={{
                      backgroundImage: `url("${voucher.image || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop'}")`
                    }}
                    onClick={() => handleVoucherClick(voucher)}
                  ></div>
                  <div className="flex flex-col flex-grow">
                    <h3 className="voucher-title text-slate-900 text-base font-medium leading-normal mb-2 line-clamp-2">
                      {voucher.title}
                    </h3>
                    <p className="voucher-description text-slate-600 text-sm font-normal leading-normal mb-3 line-clamp-3">
                      {voucher.description}
                    </p>
                                         <div className="voucher-badges flex items-center gap-2 mb-3 flex-wrap">
                       <Badge value={getCategoryName(voucher.categoryId)} severity="info" className="text-xs" />
                       <Badge value={`${voucher.points} Points`} severity="warning" className="text-xs" />
                     </div>
                     <div className="voucher-actions mt-auto">
                       <Button 
                         label={cartItems.some(item => item.voucherId === voucher._id) ? "Added to Cart" : "Add to Cart"}
                         icon={cartItems.some(item => item.voucherId === voucher._id) ? "pi pi-check" : "pi pi-shopping-cart"}
                         onClick={(e) => {
                           e.stopPropagation();
                           handleAddToCart(voucher);
                         }}
                         disabled={props.user.points < voucher.points || cartItems.some(item => item.voucherId === voucher._id)}
                         className={`p-button-sm w-full h-10 ${cartItems.some(item => item.voucherId === voucher._id) ? 'p-button-success' : ''}`}
                       />
                     </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-container flex flex-col items-center justify-center py-16 text-center">
                <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                  <i className="pi pi-gift text-3xl text-slate-400"></i>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No vouchers found</h3>
                <p className="text-slate-600 mb-6 max-w-md">
                  Try adjusting your search or category filter
                </p>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* History Dialog */}
      <Dialog 
        header="My Redemption History" 
        visible={historyDialog} 
        onHide={() => setHistoryDialog(false)}
        style={{ width: '90vw', maxWidth: '900px' }}
        className="history-dialog"
      >
        <DataTable 
          value={userHistory} 
          emptyMessage="No redemption history found"
          className="history-table"
          paginator
          rows={10}
          responsiveLayout="stack"
          breakpoint="960px"
          showGridlines
          stripedRows
        >
          <Column 
            header="Voucher" 
            body={(rowData) => (
              <div className="history-item-info">
                <div className="history-item-title">{rowData.voucher?.title || 'Loading...'}</div>
                <div className="history-item-category">{getCategoryName(rowData.voucher?.categoryId)}</div>
              </div>
            )}
          />
          <Column 
            header="Quantity" 
            body={(rowData) => (
              <div className="quantity-display">
                <span className="quantity-number">{rowData.quantity}</span>
              </div>
            )}
          />
          <Column 
            header="Points Spent" 
            body={(rowData) => `${(rowData.voucher?.points || 0) * rowData.quantity} pts`}
          />
          <Column 
            header="Redeemed Date" 
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
          <Column 
            header="Status" 
            body={(rowData) => (
              <span className={`status-badge ${rowData.status === 'completed' ? 'active' : 'inactive'}`}>
                {rowData.status}
              </span>
            )}
          />
        </DataTable>
        
        {userHistory.length > 0 && (
          <div className="history-summary">
            <h4>History Summary</h4>
            <p>Total Items Redeemed: {userHistory.reduce((sum, item) => sum + item.quantity, 0)}</p>
            <p>Total Points Spent: {userHistory.reduce((sum, item) => sum + ((item.voucher?.points || 0) * item.quantity), 0)}</p>
          </div>
        )}
      </Dialog>

      {/* Voucher Details Dialog */}
      <Dialog 
        header={selectedVoucher ? selectedVoucher.title : "Voucher Details"} 
        visible={voucherDetailsDialog} 
        onHide={() => setVoucherDetailsDialog(false)}
        style={{ width: '600px' }}
      >
        {selectedVoucher && (
          <div className="voucher-details">
            <div className="voucher-image-large mb-4">
              <img 
                src={selectedVoucher.image || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop'} 
                alt={selectedVoucher.title}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop';
                }}
              />
            </div>
            
            <div className="voucher-info mb-4">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{selectedVoucher.title}</h3>
              <p className="text-slate-600 mb-3">{selectedVoucher.description}</p>
              
              <div className="voucher-meta mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge value={getCategoryName(selectedVoucher.categoryId)} severity="info" />
                  <Badge value={`${selectedVoucher.points} Points`} severity="warning" />
                  {cartItems.some(item => item.voucherId === selectedVoucher._id) && (
                    <Badge value="Added to Cart" severity="success" />
                  )}
                </div>
                
                {selectedVoucher.termsAndCondition && (
                  <div className="terms-section">
                    <h4 className="font-semibold text-slate-900 mb-2">Terms & Conditions</h4>
                    <p className="text-sm text-slate-600">{selectedVoucher.termsAndCondition}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="voucher-actions-dialog">
              <Button 
                label={cartItems.some(item => item.voucherId === selectedVoucher._id) ? "Added to Cart" : "Add to Cart"}
                icon={cartItems.some(item => item.voucherId === selectedVoucher._id) ? "pi pi-check" : "pi pi-shopping-cart"}
                onClick={() => {
                  handleAddToCart(selectedVoucher);
                  setVoucherDetailsDialog(false);
                }}
                disabled={props.user.points < selectedVoucher.points || cartItems.some(item => item.voucherId === selectedVoucher._id)}
                className={`w-full ${cartItems.some(item => item.voucherId === selectedVoucher._id) ? 'p-button-success' : ''}`}
              />
            </div>
          </div>
        )}
      </Dialog>

    </div>
  );
};

const mapState = (state) => ({
  user: state.auth.user
});

const mapDispatch = (dispatch) => ({
  getUser: () => dispatch.auth.getUser()
});

export default connect(mapState, mapDispatch)(UserDashboard); 