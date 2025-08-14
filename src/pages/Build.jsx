import { useLocation } from 'react-router-dom';
import { mockProduct } from '../data/mockProduct';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { Heart, Send, ArrowLeft, Save, Sparkles, MessageCircle, Eye, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { uploadGeneratedImage, blobToBase64 } from '../components/checkout/utils/printful';


function Build() {

  // get item info
  const location = useLocation();
  const itemId = location.state?.itemId;
  const item = mockProduct.find((anItem) => anItem.id === itemId);
  const variantId = location.state.variantId;
  if (!variantId) {
    console.warn('variantId missing from router state — return to product selection.');
  }

  if (!item) return <h1>Item not found</h1>

  const inputRedirect = async () => {
    try {
      // Ensure we have a canonical Blob URL to pass to Checkout
      let url = printfileUrl;
      if (!url) {
        if (!generatedImageUrl) {
          alert('Please generate an image first.');
          return;
        }
        url = await uploadFromUrl(generatedImageUrl);
      }

      navigate('/checkout', {
        state: {
          itemId: item.id,
          size: location.state.size,
          color: location.state.color,
          variantId,
          printfileUrl: url
        }
      });
    } catch (e) {
      alert(`Unable to proceed: ${e.message || e}`);
    }
  };


  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Initialize chat with product context (assistant only)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: `Hi there! I'm here to help you turn your story into a special gift. What would you like to express in your design? (Product: ${item?.name || 'your product'})`,
      timestamp: new Date()
    }
  ]);

  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [printfileUrl, setPrintfileUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const navigate = useNavigate()

  // Add message to chat
  const addMessage = (content, sender) => {
    setMessages(prev => [
      ...prev,
      {
        id: prev.length + 1,
        type: sender,
        content,
        timestamp: new Date()
      }
    ]);
  };

  // Add loading message
  const addLoadingMessage = () => {
    setMessages(prev => [
      ...prev,
      {
        id: prev.length + 1,
        type: 'assistant',
        content: '__loading__',
        timestamp: new Date()
      }
    ]);
  };

  // Remove loading message
  const removeLoadingMessage = () => {
    setMessages(prev => prev.filter(msg => msg.content !== '__loading__'));
  };

  async function uploadFromUrl(imageUrl) {
    try {
      setIsUploading(true);
      setUploadError(null);

      // Fetch the generated image bytes
      const resp = await fetch(imageUrl, { mode: 'cors' });
      if (!resp.ok) throw new Error(`Failed to fetch image (${resp.status})`);

      const blob = await resp.blob();

      // Infer extension from content-type; default to png
      let ext = 'png';
      const ct = blob.type || '';
      if (ct.includes('jpeg') || ct.includes('jpg')) ext = 'jpg';
      else if (ct.includes('png')) ext = 'png';

      // Convert to base64 (no data: prefix)
      const base64 = await blobToBase64(blob);

      // Upload to Vercel Blob (returns public CDN URL)
      const { url } = await uploadGeneratedImage({ base64, ext });

      // Save canonical printfile URL and also use it for preview
      setPrintfileUrl(url);
      setGeneratedImageUrl(url);

      return url;
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Upload failed');
      throw err;
    } finally {
      setIsUploading(false);
    }
}

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    addMessage(message, 'user');
    setMessage('');
    setIsLoading(true);
    addLoadingMessage();
    try {
      // Always send product name as context in every message
      const context = `The product is: ${item?.name || 'Unknown Product'}`;
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `${context}\n${message}` })
      });
      let data = null;
      try {
        data = await response.json();
      } catch (err) {
        removeLoadingMessage();
        addMessage(`Error: Failed to parse response.`, 'assistant');
        setIsLoading(false);
        return;
      }
      removeLoadingMessage();
      if (response.ok && data && data.response) {
        // If backend returns an array of messages, handle each
        const responses = Array.isArray(data.response) ? data.response : [data.response];
        responses.forEach((msg) => {
          if (!msg || (typeof msg === 'string' && msg.trim() === '')) return; // Skip blank/null/undefined
          if (typeof msg === 'string' && msg.includes('[Image generated: output.png]')) {
            // (If you proxied the image via Vercel, swap the URL accordingly)
            const imageUrl = `/api/agent/image?ts=${Date.now()}`;

            // Show immediate preview
            setGeneratedImageUrl(imageUrl);
            addMessage(
              <img
                src={imageUrl}
                alt="Generated Image"
                style={{ maxWidth: "100%", borderRadius: "8px" }}
              />,
              'assistant'
            );

            // Kick off upload to Vercel Blob; when done, preview will switch to the CDN URL
            uploadFromUrl(imageUrl).catch(() => {});
          } else {
            addMessage(msg, 'assistant');
          }
        });
      } else {
        addMessage(`Error: ${data?.response || 'Failed to get response'}`, 'assistant');
      }
    } catch (error) {
      removeLoadingMessage();
      addMessage(`Error: ${error.message}`, 'assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const messagesEndRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = document.getElementById('reactMessageInput');
    if (!textarea) return;
    const handleInput = function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    };
    textarea.addEventListener('input', handleInput);
    return () => textarea.removeEventListener('input', handleInput);
  }, []);

  // Scroll to bottom every time messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  

  return (
    <Layout>
      <div className="min-h-[110vh] bg-gradient-to-br from-rose-50 via-white to-purple-50">
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
                onClick={inputRedirect}
                disabled={isUploading}
                className="flex items-center px-4 py-2 bg-rose-100 text-rose-700 rounded-full hover:bg-rose-200 disabled:opacity-50 transition-colors duration-200">
                <Save className="w-4 h-4 mr-2" />
                {isUploading ? 'Preparing…' : 'Proceed to Checkout'}
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
              <div className="p-6 space-y-4" style={{ height: '350px', overflowY: 'auto' }}>
                {messages.map((msg) => (
                  msg.content === '__loading__' ? (
                    <div key={msg.id} className="flex justify-start">
                      <div className="message-content bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center gap-2">
                        <span className="inline-block w-4 h-4 border-2 border-rose-200 border-t-rose-400 rounded-full animate-spin mr-2"></span>
                        <span style={{ color: '#be185d', fontWeight: 500 }}>Assistant is thinking...</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`message-content max-w-[80%] p-4 rounded-2xl ${msg.type === 'user' ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white' : 'bg-gray-50 text-gray-800 border border-gray-100'}`}>
                        {typeof msg.content === 'string' ? msg.content : msg.content}
                      </div>
                    </div>
                  )
                ))}
                <div ref={messagesEndRef} />
              </div>
              {/* Message Input */}
              <div className="p-6 border-t border-rose-50">
                <div className="flex space-x-3">
                  <textarea
                    id="reactMessageInput"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Turn your ideas into designs..."
                    className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent"
                    rows={1}
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isLoading}
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
                  {generatedImageUrl ? (
                    <img
                      src={generatedImageUrl}
                      alt="Live Preview"
                      style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "16px", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}
                    />
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                        <Heart className="w-8 h-8 text-rose-400" />
                      </div>
                      <h3 className="text-lg font-playfair font-medium text-gray-600 mb-2">
                        Preview will appear here soon...
                      </h3>
                      <p className="text-sm text-gray-500 text-center max-w-xs leading-relaxed">
                        Once we've chatted a bit, we'll show your unique creation taking shape.
                      </p>
                    </>
                  )}
                </div>
                
                <div className="mt-6 p-4 bg-rose-50 rounded-xl border border-rose-100 w-full">
                  <p className="text-sm text-rose-700 text-center">
                    <strong>Magic in progress:</strong> Your words are being transformed into a beautiful, personalized design.
                  </p>
                  {isUploading && (
                    <div className="mt-3 text-xs text-gray-500 text-center">Uploading your design securely…</div>
                  )}
                  {uploadError && (
                    <div className="mt-3 text-xs text-red-600 text-center">Upload error: {uploadError}</div>
                  )}
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