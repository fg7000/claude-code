"use client";

interface GradientBlobsProps {
  variant?: "dark" | "warm";
  className?: string;
}

export function GradientBlobs({ variant = "dark", className = "" }: GradientBlobsProps) {
  const colors = variant === "warm"
    ? {
        blob1: "rgba(212, 168, 83, 0.15)",
        blob2: "rgba(199, 107, 74, 0.12)",
        blob3: "rgba(107, 63, 160, 0.1)",
      }
    : {
        blob1: "rgba(107, 63, 160, 0.15)",
        blob2: "rgba(212, 168, 83, 0.08)",
        blob3: "rgba(199, 107, 74, 0.1)",
      };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Blob 1 */}
      <div
        className="blob-1 absolute w-[600px] h-[600px] rounded-full blur-[100px]"
        style={{
          background: colors.blob1,
          top: "10%",
          left: "20%",
        }}
      />

      {/* Blob 2 */}
      <div
        className="blob-2 absolute w-[500px] h-[500px] rounded-full blur-[120px]"
        style={{
          background: colors.blob2,
          top: "40%",
          right: "10%",
        }}
      />

      {/* Blob 3 */}
      <div
        className="blob-3 absolute w-[700px] h-[700px] rounded-full blur-[150px]"
        style={{
          background: colors.blob3,
          bottom: "0%",
          left: "30%",
        }}
      />
    </div>
  );
}
