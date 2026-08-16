"use client";

import { useEffect, useState } from "react";
import { IRAN_PROVINCES } from "@/lib/iran";

const selectCls =
  "w-full h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white focus:border-indigo-400 focus:outline-none";

export default function ProvinceCityFields({
  province = "",
  city = "",
  provinceName = "province",
  cityName = "city",
  onChange,
}: {
  province?: string;
  city?: string;
  provinceName?: string;
  cityName?: string;
  onChange?: (province: string, city: string) => void;
}) {
  const [prov, setProv] = useState(province);
  const [c, setC] = useState(city);

  useEffect(() => {
    setProv(province);
    setC(city);
  }, [province, city]);

  const entry = IRAN_PROVINCES.find((p) => p.name === prov);
  const cities = entry ? entry.cities : [];
  const cityOptions = c && !cities.includes(c) ? [c, ...cities] : cities;

  return (
    <>
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">استان *</label>
        <select
          name={provinceName}
          value={prov}
          required
          className={selectCls}
          onChange={(e) => {
            setProv(e.target.value);
            setC("");
            onChange?.(e.target.value, "");
          }}
        >
          <option value="">انتخاب استان...</option>
          {IRAN_PROVINCES.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">شهر *</label>
        <select
          name={cityName}
          value={c}
          required
          disabled={!prov}
          className={`${selectCls} disabled:bg-slate-50 disabled:text-slate-400`}
          onChange={(e) => {
            setC(e.target.value);
            onChange?.(prov, e.target.value);
          }}
        >
          <option value="">انتخاب شهر...</option>
          {cityOptions.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}