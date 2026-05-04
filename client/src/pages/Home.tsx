import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Mail, MapPin, Bed, Bath, Ruler } from "lucide-react";
import { useState } from "react";
import WhatsAppButton from "@/components/WhatsAppButton";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * Design Philosophy: Minimalismo Contemporâneo Premium
 * - Tipografia hierárquica com Playfair Display para títulos
 * - Paleta neutra com acentos em azul-cinzento (baseada no logo)
 * - Imagens de imóveis como protagonista
 * - Espaço negativo generoso
 */

interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  image: string;
  beds: number;
  baths: number;
  area: number;
  featured?: boolean;
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
    featured: true,
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
    featured: true,
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
  },
];

export default function Home() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const sendContactMutation = trpc.contact.sendMessage.useMutation({
    onSuccess: () => {
      toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    },
    onError: (error: unknown) => {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
      console.error(error);
    },
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    await sendContactMutation.mutateAsync(formData);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Botão Flutuante WhatsApp */}
      <WhatsAppButton
        phoneNumber="5517997560831"
        message="Olá! Gostaria de saber mais sobre os imóveis disponíveis na Letícia Souza Soluções Imobiliárias."
      />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img
              src="/manus-storage/pasted_file_bXJ7Cn_image_a5d72df7.png"
              alt="Letícia Souza Soluções Imobiliárias"
              className="h-12 w-auto"
            />
            <div className="hidden sm:block">
              <p className="font-display font-bold text-lg text-foreground leading-tight">Letícia Souza</p>
              <p className="text-xs text-muted-foreground font-medium">Soluções Imobiliárias</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a href="#properties" className="text-foreground hover:text-accent transition-colors text-sm font-medium">
              Imóveis
            </a>
            <a href="#contact" className="text-foreground hover:text-accent transition-colors text-sm font-medium">
              Contato
            </a>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Consultar
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663542972229/Sg4VU74wufmYhMyEUAx8fF/hero-luxury-home-fCQMtSy6nEmPgJoZQTvaNq.webp"
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-center">
          <div className="container">
            <div className="max-w-2xl">
              <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                Encontre seu Imóvel Perfeito
              </h1>
              <p className="text-white/90 text-lg mb-8 max-w-xl">
                Explore uma seleção curada de propriedades premium em Bady Bassitt e região. Qualidade, sofisticação e localização privilegiada.
              </p>
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                Explorar Imóveis
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="mb-16">
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">Destaques</h2>
            <p className="text-muted-foreground text-lg">Nossas propriedades mais exclusivas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {properties.filter(p => p.featured).map((property) => (
              <div
                key={property.id}
                className="group cursor-pointer"
                onClick={() => setSelectedProperty(property)}
              >
                <div className="relative overflow-hidden rounded-lg mb-4 h-80">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-4 py-2 rounded-lg font-semibold">
                    {property.price}
                  </div>
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                  {property.title}
                </h3>
                <p className="text-muted-foreground flex items-center gap-2 mb-4">
                  <MapPin size={16} />
                  {property.location}
                </p>
                <div className="flex gap-6 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <Bed size={18} className="text-accent" />
                    <span>{property.beds} Quartos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath size={18} className="text-accent" />
                    <span>{property.baths} Banheiros</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler size={18} className="text-accent" />
                    <span>{property.area} m²</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Properties */}
      <section id="properties" className="py-20 bg-secondary/30">
        <div className="container">
          <div className="mb-16">
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">Todos os Imóveis</h2>
            <p className="text-muted-foreground text-lg">Explore nossa carteira completa de propriedades</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <Card
                key={property.id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
                onClick={() => setSelectedProperty(property)}
              >
                <div className="relative overflow-hidden h-48">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-3">
                    <p className="text-accent font-semibold text-lg">{property.price}</p>
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    {property.title}
                  </h3>
                  <p className="text-muted-foreground text-sm flex items-center gap-2 mb-4">
                    <MapPin size={14} />
                    {property.location}
                  </p>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <Bed size={16} className="text-accent mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">{property.beds}</p>
                    </div>
                    <div className="text-center">
                      <Bath size={16} className="text-accent mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">{property.baths}</p>
                    </div>
                    <div className="text-center">
                      <Ruler size={16} className="text-accent mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">{property.area}m²</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="font-display text-4xl font-bold text-foreground mb-6">Entre em Contato</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Tem interesse em algum imóvel? Fale conosco e agende uma visita. Estamos aqui para ajudá-lo a encontrar o imóvel dos seus sonhos.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="text-accent" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Telefone</p>
                    <p className="text-muted-foreground">(17) 99756-0831</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="text-accent" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Email</p>
                    <p className="text-muted-foreground">alvercio.junior@gmail.com</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-accent" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Localização</p>
                    <p className="text-muted-foreground">Rua Jesus Domingos Candido nº 52 - Residencial Paraty - Bady Bassitt - SP CEP 15115-059</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-8">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="(17) 99756-0831"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Mensagem
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Sua mensagem aqui..."
                  ></textarea>
                </div>

                <Button
                  type="submit"
                  disabled={sendContactMutation.isPending}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3"
                >
                  {sendContactMutation.isPending ? "Enviando..." : "Enviar Mensagem"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <img
                src="/manus-storage/pasted_file_bXJ7Cn_image_a5d72df7.png"
                alt="Letícia Souza Soluções Imobiliárias"
                className="h-10 w-auto mb-4"
              />
              <p className="text-background/80 text-sm">
                Sua corretora de confiança para encontrar o imóvel perfeito em Bady Bassitt.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-sm text-background/80">
                <li><a href="#properties" className="hover:text-background transition-colors">Imóveis</a></li>
                <li><a href="#contact" className="hover:text-background transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Sobre Nós</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-sm text-background/80">
                <li>(17) 99756-0831</li>
                <li>alvercio.junior@gmail.com</li>
                <li>Rua Jesus Domingos Candido nº 52</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contato Rápido</h4>
              <a
                href="https://wa.me/5517997560831?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20seus%20imóveis."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-10 h-10 bg-[#25D366] rounded-lg flex items-center justify-center hover:bg-[#20BA5A] transition-colors text-white font-bold"
              >
                W
              </a>
            </div>
          </div>

          <div className="border-t border-background/20 pt-8">
            <p className="text-center text-background/60 text-sm">
              © 2026 Letícia Souza Soluções Imobiliárias. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Property Modal */}
      {selectedProperty && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProperty(null)}
        >
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-80 overflow-hidden">
              <img
                src={selectedProperty.image}
                alt={selectedProperty.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProperty(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-8">
              <div className="mb-4">
                <p className="text-accent font-semibold text-2xl">{selectedProperty.price}</p>
              </div>

              <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                {selectedProperty.title}
              </h2>

              <p className="text-muted-foreground flex items-center gap-2 mb-6">
                <MapPin size={18} />
                {selectedProperty.location}
              </p>

              <div className="grid grid-cols-3 gap-6 mb-8 pb-8 border-b border-border">
                <div>
                  <Bed size={24} className="text-accent mb-2" />
                  <p className="text-sm text-muted-foreground">Quartos</p>
                  <p className="text-2xl font-bold text-foreground">{selectedProperty.beds}</p>
                </div>
                <div>
                  <Bath size={24} className="text-accent mb-2" />
                  <p className="text-sm text-muted-foreground">Banheiros</p>
                  <p className="text-2xl font-bold text-foreground">{selectedProperty.baths}</p>
                </div>
                <div>
                  <Ruler size={24} className="text-accent mb-2" />
                  <p className="text-sm text-muted-foreground">Área</p>
                  <p className="text-2xl font-bold text-foreground">{selectedProperty.area}m²</p>
                </div>
              </div>

              <div className="space-y-4">
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3">
                  Agendar Visita
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedProperty(null)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
