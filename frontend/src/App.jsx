import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './context/CartContext'
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductPage from './pages/ProductPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import ContactPage from './pages/ContactPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminOrderDetail from './pages/admin/AdminOrderDetail'
import AdminMessages from './pages/admin/AdminMessages'
import AdminCategories from './pages/admin/AdminCategories'

function AdminGuard({ children }) {
  const { admin, loading } = useAdminAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-walnut">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )
  if (!admin) return <Navigate to="/admin/login" replace />
  return children
}

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/447349790597?text=Hi%2C%20I%27m%20interested%20in%20your%20furniture"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform duration-200 hover:scale-110"
      style={{ backgroundColor: '#25D366' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="30" height="30" fill="white">
        <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.668 4.61 1.832 6.51L4 29l7.698-1.81A11.94 11.94 0 0016 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm5.894 16.63c-.247.694-1.453 1.326-2.007 1.374-.513.045-1.002.228-3.38-.704-2.84-1.1-4.666-3.993-4.808-4.178-.14-.186-1.14-1.52-1.14-2.9 0-1.378.72-2.057 1-2.35.246-.258.537-.324.717-.324.18 0 .358.002.515.01.165.007.388-.063.607.464.228.547.773 1.89.84 2.027.068.137.113.297.022.478-.09.18-.135.292-.268.45-.132.157-.278.35-.397.47-.133.133-.271.277-.117.543.155.267.688 1.136 1.477 1.84 1.015.908 1.87 1.19 2.137 1.324.267.133.422.11.578-.067.155-.178.664-.775.84-1.042.178-.267.356-.222.6-.133.245.089 1.556.734 1.822.868.268.133.446.2.512.31.067.112.067.647-.18 1.34z"/>
      </svg>
    </a>
  )
}

function CustomerLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}

export default function App() {
  return (
    <AdminAuthProvider>
      <CartProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: { fontFamily: 'Jost, sans-serif', fontSize: '14px', background: '#1C1814', color: '#fff', borderRadius: '2px' },
            success: { iconTheme: { primary: '#C4954A', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Customer routes */}
          <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />
          <Route path="/shop" element={<CustomerLayout><ShopPage title="The Full Collection" /></CustomerLayout>} />
          <Route path="/sofas" element={<CustomerLayout><ShopPage category="sofa" title="Handcrafted Sofas" subtitle="Premium sofas crafted for British living." /></CustomerLayout>} />
          <Route path="/beds" element={<CustomerLayout><ShopPage category="bed" title="Handcrafted Beds" subtitle="Luxury beds built for deep, restful sleep." /></CustomerLayout>} />
          <Route path="/product/:id" element={<CustomerLayout><ProductPage /></CustomerLayout>} />
          <Route path="/checkout" element={<CustomerLayout><CheckoutPage /></CustomerLayout>} />
          <Route path="/order-success/:orderNumber" element={<CustomerLayout><OrderSuccessPage /></CustomerLayout>} />
          <Route path="/contact" element={<CustomerLayout><ContactPage /></CustomerLayout>} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="categories" element={<AdminCategories />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <CustomerLayout>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="font-display text-6xl font-normal text-bone mb-4">404</h1>
                  <p className="text-walnut font-semibold mb-2">Page not found</p>
                  <a href="/" className="btn-primary mt-4 inline-flex">Go Home</a>
                </div>
              </div>
            </CustomerLayout>
          } />
        </Routes>
      </CartProvider>
    </AdminAuthProvider>
  )
}
