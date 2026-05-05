import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import ImageUpload from "@/components/ImageUpload";
import { useAuth } from "@/_core/hooks/useAuth";

interface UploadedImage {
  file: File;
  preview: string;
  id: string;
}

interface FormData {
  title: string;
  description: string;
  price: string;
  beds: string;
  baths: string;
  area: string;
  location: string;
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedImages, setSelectedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    price: "",
    beds: "",
    baths: "",
    area: "",
    location: "",
  });

  const propertiesQuery = trpc.properties.list.useQuery();
  const createPropertyMutation = trpc.properties.create.useMutation({
    onSuccess: () => {
      propertiesQuery.refetch();
    },
  });
  const updatePropertyMutation = trpc.properties.update.useMutation({
    onSuccess: () => {
      propertiesQuery.refetch();
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

  const deleteAllImagesMutation = trpc.properties.deleteAllImages.useMutation({
    onError: (error) => {
      toast.error("Erro ao remover imagens", {
        description: error.message || "Tente novamente.",
        duration: 5000,
      });
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
  }, [isAuthenticated]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      beds: "",
      baths: "",
      area: "",
      location: "",
    });
    setSelectedImages([]);
    setEditingId(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImagesSelected = (images: UploadedImage[]) => {
    setSelectedImages(images);
  };

  const handleDeleteImage = async (propertyId: number, imageId: number) => {
    if (!confirm("Tem certeza que deseja remover esta imagem?")) {
      return;
    }

    try {
      await addImageDirectMutation.mutateAsync({
        propertyId,
        imageId,
        action: "delete",
      } as any);
      await propertiesQuery.refetch();
      toast.success("Imagem removida com sucesso!");
    } catch (error) {
      console.error("Erro ao remover imagem:", error);
    }
  };

  const handleDeleteAllImages = async (propertyId: number) => {
    if (!confirm("Tem certeza que deseja remover TODAS as imagens deste anúncio?")) {
      return;
    }

    try {
      await deleteAllImagesMutation.mutateAsync({ propertyId });
      await propertiesQuery.refetch();
      toast.success("Todas as imagens foram removidas!");
    } catch (error) {
      console.error("Erro ao remover todas as imagens:", error);
    }
  };

  const handleSaveProperty = async () => {
    const missingFields = [];
    if (!formData.title) missingFields.push("Título");
    if (!formData.price) missingFields.push("Preço");
    if (!formData.beds) missingFields.push("Quartos");
    if (!formData.baths) missingFields.push("Banheiros");
    if (!formData.area) missingFields.push("Área");

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
        await createPropertyMutation.mutateAsync({
          ...formData,
          beds: Number(formData.beds),
          baths: Number(formData.baths),
          area: Number(formData.area),
        });
        // Pegar o ID da propriedade criada
        await new Promise(resolve => setTimeout(resolve, 500));
        if (propertiesQuery.data && propertiesQuery.data.length > 0) {
          propertyId = propertiesQuery.data[0].id;
        }
      }

      // Upload de imagens selecionadas (sequencial para evitar timeout em produção)
      if (selectedImages.length > 0 && propertyId) {
        let uploadedCount = 0;
        let failedCount = 0;
        
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
                  uploadedCount++;
                  resolve(null);
                } catch (err) {
                  failedCount++;
                  reject(err);
                }
              };
              reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
              reader.readAsDataURL(image.file);
            });
            
            // Adicionar delay entre uploads para evitar timeout em produção
            if (i < selectedImages.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          } catch (error) {
            console.error('Erro ao fazer upload da imagem', i + 1, ':', error);
          }
        }
        
        // Mostrar resultado do upload
        if (uploadedCount > 0) {
          toast.success("Imagens enviadas com sucesso!", {
            description: `${uploadedCount} de ${selectedImages.length} foto(s) adicionada(s) ao imóvel.`,
            duration: 3000,
          });
        }
        if (failedCount > 0) {
          toast.error("Algumas imagens falharam", {
            description: `${failedCount} de ${selectedImages.length} foto(s) não foram enviadas.`,
            duration: 5000,
          });
        }
      }

      // Recarregar propriedades após upload
      await propertiesQuery.refetch();
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Tem certeza que deseja remover este imóvel?")) {
      return;
    }

    // Implementar delete quando houver mutation
    toast.info("Funcionalidade de exclusão em desenvolvimento");
  };

  const handleEdit = (property: any) => {
    setEditingId(property.id);
    setFormData({
      title: property.title,
      description: property.description,
      price: property.price.toString(),
      beds: property.beds.toString(),
      baths: property.baths.toString(),
      area: property.area.toString(),
      location: property.location,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>

        {/* Formulário de Propriedade */}
        <Card className="mb-8 p-6">
          <h2 className="text-2xl font-semibold mb-6">
            {editingId ? "Editar Imóvel" : "Novo Imóvel"}
          </h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ex: Casa em Bady Bassitt"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva o imóvel..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Bady Bassitt, SP"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="beds">Quartos</Label>
                <Input
                  id="beds"
                  name="beds"
                  type="number"
                  value={formData.beds}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="baths">Banheiros</Label>
                <Input
                  id="baths"
                  name="baths"
                  type="number"
                  value={formData.baths}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="area">Área (m²)</Label>
                <Input
                  id="area"
                  name="area"
                  type="number"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Upload de Novas Imagens */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Fotos do Imóvel</h3>
              <ImageUpload
                onImagesSelected={handleImagesSelected}
                maxImages={10}
                maxSizeMB={10}
              />
              {isUploading || createPropertyMutation.isPending || updatePropertyMutation.isPending ? (
                <p className="text-sm text-muted-foreground mt-2">Processando imagens...</p>
              ) : null}
            </div>

            <div className="flex gap-3 justify-end">
              {editingId && (
                <Button
                  variant="outline"
                  onClick={() => resetForm()}
                  disabled={isUploading}
                >
                  Cancelar
                </Button>
              )}
              <Button
                onClick={handleSaveProperty}
                disabled={isUploading || createPropertyMutation.isPending || updatePropertyMutation.isPending}
              >
                {editingId ? "Atualizar" : "Criar"} Imóvel
              </Button>
            </div>
          </div>
        </Card>

        {/* Lista de Propriedades */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Meus Imóveis</h2>
          {propertiesQuery.isLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : propertiesQuery.data && propertiesQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {propertiesQuery.data.map((property: any) => (
                <Card key={property.id} className="overflow-hidden">
                  {property.images && property.images.length > 0 ? (
                    <div className="relative">
                      <img
                        src={property.images[0].url}
                        alt={property.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                        {property.images.length} foto(s)
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-secondary flex items-center justify-center">
                      <span className="text-muted-foreground">Sem imagens</span>
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {property.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <p className="font-semibold text-accent">R${property.price.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {property.beds} quartos • {property.baths} banheiros • {property.area}m²
                      </p>
                      <p className="text-sm text-muted-foreground">{property.location}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(property)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(property.id)}
                      >
                        Deletar
                      </Button>
                      {property.images && property.images.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAllImages(property.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remover Fotos
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum imóvel cadastrado</p>
          )}
        </div>
      </div>
    </div>
  );
}
