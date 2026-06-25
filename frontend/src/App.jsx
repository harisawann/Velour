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

function CustomerLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
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
