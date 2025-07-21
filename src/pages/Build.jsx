import { useLocation } from 'react-router-dom';
import { mockProduct } from '../data/mockProduct';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { Heart, Send, ArrowLeft, Save, Sparkles, MessageCircle, Eye, Clock } from 'lucide-react';
import Layout from '../components/Layout';

function Build() {

  // get item info
  const location = useLocation();
  const itemId = location.state?.itemId;
  const item = mockProduct.find((anItem) => anItem.id === itemId);

  if (!item) return <h1>Item not found</h1>

  // TEMPORARY: redirect to a checkout page
  const inputRedirect = (itemId, quantity) => {
    navigate('/checkout', { state: { itemId: itemId, quantity: quantity } });
  };

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // AI 'typing'
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi there! I'm here to help you turn your story into a special gift. What would you like to express, and who is this beautiful mug for?",
      timestamp: new Date()
    }
  ]);

  const navigate = useNavigate()

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        // increment message id
        id: messages.length + 1,
        type: 'user',
        content: message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      setIsTyping(true);
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          type: 'ai',
          content: "That sounds wonderful! I can feel the love in your words. Let me help you craft something beautiful that captures that sentiment perfectly.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 2000);
    }
  };

  // reference to bottom of chat
  const messagesEndRef = useRef(null);

  //scrolls to bottom of chat when called
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // scrolls to bottom every time messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-rose-100 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <button className="mr-4 p-2 hover:bg-rose-50 rounded-full transition-colors duration-200"
                onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center">
                <Heart className="w-6 h-6 text-rose-400 mr-2" />
                <h1 className="text-2xl font-playfair font-bold text-gray-800">Dearly</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
              onClick={() => inputRedirect(item.id)}
              className="flex items-center px-4 py-2 bg-rose-100 text-rose-700 rounded-full hover:bg-rose-200 transition-colors duration-200">
                <Save className="w-4 h-4 mr-2" />
                Save Progress
              </button>
            </div>
          </div>
        </header>

        {/* Inspirational Quote */}
        <div className="bg-gradient-to-r from-rose-100 to-purple-100 py-4">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-lg font-playfair text-gray-700 italic">
              "Big feelings make beautiful gifts."
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-full mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
            
            {/* Left Panel - AI Chatbox */}
            <div className="bg-white rounded-2xl shadow-lg border border-rose-100 flex flex-col">
              <div className="p-6 border-b border-rose-50">
                <div className="flex items-center mb-2">
                  <MessageCircle className="w-5 h-5 text-rose-400 mr-2" />
                  <h2 className="text-xl font-playfair font-semibold text-gray-800">
                    Let's Create Together
                  </h2>
                </div>
                <p className="text-sm text-gray-500">
                  Share your story, and I'll help bring it to life
                </p>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        msg.type === 'user'
                          ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white'
                          : 'bg-gray-50 text-gray-800 border border-gray-100'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <div className="p-6 border-t border-rose-50">
                <div className="flex space-x-3">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Share what's in your heart..."
                    className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent"
                    rows={2}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="bg-gradient-to-r from-rose-400 to-pink-500 text-white p-3 rounded-xl hover:from-rose-500 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Center Panel - Selected Item Preview */}
            <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-8 flex flex-col items-center justify-center">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-playfair font-semibold text-gray-800 mb-2">
                  {/* name of item */}
                  {item.name}
                </h2>
                <p className="text-gray-500 mb-4">
                  {/* selling feature of item */}
                  {item.features}
                </p>
                <div className="inline-flex items-center px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  Customizing in progress...
                </div>
              </div>
              
              <div className="relative">
                {/* image of item */}
                <img
                  src= { item.images }
                  alt= {item.name}
                  className="w-64 h-64 object-cover rounded-2xl shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl"></div>
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                  </div>
                </div>
              </div>
              
              <p className="text-center text-gray-500 mt-6 leading-relaxed">
                Your personalized design will transform this gift into something truly special
              </p>
            </div>

            {/* Right Panel - Live Product Mockup */}
            <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-8 flex flex-col">
              <div className="flex items-center mb-6">
                <Eye className="w-5 h-5 text-rose-400 mr-2" />
                <h2 className="text-xl font-playfair font-semibold text-gray-800">
                  Live Preview
                </h2>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-full h-80 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 text-rose-400" />
                  </div>
                  <h3 className="text-lg font-playfair font-medium text-gray-600 mb-2">
                    Preview will appear here soon...
                  </h3>
                  <p className="text-sm text-gray-500 text-center max-w-xs leading-relaxed">
                    Once we've chatted a bit, we'll show your unique creation taking shape
                  </p>
                </div>
                
                <div className="mt-6 p-4 bg-rose-50 rounded-xl border border-rose-100 w-full">
                  <p className="text-sm text-rose-700 text-center">
                    <strong>Magic in progress:</strong> Your words are being transformed into a beautiful, personalized design
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


export default Build;