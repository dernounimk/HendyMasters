import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

import Layout from './components/layout/Layout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Artisans from './pages/Artisans';
import ArtisanProfile from './pages/ArtisanProfile';
import Posts from './pages/Posts';
import CreatePost from './pages/CreatePost';
import PostDetails from './pages/PostDetails';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import SavedPosts from './pages/SavedPosts';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Context
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext'; // تأكد من استيراده

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ThemeProvider>
            <LanguageProvider> {/* ✅ يجب أن يكون قبل AuthProvider و SocketProvider */}
              <AuthProvider>
                <SocketProvider>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/artisans" element={<Artisans />} />
                      <Route path="/artisans/:id" element={<ArtisanProfile />} />
                      <Route path="/posts" element={<Posts />} />
                      <Route path="/posts/create" element={<CreatePost />} />
                      <Route path="/posts/:id" element={<PostDetails />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/chat/:id" element={<Chat />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/profile/:id" element={<Profile />} />
                      <Route path="/saved" element={<SavedPosts />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                  <Toaster 
                    position="top-center"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                    }}
                  />
                </SocketProvider>
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;