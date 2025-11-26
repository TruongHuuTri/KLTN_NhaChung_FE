"use client";

import { usePathname } from 'next/navigation';
import Header from '../components/common/Header';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { ToastProvider } from '../contexts/ToastContext';
import { ChatProvider } from '../contexts/ChatContext';
import FloatingChatButton from '../components/chat/FloatingChatButton';
import DashboardLayout from '../components/dashboard/DashboardLayout';

import Footer from '../components/common/Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isRegisterPage = pathname === '/register';
  const isFindSharePage = pathname === '/find_share';
  const headerFeatureRoutes = [
    '/',
    '/find_share',
    '/post',
    '/blog',
    '/support',
  ];
  const isHeaderFeaturePage =
    headerFeatureRoutes.includes(pathname) ||
    pathname.startsWith('/post') ||
    pathname.startsWith('/room_details');
  
  // Các trang cần sidebar (trừ find_share)
  const needsSidebar = !isLoginPage && !isRegisterPage && !isFindSharePage && (
    pathname === '/dashboard' ||
    pathname === '/profile' ||
    pathname.startsWith('/profile/') ||
    pathname === '/my-posts' ||
    pathname === '/my-rentals' ||
    pathname === '/my-rooms' ||
    pathname === '/favorites' ||
    pathname.startsWith('/landlord') ||
    pathname.startsWith('/contracts')
  );

  return (
    <div suppressHydrationWarning={true}>
      <ToastProvider>
        <FavoritesProvider>
          <ChatProvider>
            <div className="min-h-screen flex flex-col overflow-x-hidden">
              {!isLoginPage && <Header />}
              <main className={`flex-1 overflow-x-hidden ${isLoginPage ? '' : needsSidebar ? '' : 'pt-16 md:pt-20'}`}>
                {needsSidebar ? (
                  <DashboardLayout>
                    {children}
                  </DashboardLayout>
                ) : (
                  children
                )}
              </main>
              {!isLoginPage && isHeaderFeaturePage && <Footer />}
              <FloatingChatButton />
            </div>
          </ChatProvider>
        </FavoritesProvider>
      </ToastProvider>
    </div>
  );
}
