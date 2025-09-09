import Header from './Header';
import Footer from './Footer';
import type { ReactNode } from 'react';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex font-poppins"> {/* <== tambahin font-poppins disini */}
      <div className="flex flex-col flex-1 min-h-screen bg-[#222831] text-[#EEEEEE]">
        <Header />
        <main className="flex-1 p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
