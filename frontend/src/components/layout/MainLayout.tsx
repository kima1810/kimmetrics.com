import React from 'react';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div id="page-wrapper">
      <Header />
      <main className="wrapper style1">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
}