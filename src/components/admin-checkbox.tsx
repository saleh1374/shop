"use client";

import { useState } from "react";

type Props = {
  ids: string[];
  onChange: (selected: string[]) => void;
};

export default function SelectAllCheckbox({ ids, onChange }: Props) {
  const [allChecked, setAllChecked] = useState(false);

  const toggleAll = () => {
    if (allChecked) {
      onChange([]);
      setAllChecked(false);
    } else {
      onChange(ids);
      setAllChecked(true);
    }
  };

  return (
    <input
      type="checkbox"
      checked={allChecked}
      onChange={toggleAll}
      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
    />
  );
}

export function RowCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
    />
  );
}
