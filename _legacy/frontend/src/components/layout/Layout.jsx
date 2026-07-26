import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatbotWidget from '../ai/ChatbotWidget';
import OfflineBanner from '../ui/OfflineBanner';

/**
 * Root layout component.
 * Includes Navbar, main content area, Footer, and the Layla chatbot widget.
 */
export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <OfflineBanner />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}
