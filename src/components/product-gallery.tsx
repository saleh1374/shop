"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({
  images,
  name,
}: {
  images: { url: string }[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const imgs = images.length > 0 ? images : [{ url: "" }];

  return (
    <div>
      <div className="relative aspect-square rounded-2xl border border-slate-200 bg-white overflow-hidden mb-3">
        {imgs[active].url ? (
          <Image
            src={imgs[active].url}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            بدون تصویر
          </div>
        )}
      </div>
      {imgs.length > 1 && (
        <div className="flex gap-2">
          {imgs.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                i === active ? "border-indigo-600" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {img.url ? (
                <Image src={img.url} alt={`${name} ${i + 1}`} fill sizes="80px" className="object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-slate-300 text-xs">-</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
