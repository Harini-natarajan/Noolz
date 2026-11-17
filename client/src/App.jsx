import { Route, Routes } from 'react-router-dom';
import SiteLayout from './layouts/SiteLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Contact from './pages/Contact';
import About from './pages/About';
import NotFound from './pages/NotFound';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import ProductForm from './pages/admin/ProductForm';
import StockManagement from './pages/admin/StockManagement';
import StockHistory from './pages/admin/StockHistory';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogin from './pages/admin/AdminLogin';
import AdminHeroBanners from './pages/admin/AdminHeroBanners';
import HeroBannerForm from './pages/admin/HeroBannerForm';

export default function App() {
  return (
    <Routes>
      {/* Public Storefront Routes */}
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="shop/:categoryPath" element={<Shop />} />
        <Route path="shop/:categoryPath/:subCategoryPath" element={<Shop />} />
        <Route path="product/:id" element={<ProductDetails />} />
        <Route path="contact" element={<Contact />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin Authentication Portal */}
      <Route path="admin/login" element={<AdminLogin />} />

      {/* Protected Admin Dashboard Routes */}
      <Route
        path="admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="banners" element={<AdminHeroBanners />} />
        <Route path="banners/new" element={<HeroBannerForm />} />
        <Route path="banners/:id/edit" element={<HeroBannerForm />} />
        <Route path="stock" element={<StockManagement />} />
        <Route path="history" element={<StockHistory />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}
