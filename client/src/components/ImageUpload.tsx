import { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

interface UploadedImage {
  file: File;
  preview: string;
  id: string;
  compressedSize?: number;
}

interface ImageUploadProps {
  onImagesSelected: (images: UploadedImage[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export default function ImageUpload({
  onImagesSelected,
  maxImages = 20,
  maxSizeMB = 10,
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);

  // Sincronizar imagens com o pai via useEffect (não durante render)
  useEffect(() => {
    onImagesSelected(images);
  }, [images, onImagesSelected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const compressImage = async (file: File): Promise<File> => {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        quality: 0.8,
      };
      const compressedFile = await imageCompression(file, options);
      const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const compressedSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2);
      console.log(`[Compressão] ${file.name}: ${originalSizeMB}MB → ${compressedSizeMB}MB`);
      return compressedFile;
    } catch (error) {
      console.error("Erro ao comprimir imagem:", error);
      return file;
    }
  };

  const handleFiles = async (files: FileList) => {
    if (!isMountedRef.current) return;
    
    setIsCompressing(true);
    try {
      let validFiles = Array.from(files).filter((file) => {
        // Validar tipo de arquivo
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} não é uma imagem válida`);
          return false;
        }
        return true;
      });

      // Comprimir imagens
      const compressedFiles: File[] = [];
      for (const file of validFiles) {
        const compressed = await compressImage(file);
        compressedFiles.push(compressed);
      }
      validFiles = compressedFiles;

      // Validar tamanho após compressão
      validFiles = validFiles.filter((file) => {
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > maxSizeMB) {
          toast.error(`${file.name} ainda excede o tamanho máximo de ${maxSizeMB}MB após compressão`);
          return false;
        }
        return true;
      });

      // Validar limite total de imagens
      if (images.length + validFiles.length > maxImages) {
        toast.error(`Máximo de ${maxImages} imagens permitidas`);
        return;
      }

      // Processar todas as imagens de uma vez
      let loadedCount = 0;
      const newImages: UploadedImage[] = [];

      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const uploadedImage: UploadedImage = {
            file,
            preview: e.target?.result as string,
            id: Math.random().toString(36).substr(2, 9),
            compressedSize: file.size,
          };
          newImages.push(uploadedImage);
          loadedCount++;

          // Quando todas as imagens foram carregadas, atualizar estado uma única vez
          if (loadedCount === validFiles.length) {
            if (isMountedRef.current) {
              // Atualizar estado sem chamar callback aqui
              setImages((prev) => [...prev, ...newImages]);
            }
          }
        };
        reader.onerror = () => {
          toast.error(`Erro ao ler arquivo ${file.name}`);
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error("Erro ao processar imagens:", error);
      toast.error("Erro ao processar imagens. Tente novamente.");
    } finally {
      if (isMountedRef.current) {
        setIsCompressing(false);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
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
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Área de upload */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-accent bg-accent/10"
            : "border-border hover:border-accent/50"
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
            disabled={isCompressing}
            className="bg-accent hover:bg-accent/90 text-accent-foreground mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCompressing ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                Comprimindo...
              </>
            ) : (
              "Selecionar Imagens"
            )}
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

                {/* Tamanho do arquivo */}
                <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-xs text-muted-foreground">
                  {(image.compressedSize! / (1024 * 1024)).toFixed(2)}MB
                </div>

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
                <div className="absolute top-2 right-2 bg-accent text-accent-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
