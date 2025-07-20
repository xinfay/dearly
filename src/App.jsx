import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import View from './pages/View';
import Build from './pages/Build';
import Input from './pages/Input'; // Temporary input page
import Checkout from './pages/Checkout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/view" element={<View />} />
        <Route path="/build" element={<Build />} />
        {/* TEMPORARY INPUT PAGE */}
        <Route path="/input" element={<Input />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* Any other page that doesn't exist */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;