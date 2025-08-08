import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './VoucherDetailPage.css';

const VoucherDetailPage = () => {
  const { voucherId, categoryId, categoryName } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);

  // Comprehensive vouchers data for all categories
  const vouchersData = {
    "Travel": [
      {
        id: 1,
        title: "Hotel Discount - 25% off",
        description: "Get 25% off your next hotel booking at participating locations. Perfect for your next vacation or business trip.",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
        points: 1000,
        discount: "25% off",
        value: "25% off",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Valid for hotel bookings at participating locations. Advance booking required. Subject to availability.",
        category: "Travel"
      },
      {
        id: 2,
        title: "Flight Upgrade to Premium Economy",
        description: "Upgrade to premium economy on your next flight with extra legroom and amenities. Enjoy a more comfortable travel experience.",
        image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop",
        points: 1500,
        discount: "Premium upgrade",
        value: "Premium Economy Upgrade",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Subject to airline availability and booking class restrictions.",
        category: "Travel"
      },
      {
        id: 3,
        title: "Car Rental - 30% off",
        description: "Save 30% on your car rental at major rental companies worldwide. Perfect for business trips and vacations.",
        image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop",
        points: 800,
        discount: "30% off",
        value: "30% off car rental",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Valid at participating rental locations. Minimum rental period may apply.",
        category: "Travel"
      },
      {
        id: 4,
        title: "Airport Lounge Access",
        description: "Enjoy complimentary access to airport lounges with food, drinks, and WiFi. Relax before your flight in comfort.",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
        points: 600,
        discount: "Free access",
        value: "Airport Lounge Access",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Valid at participating airport lounges. Access subject to lounge capacity.",
        category: "Travel"
      }
    ],
    "Experiences": [
      {
        id: 5,
        title: "Skydiving Adventure",
        description: "Experience the thrill of skydiving with professional instructors. An unforgettable adventure for adrenaline seekers.",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
        points: 2000,
        discount: "50% off",
        value: "50% off skydiving",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Subject to weather conditions and availability. Age and health restrictions apply.",
        category: "Experiences"
      },
      {
        id: 6,
        title: "Wine Tasting Tour",
        description: "Enjoy a guided wine tasting tour at premium vineyards. Learn about wine production and taste exceptional wines.",
        image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop",
        points: 750,
        discount: "Free tour",
        value: "Wine Tasting Tour",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Valid at participating vineyards. Age restrictions apply for alcohol consumption.",
        category: "Experiences"
      },
      {
        id: 7,
        title: "Cooking Class",
        description: "Learn to cook authentic dishes with professional chefs. Perfect for food enthusiasts and culinary beginners.",
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
        points: 500,
        discount: "40% off",
        value: "40% off cooking class",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Valid at participating cooking schools. Subject to class availability.",
        category: "Experiences"
      },
      {
        id: 8,
        title: "Hot Air Balloon Ride",
        description: "Soar above the landscape in a beautiful hot air balloon. Experience breathtaking views from above.",
        image: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&h=600&fit=crop",
        points: 1800,
        discount: "35% off",
        value: "35% off balloon ride",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Subject to weather conditions and availability. Age restrictions may apply.",
        category: "Experiences"
      }
    ],
    "Merchandise": [
      {
        id: 9,
        title: "Premium Headphones",
        description: "Get high-quality wireless headphones with noise cancellation. Perfect for music lovers and professionals.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop",
        points: 1200,
        discount: "30% off",
        value: "30% off headphones",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Valid at participating electronics retailers. Subject to product availability.",
        category: "Merchandise"
      },
      {
        id: 10,
        title: "Smart Watch",
        description: "Upgrade to a premium smartwatch with health tracking features. Stay connected and monitor your fitness.",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop",
        points: 1500,
        discount: "25% off",
        value: "25% off smartwatch",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Valid at participating electronics retailers. Subject to product availability.",
        category: "Merchandise"
      },
      {
        id: 11,
        title: "Designer Bag",
        description: "Get a luxury designer bag at a significant discount. Elevate your style with premium accessories.",
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=600&fit=crop",
        points: 2000,
        discount: "40% off",
        value: "40% off designer bag",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Valid at participating luxury retailers. Subject to product availability.",
        category: "Merchandise"
      },
      {
        id: 12,
        title: "Gaming Console",
        description: "Get the latest gaming console with a free game included. Perfect for gaming enthusiasts.",
        image: "https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=800&h=600&fit=crop",
        points: 2500,
        discount: "20% off",
        value: "20% off gaming console",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Valid at participating electronics retailers. Subject to product availability.",
        category: "Merchandise"
      }
    ],
    "Gift Cards": [
      {
        id: 13,
        title: "Amazon Gift Card - $100",
        description: "Get a $100 Amazon gift card for all your shopping needs. Use it to purchase anything from the world's largest online marketplace.",
        image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=600&fit=crop",
        points: 1600,
        discount: "$100 value",
        value: "$100 Amazon Gift Card",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Non-transferable and non-refundable. Gift card will be delivered via email within 24 hours of redemption. Valid for use on Amazon.com only.",
        category: "Gift Cards"
      },
      {
        id: 14,
        title: "Starbucks Gift Card - $50",
        description: "Enjoy $50 worth of coffee and treats at Starbucks. Perfect for coffee lovers and casual meetups.",
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop",
        points: 800,
        discount: "$50 value",
        value: "$50 Starbucks Gift Card",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Non-transferable and non-refundable. Gift card will be delivered via email within 24 hours of redemption. Valid at all Starbucks locations.",
        category: "Gift Cards"
      },
      {
        id: 15,
        title: "Netflix Gift Card - $75",
        description: "Get $75 worth of Netflix subscription for entertainment. Enjoy movies and TV shows for months.",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
        points: 1200,
        discount: "$75 value",
        value: "$75 Netflix Gift Card",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Non-transferable and non-refundable. Gift card will be delivered via email within 24 hours of redemption. Valid for Netflix subscriptions only.",
        category: "Gift Cards"
      },
      {
        id: 16,
        title: "iTunes Gift Card - $50",
        description: "Download music, movies, and apps with $50 iTunes credit. Perfect for Apple ecosystem users.",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop",
        points: 800,
        discount: "$50 value",
        value: "$50 iTunes Gift Card",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Non-transferable and non-refundable. Gift card will be delivered via email within 24 hours of redemption. Valid for iTunes purchases only.",
        category: "Gift Cards"
      }
    ],
    "Cash Back": [
      {
        id: 17,
        title: "Cash Back - $25",
        description: "Get $25 cash back credited to your account. Use it for any purpose you choose.",
        image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
        points: 500,
        discount: "$25 cash",
        value: "$25 Cash Back",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Non-transferable and non-refundable. Cash back will be credited to your account within 3-5 business days. No restrictions on usage.",
        category: "Cash Back"
      },
      {
        id: 18,
        title: "Cash Back - $50",
        description: "Get $50 cash back credited to your account. Perfect for saving or spending as needed.",
        image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
        points: 1000,
        discount: "$50 cash",
        value: "$50 Cash Back",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Non-transferable and non-refundable. Cash back will be credited to your account within 3-5 business days. No restrictions on usage.",
        category: "Cash Back"
      },
      {
        id: 19,
        title: "Cash Back - $100",
        description: "Get $100 cash back credited to your account. A substantial reward for your loyalty.",
        image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
        points: 2000,
        discount: "$100 cash",
        value: "$100 Cash Back",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Non-transferable and non-refundable. Cash back will be credited to your account within 3-5 business days. No restrictions on usage.",
        category: "Cash Back"
      }
    ],
    "Dining": [
      {
        id: 20,
        title: "20% off at The Italian Place",
        description: "Enjoy a 20% discount on your entire bill at The Italian Place. Savor delicious meals with friends and family while saving on your dining experience.",
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
        points: 500,
        discount: "20% off",
        value: "20% off dining",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Please present this voucher at the time of payment. Valid at all The Italian Place locations.",
        category: "Dining"
      },
      {
        id: 21,
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
        id: 22,
        title: "15% off at The Sushi Bar",
        description: "Get 15% off your total order at The Sushi Bar. Enjoy fresh sushi and Japanese cuisine at a great discount.",
        image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop",
        points: 400,
        discount: "15% off",
        value: "15% off dining",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Please present this voucher at the time of payment. Valid at all The Sushi Bar locations.",
        category: "Dining"
      },
      {
        id: 23,
        title: "Complimentary dessert at The French Bistro",
        description: "Receive a complimentary dessert with your meal at The French Bistro. End your dining experience on a sweet note.",
        image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop",
        points: 250,
        discount: "Free dessert",
        value: "Free dessert",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Please present this voucher at the time of ordering. Valid at all The French Bistro locations.",
        category: "Dining"
      },
      {
        id: 24,
        title: "10% off at The Mexican Cantina",
        description: "Enjoy a 10% discount on your entire bill at The Mexican Cantina. Experience authentic Mexican cuisine at a great price.",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop",
        points: 200,
        discount: "10% off",
        value: "10% off dining",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Please present this voucher at the time of payment. Valid at all The Mexican Cantina locations.",
        category: "Dining"
      },
      {
        id: 25,
        title: "Free drink at The Irish Pub",
        description: "Get a free drink with your order at The Irish Pub. Enjoy a refreshing beverage with your meal.",
        image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop",
        points: 150,
        discount: "Free drink",
        value: "Free drink",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Please present this voucher at the time of ordering. Valid at all The Irish Pub locations. Age restrictions apply.",
        category: "Dining"
      }
    ],
    "Shopping": [
      {
        id: 26,
        title: "Amazon Gift Card - $50",
        description: "Get a $50 Amazon gift card for your shopping needs. Use it to purchase anything from the world's largest online marketplace.",
        image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=600&fit=crop",
        points: 800,
        discount: "$50 value",
        value: "$50 Amazon Gift Card",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Non-transferable and non-refundable. Gift card will be delivered via email within 24 hours of redemption. Valid for use on Amazon.com only.",
        category: "Shopping"
      },
      {
        id: 27,
        title: "Department Store Voucher - 20% off",
        description: "20% off at major department stores. Save on clothing, home goods, and more at premium retailers.",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
        points: 600,
        discount: "20% off",
        value: "20% off shopping",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Valid at participating department stores. Exclusions may apply.",
        category: "Shopping"
      },
      {
        id: 28,
        title: "Electronics Store - 15% off",
        description: "Get 15% off at major electronics retailers. Save on gadgets, computers, and tech accessories.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop",
        points: 700,
        discount: "15% off",
        value: "15% off electronics",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Valid at participating electronics retailers. Exclusions may apply.",
        category: "Shopping"
      },
      {
        id: 29,
        title: "Fashion Outlet - 25% off",
        description: "Save 25% at premium fashion outlets. Get designer clothing and accessories at discounted prices.",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
        points: 900,
        discount: "25% off",
        value: "25% off fashion",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Valid at participating fashion outlets. Exclusions may apply.",
        category: "Shopping"
      }
    ],
    "Entertainment": [
      {
        id: 30,
        title: "Movie Theater - 2 Free Tickets",
        description: "Get 2 free movie tickets at participating theaters. Enjoy the latest blockbusters with a friend or family member.",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
        points: 400,
        discount: "2 free tickets",
        value: "2 Free Movie Tickets",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Valid at participating theaters. Subject to movie availability.",
        category: "Entertainment"
      },
      {
        id: 31,
        title: "Concert Tickets - 50% off",
        description: "Get 50% off concert tickets at major venues. Experience live music performances at a great discount.",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
        points: 1200,
        discount: "50% off",
        value: "50% off concert tickets",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Valid at participating venues. Subject to concert availability.",
        category: "Entertainment"
      },
      {
        id: 32,
        title: "Theme Park - 30% off",
        description: "Save 30% on theme park admission tickets. Enjoy thrilling rides and family entertainment at a discount.",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
        points: 800,
        discount: "30% off",
        value: "30% off theme park",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Valid at participating theme parks. Subject to park availability.",
        category: "Entertainment"
      },
      {
        id: 33,
        title: "Sports Event - 40% off",
        description: "Get 40% off sports event tickets. Watch your favorite teams compete live at major stadiums.",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
        points: 1000,
        discount: "40% off",
        value: "40% off sports tickets",
        validUntil: "December 31, 2024",
        terms: "This voucher is valid for one-time use only. Cannot be combined with other offers. Non-transferable and non-refundable. Valid at participating venues. Subject to event availability.",
        category: "Entertainment"
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
        title: "Voucher Details",
        description: "Enjoy this exclusive offer with your rewards points.",
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

  const handleRedeemVoucher = () => {
    console.log('Redeeming voucher:', voucher);
    // Navigate to voucher redeemed page
    navigate(`/voucher-redeemed/${voucherId}/${categoryId}/${categoryName}`);
  };

  const handleAddToCart = async () => {
    try {
      console.log('Adding voucher to cart:', voucher);
      
      // Check if user has enough points
      if (voucher.points > 0) {
        // This is a mock voucher, so we'll just show a success message
        alert(`"${voucher.title}" has been added to your cart!`);
        return;
      }

      // For real vouchers, you would use the API like this:
      // const existingCartItem = await client.service("cartItems").find({
      //   query: {
      //     userId: props.user._id,
      //     voucherId: voucher._id,
      //     $limit: 1
      //   }
      // });

      // if (existingCartItem.data && existingCartItem.data.length > 0) {
      //   const cartItem = existingCartItem.data[0];
      //   await client.service("cartItems").patch(cartItem._id, {
      //     quantity: cartItem.quantity + 1
      //   });
      //   alert("Quantity increased in cart");
      // } else {
      //   await client.service("cartItems").create({
      //     userId: props.user._id,
      //     voucherId: voucher._id,
      //     quantity: 1,
      //     isActive: true
      //   });
      //   alert(`"${voucher.title}" has been added to your cart!`);
      // }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add voucher to cart");
    }
  };

  const handleBackToCategory = () => {
    navigate(`/category/${categoryId}/${categoryName}`);
  };

  if (loading) {
    return (
      <div className="voucher-detail-page relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading voucher details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="voucher-detail-page relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-[#607285] text-6xl mb-4">🎫</div>
            <h3 className="text-[#111418] text-xl font-semibold mb-2">Voucher not found</h3>
            <p className="text-[#607285] text-base text-center mb-6">
              The voucher you're looking for doesn't exist or has been removed.
            </p>
            <button 
              onClick={handleBackToCategory}
              className="bg-[#0b6cda] text-white text-sm font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Category
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="voucher-detail-page relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">


        {/* Main Content */}
        <div className="main-content px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Breadcrumb */}
            <div className="flex flex-wrap gap-2 p-4">
              <Link to="/categories" className="text-[#49709c] text-base font-medium leading-normal hover:text-blue-600 transition-colors">
                Rewards
              </Link>
              <span className="text-[#49709c] text-base font-medium leading-normal">/</span>
              <Link 
                to={`/category/${categoryId}/${categoryName}`} 
                className="text-[#49709c] text-base font-medium leading-normal hover:text-blue-600 transition-colors"
              >
                {categoryName}
              </Link>
              <span className="text-[#49709c] text-base font-medium leading-normal">/</span>
              <span className="text-[#0d141c] text-base font-medium leading-normal">Voucher Details</span>
            </div>

            {/* Page Title */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="page-title text-[#0d141c] tracking-light text-[32px] font-bold leading-tight min-w-72">Voucher Details</p>
            </div>

            {/* Voucher Main Content */}
            <div className="p-6 @container">
              <div className="voucher-main-content flex flex-col items-stretch justify-start rounded-xl overflow-hidden @xl:flex-row @xl:items-start">
                <div
                  className="voucher-detail-image w-full bg-center bg-no-repeat bg-cover"
                  style={{ backgroundImage: `url("${voucher.image}")` }}
                ></div>
                <div className="voucher-details flex w-full min-w-72 grow flex-col items-stretch justify-center gap-4 p-6 @xl:px-6">
                  <div className="voucher-header">
                    <h1 className="voucher-title text-[#0d141c] text-2xl font-bold leading-tight tracking-[-0.015em] mb-3">
                      {voucher.title}
                    </h1>
                    <p className="voucher-description text-[#49709c] text-base font-normal leading-relaxed">
                      {voucher.description}
                    </p>
                  </div>
                  
                  <div className="voucher-highlights flex flex-wrap gap-4 py-4 border-t border-b border-gray-100">
                    <div className="highlight-item">
                      <span className="highlight-label text-[#49709c] text-sm font-medium uppercase tracking-wide">
                        Value
                      </span>
                      <div className="highlight-value text-[#0d141c] text-lg font-bold text-[#0b6cda]">
                        {voucher.value}
                      </div>
                    </div>
                    <div className="highlight-item">
                      <span className="highlight-label text-[#49709c] text-sm font-medium uppercase tracking-wide">
                        Points Required
                      </span>
                      <div className="highlight-value text-[#0d141c] text-lg font-bold">
                        {voucher.points} points
                      </div>
                    </div>
                    <div className="highlight-item">
                      <span className="highlight-label text-[#49709c] text-sm font-medium uppercase tracking-wide">
                        Valid Until
                      </span>
                      <div className="highlight-value text-[#0d141c] text-base font-medium">
                        {voucher.validUntil}
                      </div>
                    </div>
                  </div>
                  
                  <div className="voucher-actions flex gap-3">
                    <button
                      className="redeem-btn-small flex-1 flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#0b6cda] text-slate-50 text-sm font-semibold leading-normal hover:bg-blue-700 transition-all duration-200"
                      onClick={handleRedeemVoucher}
                    >
                      <i className="pi pi-check mr-2"></i>
                      <span className="truncate">Redeem Now</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Conditions Section */}
            <div className="p-6">
              <div className="terms-section bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="terms-header bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-[#0d141c] text-xl font-bold leading-tight tracking-[-0.015em] flex items-center">
                    <i className="pi pi-file-text mr-3 text-[#0b6cda]"></i>
                    Terms & Conditions
                  </h2>
                </div>
                <div className="terms-content p-6">
                  <div className="terms-text text-[#0d141c] text-sm leading-relaxed whitespace-pre-line">
                    {voucher.terms}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6">
              <div className="action-section bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-[#0d141c] text-lg font-semibold mb-4 flex items-center">
                  <i className="pi pi-shopping-bag mr-2 text-[#0b6cda]"></i>
                  Ready to Redeem?
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    className="add-to-cart-btn flex-1 flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 border-2 border-[#0b6cda] text-[#0b6cda] text-base font-semibold leading-normal tracking-[0.015em] hover:bg-blue-50 hover:border-blue-600 transition-all duration-200"
                    onClick={handleAddToCart}
                  >
                    <i className="pi pi-shopping-cart mr-2"></i>
                    <span className="truncate">Add to Cart</span>
                  </button>
                  <button
                    className="redeem-btn-main flex-1 flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#0b6cda] text-slate-50 text-base font-semibold leading-normal tracking-[0.015em] hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
                    onClick={handleRedeemVoucher}
                  >
                    <i className="pi pi-check mr-2"></i>
                    <span className="truncate">Redeem Now</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="px-6 py-4">
              <button 
                onClick={handleBackToCategory}
                className="back-button inline-flex items-center gap-2 text-[#0b6cda] text-sm font-medium hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200"
              >
                <i className="pi pi-arrow-left"></i>
                Back to {categoryName}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherDetailPage; 