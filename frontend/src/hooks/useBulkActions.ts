import { useState, useCallback } from "react";

export function useBulkActions<T extends { id: number }>() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback((items: T[]) => {
    setSelectedIds(items.map((i) => i.id));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback(
    (id: number) => selectedIds.includes(id),
    [selectedIds]
  );

  return {
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    isSelected,
    count: selectedIds.length,
    hasSelection: selectedIds.length > 0,
  };
}
