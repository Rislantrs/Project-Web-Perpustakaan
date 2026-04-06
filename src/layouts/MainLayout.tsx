import { Outlet } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-[#f8f9fa] pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
