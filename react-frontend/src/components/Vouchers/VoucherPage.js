import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import client from '../../services/restClient';
import AIChatbot from '../Chatbot/AIChatbot';
import './VoucherPage.css';

const VoucherPage = (props) => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherDialog, setVoucherDialog] = useState(false);
  const toastRef = React.useRef(null);

  useEffect(() => {
    if (categoryId) {
      loadData();
    }
  }, [categoryId]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log("Loading data for categoryId:", categoryId);
      
      // Load category details
      const categoryResponse = await client.service("category").get(categoryId);
      console.log("Category loaded:", categoryResponse);
      setCategory(categoryResponse);

      // Get the category's id field to match with voucher categoryId
      const categoryIdToSearch = categoryResponse.id;
      console.log("Searching for vouchers with categoryId:", categoryIdToSearch);

      // First, let's see ALL vouchers in the database
      const allVouchersResponse = await client.service("voucher").find({
        query: { 
          $limit: 1000 
        }
      });
      console.log("ALL vouchers in database:", allVouchersResponse);

      // Now try to find vouchers for this specific category using the category's id
      const vouchersResponse = await client.service("voucher").find({
        query: { 
          categoryId: categoryIdToSearch,
          isActive: true, 
          $limit: 1000 
        }
      });
      console.log("Vouchers for categoryId:", categoryIdToSearch, ":", vouchersResponse);
      
      // If no vouchers found, try without isActive filter
      if (!vouchersResponse.data || vouchersResponse.data.length === 0) {
        const allCategoryVouchers = await client.service("voucher").find({
          query: { 
            categoryId: categoryIdToSearch,
            $limit: 1000 
          }
        });
        console.log("All vouchers for category (no isActive filter):", allCategoryVouchers);
        setVouchers(allCategoryVouchers.data || []);
      } else {
        setVouchers(vouchersResponse.data || []);
      }
      
    } catch (error) {
      console.error("Error loading data:", error);
      showToast("error", "Error", "Failed to load vouchers");
    }
    setLoading(false);
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

  const handleVoucherClick = (voucher) => {
    setSelectedVoucher(voucher);
    setVoucherDialog(true);
  };

  const handleAddToCart = async (voucher) => {
    try {
      // Check if user has already redeemed this voucher
      const existingRedemption = await client.service("cartItemHistory").find({
        query: {
          userId: props.user._id,
          voucherId: voucher._id,
          $limit: 1
        }
      });

      if (existingRedemption.data && existingRedemption.data.length > 0) {
        showToast("warn", "Already Redeemed", "This voucher has already been added to your cart.");
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
      
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast("error", "Error", "Failed to add voucher to cart. Please try again.");
    }
  };

  const handleRedeemVoucher = async (voucher) => {
    try {
      // Check if user has already redeemed this voucher
      const existingRedemption = await client.service("cartItemHistory").find({
        query: {
          userId: props.user._id,
          voucherId: voucher._id,
          $limit: 1
        }
      });

      if (existingRedemption.data && existingRedemption.data.length > 0) {
        showToast("error", "Already Redeemed", "You have already redeemed this voucher. One redemption per user only.");
        setVoucherDialog(false);
        return;
      }

      // Check if item already exists in cart
      const existingCartItem = await client.service("cartItems").find({
        query: {
          userId: props.user._id,
          voucherId: voucher._id,
          $limit: 1
        }
      });

      if (existingCartItem.data && existingCartItem.data.length > 0) {
        // Update quantity if item exists
        const cartItem = existingCartItem.data[0];
        await client.service("cartItems").patch(cartItem._id, {
          quantity: cartItem.quantity + 1
        });
        showToast("success", "Updated", "Quantity increased in cart");
      } else {
        // Add new item to cart
        await client.service("cartItems").create({
          userId: props.user._id,
          voucherId: voucher._id,
          quantity: 1,
          isActive: true
        });
        showToast("success", "Added to Cart", `${voucher.title} added to cart`);
      }
      
      setVoucherDialog(false);
      // Navigate to cart page
      navigate('/cart');
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast("error", "Error", "Failed to add to cart");
    }
  };

  const handleBackToCategories = () => {
    navigate('/categories');
  };

  const getVoucherImage = (voucher) => {
    // Use voucher image if available, otherwise use placeholder
    return voucher.image || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" style={{fontFamily: '"Public Sans", "Noto Sans", sans-serif'}}>
      <Toast ref={toastRef} />
      
      {/* AI Chatbot */}
      <AIChatbot />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                icon="pi pi-arrow-left" 
                className="p-button-text p-button-lg hover:bg-slate-200 rounded-full"
                onClick={handleBackToCategories}
                title="Back to Categories"
              />
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  {category?.name || 'Loading...'}
                </h1>
                <p className="text-slate-600 mt-1">Browse and redeem your rewards</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge value={`${vouchers.length} vouchers`} severity="info" className="text-sm" />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-slate-600 text-lg">Loading vouchers...</div>
            </div>
          </div>
        )}

        {/* No Vouchers State */}
        {!loading && vouchers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6">
              <i className="pi pi-gift text-3xl text-slate-400"></i>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No vouchers available</h3>
            <p className="text-slate-600 mb-6 max-w-md">
              No vouchers found for {category?.name || 'this category'}. Check back later for new rewards!
            </p>
            <Button 
              label="Back to Categories" 
              icon="pi pi-arrow-left"
              onClick={handleBackToCategories}
              className="p-button-outlined"
            />
          </div>
        )}

        {/* Vouchers Grid */}
        {!loading && vouchers.length > 0 && (
          <div className="vouchers-container">
            {vouchers.map((voucher) => (
              <div key={voucher._id} className="voucher-card-wrapper">
                <div className="voucher-card-horizontal">
                  <div className="voucher-content-section">
                    <div className="voucher-info">
                      <h3 className="voucher-title">
                        {voucher.title}
                      </h3>
                      <p className="voucher-subtitle">View Details</p>
                    </div>
                    <div className="voucher-actions-section">
                      <Button 
                        label="Add to Cart" 
                        icon="pi pi-shopping-cart"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(voucher);
                        }}
                        className="p-button-secondary"
                      />
                    </div>
                  </div>
                  <div className="voucher-image-section">
                    <img 
                      src={getVoucherImage(voucher)} 
                      alt={voucher.title}
                      className="voucher-image-horizontal"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop';
                      }}
                    />
                  </div>
                </div>
                <div className="voucher-redeem-section">
                  <Button 
                    label="View Details" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVoucherClick(voucher);
                    }}
                    className="p-button-redeem"
                  />
                </div>
              </div>
            ))}
          </div>
        )}


      </div>

      {/* Voucher Details Dialog */}
      <Dialog 
        header={selectedVoucher ? selectedVoucher.title : "Voucher Details"} 
        visible={voucherDialog} 
        onHide={() => setVoucherDialog(false)}
        style={{ width: '700px' }}
        className="voucher-details-dialog"
      >
        {selectedVoucher && (
          <div className="voucher-details">
            <div className="voucher-image-large mb-4">
              <img 
                src={getVoucherImage(selectedVoucher)} 
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
                  <Badge value={category?.name || 'Unknown Category'} severity="info" />
                  <Badge value={`${selectedVoucher.points} Points`} severity="warning" />
                </div>
                
                <div className="user-points-info mb-3">
                  <div className="flex items-center gap-2">
                    <i className="pi pi-user text-blue-600"></i>
                    <span className="text-sm text-slate-600">Your Points:</span>
                    <span className={`font-semibold ${props.user?.points >= selectedVoucher.points ? 'text-green-600' : 'text-red-600'}`}>
                      {props.user?.points || 0} points
                    </span>
                  </div>
                  {props.user?.points < selectedVoucher.points && (
                    <div className="text-sm text-red-600 mt-1">
                      Need {selectedVoucher.points - (props.user?.points || 0)} more points
                    </div>
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
                label={props.user?.points < selectedVoucher.points 
                  ? `Need ${selectedVoucher.points - (props.user?.points || 0)} more points` 
                  : 'Redeem Voucher'
                }
                icon="pi pi-shopping-cart"
                onClick={() => {
                  handleRedeemVoucher(selectedVoucher);
                  setVoucherDialog(false);
                }}
                disabled={props.user?.points < selectedVoucher.points}
                className="w-full"
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

export default connect(mapState)(VoucherPage); 