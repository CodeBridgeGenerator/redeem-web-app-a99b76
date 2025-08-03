import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import client from '../../services/restClient';
import './RedemptionHistoryPage.css';

const RedemptionHistoryPage = (props) => {
  const [redemptionHistory, setRedemptionHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRedemptionHistory();
  }, []);

  const fetchRedemptionHistory = async () => {
    if (!props.isLoggedIn || !props.user?._id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch cart item history for the current user
      const historyResponse = await client.service("cartItemHistory").find({
        query: {
          userId: props.user._id,
          $sort: { createdAt: -1 }, // Most recent first
          $limit: 100,
        },
      });

      // Fetch voucher details for each history item
      const historyWithVouchers = await Promise.all(
        historyResponse.data.map(async (historyItem) => {
          try {
            // Try to get voucher details
            const voucherResponse = await client.service("voucher").find({
              query: {
                voucherId: historyItem.voucherId,
                $limit: 1,
              },
            });

            const voucher = voucherResponse.data[0] || {};
            
            return {
              ...historyItem,
              voucherTitle: voucher.title || 'Unknown Voucher',
              voucherDescription: voucher.description || '',
              voucherImage: voucher.image || '',
              points: voucher.points || 0,
              redemptionDate: (() => {
                const dateToUse = historyItem.completedDate || historyItem.createdAt;
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
              })(),
              status: 'Redeemed'
            };
          } catch (error) {
            console.error('Error fetching voucher details:', error);
            return {
              ...historyItem,
              voucherTitle: 'Unknown Voucher',
              voucherDescription: '',
              voucherImage: '',
              points: 0,
              redemptionDate: (() => {
                const dateToUse = historyItem.completedDate || historyItem.createdAt;
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
              })(),
              status: 'Redeemed'
            };
          }
        })
      );

      setRedemptionHistory(historyWithVouchers);
    } catch (error) {
      console.error('Failed to fetch redemption history:', error);
      setRedemptionHistory([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <p className="text-[#101518] tracking-light text-[32px] font-bold leading-tight min-w-72">
              Redemption History
            </p>
          </div>
          <div className="px-4 py-3">
            <div className="flex justify-center items-center h-64">
              <div className="text-[#5c748a] text-lg">Loading redemption history...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        {/* Breadcrumb */}
        <div className="flex flex-wrap gap-2 p-4">
          <Link to="/" className="text-[#607285] text-base font-medium leading-normal hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span className="text-[#607285] text-base font-medium leading-normal">/</span>
          <span className="text-[#111418] text-base font-medium leading-normal">Redemption History</span>
        </div>

        {/* Page Title */}
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <p className="text-[#101518] tracking-light text-[32px] font-bold leading-tight min-w-72">
            Redemption History
          </p>
        </div>

        {/* Redemption History Table */}
        <div className="px-4 py-3 @container">
          {redemptionHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-xl border border-[#d4dce2]">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-[#5c748a] text-lg font-medium mb-2">No Redemption History</p>
              <p className="text-[#5c748a] text-sm text-center max-w-md">
                You haven't redeemed any vouchers yet. Start exploring our rewards to see your redemption history here.
              </p>
              <Link 
                to="/categories" 
                className="mt-4 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#dee7f1] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-200 transition-colors"
              >
                <span className="truncate">Browse Rewards</span>
              </Link>
            </div>
          ) : (
            <div className="flex overflow-hidden rounded-xl border border-[#d4dce2] bg-gray-50">
              <table className="flex-1">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="table-column-120 px-4 py-3 text-left text-[#101518] w-[400px] text-sm font-medium leading-normal">
                      Voucher
                    </th>
                    <th className="table-column-240 px-4 py-3 text-left text-[#101518] w-[400px] text-sm font-medium leading-normal">
                      Redemption Date
                    </th>
                    <th className="table-column-360 px-4 py-3 text-left text-[#101518] w-[400px] text-sm font-medium leading-normal">
                      Points
                    </th>
                    <th className="table-column-480 px-4 py-3 text-left text-[#101518] w-60 text-sm font-medium leading-normal">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {redemptionHistory.map((item, index) => (
                    <tr key={item._id || index} className="border-t border-t-[#d4dce2] hover:bg-gray-100 transition-colors">
                      <td className="table-column-120 h-[72px] px-4 py-2 w-[400px] text-[#101518] text-sm font-normal leading-normal">
                        <div className="flex items-center gap-3">
                          {item.voucherImage && (
                            <img 
                              src={item.voucherImage} 
                              alt={item.voucherTitle}
                              className="w-12 h-12 rounded-lg object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <div className="font-medium">{item.voucherTitle}</div>
                            {item.voucherDescription && (
                              <div className="text-[#5c748a] text-xs truncate max-w-[300px]">
                                {item.voucherDescription}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="table-column-240 h-[72px] px-4 py-2 w-[400px] text-[#5c748a] text-sm font-normal leading-normal">
                        {item.redemptionDate}
                      </td>
                      <td className="table-column-360 h-[72px] px-4 py-2 w-[400px] text-[#5c748a] text-sm font-normal leading-normal">
                        {item.points.toLocaleString()}
                      </td>
                      <td className="table-column-480 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#eaedf1] text-[#101518] text-sm font-medium leading-normal w-full">
                          <span className="truncate">{item.status}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Responsive styles */}
          <style>
            {`
              @container(max-width:120px){.table-column-120{display: none;}}
              @container(max-width:240px){.table-column-240{display: none;}}
              @container(max-width:360px){.table-column-360{display: none;}}
              @container(max-width:480px){.table-column-480{display: none;}}
            `}
          </style>
        </div>
      </div>
    </div>
  );
};

const mapState = (state) => {
  const { isLoggedIn, user } = state.auth;
  return { isLoggedIn, user };
};

export default connect(mapState)(RedemptionHistoryPage); 