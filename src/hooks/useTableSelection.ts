import { useState, useCallback, useMemo } from 'react';

export function useTableSelection<T extends { id: number | string }>(
  items: T[],
  extractId: (item: T) => number | string = (item) => item.id
) {
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set());

  const toggleSelection = useCallback((id: number | string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(extractId)));
  }, [items, extractId]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isAllSelected = useMemo(() => {
    return items.length > 0 && selectedIds.size === items.length;
  }, [items.length, selectedIds.size]);

  const isPartiallySelected = useMemo(() => {
    return selectedIds.size > 0 && selectedIds.size < items.length;
  }, [items.length, selectedIds.size]);

  return {
    selectedIds: Array.from(selectedIds),
    selectedIdsSet: selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    isAllSelected,
    isPartiallySelected,
    setSelectedIds,
  };
}
