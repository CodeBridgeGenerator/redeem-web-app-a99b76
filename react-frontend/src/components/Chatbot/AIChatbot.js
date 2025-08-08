import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { ScrollPanel } from 'primereact/scrollpanel';
import { ProgressSpinner } from 'primereact/progressspinner';
import client from '../../services/restClient';
import './AIChatbot.css';

const AIChatbot = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [userHistory, setUserHistory] = useState([]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const toastRef = useRef(null);

  // Initialize chatbot with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user data when chatbot opens
  useEffect(() => {
    if (isOpen && props.user) {
      loadUserData();
    }
  }, [isOpen, props.user]);

  const initializeChat = () => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      content: `Hello ${props.user?.username || 'there'}! 👋 I'm your AI assistant. I can help you with:

🎫 **Voucher Information**
💰 **Points & Rewards**
📋 **Redemption History**
🛒 **Shopping Cart**
❓ **General Support**

What would you like to know?`,
      timestamp: new Date(),
      quickReplies: [
        'Show my points',
        'Available vouchers',
        'My redemption history',
        'How to redeem vouchers',
        'Help with cart'
      ]
    };
    setMessages([welcomeMessage]);
  };

  const loadUserData = async () => {
    try {
      // Load user points
      if (props.user) {
        setUserPoints(props.user.points || 0);
      }

      // Load available vouchers
      const vouchersResponse = await client.service("voucher").find({
        query: { 
          isActive: true,
          $limit: 10 
        }
      });
      setAvailableVouchers(vouchersResponse.data || []);

      // Load user redemption history
      const historyResponse = await client.service("cartItemHistory").find({
        query: { 
          userId: props.user._id,
          status: 'redeemed',
          $limit: 10 
        }
      });
      setUserHistory(historyResponse.data || []);
    } catch (error) {
      console.error('Error loading user data for chatbot:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await processUserMessage(inputMessage);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.content,
        timestamp: new Date(),
        quickReplies: response.quickReplies || []
      };

      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const processUserMessage = async (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Points related queries
    if (lowerMessage.includes('point') || lowerMessage.includes('balance')) {
      return {
        content: `💰 **Your Current Points: ${userPoints}**

You can use these points to redeem vouchers! Here's what you can do:

🎫 **Redeem Vouchers**: Browse available vouchers and redeem them with your points
📊 **Track Usage**: View your redemption history to see how you've used your points
💡 **Earn More**: Complete activities to earn additional points

Would you like to see available vouchers or your redemption history?`,
        quickReplies: ['Show available vouchers', 'My redemption history', 'How to earn points']
      };
    }

    // Voucher related queries
    if (lowerMessage.includes('voucher') || lowerMessage.includes('available') || lowerMessage.includes('redeem')) {
      const voucherList = availableVouchers.slice(0, 5).map(v => 
        `• ${v.title} - ${v.points} points`
      ).join('\n');

      return {
        content: `🎫 **Available Vouchers:**

${voucherList}

${availableVouchers.length > 5 ? `...and ${availableVouchers.length - 5} more vouchers available!` : ''}

To redeem a voucher:
1. Browse categories on the main page
2. Select a voucher you like
3. Add it to your cart
4. Complete the redemption process

Would you like me to show you specific categories or help with the redemption process?`,
        quickReplies: ['Show categories', 'Help with redemption', 'My cart']
      };
    }

    // History related queries
    if (lowerMessage.includes('history') || lowerMessage.includes('redeemed') || lowerMessage.includes('past')) {
      const historyList = userHistory.slice(0, 5).map(h => 
        `• ${h.voucherTitle || 'Voucher'} - Redeemed on ${new Date(h.createdAt).toLocaleDateString()}`
      ).join('\n');

      return {
        content: `📋 **Your Redemption History:**

${historyList.length > 0 ? historyList : 'No redemptions yet. Start redeeming vouchers to see your history here!'}

${userHistory.length > 5 ? `...and ${userHistory.length - 5} more redemptions` : ''}

You can view your complete history on the "My Vouchers" page.`,
        quickReplies: ['Show available vouchers', 'My cart', 'How to redeem']
      };
    }

    // Cart related queries
    if (lowerMessage.includes('cart') || lowerMessage.includes('shopping')) {
      return {
        content: `🛒 **Shopping Cart Help:**

Your cart contains items you've selected but haven't redeemed yet. Here's how to manage your cart:

📝 **View Cart**: Check what vouchers you've added
✅ **Complete Redemption**: Finalize your voucher redemptions
🗑️ **Remove Items**: Remove vouchers you no longer want
💰 **Check Points**: Ensure you have enough points for redemption

You can access your cart from the main navigation or I can help you with specific cart operations.`,
        quickReplies: ['View my cart', 'How to redeem', 'Show available vouchers']
      };
    }

    // Help related queries
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('how')) {
      return {
        content: `❓ **How Can I Help You?**

I'm here to assist you with:

🎫 **Voucher Redemption**
- Browse available vouchers
- Add vouchers to cart
- Complete redemption process

💰 **Points Management**
- Check your current balance
- View points usage history
- Learn how to earn more points

📋 **Account Support**
- View redemption history
- Manage shopping cart
- Get general assistance

What specific help do you need?`,
        quickReplies: ['Show my points', 'Available vouchers', 'My redemption history', 'Help with cart']
      };
    }

    // Default response
    return {
      content: `I understand you're asking about "${message}". Let me help you with that!

Here are some common things I can assist with:

🎫 **Vouchers**: Browse and redeem available vouchers
💰 **Points**: Check your balance and usage
📋 **History**: View your redemption history
🛒 **Cart**: Manage your shopping cart
❓ **Help**: Get general support

What would you like to know more about?`,
      quickReplies: ['Show my points', 'Available vouchers', 'My redemption history', 'Help with cart']
    };
  };

  const handleQuickReply = (reply) => {
    setInputMessage(reply);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      <Toast ref={toastRef} />
      
      {/* Floating Chat Button */}
      <div className="chatbot-toggle">
        <Button
          icon="pi pi-comments"
          className="p-button-rounded p-button-primary"
          onClick={toggleChat}
          tooltip="AI Assistant"
          tooltipOptions={{ position: 'left' }}
        />
      </div>

      {/* Chat Dialog */}
      <Dialog
        visible={isOpen}
        onHide={() => setIsOpen(false)}
        className="chatbot-dialog"
        header={
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <Avatar 
                icon="pi pi-robot" 
                className="chatbot-avatar"
                size="large"
              />
              <div className="chatbot-header-info">
                <h3>AI Assistant</h3>
                <p>Online • Ready to help</p>
              </div>
            </div>
          </div>
        }
        footer={null}
        modal={false}
        position="bottom-right"
        style={{ width: '400px', height: '600px' }}
      >
        <div className="chatbot-container">
          {/* Messages Area */}
          <ScrollPanel className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chatbot-message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
              >
                {message.type === 'bot' && (
                  <Avatar 
                    icon="pi pi-robot" 
                    className="message-avatar"
                    size="normal"
                  />
                )}
                <div className="message-content">
                  <div className="message-text" dangerouslySetInnerHTML={{ 
                    __html: message.content.replace(/\n/g, '<br/>') 
                  }} />
                  <div className="message-time">
                    {formatTime(message.timestamp)}
                  </div>
                  {message.quickReplies && message.type === 'bot' && (
                    <div className="quick-replies">
                      {message.quickReplies.map((reply, index) => (
                        <Button
                          key={index}
                          label={reply}
                          className="p-button-text p-button-sm"
                          onClick={() => handleQuickReply(reply)}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {message.type === 'user' && (
                  <Avatar 
                    icon="pi pi-user" 
                    className="message-avatar"
                    size="normal"
                  />
                )}
              </div>
            ))}
            {isTyping && (
              <div className="chatbot-message bot-message">
                <Avatar 
                  icon="pi pi-robot" 
                  className="message-avatar"
                  size="normal"
                />
                <div className="message-content">
                  <div className="typing-indicator">
                    <ProgressSpinner style={{ width: '20px', height: '20px' }} />
                    <span>AI is typing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollPanel>

          {/* Input Area */}
          <div className="chatbot-input">
            <div className="input-container">
              <InputText
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="chatbot-input-field"
                disabled={isTyping}
              />
              <Button
                icon="pi pi-send"
                className="p-button-primary p-button-rounded"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

const mapState = (state) => ({
  user: state.auth.user,
  isLoggedIn: state.auth.isLoggedIn
});

const mapDispatch = (dispatch) => ({
  // Add any dispatch actions if needed
});

export default connect(mapState, mapDispatch)(AIChatbot); 