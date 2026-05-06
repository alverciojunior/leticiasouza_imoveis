import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Edit2, Plus, LogOut, X, BarChart3, MapPin, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAdminAuth } from "@/_core/hooks/useAdminAuth";
import ImageUpload from "@/components/ImageUpload";
import StatsDashboard from "@/components/StatsDashboard";
import LocationMapPicker from "@/components/LocationMapPicker";
import AdminUsers from "./AdminUsers";

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
  sold?: number;
  description?: string | null;
  images?: ExistingImage[];
}

export default function AdminDashboard() {
  const { user, logout, loading } = useAdminAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"properties" | "stats" | "users">("properties");
  const [selectedImages, setSelectedImages] = useState<UploadedImage[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    price: "",
    type: "Casas" as "Apartamentos" | "Casas" | "Comerciais" | "Galpões" | "Rurais" | "Terrenos",
    description: "",
    beds: 1,
    baths: 1,
    area: 100,
    featured: false,
    latitude: -20.6596,
    longitude: -48.7669,
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

  const deleteAllImagesMutation = trpc.properties.deleteAllImages.useMutation({
    onSuccess: () => {
      toast.success("Todas as imagens removidas com sucesso!", {
        description: "Todas as fotos do imóvel foram removidas.",
        duration: 3000,
      });
      setExistingImages([]);
      propertiesQuery.refetch();
    },
    onError: (error) => {
      toast.error("Erro ao remover imagens", {
        description: error.message || "Não foi possível remover as imagens.",
        duration: 5000,
      });
    },
  });

  const markAsSoldMutation = trpc.properties.markAsSold.useMutation({
    onSuccess: () => {
      toast.success("Propriedade marcada como vendida!", {
        description: "O imóvel agora aparecerá como vendido.",
        duration: 3000,
      });
      propertiesQuery.refetch();
    },
    onError: (error) => {
      toast.error("Erro ao marcar como vendido", {
        description: error.message || "Não foi possível atualizar o status.",
        duration: 5000,
      });
    },
  });

  const geocodeMutation = trpc.properties.geocode.useMutation({
    onSuccess: (data) => {
      setFormData((prev) => ({
        ...prev,
        latitude: data.latitude,
        longitude: data.longitude,
      }));
      toast.success("Coordenadas encontradas!", {
        description: `${data.address}`,
        duration: 4000,
      });
    },
    onError: (error) => {
      toast.error("Erro ao geocodificar endereço", {
        description: error.message || "Endereço não encontrado. Tente novamente.",
        duration: 5000,
      });
    },
  });

  const addImageMutation = trpc.properties.uploadImage.useMutation({
    onError: (error) => {
      toast.error("Erro ao adicionar imagem", {
        description: error.message || "Verifique o arquivo e tente novamente.",
        duration: 5000,
      });
    },
  });

  const addImageDirectMutation = trpc.properties.addImage.useMutation({
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
      type: "Casas" as "Apartamentos" | "Casas" | "Comerciais" | "Galpões" | "Rurais" | "Terrenos",
      description: "",
      beds: 1,
      baths: 1,
      area: 100,
      featured: false,
      latitude: -20.6596,
      longitude: -48.7669,
    });
    setSelectedImages([]);
    setExistingImages([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (property: Property) => {
    setEditingId(property.id);
    const propertyType = ((property as any).type || "Casas") as "Apartamentos" | "Casas" | "Comerciais" | "Galpões" | "Rurais" | "Terrenos";
    setFormData({
      title: property.title,
      location: property.location,
      price: property.price,
      type: propertyType,
      description: property.description || "",
      beds: property.beds,
      baths: property.baths,
      area: property.area,
      featured: property.featured === 1,
      latitude: (property as any).latitude || -20.6596,
      longitude: (property as any).longitude || -48.7669,
    });
    setExistingImages(property.images || []);
    setSelectedImages([]);
    setShowForm(true);
  };

  const handleGeocode = async () => {
    if (!formData.location.trim()) {
      toast.error("Campo de localizacao vazio", {
        description: "Preencha o campo de localizacao antes de geocodificar.",
        duration: 4000,
      });
      return;
    }

    setIsGeocoding(true);
    try {
      await geocodeMutation.mutateAsync({
        address: formData.location,
      });
    } finally {
      setIsGeocoding(false);
    }
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

    try {
      setIsUploading(true);
      let propertyId = editingId;

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
        const createResult = await createPropertyMutation.mutateAsync({
          ...formData,
          beds: Number(formData.beds),
          baths: Number(formData.baths),
          area: Number(formData.area),
        });
        // Usar o ID retornado pelo backend
        propertyId = (createResult as any)?.id;
        if (!propertyId) {
          throw new Error("Falha ao obter ID da propriedade criada");
        }
      }

      // Upload de imagens selecionadas
      if (selectedImages.length > 0 && propertyId) {
        for (let i = 0; i < selectedImages.length; i++) {
          const image = selectedImages[i];
          try {
            const reader = new FileReader();
            await new Promise((resolve, reject) => {
              reader.onload = async (e) => {
                try {
                  const base64 = e.target?.result as string;
                  await addImageMutation.mutateAsync({
                    propertyId,
                    imageData: base64,
                    fileName: image.file.name,
                    order: i,
                  } as any);
                  resolve(null);
                } catch (err) {
                  reject(err);
                }
              };
              reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
              reader.readAsDataURL(image.file);
            });
          } catch (error) {
            console.error('Erro ao fazer upload:', error);
          }
        }
        
        // Recarregar propriedades após upload
        await propertiesQuery.refetch();
        toast.success("Imagens enviadas com sucesso!", {
          description: `${selectedImages.length} foto(s) adicionada(s) ao imóvel.`,
          duration: 3000,
        });
      }

      resetForm();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setIsUploading(false);
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

  const handleDeleteAllImages = () => {
    if (confirm("Tem certeza que deseja remover TODAS as imagens deste imóvel? Esta ação não pode ser desfeita.")) {
      if (editingId) {
        deleteAllImagesMutation.mutate({ propertyId: editingId });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

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
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("properties")}
            className={`pb-3 px-4 font-semibold transition-colors ${
              activeTab === "properties"
                ? "text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Imóveis
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`pb-3 px-4 font-semibold transition-colors flex items-center gap-2 ${
              activeTab === "stats"
                ? "text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 size={18} />
            Estatísticas
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 px-4 font-semibold transition-colors ${
              activeTab === "users"
                ? "text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Usuários
          </button>
        </div>

        {/* Properties Tab */}
        {activeTab === "properties" && (
          <>
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
                      Tipo *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as "Apartamentos" | "Casas" | "Comerciais" | "Galpões" | "Rurais" | "Terrenos" })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    >
                      <option value="Apartamentos">Apartamentos</option>
                      <option value="Casas">Casas</option>
                      <option value="Comerciais">Comerciais</option>
                      <option value="Galpões">Galpões</option>
                      <option value="Rurais">Rurais</option>
                      <option value="Terrenos">Terrenos</option>
                    </select>
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
                      min="0"
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
                      min="0"
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

                {/* Localização (Coordenadas) */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-foreground">Localização (Apenas para mapa - Não visível ao cliente)</h4>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleGeocode}
                        disabled={isGeocoding}
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 text-sm"
                      >
                        {isGeocoding ? "Geocodificando..." : "Geocodificar Endereco"}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowMapPicker(true)}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2 text-sm"
                      >
                        <MapPin size={16} />
                        Selecionar no Mapa
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Ex: -20.6596"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Padrão: Bady Bassitt (-20.6596)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Ex: -48.7669"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Padrão: Bady Bassitt (-48.7669)</p>
                    </div>
                  </div>
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
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">Fotos Atuais</h4>
                  </div>
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

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[80px] flex items-center justify-center gap-2"
                      onClick={() => handleEditClick(property)}
                    >
                      <Edit2 size={16} />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[80px] flex items-center justify-center gap-2 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(property.id)}
                    >
                      <Trash2 size={16} />
                      Deletar
                    </Button>
                  </div>

                  <div className="flex gap-2 flex-wrap mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[100px] flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja remover todas as imagens?")) {
                          deleteAllImagesMutation.mutate({ propertyId: property.id });
                        }
                      }}
                    >
                      <Trash2 size={16} />
                      Remover Fotos
                    </Button>
                    {property.sold ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700"
                        onClick={() => {
                          if (confirm("Marcar como disponivel para venda?")) {
                            markAsSoldMutation.mutate({ propertyId: property.id, sold: false });
                          }
                        }}
                      >
                        <Check size={16} />
                        Disponivel para Venda
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-[80px] flex items-center justify-center gap-2 text-green-600 hover:text-green-700"
                        onClick={() => {
                          if (confirm("Marcar como vendido?")) {
                            markAsSoldMutation.mutate({ propertyId: property.id, sold: true });
                          }
                        }}
                      >
                        <Check size={16} />
                        Vendido
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
          </>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <StatsDashboard />
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <AdminUsers />
        )}

        {/* Map Picker Modal */}
        {showMapPicker && (
          <LocationMapPicker
            latitude={formData.latitude}
            longitude={formData.longitude}
            onLocationChange={(lat, lng) => {
              setFormData({ ...formData, latitude: lat, longitude: lng });
            }}
            onClose={() => setShowMapPicker(false)}
          />
        )}
      </div>
    </div>
  );
}
