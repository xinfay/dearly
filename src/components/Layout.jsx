import React from 'react';
import { Header } from './Header';

const Layout = ({ children }) => {
  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="pt-16">{children}</main>
    </div>
  );
};

export default Layout;