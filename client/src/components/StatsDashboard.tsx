import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Eye, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function StatsDashboard() {
  const overviewQuery = trpc.stats.overview.useQuery();
  const propertiesQuery = trpc.stats.properties.useQuery();

  const overview = overviewQuery.data;
  const properties = propertiesQuery.data || [];

  const appointmentStatusData = overview ? [
    { name: "Pendente", value: overview.pending, color: "#FFA500" },
    { name: "Confirmado", value: overview.confirmed, color: "#4CAF50" },
    { name: "Concluído", value: overview.completed, color: "#2196F3" },
    { name: "Cancelado", value: overview.cancelled, color: "#F44336" },
  ] : [];

  const topProperties = properties
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const COLORS = ["#FFA500", "#4CAF50", "#2196F3", "#F44336"];

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total de Visualizações</p>
              <p className="text-3xl font-bold text-foreground mt-2">{overview?.totalViews || 0}</p>
            </div>
            <Eye className="w-12 h-12 text-accent opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total de Agendamentos</p>
              <p className="text-3xl font-bold text-foreground mt-2">{overview?.total || 0}</p>
            </div>
            <Calendar className="w-12 h-12 text-accent opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Pendentes</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{overview?.pending || 0}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Confirmados</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{overview?.confirmed || 0}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Status de Agendamentos */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Status dos Agendamentos</h3>
          {appointmentStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appointmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Sem dados de agendamentos
            </div>
          )}
        </Card>

        {/* Gráfico de Imóveis Mais Visualizados */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Top 5 Imóveis Mais Visualizados</h3>
          {topProperties.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProperties}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#3b82f6" name="Visualizações" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Sem dados de visualizações
            </div>
          )}
        </Card>
      </div>

      {/* Tabela de Desempenho dos Imóveis */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Desempenho de Todos os Imóveis</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Imóvel</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Visualizações</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Agendamentos</th>
              </tr>
            </thead>
            <tbody>
              {properties.length > 0 ? (
                properties.map((prop) => (
                  <tr key={prop.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-4 text-foreground">{prop.title}</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        <Eye size={14} />
                        {prop.views}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 text-muted-foreground">
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        <Calendar size={14} />
                        {prop.appointments}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-muted-foreground">
                    Nenhum imóvel cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
