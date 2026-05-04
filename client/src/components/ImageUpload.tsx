import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UploadedImage {
  file: File;
  preview: string;
  id: string;
}

interface ImageUploadProps {
  onImagesSelected: (images: UploadedImage[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export default function ImageUpload({
  onImagesSelected,
  maxImages = 10,
  maxSizeMB = 10,
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const newImages: UploadedImage[] = [];

    Array.from(files).forEach((file) => {
      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} não é uma imagem válida`);
        return;
      }

      // Validar tamanho
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        toast.error(`${file.name} excede o tamanho máximo de ${maxSizeMB}MB`);
        return;
      }

      // Validar limite de imagens
      if (images.length + newImages.length >= maxImages) {
        toast.error(`Máximo de ${maxImages} imagens permitidas`);
        return;
      }

      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const uploadedImage: UploadedImage = {
          file,
          preview: e.target?.result as string,
          id: Math.random().toString(36).substr(2, 9),
        };
        setImages((prev) => [...prev, uploadedImage]);
        onImagesSelected([...images, uploadedImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (id: string) => {
    const updatedImages = images.filter((img) => img.id !== id);
    setImages(updatedImages);
    onImagesSelected(updatedImages);
  };

  const moveImage = (id: string, direction: "up" | "down") => {
    const index = images.findIndex((img) => img.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === images.length - 1)
    ) {
      return;
    }

    const newImages = [...images];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setImages(newImages);
    onImagesSelected(newImages);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-accent bg-accent/10"
            : "border-border bg-secondary/30 hover:border-accent/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <Upload className="text-accent" size={32} />
          <div>
            <p className="font-semibold text-foreground">
              Arraste imagens aqui ou clique para selecionar
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Máximo {maxImages} imagens, até {maxSizeMB}MB cada
            </p>
          </div>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-accent hover:bg-accent/90 text-accent-foreground mt-2"
          >
            Selecionar Imagens
          </Button>
        </div>
      </div>

      {/* Preview de imagens */}
      {images.length > 0 && (
        <div className="space-y-3">
          <p className="font-semibold text-foreground">
            Imagens selecionadas ({images.length}/{maxImages})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative group rounded-lg overflow-hidden bg-secondary/30"
              >
                <img
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover"
                />

                {/* Overlay com ações */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => removeImage(image.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                    title="Remover"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Número da imagem */}
                <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 rounded text-xs font-semibold">
                  {index + 1}
                </div>

                {/* Controles de ordem */}
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <button
                    onClick={() => moveImage(image.id, "up")}
                    disabled={index === 0}
                    className="p-1 bg-background/80 hover:bg-background rounded text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Mover para cima"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveImage(image.id, "down")}
                    disabled={index === images.length - 1}
                    className="p-1 bg-background/80 hover:bg-background rounded text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Mover para baixo"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
