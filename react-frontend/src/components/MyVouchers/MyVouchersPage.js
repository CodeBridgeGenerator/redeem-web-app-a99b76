import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import client from '../../services/restClient';
import AIChatbot from '../Chatbot/AIChatbot';
import './MyVouchersPage.css';

const MyVouchersPage = (props) => {
  const navigate = useNavigate();
  const [redeemedVouchers, setRedeemedVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const toastRef = React.useRef(null);

  useEffect(() => {
    loadRedeemedVouchers();
  }, []);

  const loadRedeemedVouchers = async () => {
    setLoading(true);
    try {
      const response = await client.service("cartItemHistory").find({
        query: {
          userId: props.user?._id,
          status: 'redeemed',
          $populate: ['voucherId'],
          $sort: { completedDate: -1 }
        }
      });

      // Load voucher details for each redeemed item
      const vouchersWithDetails = await Promise.all(
        response.data.map(async (item) => {
          let voucher = item.voucherId;
          
          // If voucherId is populated, use it
          if (voucher && typeof voucher === 'object') {
            return {
              ...item,
              voucherId: voucher
            };
          }
          
          // If voucherId is just an ID, fetch the voucher details
          if (item.voucherId && typeof item.voucherId === 'string') {
            try {
              const voucherResponse = await client.service("voucher").get(item.voucherId);
              return {
                ...item,
                voucherId: voucherResponse
              };
            } catch (error) {
              console.error("Error fetching voucher details:", error);
              return {
                ...item,
                voucherId: {
                  _id: item.voucherId,
                  title: 'Unknown Voucher',
                  description: 'Voucher details not available',
                  points: 0,
                  image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop'
                }
              };
            }
          }
          
          return item;
        })
      );

      setRedeemedVouchers(vouchersWithDetails || []);
    } catch (error) {
      console.error("Error loading redeemed vouchers:", error);
      showToast("error", "Error", "Failed to load redeemed vouchers");
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

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date not available';
    }
  };

  const getVoucherImage = (voucher) => {
    return voucher?.image || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop';
  };

  const voucherImageTemplate = (rowData) => {
    const voucher = rowData.voucherId;
    return (
      <div className="voucher-image-container">
        <img 
          src={getVoucherImage(voucher)}
          alt={voucher?.title || 'Voucher'}
          className="voucher-image"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop';
          }}
        />
      </div>
    );
  };

  const voucherTitleTemplate = (rowData) => {
    const voucher = rowData.voucherId;
    return (
      <div className="voucher-info">
        <h4 className="voucher-title">{voucher?.title || 'Unknown Voucher'}</h4>
        <p className="voucher-description">{voucher?.description || 'No description available'}</p>
      </div>
    );
  };

  const statusTemplate = (rowData) => {
    return (
      <Badge 
        value={rowData.status} 
        severity={rowData.status === 'redeemed' ? 'success' : 'warning'}
        className="status-badge"
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" style={{fontFamily: '"Public Sans", "Noto Sans", sans-serif'}}>
      <Toast ref={toastRef} />
      
      {/* AI Chatbot */}
      <AIChatbot />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Vouchers</h1>
                <p className="text-slate-600 mt-1">View your redeemed vouchers and QR codes</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge value={`${redeemedVouchers.length} vouchers`} severity="info" className="text-sm" />
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
          <span className="text-slate-900 text-base font-medium leading-normal">My Vouchers</span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-slate-600 text-lg">Loading your vouchers...</div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && redeemedVouchers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6">
              <i className="pi pi-ticket text-3xl text-slate-400"></i>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No vouchers yet</h3>
            <p className="text-slate-600 mb-6 max-w-md">
              You haven't redeemed any vouchers yet. Start browsing categories to find rewards!
            </p>
            <Button 
              label="Browse Categories" 
              icon="pi pi-tags"
              onClick={() => navigate('/categories')}
              className="p-button-outlined"
            />
          </div>
        )}

        {/* Vouchers List */}
        {!loading && redeemedVouchers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <DataTable 
              value={redeemedVouchers}
              emptyMessage="No redeemed vouchers found"
              className="vouchers-table"
              responsiveLayout="stack"
              breakpoint="960px"
              showGridlines
              stripedRows
            >
              <Column 
                header="Voucher" 
                body={voucherImageTemplate}
                style={{ width: '80px' }}
                className="voucher-image-column"
              />
              <Column 
                header="Details" 
                body={voucherTitleTemplate}
                className="voucher-details-column"
              />
              <Column 
                field="quantity" 
                header="Quantity" 
                style={{ width: '100px' }}
                className="quantity-column"
              />
              <Column 
                field="pointsUsed" 
                header="Points Used" 
                style={{ width: '120px' }}
                className="points-column"
              />
              <Column 
                field="completedDate" 
                header="Redeemed Date" 
                body={(rowData) => formatDate(rowData.completedDate)}
                style={{ width: '150px' }}
                className="date-column"
              />
              <Column 
                header="Status" 
                body={statusTemplate}
                style={{ width: '100px' }}
                className="status-column"
              />
            </DataTable>
          </div>
        )}
      </div>
    </div>
  );
};

const mapState = (state) => ({
  user: state.auth.user
});

export default connect(mapState)(MyVouchersPage); 