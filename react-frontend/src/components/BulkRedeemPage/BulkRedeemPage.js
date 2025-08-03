import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './BulkRedeemPage.css';

const BulkRedeemPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get cart items from navigation state
    if (location.state?.cartItems) {
      setCartItems(location.state.cartItems);
      setTotalPoints(location.state.totalPoints);
    } else {
      // Fallback: load from localStorage
      const cart = JSON.parse(localStorage.getItem('voucherCart') || '[]');
      setCartItems(cart);
      const total = cart.reduce((sum, item) => sum + (item.points * item.quantity), 0);
      setTotalPoints(total);
    }
  }, [location.state]);

  const generateQRCode = (voucher, index) => {
    const timestamp = Date.now();
    const uniqueId = `${voucher.id}-${index}-${timestamp}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=VOUCHER-${voucher.id}-${voucher.categoryName.toUpperCase()}-${uniqueId}`;
  };

  const downloadPDF = async () => {
    setLoading(true);
    
    try {
      // Create PDF content
      const pdfContent = {
        title: 'Voucher Redemption Receipt',
        date: new Date().toLocaleDateString(),
        totalPoints: totalPoints,
        items: cartItems.map((item, index) => ({
          ...item,
          qrCode: generateQRCode(item, index)
        }))
      };

      // Generate PDF using jsPDF (you'll need to install this)
      // For now, we'll create a downloadable HTML file
      const htmlContent = generateHTMLReceipt(pdfContent);
      downloadHTMLAsFile(htmlContent, 'voucher-receipt.html');
      
      // Clear cart after successful download
      setCartItems([]);
      localStorage.removeItem('voucherCart');
      setTotalPoints(0);
      
      // Update points in navigation bar
      if (window.updateUserPoints) {
        window.updateUserPoints();
      }
      
      alert('PDF receipt has been downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateHTMLReceipt = (pdfContent) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Voucher Redemption Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .receipt { border: 1px solid #ccc; padding: 20px; margin-bottom: 20px; }
          .voucher { border: 1px solid #ddd; padding: 15px; margin: 10px 0; }
          .qr-code { text-align: center; margin: 10px 0; }
          .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Voucher Redemption Receipt</h1>
          <p>Date: ${pdfContent.date}</p>
        </div>
        
        <div class="receipt">
          ${pdfContent.items.map((item, index) => `
            <div class="voucher">
              <h3>${item.title}</h3>
              <p><strong>Category:</strong> ${item.categoryName}</p>
              <p><strong>Points:</strong> ${item.points} per voucher</p>
              <p><strong>Quantity:</strong> ${item.quantity}</p>
              <p><strong>Total Points:</strong> ${item.points * item.quantity}</p>
              <div class="qr-code">
                <img src="${item.qrCode}" alt="QR Code for ${item.title}" style="width: 200px; height: 200px;">
              </div>
            </div>
          `).join('')}
          
          <div class="total">
            <p>Total Points Redeemed: ${pdfContent.totalPoints}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const downloadHTMLAsFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBackToCategories = () => {
    navigate('/categories');
  };

  const handleBackToCart = () => {
    navigate('/cart');
  };

  if (cartItems.length === 0) {
    return (
      <div className="bulk-redeem-page relative flex size-full min-h-screen flex-col bg-gray-50 group/design-root overflow-x-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-[#607285] text-6xl mb-4">❌</div>
            <h3 className="text-[#111418] text-xl font-semibold mb-2">No vouchers to redeem</h3>
            <p className="text-[#607285] text-base text-center mb-6">
              Your cart is empty or the redemption data is missing.
            </p>
            <button 
              onClick={handleBackToCategories}
              className="bg-[#0b6cda] text-white text-sm font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Categories
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bulk-redeem-page relative flex size-full min-h-screen flex-col bg-gray-50 group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#eaedf0] px-10 py-3">
          <div className="flex items-center gap-4 text-[#111418]">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em]">Bank of Financials</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="nav-links flex items-center gap-9">
              <Link to="/" className="text-[#111418] text-sm font-medium leading-normal hover:text-blue-600 transition-colors">Home</Link>
              <Link to="/categories" className="text-[#111418] text-sm font-medium leading-normal hover:text-blue-600 transition-colors">Rewards</Link>
              <Link to="/cart" className="text-[#111418] text-sm font-medium leading-normal hover:text-blue-600 transition-colors">Cart</Link>
              <Link to="/login" className="text-[#111418] text-sm font-medium leading-normal hover:text-blue-600 transition-colors">Account</Link>
            </div>
            <button className="notification-btn flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#eaedf0] text-[#111418] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-gray-200 transition-colors">
              <i className="pi pi-bell text-[#111418]"></i>
            </button>
            <Link to="/login" className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center">
              <i className="pi pi-user text-gray-600 text-xl"></i>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="main-content px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Breadcrumb */}
            <div className="flex flex-wrap gap-2 p-4">
              <Link to="/categories" className="text-[#607285] text-base font-medium leading-normal hover:text-blue-600 transition-colors">
                Rewards
              </Link>
              <span className="text-[#607285] text-base font-medium leading-normal">/</span>
              <Link to="/cart" className="text-[#607285] text-base font-medium leading-normal hover:text-blue-600 transition-colors">
                Cart
              </Link>
              <span className="text-[#607285] text-base font-medium leading-normal">/</span>
              <span className="text-[#111418] text-base font-medium leading-normal">Bulk Redemption</span>
            </div>

            {/* Success Message */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="success-icon text-green-500 text-3xl">✅</div>
                  <p className="page-title text-[#111418] tracking-light text-[32px] font-bold leading-tight">Vouchers Redeemed</p>
                </div>
                <p className="success-message text-[#607285] text-sm font-normal leading-normal">
                  All vouchers have been successfully redeemed. Present these QR codes to redeem your vouchers.
                </p>
              </div>
            </div>

            {/* Total Points */}
            <div className="px-4 pb-4">
              <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em]">
                Total Points Redeemed: {totalPoints.toLocaleString()}
              </h3>
            </div>

            {/* Voucher QR Codes */}
            <div className="vouchers-grid grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="voucher-card bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0"
                      style={{ backgroundImage: `url("${item.image}")` }}
                    ></div>
                    <div className="flex-1">
                      <h4 className="text-[#111418] text-lg font-bold leading-tight mb-2">{item.title}</h4>
                      <p className="text-[#607285] text-sm font-normal leading-normal mb-2">{item.description}</p>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[#111418] text-sm font-medium">
                          {item.points} points × {item.quantity} = {item.points * item.quantity} points
                        </span>
                        <span className="text-[#0b6cda] text-sm font-bold bg-blue-50 px-2 py-1 rounded">
                          {item.value}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* QR Code */}
                  <div className="qr-code-section mt-4 text-center">
                    <h5 className="text-[#111418] text-base font-bold leading-tight mb-3">Voucher QR Code</h5>
                    <div className="qr-code-container bg-white border-2 border-gray-200 rounded-lg p-4 inline-block">
                      <img
                        src={generateQRCode(item, index)}
                        alt={`QR Code for ${item.title}`}
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                    <p className="text-[#607285] text-xs font-normal leading-normal mt-2">
                      Scan this code at the point of sale to apply your discount
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 px-4 py-3">
              <button
                className="download-pdf-btn flex-1 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#0b6cda] text-slate-50 text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-colors"
                onClick={downloadPDF}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    <span className="truncate">Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <i className="pi pi-download mr-2"></i>
                    <span className="truncate">Download PDF Receipt</span>
                  </>
                )}
              </button>
              <button
                className="back-btn flex-1 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 border border-[#0b6cda] text-[#0b6cda] text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-50 transition-colors"
                onClick={handleBackToCart}
              >
                <i className="pi pi-arrow-left mr-2"></i>
                <span className="truncate">Back to Cart</span>
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col sm:flex-row gap-3 px-4 py-3">
              <button 
                onClick={handleBackToCategories}
                className="back-button inline-flex items-center gap-2 text-[#0b6cda] text-sm font-medium hover:text-blue-700 transition-colors"
              >
                <i className="pi pi-arrow-left"></i>
                Back to Categories
              </button>
              <Link 
                to="/"
                className="home-link inline-flex items-center gap-2 text-[#0b6cda] text-sm font-medium hover:text-blue-700 transition-colors"
              >
                <i className="pi pi-home"></i>
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkRedeemPage; 