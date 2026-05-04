import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Mail, MapPin, Bed, Bath, Ruler, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ImageCarousel from "@/components/ImageCarousel";
import PropertyMap from "@/components/PropertyMap";

interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  image: string;
  images: string[];
  beds: number;
  baths: number;
  area: number;
  description?: string;
  latitude: number;
  longitude: number;
}

const baseImage1 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663542972229/Sg4VU74wufmYhMyEUAx8fF/hero-luxury-home-fCQMtSy6nEmPgJoZQTvaNq.webp";
const baseImage2 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663542972229/Sg4VU74wufmYhMyEUAx8fF/modern-living-room-LCRe2bXCNVTkR3pvAAFa8x.webp";
const baseImage3 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663542972229/Sg4VU74wufmYhMyEUAx8fF/garden-outdoor-PHWzXXrx5AK337GyABMVrx.webp";
const baseImage4 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663542972229/Sg4VU74wufmYhMyEUAx8fF/bedroom-luxury-DPY6MkRa9mSzwjt3QfkBsk.webp";
const baseImage5 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663542972229/Sg4VU74wufmYhMyEUAx8fF/kitchen-modern-LciaA5zEGHuDM3eBctWe49.webp";

const properties: Property[] = [
  {
    id: 1,
    title: "Residência Moderna Luxuosa",
    location: "Bady Bassitt - SP",
    price: "R$ 2.500.000",
    image: baseImage1,
    images: [baseImage1, baseImage2, baseImage4, baseImage5, baseImage3],
    beds: 4,
    baths: 3,
    area: 350,
    description: "Residência moderna de luxo com acabamentos premium, localizada em área privilegiada de Bady Bassitt. Possui amplos espaços, piscina e jardim paisagístico.",
    latitude: -20.5105,
    longitude: -48.7789,
  },
  {
    id: 2,
    title: "Apartamento Contemporâneo",
    location: "Centro - Bady Bassitt, SP",
    price: "R$ 1.800.000",
    image: baseImage2,
    images: [baseImage2, baseImage4, baseImage1, baseImage5, baseImage3],
    beds: 3,
    baths: 2,
    area: 280,
    description: "Apartamento contemporâneo no coração do centro, com acabamentos sofisticados e localização estratégica próximo a comércios e serviços.",
    latitude: -20.5120,
    longitude: -48.7805,
  },
  {
    id: 3,
    title: "Casa com Jardim Privativo",
    location: "Zona Residencial - Bady Bassitt, SP",
    price: "R$ 1.200.000",
    image: baseImage3,
    images: [baseImage3, baseImage1, baseImage2, baseImage4, baseImage5],
    beds: 3,
    baths: 2,
    area: 250,
    description: "Casa aconchegante com jardim privativo, ideal para famílias que buscam conforto e tranquilidade em zona residencial consolidada.",
    latitude: -20.5090,
    longitude: -48.7750,
  },
  {
    id: 4,
    title: "Penthouse com Vista Panorâmica",
    location: "Bady Bassitt - SP",
    price: "R$ 3.200.000",
    image: baseImage4,
    images: [baseImage4, baseImage5, baseImage1, baseImage2, baseImage3],
    beds: 4,
    baths: 4,
    area: 420,
    description: "Penthouse exclusivo com vista panorâmica da cidade, acabamentos de luxo e todas as comodidades para um estilo de vida sofisticado.",
    latitude: -20.5135,
    longitude: -48.7820,
  },
  {
    id: 5,
    title: "Residência com Cozinha Gourmet",
    location: "Zona Norte - Bady Bassitt, SP",
    price: "R$ 950.000",
    image: baseImage5,
    images: [baseImage5, baseImage2, baseImage3, baseImage1, baseImage4],
    beds: 3,
    baths: 2,
    area: 220,
    description: "Residência com cozinha gourmet equipada, perfeita para quem aprecia culinária e deseja espaço amplo para refeições e convivência.",
    latitude: -20.5070,
    longitude: -48.7770,
  },
  {
    id: 6,
    title: "Apartamento Aconchegante",
    location: "Zona Leste - Bady Bassitt, SP",
    price: "R$ 680.000",
    image: baseImage1,
    images: [baseImage1, baseImage3, baseImage2, baseImage5, baseImage4],
    beds: 2,
    latitude: -20.5110,
    longitude: -48.7700,
    baths: 1,
    area: 150,
    description: "Apartamento aconchegante e bem localizado, ideal para casais ou pequenas famílias que buscam imóvel com bom custo-benefício.",
  },
];

export default function PropertyDetail() {
  const [, params] = useRoute("/property/:id");
  const propertyId = params?.id ? parseInt(params.id) : null;
  const property = propertyId ? properties.find(p => p.id === propertyId) : null;

  const [formData, setFormData] = useState({
    visitorName: "",
    visitorEmail: "",
    visitorPhone: "",
    visitDate: "",
    visitTime: "",
    message: "",
  });

  const createAppointmentMutation = trpc.appointments.create.useMutation({
    onSuccess: () => {
      toast.success("Visita agendada com sucesso! Entraremos em contato para confirmar.");
      setFormData({
        visitorName: "",
        visitorEmail: "",
        visitorPhone: "",
        visitDate: "",
        visitTime: "",
        message: "",
      });
    },
    onError: (error: unknown) => {
      toast.error("Erro ao agendar visita. Tente novamente.");
      console.error(error);
    },
  });

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
          <div className="container flex items-center justify-between py-4">
            <a href="/" className="flex items-center gap-2 text-foreground hover:text-accent transition-colors">
              <ChevronLeft size={20} />
              <span>Voltar</span>
            </a>
          </div>
        </nav>
        <div className="container flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">Imóvel não encontrado</h1>
            <p className="text-muted-foreground mb-8">O imóvel que você está procurando não existe.</p>
            <a href="/">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Voltar para Home
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.visitorName || !formData.visitorEmail || !formData.visitorPhone || !formData.visitDate || !formData.visitTime) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    await createAppointmentMutation.mutateAsync({
      propertyId: property.id,
      propertyTitle: property.title,
      visitorName: formData.visitorName,
      visitorEmail: formData.visitorEmail,
      visitorPhone: formData.visitorPhone,
      visitDate: formData.visitDate,
      visitTime: formData.visitTime,
      message: formData.message,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="container flex items-center justify-between py-4">
          <a href="/" className="flex items-center gap-2 text-foreground hover:text-accent transition-colors">
            <ChevronLeft size={20} />
            <span>Voltar</span>
          </a>
          <img
            src="/manus-storage/pasted_file_bXJ7Cn_image_a5d72df7.png"
            alt="Letícia Souza Soluções Imobiliárias"
            className="h-10 w-auto"
          />
        </div>
      </nav>

      {/* Image Carousel */}
      <section className="py-6 bg-background">
        <div className="container">
          <ImageCarousel
            images={property.images}
            title={property.title}
            autoPlay={true}
            autoPlayInterval={5000}
          />
        </div>
      </section>

      {/* Property Details */}
      <section className="py-12 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <p className="text-accent font-semibold text-3xl mb-3">{property.price}</p>
                <h1 className="font-display text-4xl font-bold text-foreground mb-3">
                  {property.title}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2 text-lg">
                  <MapPin size={20} />
                  {property.location}
                </p>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-3 gap-6 mb-12 p-6 bg-secondary/30 rounded-lg">
                <div className="text-center">
                  <Bed size={28} className="text-accent mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Quartos</p>
                  <p className="text-2xl font-bold text-foreground">{property.beds}</p>
                </div>
                <div className="text-center">
                  <Bath size={28} className="text-accent mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Banheiros</p>
                  <p className="text-2xl font-bold text-foreground">{property.baths}</p>
                </div>
                <div className="text-center">
                  <Ruler size={28} className="text-accent mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Área</p>
                  <p className="text-2xl font-bold text-foreground">{property.area}m²</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-12">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">Sobre o Imóvel</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {property.description || "Imóvel com excelente localização e acabamento de qualidade."}
                </p>
              </div>

              {/* Map */}
              <div className="mb-12">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">Localização da Região</h2>
                <PropertyMap
                  latitude={property.latitude}
                  longitude={property.longitude}
                  title={property.title}
                />
              </div>

              {/* Contact Info */}
              <div className="bg-secondary/30 rounded-lg p-8">
                <h3 className="font-display text-xl font-bold text-foreground mb-6">Informações de Contato</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Phone className="text-accent flex-shrink-0" size={20} />
                    <div>
                      <p className="font-semibold text-foreground">Telefone</p>
                      <p className="text-muted-foreground">(17) 99753-0831</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Mail className="text-accent flex-shrink-0" size={20} />
                    <div>
                      <p className="font-semibold text-foreground">Email</p>
                      <p className="text-muted-foreground">alvercio.junior@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-1">
              <Card className="p-8 sticky top-24">
                <h3 className="font-display text-2xl font-bold text-foreground mb-6">Agendar Visita</h3>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.visitorName}
                      onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Seu nome"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.visitorEmail}
                      onChange={(e) => setFormData({ ...formData, visitorEmail: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      value={formData.visitorPhone}
                      onChange={(e) => setFormData({ ...formData, visitorPhone: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="(17) 99753-0831"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Data da Visita *
                    </label>
                    <input
                      type="date"
                      value={formData.visitDate}
                      onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Horário *
                    </label>
                    <input
                      type="time"
                      value={formData.visitTime}
                      onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Mensagem (opcional)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Deixe sua mensagem..."
                    ></textarea>
                  </div>

                  <Button
                    type="submit"
                    disabled={createAppointmentMutation.isPending}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3"
                  >
                    {createAppointmentMutation.isPending ? "Agendando..." : "Agendar Visita"}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
