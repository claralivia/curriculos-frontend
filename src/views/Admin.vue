<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  ShieldCheck,
  Plus,
  LogOut,
  Power,
  Crown,
  BadgeCheck,
  X,
  Loader2,
  UserPlus,
  Mail,
  Lock,
  User,
  RefreshCcw
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import api from '../lib/api';

const router = useRouter();

const usuarios = ref([]);
const loading = ref(false);
const processando = ref(false);

const modalNovoUsuarioAberto = ref(false);
const modalPlanoAberto = ref(false);

const novoUsuario = reactive({
  nome: '',
  email: '',
  password: '',
  role: 'user',
  status: 'ativo',
  plano: 'lite',
  premium: false
});

const usuarioSelecionado = ref(null);
const edicaoPlano = reactive({
  tipo: 'lite',
  premium: false,
  status: 'ativo'
});

const planoInfo = {
  lite: {
    label: 'LITE',
    limiteTemplates: 1,
    descricao: '1 template, sem criação de novos, sem exclusão e com marca d’água.'
  },
  pro: {
    label: 'PRO',
    limiteTemplates: 5,
    descricao: 'Até 5 templates, exclusão liberada e com marca d’água.'
  },
  vitalicio: {
    label: 'VITALÍCIO',
    limiteTemplates: -1,
    descricao: 'Templates ilimitados, exclusão liberada e sem marca d’água.'
  }
};

const usuariosOrdenados = computed(() => {
  return [...usuarios.value].sort((a, b) => a.nome.localeCompare(b.nome));
});

const getPlanoBadgeClass = (tipo) => {
  if (tipo === 'vitalicio') {
    return 'bg-emerald-50 text-emerald-600 border-emerald-200';
  }

  if (tipo === 'pro') {
    return 'bg-blue-50 text-blue-600 border-blue-200';
  }

  return 'bg-slate-100 text-slate-600 border-slate-200';
};

const getStatusBadgeClass = (status) => {
  return status === 'ativo'
    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
    : 'bg-red-50 text-red-500 border-red-200';
};

const formatarLimite = (limite) => {
  return limite === -1 ? 'Ilimitado' : `${limite}`;
};

const getLimitePorPlano = (tipo) => {
  if (tipo === 'vitalicio') return -1;
  if (tipo === 'pro') return 5;
  return 1;
};

const carregarUsuarios = async () => {
  loading.value = true;

  try {
    const { data } = await api.get('/admin/users');
    usuarios.value = Array.isArray(data) ? data : [];
  } catch {
    router.push('/dashboard');
  } finally {
    loading.value = false;
  }
};

const abrirModalNovoUsuario = () => {
  novoUsuario.nome = '';
  novoUsuario.email = '';
  novoUsuario.password = '';
  novoUsuario.role = 'user';
  novoUsuario.status = 'ativo';
  novoUsuario.plano = 'lite';
  novoUsuario.premium = false;
  modalNovoUsuarioAberto.value = true;
};

const fecharModalNovoUsuario = () => {
  modalNovoUsuarioAberto.value = false;
};

const criarUsuario = async () => {
  if (!novoUsuario.nome || !novoUsuario.email || !novoUsuario.password) return;

  processando.value = true;

  try {
    await api.post('/admin/users/new', {
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      password: novoUsuario.password,
      role: novoUsuario.role,
      status: novoUsuario.status,
      plano: {
        tipo: novoUsuario.plano,
        limiteTemplates: getLimitePorPlano(novoUsuario.plano),
        premium: novoUsuario.plano === 'vitalicio' ? true : novoUsuario.premium
      }
    });

    toast.success('Usuário criado com sucesso.');
    fecharModalNovoUsuario();
    await carregarUsuarios();
  } finally {
    processando.value = false;
  }
};

const abrirModalPlano = (usuario) => {
  usuarioSelecionado.value = usuario;
  edicaoPlano.tipo = usuario?.plano?.tipo || 'lite';
  edicaoPlano.premium = Boolean(usuario?.plano?.premium);
  edicaoPlano.status = usuario?.status || 'ativo';
  modalPlanoAberto.value = true;
};

const fecharModalPlano = () => {
  modalPlanoAberto.value = false;
  usuarioSelecionado.value = null;
};

const salvarPlanoUsuario = async () => {
  if (!usuarioSelecionado.value?._id) return;

  processando.value = true;

  try {
    await api.patch(`/admin/users/${usuarioSelecionado.value._id}`, {
      status: edicaoPlano.status,
      plano: {
        tipo: edicaoPlano.tipo,
        limiteTemplates: getLimitePorPlano(edicaoPlano.tipo),
        premium: edicaoPlano.tipo === 'vitalicio' ? true : edicaoPlano.premium
      }
    });

    toast.success('Plano atualizado com sucesso.');
    fecharModalPlano();
    await carregarUsuarios();
  } finally {
    processando.value = false;
  }
};

const alternarStatusRapido = async (usuario) => {
  try {
    const novoStatus = usuario.status === 'ativo' ? 'inativo' : 'ativo';

    await api.patch(`/admin/users/${usuario._id}`, {
      status: novoStatus
    });

    usuario.status = novoStatus;
    toast.success(`Usuário ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso.`);
  } catch {
    toast.error('Não foi possível alterar o status.');
  }
};

const handleLogout = () => {
  localStorage.clear();
  window.location.href = '/login';
};

onMounted(carregarUsuarios);
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
    <div class="max-w-7xl mx-auto space-y-6">
      <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div class="flex items-center gap-4">
          <div class="bg-emerald-100 text-emerald-600 p-3 rounded-2xl">
            <ShieldCheck size="24" />
          </div>

          <div>
            <h1 class="text-xl font-black tracking-tight text-slate-900">
              Central Admin
            </h1>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Gestão de usuários, planos e acessos
            </p>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            @click="carregarUsuarios"
            type="button"
            class="bg-slate-100 text-slate-700 px-4 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2"
          >
            <RefreshCcw size="14" />
            Atualizar
          </button>

          <button
            @click="abrirModalNovoUsuario"
            type="button"
            class="bg-emerald-600 text-white px-4 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2"
          >
            <Plus size="14" />
            Novo usuário
          </button>

          <button
            @click="handleLogout"
            type="button"
            class="bg-slate-900 text-white px-4 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2"
          >
            <LogOut size="14" />
            Sair
          </button>
        </div>
      </header>

      <section class="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100">
        <div class="p-6 border-b border-slate-100">
          <h2 class="text-lg font-black text-slate-800">Usuários</h2>
          <p class="text-sm text-slate-500">
            Altere planos, status e recursos premium.
          </p>
        </div>

        <div v-if="loading" class="p-6 text-sm text-slate-400">
          Carregando usuários...
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left min-w-[960px]">
            <thead class="bg-slate-50 border-b border-slate-100">
              <tr>
                <th class="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Usuário</th>
                <th class="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th class="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Plano</th>
                <th class="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Limite</th>
                <th class="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Premium</th>
                <th class="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Função</th>
                <th class="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ações</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100">
              <tr v-for="u in usuariosOrdenados" :key="u._id" class="hover:bg-slate-50/70">
                <td class="p-5">
                  <div class="font-bold text-sm text-slate-700">{{ u.nome }}</div>
                  <div class="text-[11px] text-slate-400">{{ u.email }}</div>
                </td>

                <td class="p-5">
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                    :class="getStatusBadgeClass(u.status)"
                  >
                    {{ u.status }}
                  </span>
                </td>

                <td class="p-5">
                  <span
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                    :class="getPlanoBadgeClass(u.plano?.tipo)"
                  >
                    <Crown size="12" />
                    {{ planoInfo[u.plano?.tipo || 'lite']?.label || 'LITE' }}
                  </span>
                </td>

                <td class="p-5 text-sm font-bold text-slate-600">
                  {{ formatarLimite(u.plano?.limiteTemplates ?? 1) }}
                </td>

                <td class="p-5">
                  <span
                    v-if="u.plano?.premium"
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-amber-50 text-amber-600 border-amber-200"
                  >
                    <BadgeCheck size="12" />
                    Ativo
                  </span>

                  <span
                    v-else
                    class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-slate-100 text-slate-500 border-slate-200"
                  >
                    Inativo
                  </span>
                </td>

                <td class="p-5">
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                    :class="u.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-slate-100 text-slate-600 border-slate-200'"
                  >
                    {{ u.role }}
                  </span>
                </td>

                <td class="p-5">
                  <div class="flex justify-end gap-2">
                    <button
                      @click="alternarStatusRapido(u)"
                      type="button"
                      class="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                      :title="u.status === 'ativo' ? 'Desativar usuário' : 'Ativar usuário'"
                    >
                      <Power size="15" />
                    </button>

                    <button
                      @click="abrirModalPlano(u)"
                      type="button"
                      class="px-4 py-3 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest"
                    >
                      Gerenciar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <div
      v-if="modalNovoUsuarioAberto"
      class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div class="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 class="text-lg font-black text-slate-800">Novo usuário</h2>
            <p class="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-bold">
              Criar novo acesso
            </p>
          </div>

          <button @click="fecharModalNovoUsuario" type="button" class="p-2 rounded-xl hover:bg-slate-100">
            <X size="18" class="text-slate-500" />
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div class="grid md:grid-cols-2 gap-4">
            <label class="block">
              <span class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Nome
              </span>
              <div class="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-4">
                <User size="16" class="text-slate-400 shrink-0" />
                <input
                  v-model="novoUsuario.nome"
                  type="text"
                  placeholder="Nome da cliente"
                  class="w-full bg-transparent outline-none text-sm"
                />
              </div>
            </label>

            <label class="block">
              <span class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                E-mail
              </span>
              <div class="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-4">
                <Mail size="16" class="text-slate-400 shrink-0" />
                <input
                  v-model="novoUsuario.email"
                  type="email"
                  placeholder="cliente@email.com"
                  class="w-full bg-transparent outline-none text-sm"
                />
              </div>
            </label>
          </div>

          <label class="block">
            <span class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Senha provisória
            </span>
            <div class="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-4">
              <Lock size="16" class="text-slate-400 shrink-0" />
              <input
                v-model="novoUsuario.password"
                type="text"
                placeholder="Digite uma senha provisória"
                class="w-full bg-transparent outline-none text-sm"
              />
            </div>
          </label>

          <div class="grid md:grid-cols-2 gap-4">
            <label class="block">
              <span class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Função
              </span>
              <select
                v-model="novoUsuario.role"
                class="w-full bg-slate-50 rounded-2xl px-4 py-4 outline-none text-sm"
              >
                <option value="user">Usuário</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <label class="block">
              <span class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Status
              </span>
              <select
                v-model="novoUsuario.status"
                class="w-full bg-slate-50 rounded-2xl px-4 py-4 outline-none text-sm"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </label>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <label class="block">
              <span class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Plano
              </span>
              <select
                v-model="novoUsuario.plano"
                class="w-full bg-slate-50 rounded-2xl px-4 py-4 outline-none text-sm"
              >
                <option value="lite">LITE</option>
                <option value="pro">PRO</option>
                <option value="vitalicio">VITALÍCIO</option>
              </select>
            </label>

            <label class="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-4 mt-6">
              <span class="text-sm font-semibold text-slate-700">Premium extra</span>
              <input
                v-model="novoUsuario.premium"
                :disabled="novoUsuario.plano === 'vitalicio'"
                type="checkbox"
                class="accent-emerald-500"
              />
            </label>
          </div>

          <div class="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-600">
            Limite automático do plano:
            <strong class="text-slate-800">
              {{ formatarLimite(getLimitePorPlano(novoUsuario.plano)) }}
            </strong>
          </div>
        </div>

        <div class="px-6 py-5 border-t border-slate-100 flex justify-end gap-3">
          <button
            @click="fecharModalNovoUsuario"
            type="button"
            class="px-4 py-3 rounded-2xl bg-slate-100 text-slate-600 text-xs font-black uppercase"
          >
            Cancelar
          </button>

          <button
            @click="criarUsuario"
            :disabled="processando"
            type="button"
            class="px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase flex items-center gap-2 disabled:opacity-70"
          >
            <Loader2 v-if="processando" size="14" class="animate-spin" />
            <UserPlus v-else size="14" />
            Criar usuário
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="modalPlanoAberto"
      class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div class="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 class="text-lg font-black text-slate-800">Gerenciar plano</h2>
            <p class="text-sm text-slate-500">
              {{ usuarioSelecionado?.nome }} • {{ usuarioSelecionado?.email }}
            </p>
          </div>

          <button @click="fecharModalPlano" type="button" class="p-2 rounded-xl hover:bg-slate-100">
            <X size="18" class="text-slate-500" />
          </button>
        </div>

        <div class="p-6 space-y-5">
          <label class="block">
            <span class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Status
            </span>
            <select
              v-model="edicaoPlano.status"
              class="w-full bg-slate-50 rounded-2xl px-4 py-4 outline-none text-sm"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </label>

          <div class="space-y-3">
            <span class="block text-[10px] font-black uppercase tracking-widest text-slate-400">
              Plano
            </span>

            <button
              v-for="tipo in ['lite', 'pro', 'vitalicio']"
              :key="tipo"
              @click="edicaoPlano.tipo = tipo"
              type="button"
              :class="edicaoPlano.tipo === tipo ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'"
              class="w-full text-left rounded-2xl border p-4"
            >
              <div class="flex items-center justify-between gap-4">
                <div>
                  <div class="text-sm font-black text-slate-800">
                    {{ planoInfo[tipo].label }}
                  </div>
                  <div class="text-xs text-slate-500 mt-1">
                    {{ planoInfo[tipo].descricao }}
                  </div>
                </div>

                <div class="text-xs font-black uppercase text-slate-500">
                  {{ formatarLimite(planoInfo[tipo].limiteTemplates) }}
                </div>
              </div>
            </button>
          </div>

          <label class="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-4">
            <div>
              <div class="text-sm font-semibold text-slate-700">Premium extra</div>
              <div class="text-xs text-slate-400 mt-1">
                Remove a marca d’água para LITE ou PRO
              </div>
            </div>

            <input
              v-model="edicaoPlano.premium"
              :disabled="edicaoPlano.tipo === 'vitalicio'"
              type="checkbox"
              class="accent-emerald-500"
            />
          </label>

          <div class="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-600">
            Limite final do usuário:
            <strong class="text-slate-800">
              {{ formatarLimite(getLimitePorPlano(edicaoPlano.tipo)) }}
            </strong>
          </div>
        </div>

        <div class="px-6 py-5 border-t border-slate-100 flex justify-end gap-3">
          <button
            @click="fecharModalPlano"
            type="button"
            class="px-4 py-3 rounded-2xl bg-slate-100 text-slate-600 text-xs font-black uppercase"
          >
            Cancelar
          </button>

          <button
            @click="salvarPlanoUsuario"
            :disabled="processando"
            type="button"
            class="px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase flex items-center gap-2 disabled:opacity-70"
          >
            <Loader2 v-if="processando" size="14" class="animate-spin" />
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  </div>
</template>