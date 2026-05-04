import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  title: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export default function ImageCarousel({
  images,
  title,
  autoPlay = true,
  autoPlayInterval = 5000,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isAutoPlaying, images.length, autoPlayInterval]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsAutoPlaying(false);
  };

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    if (autoPlay) {
      setIsAutoPlaying(true);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-secondary/30 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Sem imagens disponíveis</p>
      </div>
    );
  }

  const validImages = images.filter(img => img && img.trim() !== "");
  if (validImages.length === 0) {
    return (
      <div className="w-full h-96 bg-secondary/30 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Nenhuma imagem válida disponível</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-96 bg-black rounded-lg overflow-hidden group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Image */}
      <div className="relative w-full h-full">
        <img
          src={images[currentIndex]}
          alt={`${title} - Imagem ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-500"
        />

        {/* Overlay com informações */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <p className="text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </p>
        </div>
      </div>

      {/* Navigation Buttons - Aparecem ao passar o mouse */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-black rounded-full p-2 transition-all opacity-0 group-hover:opacity-100 duration-300"
            aria-label="Imagem anterior"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-black rounded-full p-2 transition-all opacity-0 group-hover:opacity-100 duration-300"
            aria-label="Próxima imagem"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Ir para imagem ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Keyboard Navigation */}
      <div className="hidden">
        <input
          type="hidden"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") goToPrevious();
            if (e.key === "ArrowRight") goToNext();
          }}
        />
      </div>
    </div>
  );
}
