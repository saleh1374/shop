"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { ChevronIcon } from "@/components/icons";

export default function ProductGallery({
  images,
  name,
}: {
  images: { url: string }[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imgRef = useRef<HTMLDivElement>(null);
  const imgs = images.length > 0 ? images : [{ url: "" }];

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }

  function next() {
    setActive((prev) => (prev + 1) % imgs.length);
  }
  function prev() {
    setActive((prev) => (prev - 1 + imgs.length) % imgs.length);
  }

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-3">
      {/* Thumbnail strip */}
      {imgs.length > 1 && (
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[500px] shrink-0 pb-1 lg:pb-0">
          {imgs.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative w-16 h-16 lg:w-[72px] lg:h-[72px] rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                i === active
                  ? "border-indigo-600 ring-2 ring-indigo-200"
                  : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
              }`}
            >
              {img.url ? (
                <Image src={img.url} alt={`${name} ${i + 1}`} fill sizes="72px" className="object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-slate-300 text-xs">-</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative flex-1">
        <div
          ref={imgRef}
          className="relative aspect-square rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden cursor-zoom-in"
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          {imgs[active].url ? (
            <Image
              src={imgs[active].url}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={`object-cover transition-transform duration-200 ${
                zoomed ? "scale-150" : "scale-100"
              }`}
              style={
                zoomed
                  ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                  : undefined
              }
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm">
              بدون تصویر
            </div>
          )}

          {/* Navigation arrows */}
          {imgs.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition z-10"
              >
                <ChevronIcon className="w-5 h-5 rotate-180" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition z-10"
              >
                <ChevronIcon className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Counter */}
          {imgs.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
              {active + 1} / {imgs.length}
            </div>
          )}

          {/* Zoom hint */}
          {!zoomed && imgs[active].url && (
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
              </svg>
            </div>
          )}
        </div>

        {/* Dots for mobile */}
        {imgs.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3 lg:hidden">
            {imgs.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-2 h-2 rounded-full transition ${
                  i === active ? "bg-indigo-600 w-5" : "bg-slate-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
