import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CategoriesPage.css';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const categories = [
    {
      id: 1,
      name: "Travel",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop",
      description: "Explore travel rewards and vacation packages"
    },
    {
      id: 2,
      name: "Experiences",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=200&fit=crop",
      description: "Unique experiences and adventures"
    },
    {
      id: 3,
      name: "Merchandise",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop",
      description: "Shop for merchandise and products"
    },
    {
      id: 4,
      name: "Gift Cards",
      image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=200&fit=crop",
      description: "Gift cards for your favorite stores"
    },
    {
      id: 5,
      name: "Cash Back",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop",
      description: "Get cash back on your purchases"
    },
    {
      id: 6,
      name: "Dining",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop",
      description: "Restaurant rewards and dining experiences"
    },
    {
      id: 7,
      name: "Shopping",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop",
      description: "Shopping rewards and discounts"
    },
    {
      id: 8,
      name: "Entertainment",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=200&fit=crop",
      description: "Entertainment and leisure activities"
    }
  ];

  const handleCategoryClick = (category) => {
    console.log('Selected category:', category.name);
    // Navigate to category detail page
    navigate(`/category/${category.id}/${category.name.toLowerCase()}`);
  };

  return (
    <div className="categories-page relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">

        {/* Main Content */}
        <div className="main-content px-4 sm:px-8 md:px-16 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Page Title */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="page-title text-[#0d141c] tracking-light text-2xl sm:text-3xl lg:text-[32px] font-bold leading-tight">Categories</p>
            </div>

            {/* Categories Section */}
            <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Categories</h2>
            <div className="categories-grid">
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className="category-card flex flex-col gap-3 pb-3 hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div
                    className="category-image"
                    style={{ backgroundImage: `url("${category.image}")` }}
                  ></div>
                  <p className="text-[#0d141c] text-base font-medium leading-normal text-center">{category.name}</p>
                </div>
              ))}
            </div>

            {/* Additional Info Section */}
            <div className="px-4 py-6">
              <div className="info-section bg-blue-50 rounded-lg p-6">
                <h3 className="text-[#0d141c] text-lg font-semibold mb-3">How to Redeem</h3>
                <p className="text-[#49709c] text-sm leading-relaxed">
                  Browse through our categories to find the perfect reward for you. Click on any category to explore available options and start redeeming your points for amazing rewards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage; 