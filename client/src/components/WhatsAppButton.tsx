import { MessageCircle } from "lucide-react";
import { useState } from "react";

/**
 * Componente de Botão Flutuante do WhatsApp
 * 
 * Design Philosophy: Minimalismo Contemporâneo Premium
 * - Posicionado fixo no canto inferior direito
 * - Animação de entrada suave (fade + slide)
 * - Hover effect com elevação e mudança de cor
 * - Tooltip com mensagem de ação
 */

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
}

export default function WhatsAppButton({
  phoneNumber = "5511987654321",
  message = "Olá! Gostaria de saber mais sobre seus imóveis.",
}: WhatsAppButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={handleWhatsAppClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group animate-fade-in"
        aria-label="Contato via WhatsApp"
        title="Fale conosco no WhatsApp"
      >
        <MessageCircle size={24} className="group-hover:scale-110 transition-transform duration-300" />
      </button>

      {/* Tooltip */}
      {isHovered && (
        <div className="fixed bottom-24 right-6 z-40 bg-foreground text-background px-4 py-2 rounded-lg shadow-lg whitespace-nowrap text-sm font-medium animate-fade-in">
          Fale conosco!
          <div className="absolute bottom-0 right-4 transform translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground"></div>
        </div>
      )}

      {/* Estilos de animação */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </>
  );
}
