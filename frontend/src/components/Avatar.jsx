import { useState, useEffect } from "react";
import { UserIcon } from "lucide-react";

const Avatar = ({ src, alt, className = "", size = "md" }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  // Reset loading and error state when src changes
  useEffect(() => {
    if (src) {
      setIsLoading(true);
      setHasError(false);
    } else {
      setIsLoading(false);
      setHasError(true);
    }
  }, [src]);

  // Clean className - remove extra spaces
  const cleanClassName = className.trim();
  
  // Combine classes: base classes, size classes, then custom className (so className can override)
  const baseClasses = `rounded-full bg-base-300 flex-shrink-0 flex items-center justify-center overflow-hidden ${sizeClasses[size]}${cleanClassName ? ` ${cleanClassName}` : ""}`;

  if (hasError || !src) {
    return (
      <div className={baseClasses}>
        <UserIcon className="w-1/2 h-1/2 text-base-content opacity-50" />
      </div>
    );
  }

  return (
    <div className={`${baseClasses} relative`}>
      {isLoading && (
        <div className="absolute inset-0 bg-base-300 animate-pulse flex items-center justify-center rounded-full z-10">
          <UserIcon className="w-1/2 h-1/2 text-base-content opacity-30" />
        </div>
      )}
      <img
        src={src}
        alt={alt || "Avatar"}
        loading="lazy"
        className={`w-full h-full object-cover transition-opacity duration-200 rounded-full ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => {
          // Small delay to keep the skeleton a bit longer for a smoother (slower) reveal
          setTimeout(() => setIsLoading(false), 200);
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
};

export default Avatar;

