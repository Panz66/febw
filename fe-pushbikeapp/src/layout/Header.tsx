import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import logo from "@/assets/img/logo.png";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const location = useLocation();

  // cek apakah sedang di halaman login admin
  const isLoginPage = location.pathname === "/admindashboard";

  return (
    <header className="w-full bg-[#222831] shadow-md border-b border-[#393E46] sticky top-0 z-50 font-poppins">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-2">
          <img src={logo} alt="PushBike Logo" className="h-16 w-auto" />
          <span className="font-bold text-[#EEEEEE] text-xl tracking-wide">
            PushBike Race
          </span>
        </Link>

        {/* Navbar Desktop */}
        {!isLoginPage && (
          <nav className="hidden md:flex">
            <ul className="flex space-x-6 text-[#EEEEEE] font-medium items-center">
              <li>
                <Link
                  to="/registrasi"
                  className="hover:text-[#00ADB5] transition"
                >
                  Registrasi
                </Link>
              </li>
              <li>
                <Link
                  to="/listhasil"
                  className="hover:text-[#00ADB5] transition"
                >
                  Hasil Live
                </Link>
              </li>
              <li>
                <Link
                  to="/kontak"
                  className="hover:text-[#00ADB5] transition"
                >
                  Kontak
                </Link>
              </li>
              <li>
                <Link
                  to="/loginadmin"
                  className="px-4 py-2 bg-[#00ADB5] text-[#EEEEEE] rounded-lg hover:bg-[#393E46] transition"
                >
                  Login Admin
                </Link>
              </li>
            </ul>
          </nav>
        )}

        {/* Mobile Toggle */}
        {!isLoginPage && (
          <button
            onClick={toggleMenu}
            className="md:hidden text-2xl text-[#EEEEEE] focus:outline-none"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        )}
      </div>

      {/* Navbar Mobile */}
      {menuOpen && !isLoginPage && (
        <nav className="md:hidden bg-[#222831] border-t border-[#393E46] shadow-md">
          <ul className="flex flex-col space-y-4 p-6 text-[#EEEEEE] font-medium">
            <li>
              <Link
                to="/registrasi"
                onClick={toggleMenu}
                className="hover:text-[#00ADB5] transition"
              >
                Registrasi
              </Link>
            </li>
            <li>
              <Link
                to="/listhasil"
                onClick={toggleMenu}
                className="hover:text-[#00ADB5] transition"
              >
                Hasil Live
              </Link>
            </li>
            <li>
              <Link
                to="/kontak"
                onClick={toggleMenu}
                className="hover:text-[#00ADB5] transition"
              >
                Kontak
              </Link>
            </li>
            <li>
              <Link
                to="/loginadmin"
                onClick={toggleMenu}
                className="block px-4 py-2 bg-[#00ADB5] text-[#EEEEEE] rounded-lg text-center hover:bg-[#393E46] transition"
              >
                Login Admin
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
