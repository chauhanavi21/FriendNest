import { useState } from "react";
import Sidebar, { MobileSidebar } from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, showSidebar = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen relative bg-base-100">
      <input id="mobile-drawer" type="checkbox" className="drawer-toggle hidden" checked={isMobileMenuOpen} readOnly />
      
      <Navbar onMenuClick={showSidebar ? () => setIsMobileMenuOpen(!isMobileMenuOpen) : undefined} />

      <div className="flex h-[calc(100vh-4rem)]">
        {showSidebar && (
          <>
            <Sidebar />
            <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
          </>
        )}

        <main className="flex-1 overflow-y-auto bg-base-100">{children}</main>
      </div>
    </div>
  );
};
export default Layout;
