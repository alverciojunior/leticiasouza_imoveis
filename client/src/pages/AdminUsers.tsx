import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Plus, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsers() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");

  // Create user form
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    name: "",
  });

  // Change password form
  const [changePasswordForm, setChangePasswordForm] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [createError, setCreateError] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");

  // Queries and mutations
  const { data: users = [], refetch: refetchUsers } = trpc.admin.listUsers.useQuery();
  const createUserMutation = trpc.admin.createUser.useMutation();
  const changePasswordMutation = trpc.admin.changePassword.useMutation();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");

    if (!createForm.email || !createForm.password || !createForm.name) {
      setCreateError("Todos os campos são obrigatórios");
      return;
    }

    if (createForm.password.length < 8) {
      setCreateError("Senha deve ter pelo menos 8 caracteres");
      return;
    }

    try {
      await createUserMutation.mutateAsync({
        email: createForm.email,
        password: createForm.password,
        name: createForm.name,
      });

      toast.success("Usuário criado com sucesso!");
      setCreateForm({ email: "", password: "", name: "" });
      setShowCreateForm(false);
      refetchUsers();
    } catch (error: any) {
      setCreateError(error.message || "Erro ao criar usuário");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError("");

    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      setChangePasswordError("As senhas não coincidem");
      return;
    }

    if (changePasswordForm.newPassword.length < 8) {
      setChangePasswordError("Nova senha deve ter pelo menos 8 caracteres");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        email: changePasswordForm.email,
        currentPassword: changePasswordForm.currentPassword,
        newPassword: changePasswordForm.newPassword,
      });

      toast.success("Senha alterada com sucesso!");
      setChangePasswordForm({
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowChangePasswordForm(false);
    } catch (error: any) {
      setChangePasswordError(error.message || "Erro ao alterar senha");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h2>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Criar Novo Usuário
          </h3>

          {createError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{createError}</p>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
                placeholder="usuario@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </label>
              <Input
                type="text"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
                placeholder="Nome completo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <Input
                type="password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
                placeholder="Mínimo 8 caracteres"
                required
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={createUserMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {createUserMutation.isPending ? "Criando..." : "Criar Usuário"}
              </Button>
              <Button
                type="button"
                onClick={() => setShowCreateForm(false)}
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Change Password Form */}
      {showChangePasswordForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Alterar Senha
          </h3>

          {changePasswordError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{changePasswordError}</p>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={changePasswordForm.email}
                onChange={(e) =>
                  setChangePasswordForm({
                    ...changePasswordForm,
                    email: e.target.value,
                  })
                }
                placeholder="usuario@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha Atual
              </label>
              <Input
                type="password"
                value={changePasswordForm.currentPassword}
                onChange={(e) =>
                  setChangePasswordForm({
                    ...changePasswordForm,
                    currentPassword: e.target.value,
                  })
                }
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha
              </label>
              <Input
                type="password"
                value={changePasswordForm.newPassword}
                onChange={(e) =>
                  setChangePasswordForm({
                    ...changePasswordForm,
                    newPassword: e.target.value,
                  })
                }
                placeholder="Mínimo 8 caracteres"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nova Senha
              </label>
              <Input
                type="password"
                value={changePasswordForm.confirmPassword}
                onChange={(e) =>
                  setChangePasswordForm({
                    ...changePasswordForm,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Confirme a nova senha"
                required
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {changePasswordMutation.isPending
                  ? "Alterando..."
                  : "Alterar Senha"}
              </Button>
              <Button
                type="button"
                onClick={() => setShowChangePasswordForm(false)}
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Data de Criação
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => {
                      setSelectedUserEmail(user.email);
                      setChangePasswordForm({
                        ...changePasswordForm,
                        email: user.email,
                      });
                      setShowChangePasswordForm(true);
                    }}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Lock className="w-4 h-4" />
                    Alterar Senha
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">Nenhum usuário cadastrado ainda</p>
        </div>
      )}
    </div>
  );
}
