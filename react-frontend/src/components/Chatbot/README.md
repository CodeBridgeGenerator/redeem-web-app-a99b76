# AI Chatbot Component

A comprehensive AI assistant integrated into all user routes of the voucher redemption application. The chatbot provides real-time support for users navigating the platform.

## 🚀 Features

### **Core Functionality**
- **Real-time Chat Interface**: Modern, responsive chat UI with typing indicators
- **Context-Aware Responses**: Understands user queries about vouchers, points, and redemption
- **Quick Reply Buttons**: Pre-defined response options for common queries
- **User Data Integration**: Accesses real user data (points, vouchers, history)
- **Floating Chat Button**: Always accessible from any user page

### **AI Capabilities**
- **Points Management**: Check balance, usage history, earning tips
- **Voucher Information**: Browse available vouchers, redemption process
- **Redemption History**: View past redemptions and status
- **Shopping Cart Help**: Manage cart items and redemption process
- **General Support**: Platform navigation and feature explanations

### **User Experience**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Support**: Automatic adaptation to user's system preferences
- **Smooth Animations**: Professional transitions and hover effects
- **Accessibility**: Keyboard navigation and screen reader support

## 📁 File Structure

```
react-frontend/src/components/Chatbot/
├── AIChatbot.js          # Main chatbot component
├── AIChatbot.css         # Styling and animations
└── README.md            # This documentation
```

## 🎯 Integration Points

The chatbot is integrated into all user-facing routes:

### **User Dashboard** (`/user-dashboard`)
- Welcome message with user's name
- Quick access to points and cart information
- Navigation assistance

### **Categories Page** (`/categories`)
- Help with category browsing
- Voucher recommendations
- Points balance information

### **Voucher Page** (`/vouchers/:categoryId`)
- Voucher-specific information
- Redemption process guidance
- Points calculation help

### **Cart Page** (`/cart`)
- Cart management assistance
- Redemption process support
- Points verification

### **My Vouchers** (`/my-vouchers`)
- Redemption history help
- QR code information
- Voucher status queries

### **Redemption History** (`/redemption-history`)
- Historical data assistance
- Transaction details
- Status explanations

## 🛠️ Technical Implementation

### **Component Architecture**
```javascript
const AIChatbot = (props) => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // User data integration
  const [userPoints, setUserPoints] = useState(0);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [userHistory, setUserHistory] = useState([]);
}
```

### **Data Integration**
- **User Points**: Real-time balance from Redux store
- **Available Vouchers**: Fetched from voucher service
- **Redemption History**: Loaded from cartItemHistory service
- **Cart Items**: Current cart status and contents

### **Message Processing**
```javascript
const processUserMessage = async (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Points related queries
  if (lowerMessage.includes('point') || lowerMessage.includes('balance')) {
    return {
      content: `💰 **Your Current Points: ${userPoints}**...`,
      quickReplies: ['Show available vouchers', 'My redemption history']
    };
  }
  
  // Voucher related queries
  if (lowerMessage.includes('voucher') || lowerMessage.includes('available')) {
    return {
      content: `🎫 **Available Vouchers:**...`,
      quickReplies: ['Show categories', 'Help with redemption']
    };
  }
  
  // Additional query handlers...
};
```

## 🎨 UI/UX Features

### **Chat Interface**
- **Floating Button**: Animated chat bubble in bottom-right corner
- **Dialog Window**: Non-modal chat interface
- **Message Bubbles**: Distinct styling for user and bot messages
- **Typing Indicator**: Animated spinner during AI response
- **Quick Replies**: Clickable response buttons

### **Responsive Design**
```css
/* Mobile Optimization */
@media (max-width: 768px) {
  .chatbot-dialog {
    width: 90vw !important;
    height: 80vh !important;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .chatbot-dialog .p-dialog-content {
    background: #2d3748;
  }
}
```

### **Animations**
- **Bounce Effect**: Floating button animation
- **Slide In**: New message animations
- **Pulse**: Typing indicator
- **Hover Effects**: Interactive element feedback

## 🔧 Configuration

### **Redux Integration**
```javascript
const mapState = (state) => ({
  user: state.auth.user,
  isLoggedIn: state.auth.isLoggedIn
});
```

### **Service Integration**
```javascript
// Load user data
const loadUserData = async () => {
  // User points from Redux
  setUserPoints(props.user.points || 0);
  
  // Available vouchers
  const vouchersResponse = await client.service("voucher").find({
    query: { isActive: true, $limit: 10 }
  });
  
  // User redemption history
  const historyResponse = await client.service("cartItemHistory").find({
    query: { userId: props.user._id, status: 'redeemed', $limit: 10 }
  });
};
```

## 🚀 Usage Examples

### **User Queries & AI Responses**

#### **Points Inquiry**
```
User: "How many points do I have?"
AI: "💰 Your Current Points: 1,250

You can use these points to redeem vouchers! Here's what you can do:

🎫 Redeem Vouchers: Browse available vouchers and redeem them with your points
📊 Track Usage: View your redemption history to see how you've used your points
💡 Earn More: Complete activities to earn additional points

Would you like to see available vouchers or your redemption history?"
```

#### **Voucher Information**
```
User: "What vouchers are available?"
AI: "🎫 Available Vouchers:

• Restaurant Discount - 500 points
• Travel Package - 2000 points
• Shopping Voucher - 300 points
• Entertainment Pass - 800 points
• Gift Card - 1000 points

...and 5 more vouchers available!

To redeem a voucher:
1. Browse categories on the main page
2. Select a voucher you like
3. Add it to your cart
4. Complete the redemption process

Would you like me to show you specific categories or help with the redemption process?"
```

#### **Redemption History**
```
User: "Show my redemption history"
AI: "📋 Your Redemption History:

• Restaurant Discount - Redeemed on 12/15/2024
• Shopping Voucher - Redeemed on 12/10/2024
• Entertainment Pass - Redeemed on 12/05/2024

...and 2 more redemptions

You can view your complete history on the "My Vouchers" page."
```

## 🔒 Security & Performance

### **Data Security**
- User data accessed only through authenticated Redux store
- No sensitive information stored in chat messages
- Real-time data validation

### **Performance Optimization**
- Lazy loading of user data when chat opens
- Debounced message processing
- Efficient state management
- Minimal re-renders

### **Error Handling**
```javascript
try {
  const response = await processUserMessage(inputMessage);
  // Handle successful response
} catch (error) {
  console.error('Error processing message:', error);
  const errorMessage = {
    type: 'bot',
    content: 'Sorry, I encountered an error. Please try again.',
    timestamp: new Date()
  };
  setMessages(prev => [...prev, errorMessage]);
}
```

## 🎯 Future Enhancements

### **Planned Features**
- **Natural Language Processing**: More sophisticated query understanding
- **Voice Integration**: Speech-to-text and text-to-speech
- **Multi-language Support**: Internationalization
- **Advanced Analytics**: Chat usage analytics and insights
- **Integration with External AI**: OpenAI or similar API integration

### **Potential Integrations**
- **Email Support**: Direct email generation for complex issues
- **Ticket System**: Create support tickets from chat
- **Payment Integration**: Direct voucher redemption through chat
- **Social Features**: Share vouchers and recommendations

## 📊 Analytics & Monitoring

### **Usage Metrics**
- Chat session duration
- Most common queries
- User satisfaction ratings
- Resolution success rate

### **Performance Metrics**
- Response time
- Error rates
- User engagement
- Feature adoption

## 🤝 Contributing

### **Adding New Features**
1. Extend the `processUserMessage` function
2. Add new quick reply options
3. Update CSS for new UI elements
4. Test across all user routes

### **Customization**
- Modify response templates in `processUserMessage`
- Adjust styling in `AIChatbot.css`
- Add new data sources in `loadUserData`
- Extend quick reply options

## 📝 License

This AI chatbot component is part of the voucher redemption application and follows the same licensing terms as the main project.

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: Development Team 