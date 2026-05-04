import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

export interface FilterOptions {
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  minBaths: string;
  minArea: string;
  location: string;
  type: string;
}

interface PropertyFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  onReset: () => void;
  locations: string[];
  types: string[];
  minBeds: number[];
  minBaths: number[];
}

export default function PropertyFilters({
  onFilterChange,
  onReset,
  locations,
  types,
  minBeds,
  minBaths,
}: PropertyFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    minPrice: "",
    maxPrice: "",
    minBeds: "",
    minBaths: "",
    minArea: "",
    location: "",
    type: "",
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      minBeds: "",
      minBaths: "",
      minArea: "",
      location: "",
      type: "",
    });
    onReset();
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="w-full">
      {/* Mobile Toggle Button */}
      <div className="md:hidden mb-4">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className="w-full"
        >
          {isOpen ? "Fechar Filtros" : "Abrir Filtros"}
        </Button>
      </div>

      {/* Filters Card */}
      <Card
        className={`p-6 ${
          !isOpen && "hidden md:block"
        } bg-secondary/30 border-border`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-foreground text-lg">Filtrar Imóveis</h3>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-sm text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
            >
              <X size={16} />
              Limpar Filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tipo
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Todos os tipos</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Localização
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Todas as localizações</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Min Price Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Preço Mínimo
            </label>
            <input
              type="number"
              placeholder="Ex: 500000"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Max Price Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Preço Máximo
            </label>
            <input
              type="number"
              placeholder="Ex: 3000000"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Min Beds Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Quartos Mínimos
            </label>
            <select
              value={filters.minBeds}
              onChange={(e) => handleFilterChange("minBeds", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Qualquer quantidade</option>
              {minBeds.map((b) => (
                <option key={b} value={b}>
                  {b}+
                </option>
              ))}
            </select>
          </div>

          {/* Min Baths Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Banheiros Mínimos
            </label>
            <select
              value={filters.minBaths}
              onChange={(e) => handleFilterChange("minBaths", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Qualquer quantidade</option>
              {minBaths.map((b) => (
                <option key={b} value={b}>
                  {b}+
                </option>
              ))}
            </select>
          </div>

          {/* Min Area Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Área Mínima (m²)
            </label>
            <input
              type="number"
              placeholder="Ex: 150"
              value={filters.minArea}
              onChange={(e) => handleFilterChange("minArea", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Mobile Apply Button */}
        <div className="md:hidden mt-4">
          <Button
            onClick={() => setIsOpen(false)}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Aplicar Filtros
          </Button>
        </div>
      </Card>
    </div>
  );
}
