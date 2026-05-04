import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Edit2, Plus, LogOut, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import ImageUpload from "@/components/ImageUpload";

interface UploadedImage {
  file: File;
  preview: string;
  id: string;
}

interface ExistingImage {
  id: number;
  imageUrl: string;
}

interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  area: number;
  featured: number;
  description?: string | null;
  images?: ExistingImage[];
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedImages, setSelectedImages] = useState<UploadedImage[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
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
    onSuccess: async () => {
      await propertiesQuery.refetch();
      toast.success("Imóvel criado com sucesso!", {
        description: `${formData.title} foi adicionado à sua carteira.`,
        duration: 4000,
      });
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar imóvel", {
        description: error.message || "Verifique os dados e tente novamente.",
        duration: 5000,
      });
    },
  });

  const updatePropertyMutation = trpc.properties.update.useMutation({
    onSuccess: async () => {
      await propertiesQuery.refetch();
      toast.success("Imóvel atualizado com sucesso!", {
        description: `${formData.title} foi atualizado com as novas informações.`,
        duration: 4000,
      });
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar imóvel", {
        description: error.message || "Verifique os dados e tente novamente.",
        duration: 5000,
      });
    },
  });

  const deletePropertyMutation = trpc.properties.delete.useMutation({
    onSuccess: () => {
      toast.success("Imóvel deletado com sucesso!", {
        description: "A propriedade foi removida de sua carteira.",
        duration: 4000,
      });
      propertiesQuery.refetch();
    },
    onError: (error) => {
      toast.error("Erro ao deletar imóvel", {
        description: error.message || "Não foi possível remover o imóvel.",
        duration: 5000,
      });
    },
  });

  const deleteImageMutation = trpc.properties.deleteImage.useMutation({
    onSuccess: () => {
      toast.success("Imagem removida com sucesso!", {
        description: "A foto foi removida do imóvel.",
        duration: 3000,
      });
      propertiesQuery.refetch();
    },
    onError: (error) => {
      toast.error("Erro ao remover imagem", {
        description: error.message || "Não foi possível remover a imagem.",
        duration: 5000,
      });
    },
  });

  const addImageMutation = trpc.properties.addImage.useMutation({
    onError: (error) => {
      toast.error("Erro ao adicionar imagem", {
        description: error.message || "Verifique o arquivo e tente novamente.",
        duration: 5000,
      });
    },
  });

  useEffect(() => {
    if (propertiesQuery.data) {
      setProperties(propertiesQuery.data);
    }
  }, [propertiesQuery.data]);

  const resetForm = () => {
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
    setSelectedImages([]);
    setExistingImages([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (property: Property) => {
    setEditingId(property.id);
    setFormData({
      title: property.title,
      location: property.location,
      price: property.price,
      description: property.description || "",
      beds: property.beds,
      baths: property.baths,
      area: property.area,
      featured: property.featured === 1,
    });
    setExistingImages(property.images || []);
    setSelectedImages([]);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const missingFields = [];
    if (!formData.title) missingFields.push("Título");
    if (!formData.location) missingFields.push("Localização");
    if (!formData.price) missingFields.push("Preço");
    
    if (missingFields.length > 0) {
      toast.error("Campos obrigatórios faltando", {
        description: `Preencha: ${missingFields.join(", ")}`,
        duration: 5000,
      });
      return;
    }

    if (editingId) {
      // Editar propriedade existente
      await updatePropertyMutation.mutateAsync({
        id: editingId,
        ...formData,
        beds: Number(formData.beds),
        baths: Number(formData.baths),
        area: Number(formData.area),
      });
    } else {
      // Criar nova propriedade
      await createPropertyMutation.mutateAsync({
        ...formData,
        beds: Number(formData.beds),
        baths: Number(formData.baths),
        area: Number(formData.area),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este imóvel?")) {
      deletePropertyMutation.mutate({ id });
    }
  };

  const handleDeleteImage = (imageId: number) => {
    if (confirm("Tem certeza que deseja remover esta imagem?")) {
      deleteImageMutation.mutate({ id: imageId });
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
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Imóvel
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl font-bold text-foreground">
                {editingId ? "Editar Imóvel" : "Adicionar Novo Imóvel"}
              </h3>
              <button
                onClick={resetForm}
                className="p-1 hover:bg-secondary rounded transition-colors"
              >
                <X size={24} className="text-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Informações Básicas</h4>
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

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-foreground">Marcar como destaque</span>
                </label>
              </div>

              {/* Imagens Existentes */}
              {editingId && existingImages.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-border">
                  <h4 className="font-semibold text-foreground">Fotos Atuais</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {existingImages.map((image, index) => (
                      <div
                        key={image.id}
                        className="relative group rounded-lg overflow-hidden bg-secondary/30"
                      >
                        <img
                          src={image.imageUrl}
                          alt={`Imagem ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(image.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                            title="Remover"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 rounded text-xs font-semibold">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload de Novas Imagens */}
              <div className="space-y-4 pt-6 border-t border-border">
                <h4 className="font-semibold text-foreground">
                  {editingId ? "Adicionar Novas Fotos" : "Fotos do Imóvel"}
                </h4>
                <ImageUpload
                  onImagesSelected={setSelectedImages}
                  maxImages={10}
                  maxSizeMB={5}
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={createPropertyMutation.isPending || updatePropertyMutation.isPending || isUploading}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isUploading || createPropertyMutation.isPending || updatePropertyMutation.isPending ? (
                    <>{editingId ? "Atualizando..." : "Criando..."}</>
                  ) : (
                    <>{editingId ? "Atualizar Imóvel" : "Criar Imóvel"}</>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
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
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
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
                      onClick={() => handleEditClick(property)}
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
