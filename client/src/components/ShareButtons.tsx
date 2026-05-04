import { Facebook, MessageCircle, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonsProps {
  propertyTitle: string;
  propertyPrice: string;
  propertyUrl: string;
  phoneNumber: string;
}

export default function ShareButtons({
  propertyTitle,
  propertyPrice,
  propertyUrl,
  phoneNumber,
}: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(propertyUrl);
  const encodedTitle = encodeURIComponent(propertyTitle);
  const encodedPrice = encodeURIComponent(propertyPrice);

  // Mensagem para compartilhamento
  const shareMessage = `Confira este imóvel: ${propertyTitle} - ${propertyPrice}`;
  const encodedMessage = encodeURIComponent(shareMessage);

  // URLs de compartilhamento
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}%20${encodedUrl}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const instagramUrl = `https://www.instagram.com/`;

  const handleInstagramShare = () => {
    // Instagram não tem URL de compartilhamento direto, então abrimos o app/web
    window.open(instagramUrl, "_blank");
    // Copiar mensagem para clipboard
    navigator.clipboard.writeText(shareMessage);
  };

  return (
    <div className="flex gap-3">
      {/* WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Compartilhar no WhatsApp"
      >
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white border-0"
        >
          <MessageCircle size={18} />
          <span className="hidden sm:inline">WhatsApp</span>
        </Button>
      </a>

      {/* Facebook */}
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Compartilhar no Facebook"
      >
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-[#1877F2] hover:bg-[#165FD9] text-white border-0"
        >
          <Facebook size={18} />
          <span className="hidden sm:inline">Facebook</span>
        </Button>
      </a>

      {/* Instagram */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleInstagramShare}
        title="Compartilhar no Instagram"
        className="flex items-center gap-2 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#833AB4] hover:opacity-90 text-white border-0"
      >
        <Instagram size={18} />
        <span className="hidden sm:inline">Instagram</span>
      </Button>
    </div>
  );
}
