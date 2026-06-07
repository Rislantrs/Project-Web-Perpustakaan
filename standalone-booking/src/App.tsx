import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import BookingLayout from './layouts/BookingLayout';

const BookingPage = lazy(() => import('./modules/booking/pages/BookingPage'));
const RescheduleConfirm = lazy(() => import('./modules/booking/pages/RescheduleConfirm'));
const AdminBookings = lazy(() => import('./modules/booking/pages/admin/AdminBookings'));
const AdminLogin = lazy(() => import('./pages/admin/LoginAdmin'));

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Suspense fallback={
        <div className="py-20 flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-[#0c2f3d]/20 border-t-[#d6a54a] rounded-full animate-spin" />
        </div>
      }>
        <Routes>
          {/* Main User Routes */}
          <Route path="/" element={<BookingLayout><BookingPage /></BookingLayout>} />
          <Route path="/booking-enkapsulasi" element={<Navigate to="/" replace />} />
          <Route path="/booking-enkapsulasi/konfirmasi-reschedule" element={<BookingLayout><RescheduleConfirm /></BookingLayout>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/bookings" element={<BookingLayout><AdminBookings /></BookingLayout>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
