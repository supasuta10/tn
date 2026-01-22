import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'

import Home from './pages/web/Home'
import Menu from './pages/web/Menu'
import Booking from './pages/web/Booking'
import Calendar from './pages/web/Calendar'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import WebLayout from './components/layouts/WebLayout'
import Contact from './pages/web/Contact'
import CustomerReviews from './pages/web/CustomerReviews'

import AdminLayout from './components/layouts/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import UserManagement from './pages/admin/Users'
import MenuManagement from './pages/admin/MenuManagement'
import Categories from './pages/admin/Categories'
import Bookings from './pages/admin/Bookings'
import UserPermissionManagement from './pages/admin/UserPermissionManagement';
import MenuPackages from './pages/admin/MenuPackages'
import MyProfile from './pages/admin/MyProfile'

import CustomerLayout from './components/layouts/CustomerLayout'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import CustomerProfile from './pages/customer/CustomerProfile'
import CustomerBookings from './pages/customer/CustomerBookings'
import CustomerBooking from './pages/customer/CustomerBooking'
import BookingConfirmation from './pages/customer/BookingConfirmation'
import BookingDetails from './pages/customer/BookingDetails'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<WebLayout />}>
          <Route path='/' element={<Home />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/menu' element={<Menu />} />
          <Route path='/calendar' element={<Calendar />} />
          <Route path='/booking' element={<Booking />} />
          <Route path='/customer-reviews' element={<CustomerReviews />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/menu" element={<MenuManagement />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/admin/bookings" element={<Bookings />} />
          <Route path="/admin/customers" element={<UserManagement />} />
          <Route path="/admin/chefs" element={<UserPermissionManagement />} />
          <Route path="/admin/menu-packages" element={<MenuPackages />} />
          <Route path="/admin/profile" element={<MyProfile />} />
        </Route>

        <Route element={<CustomerLayout />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />
          <Route path="/customer/bookings" element={<CustomerBookings />} />
          <Route path="/customer/booking" element={<CustomerBooking />} />
          <Route path="/customer/booking-confirmation/:id" element={<BookingConfirmation />} />
          <Route path="/customer/booking/:id" element={<BookingDetails />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App