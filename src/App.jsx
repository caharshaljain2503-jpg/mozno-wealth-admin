// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from './layout/ProtectedRoutes'
import Layout from "./layout/Layout";

// Pages
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Application from "./pages/career/Application";
import JobList from "./pages/career/JobList";
import JobEditor from "./pages/career/JobEditor";
import SEO from "./pages/SEO";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import ContactSettings from "./pages/ContactSettings";
import BlogList from "./pages/BlogList";
import BlogEditor from "./pages/BlogEditor";
import BlogDetail from "./pages/BlogDetail";
import Leads from "./pages/Leads";
import Notification from "./pages/Notification";
import Testimonials from "./pages/Testimonials";
import Faqs from "./pages/Faqs";
import AboutContent from "./pages/AboutContent";
import SocialMedia from "./pages/SocialMedia";
import PartnerLogos from "./pages/PartnerLogos";
import Login from "./pages/auth/Login";

// 404 Component
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-neutral-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-neutral-900">404</h1>
      <p className="text-neutral-500 mt-4 text-lg">Page not found</p>
      <a 
        href="/" 
        className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
      >
        Go Home
      </a>
    </div>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Blogs */}
              <Route path="blogs" element={<BlogList />} />
              <Route path="blogs/new" element={<BlogEditor />} />
              <Route path="blogs/edit/:id" element={<BlogEditor />} />
              <Route path="blogs/:id" element={<BlogDetail />} />
              
              {/* Jobs */}
              <Route path="jobs" element={<JobList />} />
              <Route path="jobs/new" element={<JobEditor />} />
              <Route path="jobs/edit/:id" element={<JobEditor />} />
              
              {/* Other Pages */}
              <Route path="analytics" element={<Analytics />} />
              <Route path="seo" element={<SEO />} />
              <Route path="users" element={<Users />} />
              <Route path="settings" element={<Settings />} />
              <Route path="contact-settings" element={<ContactSettings />} />
              <Route path="leads" element={<Leads />} />
              <Route path="notifications" element={<Notification />} />
              <Route path="testimonials" element={<Testimonials />} />
              <Route path="faqs" element={<Faqs />} />
              <Route path="about-content" element={<AboutContent />} />
              <Route path="social-media" element={<SocialMedia />} />
              <Route path="partner-logos" element={<PartnerLogos />} />
              <Route path="application" element={<Application />} />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;