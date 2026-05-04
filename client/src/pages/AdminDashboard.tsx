import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Edit2, Plus, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  area: number;
  featured: number;
  images?: Array<{ id: number; imageUrl: string }>;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    price: "",
    description: "",
    beds: 1,
    baths: 1,
    area: 100,
    featured: false,
  });

  const propertiesQuery = trpc.properties.list.useQuery();
  const createPropertyMutation = trpc.properties.create.useMutation({
    onSuccess: () => {
      toast.success("Imóvel criado com sucesso!");
      propertiesQuery.refetch();
      setFormData({
        title: "",
        location: "",
        price: "",
        description: "",
        beds: 1,
        baths: 1,
        area: 100,
        featured: false,
      });
      setShowForm(false);
    },
    onError: (error) => {
      toast.error("Erro ao criar imóvel");
      console.error(error);
    },
  });

  const deletePropertyMutation = trpc.properties.delete.useMutation({
    onSuccess: () => {
      toast.success("Imóvel deletado com sucesso!");
      propertiesQuery.refetch();
    },
    onError: () => {
      toast.error("Erro ao deletar imóvel");
    },
  });

  useEffect(() => {
    if (propertiesQuery.data) {
      setProperties(propertiesQuery.data);
    }
  }, [propertiesQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.location || !formData.price) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    await createPropertyMutation.mutateAsync({
      ...formData,
      beds: Number(formData.beds),
      baths: Number(formData.baths),
      area: Number(formData.area),
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este imóvel?")) {
      deletePropertyMutation.mutate({ id });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-8">Você precisa estar autenticado para acessar o painel administrativo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground">Bem-vindo, {user.name}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => logout()}
            className="flex items-center gap-2"
          >
            <LogOut size={18} />
            Sair
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-8">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">Meus Imóveis</h2>
            <p className="text-muted-foreground">Total: {properties.length} propriedades</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Imóvel
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="p-8 mb-8">
            <h3 className="font-display text-2xl font-bold text-foreground mb-6">Adicionar Novo Imóvel</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Ex: Residência Moderna Luxuosa"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Localização *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Ex: Bady Bassitt - SP"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Preço *
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Ex: R$ 2.500.000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Quartos
                  </label>
                  <input
                    type="number"
                    value={formData.beds}
                    onChange={(e) => setFormData({ ...formData, beds: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Banheiros
                  </label>
                  <input
                    type="number"
                    value={formData.baths}
                    onChange={(e) => setFormData({ ...formData, baths: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Área (m²)
                  </label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Descrição
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Descrição do imóvel..."
                ></textarea>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-foreground">Destaque</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={createPropertyMutation.isPending}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {createPropertyMutation.isPending ? "Criando..." : "Criar Imóvel"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Properties List */}
        {propertiesQuery.isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando imóveis...</p>
          </div>
        ) : properties.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhum imóvel cadastrado ainda.</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Adicionar Primeiro Imóvel
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-secondary/30 flex items-center justify-center">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0].imageUrl}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <p className="text-muted-foreground">Sem imagens</p>
                  )}
                  {property.featured === 1 && (
                    <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-3 py-1 rounded-lg text-xs font-semibold">
                      Destaque
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    {property.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">{property.location}</p>
                  <p className="text-accent font-semibold text-lg mb-4">{property.price}</p>

                  <div className="flex gap-2 text-xs text-muted-foreground mb-4 pb-4 border-b border-border">
                    <span>{property.beds} quartos</span>
                    <span>•</span>
                    <span>{property.baths} banheiros</span>
                    <span>•</span>
                    <span>{property.area}m²</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 flex items-center justify-center gap-2"
                      onClick={() => {
                        setEditingId(property.id);
                        setShowForm(true);
                      }}
                    >
                      <Edit2 size={16} />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(property.id)}
                    >
                      <Trash2 size={16} />
                      Deletar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
