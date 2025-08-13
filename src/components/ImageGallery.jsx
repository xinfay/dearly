import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";


export const ImageGallery = ({ images = [], productName = "Product" }) => {
  const [index, setIndex] = useState(0);
  const [isZoom, setIsZoom] = useState(false);

  const safeImages = useMemo(
    () =>
      Array.isArray(images) && images.length
        ? images
        : ["https://via.placeholder.com/1200x1200?text=No+Image"],
    [images]
  );

  const clamp = (i) => (i + safeImages.length) % safeImages.length;
  const next = () => setIndex((i) => clamp(i + 1));
  const prev = () => setIndex((i) => clamp(i - 1));

  // Keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key.toLowerCase() === "z") setIsZoom((z) => !z);
      if (e.key === "Escape") setIsZoom(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section className="relative">
      {/* Brand glows positioned OUTSIDE containers so they never clip */}
      <div className="pointer-events-none absolute -inset-10 -z-10">
        <div className="absolute top-0 left-2 w-[42%] h-[42%] rounded-full bg-pink-200/45 blur-3xl" />
        <div className="absolute bottom-4 right-4 w-[32%] h-[32%] rounded-full bg-yellow-200/45 blur-3xl" />
      </div>

      {/* Card wrapper */}
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md shadow-sm">
        <div className="grid grid-cols-6 gap-4 p-4 lg:p-5">
          {/* Thumbnails */}
          <div className="col-span-6 lg:col-span-1 order-2 lg:order-1">
            <div className="flex lg:block gap-3 lg:gap-2 overflow-x-auto pb-1 lg:pb-0">
              {safeImages.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setIndex(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-current={i === index}
                  className={[
                    "relative shrink-0 w-20 h-20 lg:w-full lg:h-[78px]",
                    "rounded-xl overflow-hidden border transition-all duration-200",
                    i === index
                      ? "border-pink-400 ring-2 ring-pink-300"
                      : "border-white/40 hover:border-pink-200"
                  ].join(" ")}
                >
                  <img
                    src={src}
                    alt={`${productName} thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Main image area */}
          <div className="col-span-6 lg:col-span-5 order-1 lg:order-2">
            {/* 
              Use a height that plays well on laptops:
              - min-h so it doesn’t collapse on small screens
              - max-h so tall images never exceed the viewport
              - object-contain to preserve full image
            */}
            <div className="relative w-full rounded-xl border border-white/40 bg-white/65 overflow-hidden">
              <div className="flex items-center justify-center"
                   style={{ minHeight: 360 }}>
                <img
                  src={safeImages[index]}
                  alt={`${productName} view ${index + 1}`}
                  className="w-full h-full object-contain transition-transform duration-300 hover:scale-[1.01]"
                  style={{ maxHeight: "72vh" }}
                  draggable={false}
                />
              </div>

              {/* Prev/Next controls (always inside bounds) */}
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
                <button
                  onClick={prev}
                  className="rounded-full bg-white/90 backdrop-blur-md border border-white/60 p-2 shadow-sm hover:shadow transition"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  className="rounded-full bg-white/90 backdrop-blur-md border border-white/60 p-2 shadow-sm hover:shadow transition"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Zoom button */}
              <button
                onClick={() => setIsZoom(true)}
                className="absolute bottom-3 right-3 rounded-full bg-white/90 backdrop-blur-md border border-white/60 px-3 py-1.5 shadow hover:shadow-md transition flex items-center gap-2 text-sm"
                aria-label="Zoom image"
                type="button"
              >
                <ZoomIn className="w-4 h-4" />
                <span>Zoom</span>
              </button>
            </div>

            {/* Mobile dot indicators */}
            <div className="mt-3 lg:hidden flex justify-center gap-1.5">
              {safeImages.map((_, i) => (
                <span
                  key={i}
                  className={[
                    "h-1.5 w-1.5 rounded-full",
                    i === index ? "bg-pink-400" : "bg-gray-300"
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox / Zoom — with Dearly glows */}
      {isZoom && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[50] bg-black/70 flex items-center justify-center p-4"
          onClick={() => setIsZoom(false)}
        >
          <div
            className="relative max-w-[92vw] w-full rounded-2xl overflow-hidden bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* blobs */}
            <div className="pointer-events-none absolute inset-0 z-0">
              <div
                aria-hidden="true"
                className="absolute top-6 left-8 w-[55%] h-[55%] rounded-full bg-pink-200/55 blur-3xl animate-pulse"
              />
              <div
                aria-hidden="true"
                className="absolute bottom-8 right-10 w-[38%] h-[38%] rounded-full bg-yellow-200/50 blur-3xl animate-pulse"
                style={{ animationDelay: "250ms" }}
              />
              <div
                aria-hidden="true"
                className="absolute top-6 left-8 w-[25%] h-[75%] rounded-full bg-pink-200/55 blur-2xl animate-pulse"
              />
              <div
                aria-hidden="true"
                className="absolute bottom-8 right-10 w-[18%] h-[68%] rounded-full bg-yellow-200/50 blur-3xl animate-pulse"
                style={{ animationDelay: "400ms" }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-pink-50/20"
              />
            </div>

            {/* IMAGE */}
            <div className="relative z-10 flex items-center justify-center" style={{ maxHeight: "90vh" }}>
              <img
                src={safeImages[index]}
                alt={`${productName} zoomed ${index + 1}`}
                className="w-full h-full object-contain"
                style={{ maxHeight: "90vh" }}
                draggable={false}
              />
            </div>

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setIsZoom(false)}
              className="absolute z-20 top-3 right-3 rounded-full bg-white/90 backdrop-blur-md border border-white/60 px-3 py-1.5 shadow hover:shadow-md transition text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
