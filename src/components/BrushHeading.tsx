import React from "react";

interface BrushHeadingProps {
  children: React.ReactNode;
  className?: string;
}

function BrushHeading({ children, className = "" }: BrushHeadingProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      {/* Brush stroke background */}
      <div
        className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-indigo-200/60 via-purple-200/60 to-teal-200/60 rounded-lg transform scale-110"
        style={{
          clipPath: "polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)",
        }}
      />

      {/* Text content */}
      <div className="relative px-6 py-2">{children}</div>
    </div>
  );
}
export default BrushHeading;
