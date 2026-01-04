import { ShipWheelIcon } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-base-200 border-t border-base-300 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShipWheelIcon className="size-5 text-primary" />
            <span className="text-lg font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              FriendNest
            </span>
          </div>

          <div className="text-sm text-base-content opacity-70">
            © {currentYear} FriendNest. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

