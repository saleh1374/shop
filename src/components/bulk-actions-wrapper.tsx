"use client";

import { useState, useEffect, useCallback } from "react";
import BulkActions from "@/components/bulk-actions";

type Props = {
  ids: string[];
};

export default function BulkActionsWrapper({ ids }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = useCallback(
    (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.checked) {
        setSelectedIds(ids);
      } else {
        setSelectedIds([]);
      }
    },
    [ids]
  );

  const handleItemChange = useCallback((id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  }, []);

  useEffect(() => {
    const selectAll = document.querySelector(".bulk-toggle") as HTMLInputElement | null;
    if (selectAll) {
      selectAll.addEventListener("change", handleSelectAll);
      return () => selectAll.removeEventListener("change", handleSelectAll);
    }
  }, [handleSelectAll]);

  useEffect(() => {
    const items = document.querySelectorAll(".bulk-item") as NodeListOf<HTMLInputElement>;
    const handlers: Array<() => void> = [];
    items.forEach((item) => {
      const handler = () => handleItemChange(item.value, item.checked);
      item.addEventListener("change", handler);
      handlers.push(() => item.removeEventListener("change", handler));
    });
    return () => handlers.forEach((fn) => fn());
  }, [ids, handleItemChange]);

  useEffect(() => {
    const selectAll = document.querySelector(".bulk-toggle") as HTMLInputElement | null;
    if (selectAll) {
      selectAll.checked = selectedIds.length === ids.length && ids.length > 0;
    }
  }, [selectedIds, ids]);

  return (
    <BulkActions
      selectedIds={selectedIds}
      onClearSelection={() => {
        setSelectedIds([]);
        document.querySelectorAll(".bulk-item").forEach((el) => {
          (el as HTMLInputElement).checked = false;
        });
        const selectAll = document.querySelector(".bulk-toggle") as HTMLInputElement | null;
        if (selectAll) selectAll.checked = false;
      }}
    />
  );
}
