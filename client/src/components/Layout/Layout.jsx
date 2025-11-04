import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className='app-layout'>
      <Header />
      <div className='main-content'>
        <Navigation />
        <main className='content'>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
