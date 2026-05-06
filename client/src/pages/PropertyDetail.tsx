import { Card } from "@/components/ui/card";
import { Phone, Mail, MapPin, Bed, Bath, Ruler, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ImageCarousel from "@/components/ImageCarousel";
import PropertyMap from "@/components/PropertyMap";
import ShareButtons from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";

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

export default function PropertyDetail() {
  const [, params] = useRoute("/property/:id");
  const propertyId = params?.id ? parseInt(params.id) : null;
  
  const { data: propertiesData = [] } = trpc.properties.getAll.useQuery();
  const allProperties = propertiesData.map((p: any) => ({
    id: p.id,
    title: p.title,
    location: p.location,
    price: p.price,
    image: p.images?.[0]?.imageUrl || "",
    images: p.images?.map((img: any) => img.imageUrl) || [],
    beds: p.beds,
    baths: p.baths,
    area: p.area,
    description: p.description,
    latitude: p.latitude || -20.5105,
    longitude: p.longitude || -48.7789,
  }));
  
  const property = propertyId ? allProperties.find(p => p.id === propertyId) : null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    try {
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
    } catch (error) {
      console.error("Error creating appointment:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="container flex items-center justify-between py-4">
          <a href="/" className="flex items-center gap-2 text-foreground hover:text-accent transition-colors">
            <ChevronLeft size={20} />
            <span>Voltar</span>
          </a>
          <h1 className="font-display text-xl font-bold text-foreground">{property.title}</h1>
          <div className="w-20" />
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Carousel */}
            {property.images && property.images.length > 0 ? (
              <ImageCarousel images={property.images} title={property.title} />
            ) : (
              <div className="w-full h-96 bg-secondary/30 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Sem imagens disponíveis</p>
              </div>
            )}

            {/* Property Info */}
            <Card className="p-8">
              <div className="mb-6">
                <p className="text-accent font-semibold text-3xl mb-2">{property.price}</p>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">{property.title}</h2>
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin size={18} />
                  {property.location}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 py-6 border-y border-border">
                <div className="text-center">
                  <Bed size={24} className="text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{property.beds}</p>
                  <p className="text-sm text-muted-foreground">Quartos</p>
                </div>
                <div className="text-center">
                  <Bath size={24} className="text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{property.baths}</p>
                  <p className="text-sm text-muted-foreground">Banheiros</p>
                </div>
                <div className="text-center">
                  <Ruler size={24} className="text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{property.area}</p>
                  <p className="text-sm text-muted-foreground">m²</p>
                </div>
              </div>

              {property.description && (
                <div className="mt-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">Descrição</h3>
                  <p className="text-muted-foreground leading-relaxed">{property.description}</p>
                </div>
              )}

              {/* Share Buttons */}
              <div className="mt-8 pt-8 border-t border-border">
                <p className="text-sm font-semibold text-foreground mb-4">Compartilhar</p>
                <ShareButtons
                  propertyTitle={property.title}
                  propertyPrice={property.price}
                  propertyUrl={window.location.href}
                  phoneNumber="5517992641234"
                />
              </div>
            </Card>

            {/* Map */}
            <div>
              <h3 className="font-display text-xl font-bold text-foreground mb-4">Localização</h3>
              <PropertyMap latitude={property.latitude} longitude={property.longitude} title={property.title} />
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div>
            <Card className="p-8 sticky top-24">
              <h3 className="font-display text-2xl font-bold text-foreground mb-6">Agende uma Visita</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Nome</label>
                  <input
                    type="text"
                    value={formData.visitorName}
                    onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.visitorEmail}
                    onChange={(e) => setFormData({ ...formData, visitorEmail: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={formData.visitorPhone}
                    onChange={(e) => setFormData({ ...formData, visitorPhone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Data da Visita</label>
                  <input
                    type="date"
                    value={formData.visitDate}
                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Horário</label>
                  <input
                    type="time"
                    value={formData.visitTime}
                    onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Mensagem (Opcional)</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Deixe sua mensagem..."
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createAppointmentMutation.isPending}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50"
                >
                  {createAppointmentMutation.isPending ? "Agendando..." : "Agendar Visita"}
                </Button>
              </form>

              {/* Contact Info */}
              <div className="mt-8 pt-8 border-t border-border space-y-4">
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="font-semibold text-foreground">(17) 3264-1234</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-semibold text-foreground">leticia.frodrigues.souza@gmail.com</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
