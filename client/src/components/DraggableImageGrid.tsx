import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical } from "lucide-react";

interface ExistingImage {
  id: number;
  imageUrl: string;
}

interface DraggableImageGridProps {
  images: ExistingImage[];
  onReorder: (imageIds: number[]) => void;
  onDeleteImage: (imageId: number) => void;
}

function SortableImage({
  image,
  index,
  onDelete,
}: {
  image: ExistingImage;
  index: number;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group rounded-lg overflow-hidden bg-secondary/30"
    >
      <img
        src={image.imageUrl}
        alt={`Imagem ${index + 1}`}
        className="w-full h-32 object-cover"
      />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onDelete(image.id)}
          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
          title="Remover"
        >
          <X size={18} />
        </button>
        <div
          {...attributes}
          {...listeners}
          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors cursor-grab active:cursor-grabbing"
          title="Arrastar para reordenar"
        >
          <GripVertical size={18} />
        </div>
      </div>
      <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 rounded text-xs font-semibold">
        {index + 1}
      </div>
    </div>
  );
}

export default function DraggableImageGrid({
  images,
  onReorder,
  onDeleteImage,
}: DraggableImageGridProps) {
  const [items, setItems] = useState<ExistingImage[]>(images);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Chamar callback com os IDs reordenados
      onReorder(newItems.map((item) => item.id));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((image, index) => (
            <SortableImage
              key={image.id}
              image={image}
              index={index}
              onDelete={onDeleteImage}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
