import React, { useState, useEffect } from 'react';
import {Heart, Sparkles, Gift, Users, Clock, Package, Star, Brain, ChevronLeft, ChevronRight, Mail} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockProduct } from '../data/mockProduct';
import quotes from '../data/testimonials'


function Home() {
  const [currentQuote, setCurrentQuote] = useState(0);

  const navigate = useNavigate()
  const viewRedirect = (itemId) => {
    navigate('/view', { state: { itemId: itemId } });
  };

  // Auto-Scroll Quotes every 5 seconds (modify under interval)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Smooth scrolling behaviours set to buttons under 'gifts' Id
  const scrollToGifts = () => {
    document.getElementById('gifts')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Increment Quote
  const nextQuote = () => {
    setCurrentQuote((prev) => (prev + 1) % quotes.length);
  };

  // Decrement Quote
  const prevQuote = () => {
    setCurrentQuote((prev) => (prev - 1 + quotes.length) % quotes.length);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="min-h-screen w-full flex flex-col items-center justify-center px-4 md:px-6 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e11d48' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <p className="text-sm uppercase tracking-wider text-rose-400 mb-2">Your Feelings. Our Craft.</p>

        <div className="w-full max-w-6xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2">
            <Heart className="w-8 h-8 text-rose-400" />
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-playfair font-bold text-gray-800 tracking-tight">
              Dearly
            </h1>
          </div>

          <h2 className="text-2xl sm:text-3xl text-gray-700 font-medium mt-4 mb-6">
            Say it dearly. Gift it truly.
          </h2>

          <p className="text-lg sm:text-xl text-gray-600 mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
            Create heartfelt, personalized gifts with AI that understands your intentions. <br className="hidden sm:inline" />
            Your feelings, enhanced by intelligence, crafted into something truly special —<br className="hidden sm:inline" />
            words, design, and gift, all in one.
          </p>

          <button 
            onClick={scrollToGifts}
            className="bg-gradient-to-r from-rose-400 to-pink-500 text-white px-10 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
          >
            Make It Special
          </button>
        </div>
        
        {/* Background Sparkles - Hero */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute w-[25%] h-[25%] bg-pink-200 rounded-full opacity-30 blur-3xl top-[5%] left-[10%] animate-pulse" />
          <div className="absolute w-[15%] h-[15%] bg-rose-300 rounded-full opacity-25 blur-2xl top-[35%] right-[10%] animate-pulse" />
          <div className="absolute w-[18%] h-[25%] bg-rose-300 rounded-full opacity-30 blur-2xl top-[20%] right-[70%] animate-pulse" />
          <div className="absolute w-[22%] h-[22%] bg-yellow-200 rounded-full opacity-15 blur-3xl bottom-[5%] left-[25%] animate-pulse" />
          <div className="absolute w-[20%] h-[20%] bg-yellow-200 rounded-full opacity-20 blur-3xl bottom-[15%] right-[15%] animate-pulse" />
          <div className="absolute w-[22%] h-[22%] bg-pink-300 opacity-35 rounded-full blur-3xl top-[5%] left-[45%] animate-pulse" />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-24 px-4 md:px-6 bg-gradient-to-br from-yellow-100 via-rose-50 to-pink-100 bg-opacity-60 backdrop-blur-lg relative overflow-hidden">

        {/* Background Sparkles */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute w-72 h-72 bg-pink-200 rounded-full opacity-30 blur-3xl top-[-3rem] left-[10%]" />
          <div className="absolute w-56 h-56 bg-rose-300 rounded-full opacity-20 blur-2xl top-[30%] right-[10%]" />
          <div className="absolute w-64 h-64 bg-yellow-200 rounded-full opacity-25 blur-3xl bottom-[-4rem] left-[35%]" />
        </div>

        <div className="w-full max-w-6xl mx-auto relative z-10">
          <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-center text-gray-800 mb-20">
            How Dearly Works
          </h2>

          <div className="grid gap-12 md:grid-cols-3">
            {/* Step 1 */}
            <div className="text-center group px-10 py-14 sm:px-12 sm:py-16 bg-white/30 rounded-3xl shadow-lg border border-white/20 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
              <div className="text-center group">
                <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-8 transform group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                  <Sparkles className="w-12 h-12 text-rose-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-playfair font-semibold text-gray-800 mb-4">
                  Share your intentions
                </h3>
                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                  Describe what you want to say, and who it's for. Share the feeling, 
                  the memory, or the message you want to convey.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center group px-10 py-14 sm:px-12 sm:py-16 bg-white/30 rounded-3xl shadow-lg border border-white/20 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
              <div className="text-center group">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-8 transform group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                  <Brain className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-playfair font-semibold text-gray-800 mb-4">
                  Let AI assist your magic
                </h3>
                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                  We help turn your idea into a design-worthy gift. AI enhances your creativity, 
                  never replacing your personal touch.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center group px-10 py-14 sm:px-12 sm:py-16 bg-white/30 rounded-3xl shadow-lg border border-white/20 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
              <div className="text-center group">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-8 transform group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                  <Gift className="w-12 h-12 text-amber-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-playfair font-semibold text-gray-800 mb-4">
                  Customize & send
                </h3>
                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                  Apply your creation to a gift and make it real. Every detail 
                  reflects your intention, ready to touch hearts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Featured Gift Items */}
      <section id="gifts" className="relative w-full py-24 px-4 md:px-6 bg-gradient-to-br from-purple-50 via-white to-rose-50 overflow-hidden">

        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute w-[15%] h-[15%] bg-yellow-100 opacity-30 blur-3xl top-[5%] left-[5%] animate-pulse" />
          <div className="absolute w-[13%] h-[13%] bg-rose-300 opacity-20 blur-2xl top-[30%] right-[8%] animate-pulse" />
          <div className="absolute w-[16%] h-[16%] bg-pink-300 opacity-20 blur-3xl bottom-[2%] left-[40%] animate-pulse" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-center text-gray-800 mb-20">
            Choose a gift to personalize
          </h2>

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {mockProduct.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden group"
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={item.images}
                    alt={item.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Text content */}
                <div className="p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-playfair font-semibold text-gray-800 mb-3">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed text-base sm:text-lg">
                    {item.short_description}
                  </p>
                  <button
                    className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white py-3 px-6 rounded-xl font-medium hover:from-rose-500 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                    onClick={() => viewRedirect(item.id)}
                  >
                    Gift the Feeling
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Customer Quotes */}
      <section className="relative w-full py-24 px-4 md:px-6 bg-gradient-to-b from-[#2e2e38] via-[#3b3641] to-[#44364c] text-white overflow-hidden">

        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute w-[18%] h-[18%] bg-yellow-200 opacity-35 blur-3xl top-[5%] left-[10%] animate-pulse" />
          <div className="absolute w-[15%] h-[15%] bg-rose-400 opacity-20 blur-3xl top-[30%] right-[8%] animate-pulse" />
          <div className="absolute w-[20%] h-[20%] bg-purple-400 opacity-15 blur-3xl bottom-[0%] left-[40%] animate-pulse" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-center text-white mb-20">
            What our clients are saying
          </h2>
            <div className="relative w-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#2e2e38] to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#2e2e38] to-transparent z-10 pointer-events-none" />
              
              <div className="flex animate-marquee gap-16 w-max px-6">
                {[...quotes, ...quotes].map((quote, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white/80 to-rose-100/80 text-gray-800 rounded-3xl p-8 sm:p-10 shadow-xl w-[520px] flex-shrink-0 break-words"
                >
                  <div className="flex justify-center mb-6">
                    <img
                      src={quote.image}
                      alt={quote.avatar}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-md"
                    />
                  </div>
                  <blockquote className="italic text-lg sm:text-xl leading-relaxed text-center mb-6">
                    “{quote.quote}”
                  </blockquote>
                  <p className="text-center font-semibold text-base sm:text-lg text-gray-700">
                    — {quote.author}
                  </p>
                </div>
                ))}
              </div>
            </div>

        </div>
      </section>


      {/* Quick Stats */}
      <section className="relative w-full py-24 px-4 md:px-6 bg-[#e8e3f3] overflow-hidden">

        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute w-[20%] h-[20%] bg-yellow-100 opacity-10 blur-3xl top-[50%] left-[30%] animate-pulse" />
          <div className="absolute w-[18%] h-[18%] bg-rose-300 opacity-10 blur-3xl top-[20%] right-[15%] animate-pulse" />
          <div className="absolute w-[25%] h-[25%] bg-purple-300 opacity-10 blur-3xl bottom-[5%] left-[55%] animate-pulse" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-center text-gray-800 mb-20">
            Why Dearly?
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Stat 1 */}
            <div className="text-center p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition duration-300">
              <Clock className="w-14 h-14 sm:w-16 sm:h-16 text-amber-500 mx-auto mb-4" />
              <p className="text-gray-800 font-medium leading-relaxed text-base sm:text-lg">
                Create a personalized design in under 3 minutes
              </p>
            </div>

            {/* Stat 2 */}
            <div className="text-center p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition duration-300">
              <Package className="w-14 h-14 sm:w-16 sm:h-16 text-rose-500 mx-auto mb-4" />
              <p className="text-gray-800 font-medium leading-relaxed text-base sm:text-lg">
                11,000+ gifts shipped and loved
              </p>
            </div>

            {/* Stat 3 */}
            <div className="text-center p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition duration-300">
              <Star className="w-14 h-14 sm:w-16 sm:h-16 text-purple-500 mx-auto mb-4" />
              <p className="text-gray-800 font-medium leading-relaxed text-base sm:text-lg">
                98% of users say it helped them express what they truly feel
              </p>
            </div>

            {/* Stat 4 */}
            <div className="text-center p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition duration-300">
              <Users className="w-14 h-14 sm:w-16 sm:h-16 text-indigo-500 mx-auto mb-4" />
              <p className="text-gray-800 font-medium leading-relaxed text-base sm:text-lg">
                You + AI = one-of-a-kind creativity
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="w-full bg-gray-800 text-white py-16 px-4 md:px-6">
        <div className="w-full max-w-6xl mx-auto">
          {/* Top Grid */}
          <div className="grid gap-12 md:grid-cols-2 mb-12">
            {/* Branding & Links */}
            <div>
              <div className="flex items-center mb-6">
                <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-rose-400 mr-3" />
                <h3 className="text-2xl sm:text-3xl font-playfair font-bold">Dearly</h3>
              </div>
              <div className="flex flex-wrap gap-4 sm:gap-6 text-gray-300 text-sm sm:text-base">
                <a href="#" className="hover:text-white transition-colors duration-300">About</a>
                <a href="#" className="hover:text-white transition-colors duration-300">Support</a>
                <a href="#" className="hover:text-white transition-colors duration-300">Privacy</a>
                <a href="#" className="hover:text-white transition-colors duration-300">Contact</a>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div>
              <h4 className="text-lg sm:text-xl font-playfair font-semibold mb-4">Stay Connected</h4>
              <div className="flex w-full max-w-md">
                {/* Update to gather the input email and add it to a file */}
                <input 
                  type="email" 
                  placeholder="Enter your email..."
                  className="flex-1 px-4 py-3 rounded-l-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                {/* Gather the email after onClick */}
                <button className="bg-gradient-to-r from-rose-400 to-pink-500 px-4 sm:px-6 py-3 rounded-r-xl hover:from-rose-500 hover:to-pink-600 transition-all duration-300 flex items-center">
                  <Mail className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-3 leading-relaxed max-w-md">
                Get seasonal releases, personalization tips, and learn how to become a more thoughtful gift-giver.
              </p>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400 leading-relaxed italic text-sm sm:text-base">
              Dearly empowers your gift-giving. AI doesn't replace your heart — it just helps you show it better.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;