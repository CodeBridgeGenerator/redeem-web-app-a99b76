import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    // Load cart items from localStorage
    const cart = JSON.parse(localStorage.getItem('voucherCart') || '[]');
    setCartItems(cart);
    
    // Calculate total points
    const total = cart.reduce((sum, item) => sum + (item.points * item.quantity), 0);
    setTotalPoints(total);
  }, []);

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedCart);
    localStorage.setItem('voucherCart', JSON.stringify(updatedCart));
    
    // Recalculate total points
    const total = updatedCart.reduce((sum, item) => sum + (item.points * item.quantity), 0);
    setTotalPoints(total);
    
    // Update points in navigation bar if user is logged in
    if (window.updateUserPoints) {
      window.updateUserPoints();
    }
  };

  const removeItem = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem('voucherCart', JSON.stringify(updatedCart));
    
    // Recalculate total points
    const total = updatedCart.reduce((sum, item) => sum + (item.points * item.quantity), 0);
    setTotalPoints(total);
    
    // Update points in navigation bar if user is logged in
    if (window.updateUserPoints) {
      window.updateUserPoints();
    }
  };

  const handleRedeemAll = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    console.log('Redeeming all vouchers:', cartItems);
    // Navigate to bulk redemption page
    navigate('/bulk-redeem', { 
      state: { 
        cartItems: cartItems,
        totalPoints: totalPoints
      } 
    });
  };

  const handleEditDetails = () => {
    // Navigate back to categories to edit
    navigate('/categories');
  };

  const handleContinueShopping = () => {
    navigate('/categories');
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page relative flex size-full min-h-screen flex-col bg-gray-50 group/design-root overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">

          {/* Empty Cart Content */}
          <div className="main-content px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              {/* Breadcrumb */}
              <div className="flex flex-wrap gap-2 p-4">
                <Link to="/categories" className="text-[#607285] text-base font-medium leading-normal hover:text-blue-600 transition-colors">
                  Rewards
                </Link>
                <span className="text-[#607285] text-base font-medium leading-normal">/</span>
                <span className="text-[#111418] text-base font-medium leading-normal">Manage Vouchers</span>
              </div>

              {/* Page Title */}
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <p className="page-title text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">Manage Vouchers</p>
              </div>

              {/* Empty Cart Message */}
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-[#607285] text-6xl mb-4">🛒</div>
                  <h3 className="text-[#111418] text-xl font-semibold mb-2">Your cart is empty</h3>
                  <p className="text-[#607285] text-base text-center mb-6">
                    Add some vouchers to your cart to get started!
                  </p>
                  <button 
                    onClick={handleContinueShopping}
                    className="bg-[#0b6cda] text-white text-sm font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page relative flex size-full min-h-screen flex-col bg-gray-50 group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">

        {/* Main Content */}
        <div className="main-content px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Breadcrumb */}
            <div className="flex flex-wrap gap-2 p-4">
              <Link to="/categories" className="text-[#607285] text-base font-medium leading-normal hover:text-blue-600 transition-colors">
                Rewards
              </Link>
              <span className="text-[#607285] text-base font-medium leading-normal">/</span>
              <span className="text-[#111418] text-base font-medium leading-normal">Manage Vouchers</span>
            </div>

            {/* Page Title */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="page-title text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">Manage Vouchers</p>
            </div>

            {/* Cart Items */}
            {cartItems.map((item, index) => (
              <div key={item.id}>
                <div className="p-4">
                  <div className="flex items-stretch justify-between gap-4 rounded-xl">
                    <div className="flex flex-col gap-1 flex-[2_2_0px]">
                      <p className="text-[#111418] text-base font-bold leading-tight">{item.title}</p>
                      <p className="text-[#607285] text-sm font-normal leading-normal">{item.description}</p>
                      <p className="text-[#607285] text-sm font-normal leading-normal">
                        <span className="font-medium">{item.points} points</span> per voucher
                      </p>
                    </div>
                    <div
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                      style={{ backgroundImage: `url("${item.image}")` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 px-4 min-h-14 justify-between">
                  <p className="text-[#111418] text-base font-normal leading-normal flex-1 truncate">Quantity</p>
                  <div className="shrink-0 flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[#111418]">
                      <button 
                        className="text-base font-medium leading-normal flex h-7 w-7 items-center justify-center rounded-full bg-[#eaedf0] cursor-pointer hover:bg-gray-300 transition-colors"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <input
                        className="text-base font-medium leading-normal w-8 p-0 text-center bg-transparent focus:outline-0 focus:ring-0 focus:border-none border-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        min="1"
                      />
                      <button 
                        className="text-base font-medium leading-normal flex h-7 w-7 items-center justify-center rounded-full bg-[#eaedf0] cursor-pointer hover:bg-gray-300 transition-colors"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button 
                      className="text-red-500 hover:text-red-700 transition-colors"
                      onClick={() => removeItem(item.id)}
                      title="Remove item"
                    >
                      <i className="pi pi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Total Points */}
            <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
              Total Points Required: {totalPoints.toLocaleString()}
            </h3>

            {/* Action Buttons */}
            <div className="flex justify-stretch">
              <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-end">
                <button
                  className="edit-btn flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#eaedf0] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-200 transition-colors"
                  onClick={handleEditDetails}
                >
                  <span className="truncate">Edit Details</span>
                </button>
                <button
                  className="redeem-all-btn flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#dee7f1] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-200 transition-colors"
                  onClick={handleRedeemAll}
                >
                  <span className="truncate">Redeem All</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 