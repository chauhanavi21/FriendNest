import { useState } from "react";
import Sidebar, { MobileSidebar } from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, showSidebar = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen relative">
      <input id="mobile-drawer" type="checkbox" className="drawer-toggle hidden" checked={isMobileMenuOpen} readOnly />
      
      <div className="min-h-screen">
        <div className="flex">
          {showSidebar && (
            <>
              <Sidebar />
              <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            </>
          )}

          <div className="flex-1 flex flex-col bg-base-100">
            <Navbar onMenuClick={showSidebar ? () => setIsMobileMenuOpen(!isMobileMenuOpen) : undefined} />

            <main className="flex-1 overflow-y-auto bg-base-100">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Layout;
