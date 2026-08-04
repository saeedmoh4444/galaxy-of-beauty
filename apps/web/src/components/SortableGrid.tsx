'use client';

import { useState, useCallback, type ReactNode } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@galaxy/ui';

// ──────────────────────────────────────────────────────────────
// SortableItem — individual draggable card
// ──────────────────────────────────────────────────────────────

interface SortableItemProps {
  id: string | number;
  children: ReactNode;
  className?: string;
}

function SortableItem({ id, children, className }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'touch-none',
        isDragging && 'relative z-50 opacity-80 scale-105 shadow-xl',
        className,
      )}
    >
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SortableGrid — drag-and-drop grid container
// ──────────────────────────────────────────────────────────────

interface SortableGridProps<T> {
  items: T[];
  /** Stable unique key for each item */
  getItemId: (item: T) => string | number;
  /** Called with the new array order after a drop */
  onReorder: (newItems: T[]) => void;
  /** Render function for each item */
  children: (item: T, index: number) => ReactNode;
  /** Grid columns (Tailwind) */
  columns?: string;
  /** Gap between items */
  gap?: string;
  className?: string;
}

export function SortableGrid<T>({
  items,
  getItemId,
  onReorder,
  children,
  columns = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  gap = 'gap-4',
  className = '',
}: SortableGridProps<T>) {
  const [activeId, setActiveId] = useState<string | number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // 8px threshold to avoid accidental drags
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = items.findIndex((item) => getItemId(item) === active.id);
      const newIndex = items.findIndex((item) => getItemId(item) === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(arrayMove(items, oldIndex, newIndex));
      }
    },
    [items, getItemId, onReorder],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(getItemId)}
        strategy={rectSortingStrategy}
      >
        <div className={cn('grid', columns, gap, className)}>
          {items.map((item, index) => (
            <SortableItem key={getItemId(item)} id={getItemId(item)}>
              {children(item, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
