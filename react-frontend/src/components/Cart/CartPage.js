import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Toast } from 'primereact/toast';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import client from '../../services/restClient';
import AIChatbot from '../Chatbot/AIChatbot';
import './CartPage.css';

const CartPage = (props) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const toastRef = React.useRef(null);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    setLoading(true);
    try {
      console.log("Loading cart items for user:", props.user?._id);
      
      // Load from cartItems service
      const cartItemsResponse = await client.service("cartItems").find({
        query: {
          userId: props.user?._id,
          $populate: ['voucherId'],
          $sort: { createdAt: -1 }
        }
      });

      // Load from cartItemHistory service
      const cartHistoryResponse = await client.service("cartItemHistory").find({
        query: {
          userId: props.user?._id,
          status: 'pending',
          $sort: { addedAt: -1 }
        }
      });

      // Combine both responses
      const allCartItems = [
        ...cartItemsResponse.data,
        ...cartHistoryResponse.data
      ];
      
      console.log("Cart items response:", cartItemsResponse);
      console.log("Cart history response:", cartHistoryResponse);
      console.log("All cart items:", allCartItems);
      
      // Load voucher details for each cart item if not populated
      const cartItemsWithVouchers = await Promise.all(
        allCartItems.map(async (cartItem) => {
          console.log("Processing cart item:", cartItem);
          
          // Ensure quantity exists (cartItemHistory items don't have quantity)
          const itemWithQuantity = {
            ...cartItem,
            quantity: cartItem.quantity || 1 // Default to 1 if no quantity
          };
          
          // If voucherId is populated, use it
          if (cartItem.voucherId && typeof cartItem.voucherId === 'object') {
            console.log("Voucher already populated:", cartItem.voucherId);
            return itemWithQuantity;
          }
          
          // If voucherId is just an ID, fetch the voucher details
          if (cartItem.voucherId && typeof cartItem.voucherId === 'string') {
            try {
              console.log("Fetching voucher details for ID:", cartItem.voucherId);
              const voucherResponse = await client.service("voucher").get(cartItem.voucherId);
              console.log("Voucher details fetched:", voucherResponse);
              return {
                ...itemWithQuantity,
                voucherId: voucherResponse
              };
            } catch (error) {
              console.error("Error fetching voucher details:", error);
              return {
                ...itemWithQuantity,
                voucherId: {
                  _id: cartItem.voucherId,
                  title: 'Unknown Voucher',
                  description: 'Voucher details not available',
                  points: 0,
                  image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop'
                }
              };
            }
          }
          
          // Fallback for missing voucherId
          console.log("No voucherId found for cart item:", cartItem);
          return {
            ...itemWithQuantity,
            voucherId: {
              _id: 'unknown',
              title: 'Unknown Voucher',
              description: 'Voucher details not available',
              points: 0,
              image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop'
            }
          };
        })
      );
      
      console.log("Final cart items with vouchers:", cartItemsWithVouchers);
      setCartItems(cartItemsWithVouchers || []);
    } catch (error) {
      console.error("Error loading cart items:", error);
      showToast("error", "Error", "Failed to load cart items");
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

  const handleQuantityChange = async (cartItem, newQuantity) => {
    if (newQuantity < 1) {
      // Remove item if quantity is 0
      await handleRemoveItem(cartItem);
      return;
    }

    try {
      // Try to update in cartItems service first
      try {
        await client.service("cartItems").patch(cartItem._id, {
          quantity: newQuantity
        });
        console.log("Updated in cartItems service");
      } catch (error) {
        // If that fails, try cartItemHistory service
        console.log("cartItems update failed, trying cartItemHistory");
        await client.service("cartItemHistory").patch(cartItem._id, {
          quantity: newQuantity
        });
        console.log("Updated in cartItemHistory service");
      }
      
      // Update local state
      setCartItems(prevItems => 
        prevItems.map(item => 
          item._id === cartItem._id 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      
      showToast("success", "Updated", "Quantity updated successfully");
    } catch (error) {
      console.error("Error updating quantity:", error);
      showToast("error", "Error", "Failed to update quantity");
    }
  };

  const handleRemoveItem = async (cartItem) => {
    try {
      // Try to remove from cartItems service first
      try {
        await client.service("cartItems").remove(cartItem._id);
        console.log("Removed from cartItems service");
      } catch (error) {
        // If that fails, try cartItemHistory service
        console.log("cartItems remove failed, trying cartItemHistory");
        await client.service("cartItemHistory").remove(cartItem._id);
        console.log("Removed from cartItemHistory service");
      }
      
      // Update local state
      setCartItems(prevItems => 
        prevItems.filter(item => item._id !== cartItem._id)
      );
      
      showToast("success", "Removed", "Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      showToast("error", "Error", "Failed to remove item");
    }
  };

  const handleRedeemAll = async () => {
    if (cartItems.length === 0) {
      showToast("warn", "Empty Cart", "Your cart is empty");
      return;
    }

    const totalPoints = cartItems.reduce((total, item) => {
      const voucherPoints = item.voucherId?.points || 0;
      return total + (voucherPoints * item.quantity);
    }, 0);

    if (props.user?.points < totalPoints) {
      showToast("error", "Insufficient Points", `You need ${totalPoints - (props.user?.points || 0)} more points`);
      return;
    }

    try {
      // Process redemption for all items
      for (const item of cartItems) {
        const voucherId = item.voucherId?._id || item.voucherId;
        const voucherPoints = item.voucherId?.points || 0;
        
        if (!voucherId) {
          console.error("No voucher ID found for cart item:", item);
          continue;
        }
        
        // Update existing cart item to redeemed status
        if (item._id) {
          await client.service("cartItemHistory").patch(item._id, {
            status: 'redeemed',
            pointsUsed: voucherPoints * item.quantity,
            completedDate: new Date()
          });
        } else {
          // Create new redeemed record if no existing cart item
          await client.service("cartItemHistory").create({
            userId: props.user._id,
            voucherId: voucherId,
            quantity: item.quantity,
            pointsUsed: voucherPoints * item.quantity,
            status: 'redeemed',
            completedDate: new Date()
          });
        }
      }

      // Deduct points from user
      const totalPointsUsed = cartItems.reduce((total, item) => {
        const voucherPoints = item.voucherId?.points || 0;
        return total + (voucherPoints * item.quantity);
      }, 0);
      
      const updatedUser = await client.service("users").patch(props.user._id, {
        points: props.user.points - totalPointsUsed
      });
      
      // Update Redux store with new points
      props.updateUser(updatedUser);

      // Clear cart - remove from cartItems service and update cartItemHistory to redeemed
      for (const item of cartItems) {
        try {
          // Try to remove from cartItems service
          await client.service("cartItems").remove(item._id);
        } catch (error) {
          console.log("Item not found in cartItems service, already handled in cartItemHistory");
        }
      }

      // Generate QR codes and PDF for redeemed vouchers
      await generateVoucherPDF(cartItems);

      setCartItems([]);
      showToast("success", "Redeemed", "All vouchers redeemed successfully! PDF with QR codes downloaded.");

    } catch (error) {
      console.error("Error redeeming vouchers:", error);
      if (error.message && error.message.includes('already redeemed')) {
        showToast("error", "Already Redeemed", error.message);
      } else {
        showToast("error", "Error", "Failed to redeem vouchers");
      }
    }
  };

  const getVoucherImage = (voucher) => {
    return voucher?.image || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop';
  };

  const getTotalPoints = () => {
    return cartItems.reduce((total, item) => {
      const voucherPoints = item.voucherId?.points || 0;
      const quantity = item.quantity || 1; // Default to 1 if quantity is undefined
      return total + (voucherPoints * quantity);
    }, 0);
  };

  const canRedeem = () => {
    const totalPoints = getTotalPoints();
    return props.user?.points >= totalPoints;
  };

  const generateVoucherPDF = async (redeemedItems) => {
    try {
      const pdf = new jsPDF();
      let yPosition = 20;
      
      for (let i = 0; i < redeemedItems.length; i++) {
        const item = redeemedItems[i];
        const voucher = item.voucherId;
        const voucherTitle = voucher?.title || 'Unknown Voucher';
        const voucherDescription = voucher?.description || 'No description available';
        const voucherPoints = voucher?.points || 0;
        const quantity = item.quantity || 1;
        
        // Generate unique voucher code
        const voucherCode = `VOUCHER-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Generate QR code
        const qrCodeDataURL = await QRCode.toDataURL(voucherCode);
        
        // Add voucher title
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(voucherTitle, 20, yPosition);
        yPosition += 10;
        
        // Add voucher description
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const descriptionLines = pdf.splitTextToSize(voucherDescription, 170);
        pdf.text(descriptionLines, 20, yPosition);
        yPosition += descriptionLines.length * 5 + 5;
        
        // Add voucher details
        pdf.setFontSize(12);
        pdf.text(`Points: ${voucherPoints}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Quantity: ${quantity}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Voucher Code: ${voucherCode}`, 20, yPosition);
        yPosition += 15;
        
        // Add QR code
        pdf.addImage(qrCodeDataURL, 'PNG', 20, yPosition, 40, 40);
        yPosition += 50;
        
        // Add separator
        if (i < redeemedItems.length - 1) {
          pdf.line(20, yPosition, 190, yPosition);
          yPosition += 20;
        }
        
        // Add new page if needed
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
      }
      
      // Save PDF
      const fileName = `vouchers-${Date.now()}.pdf`;
      pdf.save(fileName);
      
      showToast("success", "PDF Generated", "Voucher PDF with QR codes downloaded successfully!");
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("error", "PDF Generation Failed", "Failed to generate voucher PDF");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" style={{fontFamily: '"Public Sans", "Noto Sans", sans-serif'}}>
      <Toast ref={toastRef} />
      
      {/* AI Chatbot */}
      <AIChatbot />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                icon="pi pi-arrow-left" 
                className="p-button-text p-button-lg hover:bg-slate-200 rounded-full"
                onClick={() => navigate('/user-dashboard')}
                title="Back to Dashboard"
              />
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Cart</h1>
                <p className="text-slate-600 mt-1">Manage your voucher selections</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge value={`${cartItems.length} items`} severity="info" className="text-sm" />
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex flex-wrap gap-2 p-4 mb-6">
          <button 
            className="text-slate-600 text-base font-medium leading-normal hover:text-slate-900 transition-colors"
            onClick={() => navigate('/user-dashboard')}
          >
            Dashboard
          </button>
          <span className="text-slate-600 text-base font-medium leading-normal">/</span>
          <span className="text-slate-900 text-base font-medium leading-normal">My Cart</span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-slate-600 text-lg">Loading cart items...</div>
            </div>
          </div>
        )}

        {/* Empty Cart State */}
        {!loading && cartItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6">
              <i className="pi pi-shopping-cart text-3xl text-slate-400"></i>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Your cart is empty</h3>
            <p className="text-slate-600 mb-6 max-w-md">
              Start adding vouchers to your cart to redeem them for rewards!
            </p>
            <Button 
              label="Browse Vouchers" 
              icon="pi pi-tags"
              onClick={() => navigate('/categories')}
              className="p-button-outlined"
            />
          </div>
        )}

        {/* Cart Items */}
        {!loading && cartItems.length > 0 && (
          <div className="space-y-4">
            {cartItems.map((cartItem) => {
              console.log("Rendering cart item:", cartItem);
              console.log("Voucher data:", cartItem.voucherId);
              
              const voucher = cartItem.voucherId;
              const voucherTitle = voucher?.title || 'Unknown Voucher';
              const voucherDescription = voucher?.description || 'No description available';
              const voucherPoints = voucher?.points || 0;
              const voucherImage = voucher?.image || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop';
              
              return (
                <div key={cartItem._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  {/* Voucher Info */}
                  <div className="p-4">
                    <div className="flex items-stretch justify-between gap-4">
                      <div className="flex flex-col gap-1 flex-[2_2_0px]">
                        <p className="text-slate-900 text-base font-bold leading-tight">
                          {voucherTitle}
                        </p>
                        <p className="text-slate-600 text-sm font-normal leading-normal">
                          {voucherDescription}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge value={`${voucherPoints} pts each`} severity="warning" className="text-xs" />
                          <span className="text-xs text-slate-500">
                            Total: {voucherPoints * (cartItem.quantity || 1)} pts
                          </span>
                        </div>
                      </div>
                      <div
                        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                        style={{backgroundImage: `url("${voucherImage}")`}}
                      ></div>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4 bg-slate-50 px-4 min-h-14 justify-between">
                    <p className="text-slate-900 text-base font-normal leading-normal flex-1 truncate">Quantity</p>
                    <div className="shrink-0 flex items-center gap-4">
                      <div className="flex items-center gap-2 text-slate-900">
                        <button 
                          className="text-base font-medium leading-normal flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 cursor-pointer transition-colors"
                          onClick={() => handleQuantityChange(cartItem, (cartItem.quantity || 1) - 1)}
                        >
                          -
                        </button>
                        <input
                          className="text-base font-medium leading-normal w-8 p-0 text-center bg-transparent focus:outline-0 focus:ring-0 focus:border-none border-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          type="number"
                          value={cartItem.quantity || 1}
                          onChange={(e) => handleQuantityChange(cartItem, parseInt(e.target.value) || 1)}
                          min="1"
                        />
                        <button 
                          className="text-base font-medium leading-normal flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 cursor-pointer transition-colors"
                          onClick={() => handleQuantityChange(cartItem, (cartItem.quantity || 1) + 1)}
                        >
                          +
                        </button>
                      </div>
                      <Button 
                        icon="pi pi-trash" 
                        className="p-button-text p-button-sm p-button-danger"
                        onClick={() => handleRemoveItem(cartItem)}
                        title="Remove Item"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Total and Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">
                  Total Points Required: {getTotalPoints()}
                </h3>
                <div className="text-sm text-slate-600">
                  Your Points: {props.user?.points || 0}
                </div>
              </div>

              {!canRedeem() && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-700 text-sm">
                    You need {getTotalPoints() - (props.user?.points || 0)} more points to redeem all items
                  </p>
                </div>
              )}

              <div className="flex justify-stretch">
                <div className="flex flex-1 gap-3 flex-wrap justify-end">
                  <Button
                    label="Continue Shopping"
                    icon="pi pi-arrow-left"
                    className="p-button-outlined"
                    onClick={() => navigate('/categories')}
                  />
                  <Button
                    label="Redeem All"
                    icon="pi pi-check"
                    className="p-button-success"
                    onClick={handleRedeemAll}
                    disabled={!canRedeem() || cartItems.length === 0}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const mapState = (state) => ({
  user: state.auth.user
});

const mapDispatch = (dispatch) => ({
  updateUser: (user) => dispatch({ type: 'auth/updateUser', payload: user })
});

export default connect(mapState, mapDispatch)(CartPage); 