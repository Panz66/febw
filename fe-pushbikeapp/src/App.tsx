import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Registrasi from './pages/Registrasi';
import Kontak from './pages/Kontak'
import LoginAdmin from './pages/Login/LoginAdmin';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ListHasil from './pages/HasilLomba';
import TambahLomba from './pages/Lomba/TambahLomba'; 
import DaftarPeserta from './pages/Peserta/DaftarPeserta';
import DaftarLomba from './pages/Lomba/DaftarLomba';
import KelolaLomba from './pages/Lomba/KelolaLomba';
import Statistik from './pages/Statistik';
import KelolaPeserta from './pages/Peserta/KelolaPeserta';
import OlahDataPeserta from './pages/Peserta/OlahDataPeserta';
import InputHasilLomba from './pages/Form/InputHasilLomba';
import SesiLanjutanLomba from './pages/Lomba/SesiLanjutanLomba';
import Final from './pages/Lomba/Final';
import LiveHasil from './pages/Hasil/LiveHasil';
import LihatPesan from './pages/Peserta/LihatPesan';
import CheckPeserta from './pages/Peserta/CheckPeserta';
import PesertaLombaCek from './pages/Peserta/PesertaLombaCek';
import AcakPeserta from './pages/Peserta/AcakPeserta';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Redirect default ke /dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/registrasi" element={<Registrasi />} />
          <Route path="/kontak" element={<Kontak />} />
          <Route path="/listhasil" element={<ListHasil />} />
          <Route path="/livehasil/:id" element={<LiveHasil />} />
          <Route path="/loginadmin" element={<LoginAdmin />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />

          {/* Nested route di bawah dashboard */}
          <Route path="/admindashboard/tambahLomba" element={<TambahLomba />} />
          <Route path="/admindashboard/daftarpeserta" element={<DaftarPeserta />} />
          <Route path="/admindashboard/daftarlomba" element={<DaftarLomba />} />
          <Route path="/admindashboard/kelolalomba" element={<KelolaLomba />} />
          <Route path="/admindashboard/kelolapeserta/:id" element={<KelolaPeserta />} />
          <Route path="/admindashboard/acakpeserta/:id" element={<AcakPeserta />} />
          <Route path="/admindashboard/olahdatapeserta/:id" element={<OlahDataPeserta />} />
          <Route path="/admindashboard/lihatpesan" element={<LihatPesan />} />
          <Route path="/admindashboard/checkpeserta" element={<CheckPeserta />} />
          <Route path="/pesertalomba/:id" element={<PesertaLombaCek/>} />
          <Route path="/sesilanjutanlomba/:id" element={<SesiLanjutanLomba />} />
          <Route path="/final/:id" element={<Final />} />
          <Route path="/inputhasillomba/:moto/:id" element={<InputHasilLomba />} />
          <Route path="/admindashboard/statistik" element={<Statistik />} />

          {/* Nested route untuk Hasil */}
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
