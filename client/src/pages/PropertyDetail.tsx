import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Mail, MapPin, Bed, Bath, Ruler, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  image: string;
  beds: number;
  baths: number;
  area: number;
  description?: string;
}

const properties: Property[] = [
  {
    id: 1,
    title: "Residência Moderna Luxuosa",
    location: "Bady Bassitt - SP",
    price: "R$ 2.500.000",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663542972229/Sg4VU74wufmYhMyEUAx8fF/hero-luxury-home-fCQMtSy6nEmPgJoZQTvaNq.webp",
    beds: 4,
    baths: 3,
    area: 350,
    description: "Residência moderna de luxo com acabamentos premium, localizada em área privilegiada de Bady Bassitt. Possui amplos espaços, piscina e jardim paisagístico.",
  },
  {
    id: 2,
    title: "Apartamento Contemporâneo",
    location: "Centro - Bady Bassitt, SP",
    price: "R$ 1.800.000",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663542972229/Sg4VU74wufmYhMyEUAx8fF/modern-living-room-LCRe2bXCNVTkR3pvAAFa8x.webp",
    beds: 3,
    baths: 2,
    area: 280,
    description: "Apartamento contemporâneo no coração do centro, com acabamentos sofisticados e localização estratégica próximo a comércios e serviços.",
  },
  {
    id: 3,
    title: "Casa com Jardim Privativo",
    location: "Zona Residencial - Bady Bassitt, SP",
    price: "R$ 1.200.000",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663542972229/Sg4VU74wufmYhMyEUAx8fF/garden-outdoor-PHWzXXrx5AK337GyABMVrx.webp",
    beds: 3,
    baths: 2,
    area: 250,
    description: "Casa aconchegante com jardim privativo, ideal para famílias que buscam conforto e tranquilidade em zona residencial consolidada.",
  },
  {
    id: 4,
    title: "Penthouse com Vista Panorâmica",
    location: "Bady Bassitt - SP",
    price: "R$ 3.200.000",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663542972229/Sg4VU74wufmYhMyEUAx8fF/bedroom-luxury-DPY6MkRa9mSzwjt3QfkBsk.webp",
    beds: 4,
    baths: 4,
    area: 420,
    description: "Penthouse exclusivo com vista panorâmica da cidade, acabamentos de luxo e todas as comodidades para um estilo de vida sofisticado.",
  },
  {
    id: 5,
    title: "Residência com Cozinha Gourmet",
    location: "Zona Norte - Bady Bassitt, SP",
    price: "R$ 950.000",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663542972229/Sg4VU74wufmYhMyEUAx8fF/kitchen-modern-LciaA5zEGHuDM3eBctWe49.webp",
    beds: 3,
    baths: 2,
    area: 220,
    description: "Residência com cozinha gourmet equipada, perfeita para quem aprecia culinária e deseja espaço amplo para refeições e convivência.",
  },
  {
    id: 6,
    title: "Apartamento Aconchegante",
    location: "Zona Leste - Bady Bassitt, SP",
    price: "R$ 680.000",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663542972229/Sg4VU74wufmYhMyEUAx8fF/hero-luxury-home-fCQMtSy6nEmPgJoZQTvaNq.webp",
    beds: 2,
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

      {/* Hero Image */}
      <section className="relative h-96 overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover"
        />
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
