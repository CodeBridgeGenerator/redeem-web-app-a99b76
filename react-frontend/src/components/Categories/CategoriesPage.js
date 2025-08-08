import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import client from '../../services/restClient';
import AIChatbot from '../Chatbot/AIChatbot';
import './CategoriesPage.css';

const CategoriesPage = (props) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const toastRef = React.useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load categories
      const categoriesResponse = await client.service("category").find({
        query: { $limit: 1000 }
      });
      setCategories(categoriesResponse.data || []);

      // Load vouchers
      const vouchersResponse = await client.service("voucher").find({
        query: { isActive: true, $limit: 1000 }
      });
      setVouchers(vouchersResponse.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      showToast("error", "Error", "Failed to load categories");
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

  const handleCategoryClick = (category) => {
    navigate(`/vouchers/${category._id}`);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };



  const getCategoryImage = (categoryName) => {
    // Map category names to aesthetic images
    const imageMap = {
      'Food': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop',
      'Travel': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      'Experiences': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
      'Merchandise': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
      'Gift Cards': 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=400&fit=crop',
      'Cash Back': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
      'Dining': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop',
      'Shopping': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
      'Entertainment': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
      'Health & Wellness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'
    };
    
    return imageMap[categoryName] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop';
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{fontFamily: '"Public Sans", "Noto Sans", sans-serif'}}>
      <Toast ref={toastRef} />
      
      {/* AI Chatbot */}
      <AIChatbot />
      
      <div className="layout-container flex h-full grow flex-col">
        {/* Main Content */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Page Title */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#0d141c] tracking-light text-2xl sm:text-3xl lg:text-[32px] font-bold leading-tight">Categories</p>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-3">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-[#49709c] flex border-none bg-[#e7edf4] items-center justify-center pl-4 rounded-l-lg border-r-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                    </svg>
                  </div>
                  <input
                    placeholder="Search rewards"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border-none bg-[#e7edf4] focus:border-none h-full placeholder:text-[#49709c] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </label>
            </div>

            {/* Categories Section */}
            <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Categories</h2>
            <div className="flex flex-nowrap gap-3 p-4 overflow-x-auto">
              {categories.map((category) => (
                <div 
                  key={category._id} 
                  className="flex flex-col gap-3 pb-3 cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div
                    className="bg-center bg-no-repeat bg-cover rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                    style={{
                      backgroundImage: `url("${getCategoryImage(category.name)}")`,
                      width: '150px',
                      height: '100px',
                      margin: '0 auto',
                      display: 'block'
                    }}
                  ></div>
                  <div className="flex flex-col gap-1">
                    <p className="text-[#0d141c] text-base font-medium leading-normal">{category.name}</p>
                  </div>
                </div>
              ))}
            </div>





            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center p-8">
                <div className="text-[#49709c]">Loading categories...</div>
              </div>
            )}

            {/* No Categories State */}
            {!loading && categories.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="text-[#49709c] text-lg mb-2">No categories available</div>
                <div className="text-[#49709c] text-sm">Categories will appear here once they are added to the system.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapState = (state) => ({
  user: state.auth.user
});

export default connect(mapState)(CategoriesPage); 