import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './VoucherRedeemedPage.css';

const VoucherRedeemedPage = () => {
  const { voucherId, categoryId, categoryName } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sample vouchers data (same as in VoucherDetailPage)
  const vouchersData = {
    "Dining": [
      {
        id: 1,
        title: "20% off at The Italian Place",
        description: "Enjoy a 20% discount on your entire bill at The Italian Place. Savor delicious meals with friends and family while saving on your dining experience.",
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
        points: 500,
        discount: "20% off",
        value: "20% off",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Please present this voucher at the time of payment. Valid at all The Italian Place locations.",
        category: "Dining"
      },
      {
        id: 2,
        title: "Free appetizer at The Steakhouse",
        description: "Receive a free appetizer with your main course at The Steakhouse. Perfect for starting your meal with a delicious treat.",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop",
        points: 300,
        discount: "Free appetizer",
        value: "Free appetizer",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Please present this voucher at the time of ordering. Valid at all The Steakhouse locations.",
        category: "Dining"
      },
      {
        id: 3,
        title: "15% off at The Sushi Bar",
        description: "Get 15% off your total order at The Sushi Bar. Enjoy fresh sushi and Japanese cuisine at a great discount.",
        image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop",
        points: 400,
        discount: "15% off",
        value: "15% off",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Please present this voucher at the time of payment. Valid at all The Sushi Bar locations.",
        category: "Dining"
      }
    ],
    "Travel": [
      {
        id: 7,
        title: "Hotel Discount - 25% off",
        description: "Get 25% off your next hotel booking at participating locations. Perfect for your next vacation or business trip.",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
        points: 1000,
        discount: "25% off",
        value: "25% off",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Valid for hotel bookings at participating locations. Advance booking required.",
        category: "Travel"
      }
    ],
    "Shopping": [
      {
        id: 9,
        title: "Amazon Gift Card",
        description: "Get a $50 Amazon gift card for your shopping needs. Use it to purchase anything from the world's largest online marketplace.",
        image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=600&fit=crop",
        points: 800,
        discount: "$50 value",
        value: "$50 value",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Non-transferable and non-refundable. Gift card will be delivered via email within 24 hours of redemption. Valid for use on Amazon.com only.",
        category: "Shopping"
      }
    ]
  };

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    
    // Find the voucher based on category and voucher ID
    const categoryVouchers = vouchersData[categoryName] || [];
    const foundVoucher = categoryVouchers.find(v => v.id.toString() === voucherId);
    
    if (foundVoucher) {
      setVoucher(foundVoucher);
    } else {
      // If voucher not found, create a default one
      setVoucher({
        id: voucherId,
        title: "Voucher Redeemed",
        description: "Your voucher has been successfully redeemed.",
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
        points: 500,
        discount: "Special Offer",
        value: "Special Offer",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable.",
        category: categoryName || "General"
      });
    }
    
    setLoading(false);
  }, [voucherId, categoryName]);

  const handleDownloadQR = () => {
    console.log('Downloading QR code for voucher:', voucher);
    // Implement QR code download logic
    alert('QR code download started!');
  };

  const handleBackToCategories = () => {
    navigate('/categories');
  };

  const handleBackToVoucher = () => {
    navigate(`/voucher/${voucherId}/${categoryId}/${categoryName}`);
  };

  if (loading) {
    return (
      <div className="voucher-redeemed-page relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading redemption details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="voucher-redeemed-page relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-[#607285] text-6xl mb-4">❌</div>
            <h3 className="text-[#111418] text-xl font-semibold mb-2">Voucher not found</h3>
            <p className="text-[#607285] text-base text-center mb-6">
              The voucher you're looking for doesn't exist or has been removed.
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
    <div className="voucher-redeemed-page relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
          <div className="flex items-center gap-4 text-[#0d141c]">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"
                  fill="currentColor"
                ></path>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">Banking Client</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="nav-links flex items-center gap-9">
              <Link to="/" className="text-[#0d141c] text-sm font-medium leading-normal hover:text-blue-600 transition-colors">Home</Link>
              <Link to="/dashboard" className="text-[#0d141c] text-sm font-medium leading-normal hover:text-blue-600 transition-colors">Rewards</Link>
              <Link to="/categories" className="text-[#0d141c] text-sm font-medium leading-normal hover:text-blue-600 transition-colors">Redeem</Link>
              <Link to="/cart" className="text-[#0d141c] text-sm font-medium leading-normal hover:text-blue-600 transition-colors">Cart</Link>
              <Link to="/login" className="text-[#0d141c] text-sm font-medium leading-normal hover:text-blue-600 transition-colors">Account</Link>
            </div>
            <Link to="/login" className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center">
              <i className="pi pi-user text-gray-600 text-xl"></i>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="main-content px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Success Message */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="success-icon text-green-500 text-3xl">✅</div>
                  <p className="page-title text-[#0d141c] tracking-light text-[32px] font-bold leading-tight">Voucher Redeemed</p>
                </div>
                <p className="success-message text-[#49709c] text-sm font-normal leading-normal">
                  Present this QR code to the cashier to redeem your voucher.
                </p>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="p-4 @container">
              <div className="flex flex-col items-stretch justify-start rounded-lg @xl:flex-row @xl:items-start">
                <div
                  className="qr-code-image w-full bg-center bg-no-repeat bg-cover rounded-lg"
                  style={{ 
                    backgroundImage: `url("https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=VOUCHER-${voucherId}-${categoryName.toUpperCase()}-${Date.now()}")`
                  }}
                ></div>
                <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-1 py-4 @xl:px-4">
                  <p className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">Voucher QR Code</p>
                  <div className="flex items-end gap-3 justify-between">
                    <p className="text-[#49709c] text-base font-normal leading-normal">
                      Scan this code at the point of sale to apply your discount.
                    </p>
                    <button
                      className="download-btn flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#0b6cda] text-slate-50 text-sm font-medium leading-normal hover:bg-blue-700 transition-colors"
                      onClick={handleDownloadQR}
                    >
                      <span className="truncate">Download</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Voucher Details Summary */}
            <div className="p-4">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-[#0d141c] text-lg font-bold mb-4">Redeemed Voucher Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#49709c] text-sm font-medium">Voucher</p>
                    <p className="text-[#0d141c] text-base font-semibold">{voucher.title}</p>
                  </div>
                  <div>
                    <p className="text-[#49709c] text-sm font-medium">Value</p>
                    <p className="text-[#0d141c] text-base font-semibold">{voucher.value}</p>
                  </div>
                  <div>
                    <p className="text-[#49709c] text-sm font-medium">Category</p>
                    <p className="text-[#0d141c] text-base font-semibold">{voucher.category}</p>
                  </div>
                  <div>
                    <p className="text-[#49709c] text-sm font-medium">Points Used</p>
                    <p className="text-[#0d141c] text-base font-semibold">{voucher.points} points</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 px-4 py-3">
              <button
                className="primary-btn flex-1 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#0b6cda] text-slate-50 text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-colors"
                onClick={handleDownloadQR}
              >
                <i className="pi pi-download mr-2"></i>
                <span className="truncate">Download QR Code</span>
              </button>
              <button
                className="secondary-btn flex-1 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 border border-[#0b6cda] text-[#0b6cda] text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-50 transition-colors"
                onClick={handleBackToVoucher}
              >
                <i className="pi pi-eye mr-2"></i>
                <span className="truncate">View Voucher Details</span>
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

export default VoucherRedeemedPage; 