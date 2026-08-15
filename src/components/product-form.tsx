"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProduct } from "@/app/admin/actions";
import { UploadIcon, XIcon } from "@/components/icons";
import Image from "next/image";

export default function ProductForm({
  product,
  categories,
}: {
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    salePrice: number | null;
    stock: number;
    categoryId: string | null;
    featured: boolean;
    active: boolean;
    images: { url: string }[];
  };
  categories: { id: string; name: string; parentId: string | null }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>(product?.images.map((i) => i.url) ?? []);
  const [uploading, setUploading] = useState(false);

  const cats = categories.filter((c) => !c.parentId);
  const children = categories.filter((c) => c.parentId);

  function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const tasks = Array.from(files).map(async (file) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setImages((prev) => [...prev, data.url]);
      else setError(data.error ?? "خطا در آپلود");
    });
    Promise.all(tasks).finally(() => setUploading(false));
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "");
    const price = Number(form.get("price") ?? 0);
    const stock = Number(form.get("stock") ?? 0);

    if (!name.trim()) return setError("نام محصول را وارد کنید");
    if (!price || price <= 0) return setError("قیمت معتبر وارد کنید");

    startTransition(async () => {
      const res = await saveProduct({
        id: product?.id,
        name,
        slug: product?.slug,
        description: String(form.get("description") ?? ""),
        price,
        salePrice: String(form.get("salePrice") ?? ""),
        stock,
        categoryId: String(form.get("categoryId") ?? ""),
        featured: form.get("featured") === "on",
        active: form.get("active") !== "off",
        images,
      });
      if (res.error) setError(res.error);
      else router.push("/admin/products");
    });
  }

  const inputCls = "w-full h-11 rounded-xl border border-slate-200 px-3 text-sm";
  const labelCls = "block text-xs font-bold text-slate-600 mb-1.5";

  return (
    <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-black text-slate-800">اطلاعات پایه</h2>
          <div>
            <label className={labelCls}>نام محصول *</label>
            <input name="name" defaultValue={product?.name} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>توضیحات</label>
            <textarea
              name="description"
              rows={5}
              defaultValue={product?.description ?? ""}
              className={`${inputCls} h-auto py-2.5 resize-none`}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-black text-slate-800">قیمت و موجودی</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>قیمت (تومان) *</label>
              <input name="price" type="number" min="0" required defaultValue={product?.price} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>قیمت با تخفیف</label>
              <input name="salePrice" type="number" min="0" defaultValue={product?.salePrice ?? ""} className={inputCls} placeholder="اختیاری" />
            </div>
            <div>
              <label className={labelCls}>موجودی *</label>
              <input name="stock" type="number" min="0" required defaultValue={product?.stock ?? 0} className={inputCls} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-black text-slate-800 mb-3">دسته‌بندی</h2>
          <div>
            <label className={labelCls}>دسته</label>
            <select name="categoryId" defaultValue={product?.categoryId ?? ""} className={inputCls}>
              <option value="">بدون دسته</option>
              {cats.map((c) => (
                <optgroup key={c.id} label={c.name}>
                  <option value={c.id}>{c.name}</option>
                  {children.filter((ch) => ch.parentId === c.id).map((ch) => (
                    <option key={ch.id} value={ch.id}>{ch.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-black text-slate-800">وضعیت</h2>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
              <input type="checkbox" name="featured" defaultChecked={product?.featured} className="w-4 h-4 accent-indigo-600" />
              محصول ویژه
            </label>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
              <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="w-4 h-4 accent-indigo-600" />
              فعال (نمایش در سایت)
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-black text-slate-800 mb-3">گالری تصاویر</h2>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {images.map((url, i) => (
              <div key={url + i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                <Image src={url} alt={`تصویر ${i + 1}`} fill sizes="120px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1 left-1 w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <label
            className={`w-full h-24 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition text-slate-500 ${
              uploading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <UploadIcon className="w-6 h-6" />
            <span className="text-xs font-bold">{uploading ? "در حال آپلود..." : "انتخاب تصویر (چندتایی)"}</span>
            <span className="text-[10px] text-slate-400">jpg, png, webp — حداکثر ۵MB</span>
            <input type="file" accept="image/*" multiple onChange={upload} className="hidden" />
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm font-bold">{error}</div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full h-12 rounded-xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {pending ? "در حال ذخیره..." : product ? "ذخیره تغییرات" : "ایجاد محصول"}
        </button>
      </div>
    </form>
  );
}
