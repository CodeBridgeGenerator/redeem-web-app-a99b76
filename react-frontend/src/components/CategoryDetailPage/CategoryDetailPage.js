import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './CategoryDetailPage.css';

const CategoryDetailPage = () => {
  const { categoryId, categoryName } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [vouchers, setVouchers] = useState([]);

  // Sample category data
  const categories = [
    {
      id: 1,
      name: "Dining",
      icon: "🍽️",
      description: "Restaurant rewards and dining experiences"
    },
    {
      id: 2,
      name: "Travel",
      icon: "✈️",
      description: "Vacation packages and travel rewards"
    },
    {
      id: 3,
      name: "Shopping",
      icon: "🛍️",
      description: "Retail and shopping rewards"
    },
    {
      id: 4,
      name: "Experiences",
      icon: "🎯",
      description: "Unique adventures and activities"
    },
    {
      id: 5,
      name: "Gift Cards",
      icon: "🎁",
      description: "Digital and physical gift cards"
    },
    {
      id: 6,
      name: "Cash Back",
      icon: "💰",
      description: "Direct cash rewards"
    },
    {
      id: 7,
      name: "Entertainment",
      icon: "🎬",
      description: "Entertainment and leisure activities"
    },
    {
      id: 8,
      name: "Merchandise",
      icon: "📦",
      description: "Physical products and items"
    }
  ];

  // Comprehensive vouchers data for all categories
  const vouchersData = {
    "Travel": [
      {
        id: 1,
        title: "Hotel Discount - 25% off",
        description: "Get 25% off your next hotel booking at participating locations.",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=400&fit=crop",
        points: 1000,
        discount: "25% off"
      },
      {
        id: 2,
        title: "Flight Upgrade to Premium Economy",
        description: "Upgrade to premium economy on your next flight with extra legroom and amenities.",
        image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=400&fit=crop",
        points: 1500,
        discount: "Premium upgrade"
      },
      {
        id: 3,
        title: "Car Rental - 30% off",
        description: "Save 30% on your car rental at major rental companies worldwide.",
        image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop",
        points: 800,
        discount: "30% off"
      },
      {
        id: 4,
        title: "Airport Lounge Access",
        description: "Enjoy complimentary access to airport lounges with food, drinks, and WiFi.",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
        points: 600,
        discount: "Free access"
      }
    ],
    "Experiences": [
      {
        id: 5,
        title: "Skydiving Adventure",
        description: "Experience the thrill of skydiving with professional instructors.",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
        points: 2000,
        discount: "50% off"
      },
      {
        id: 6,
        title: "Wine Tasting Tour",
        description: "Enjoy a guided wine tasting tour at premium vineyards.",
        image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop",
        points: 750,
        discount: "Free tour"
      },
      {
        id: 7,
        title: "Cooking Class",
        description: "Learn to cook authentic dishes with professional chefs.",
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
        points: 500,
        discount: "40% off"
      },
      {
        id: 8,
        title: "Hot Air Balloon Ride",
        description: "Soar above the landscape in a beautiful hot air balloon.",
        image: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=400&h=400&fit=crop",
        points: 1800,
        discount: "35% off"
      }
    ],
    "Merchandise": [
      {
        id: 9,
        title: "Premium Headphones",
        description: "Get high-quality wireless headphones with noise cancellation.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
        points: 1200,
        discount: "30% off"
      },
      {
        id: 10,
        title: "Smart Watch",
        description: "Upgrade to a premium smartwatch with health tracking features.",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
        points: 1500,
        discount: "25% off"
      },
      {
        id: 11,
        title: "Designer Bag",
        description: "Get a luxury designer bag at a significant discount.",
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop",
        points: 2000,
        discount: "40% off"
      },
      {
        id: 12,
        title: "Gaming Console",
        description: "Get the latest gaming console with a free game included.",
        image: "https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=400&h=400&fit=crop",
        points: 2500,
        discount: "20% off"
      }
    ],
    "Gift Cards": [
      {
        id: 13,
        title: "Amazon Gift Card - $100",
        description: "Get a $100 Amazon gift card for all your shopping needs.",
        image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=400&fit=crop",
        points: 1600,
        discount: "$100 value"
      },
      {
        id: 14,
        title: "Starbucks Gift Card - $50",
        description: "Enjoy $50 worth of coffee and treats at Starbucks.",
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop",
        points: 800,
        discount: "$50 value"
      },
      {
        id: 15,
        title: "Netflix Gift Card - $75",
        description: "Get $75 worth of Netflix subscription for entertainment.",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
        points: 1200,
        discount: "$75 value"
      },
      {
        id: 16,
        title: "iTunes Gift Card - $50",
        description: "Download music, movies, and apps with $50 iTunes credit.",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop",
        points: 800,
        discount: "$50 value"
      }
    ],
    "Cash Back": [
      {
        id: 17,
        title: "Cash Back - $25",
        description: "Get $25 cash back credited to your account.",
        image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
        points: 500,
        discount: "$25 cash"
      },
      {
        id: 18,
        title: "Cash Back - $50",
        description: "Get $50 cash back credited to your account.",
        image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
        points: 1000,
        discount: "$50 cash"
      },
      {
        id: 19,
        title: "Cash Back - $100",
        description: "Get $100 cash back credited to your account.",
        image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
        points: 2000,
        discount: "$100 cash"
      }
    ],
    "Dining": [
      {
        id: 20,
        title: "20% off at The Italian Place",
        description: "Enjoy a 20% discount on your entire bill at The Italian Place.",
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop",
        points: 500,
        discount: "20% off"
      },
      {
        id: 21,
        title: "Free appetizer at The Steakhouse",
        description: "Receive a free appetizer with your main course at The Steakhouse.",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop",
        points: 300,
        discount: "Free appetizer"
      },
      {
        id: 22,
        title: "15% off at The Sushi Bar",
        description: "Get 15% off your total order at The Sushi Bar.",
        image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=400&fit=crop",
        points: 400,
        discount: "15% off"
      },
      {
        id: 23,
        title: "Complimentary dessert at The French Bistro",
        description: "Receive a complimentary dessert with your meal at The French Bistro.",
        image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop",
        points: 250,
        discount: "Free dessert"
      },
      {
        id: 24,
        title: "10% off at The Mexican Cantina",
        description: "Enjoy a 10% discount on your entire bill at The Mexican Cantina.",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop",
        points: 200,
        discount: "10% off"
      },
      {
        id: 25,
        title: "Free drink at The Irish Pub",
        description: "Get a free drink with your order at The Irish Pub.",
        image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop",
        points: 150,
        discount: "Free drink"
      }
    ],
    "Shopping": [
      {
        id: 26,
        title: "Amazon Gift Card - $50",
        description: "Get a $50 Amazon gift card for your shopping needs.",
        image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=400&fit=crop",
        points: 800,
        discount: "$50 value"
      },
      {
        id: 27,
        title: "Department Store Voucher - 20% off",
        description: "20% off at major department stores.",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop",
        points: 600,
        discount: "20% off"
      },
      {
        id: 28,
        title: "Electronics Store - 15% off",
        description: "Get 15% off at major electronics retailers.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
        points: 700,
        discount: "15% off"
      },
      {
        id: 29,
        title: "Fashion Outlet - 25% off",
        description: "Save 25% at premium fashion outlets.",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop",
        points: 900,
        discount: "25% off"
      }
    ],
    "Entertainment": [
      {
        id: 30,
        title: "Movie Theater - 2 Free Tickets",
        description: "Get 2 free movie tickets at participating theaters.",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
        points: 400,
        discount: "2 free tickets"
      },
      {
        id: 31,
        title: "Concert Tickets - 50% off",
        description: "Get 50% off concert tickets at major venues.",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
        points: 1200,
        discount: "50% off"
      },
      {
        id: 32,
        title: "Theme Park - 30% off",
        description: "Save 30% on theme park admission tickets.",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
        points: 800,
        discount: "30% off"
      },
      {
        id: 33,
        title: "Sports Event - 40% off",
        description: "Get 40% off sports event tickets.",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
        points: 1000,
        discount: "40% off"
      }
    ]
  };

  useEffect(() => {
    // Find the selected category
    const category = categories.find(cat => 
      cat.id.toString() === categoryId || 
      cat.name.toLowerCase() === (categoryName || '').toLowerCase()
    );
    
    if (category) {
      setSelectedCategory(category);
      // Get vouchers for this category
      const categoryVouchers = vouchersData[category.name] || [];
      setVouchers(categoryVouchers);
    } else {
      // Default to Dining if category not found
      setSelectedCategory(categories[0]);
      setVouchers(vouchersData["Dining"] || []);
    }
  }, [categoryId, categoryName]);

  const handleVoucherClick = (voucher) => {
    console.log('Selected voucher:', voucher);
    // Navigate to voucher detail page
    navigate(`/voucher/${voucher.id}/${categoryId}/${categoryName}`);
  };

  const handleRedeemVoucher = (voucher, e) => {
    e.stopPropagation();
    console.log('Redeeming voucher:', voucher);
    // Implement voucher redemption logic
  };

  if (!selectedCategory) {
    return (
      <div className="category-detail-page relative flex size-full min-h-screen flex-col bg-gray-50 group/design-root overflow-x-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading category...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-detail-page relative flex size-full min-h-screen flex-col bg-gray-50 group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">


        {/* Main Content */}
        <div className="main-content px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Breadcrumb and Title */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex items-center gap-2">
                <Link to="/categories" className="text-[#607285] text-sm hover:text-blue-600 transition-colors">
                  Categories
                </Link>
                <span className="text-[#607285] text-sm">/</span>
                <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">
                  {selectedCategory.icon} {selectedCategory.name}
                </p>
              </div>
            </div>

            {/* Category Description */}
            <div className="px-4 pb-4">
              <p className="text-[#607285] text-base leading-relaxed">
                {selectedCategory.description}
              </p>
            </div>

            {/* Vouchers Grid */}
            {vouchers.length > 0 ? (
              <div className="vouchers-grid grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 p-4">
                {vouchers.map((voucher) => (
                  <div 
                    key={voucher.id} 
                    className="voucher-card flex flex-col gap-3 pb-3 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white rounded-xl overflow-hidden"
                    onClick={() => handleVoucherClick(voucher)}
                  >
                    <div
                      className="voucher-image"
                      style={{ backgroundImage: `url("${voucher.image}")` }}
                    ></div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[#111418] text-base font-medium leading-normal flex-1">
                          {voucher.title}
                        </p>
                        <span className="text-[#0b6cda] text-sm font-bold bg-blue-50 px-2 py-1 rounded">
                          {voucher.discount}
                        </span>
                      </div>
                      <p className="text-[#607285] text-sm font-normal leading-normal mb-3">
                        {voucher.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-[#111418] text-sm font-medium">
                          {voucher.points} points
                        </span>
                        <button
                          className="redeem-btn bg-[#0b6cda] text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          onClick={(e) => handleRedeemVoucher(voucher, e)}
                        >
                          Redeem
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="text-[#607285] text-6xl mb-4">🎫</div>
                <h3 className="text-[#111418] text-xl font-semibold mb-2">No vouchers available</h3>
                <p className="text-[#607285] text-base text-center mb-6">
                  There are currently no vouchers available for this category. Check back later!
                </p>
                <Link 
                  to="/categories" 
                  className="bg-[#0b6cda] text-white text-sm font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Other Categories
                </Link>
              </div>
            )}

            {/* Back to Categories Button */}
            <div className="px-4 py-6">
              <Link 
                to="/categories" 
                className="inline-flex items-center gap-2 text-[#0b6cda] text-sm font-medium hover:text-blue-700 transition-colors"
              >
                <i className="pi pi-arrow-left"></i>
                Back to Categories
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailPage; 