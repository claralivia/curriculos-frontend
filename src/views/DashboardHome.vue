<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, LogOut } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import api from '../lib/api';
import PlanSummaryCard from '../components/PlanSummaryCard.vue';
import UpgradeModal from '../components/UpgradeModal.vue';
import TemplateCard from '../components/TemplateCard.vue';

const router = useRouter();

const SUPORTE_HORARIO = process.env.VITE_SUPORTE_HORARIO;
const SUPORTE_EMAIL = process.env.VITE_SUPORTE_EMAIL;
const SUPORTE_WHATSAPP = process.env.VITE_SUPORTE_WHATSAPP;

const PRECOS_PLANOS = {
  lite: process.env.VITE_PRECO_LITE,
  pro: process.env.VITE_PRECO_PRO,
  vitalicio: process.env.VITE_PRECO_VITALICIO,
  premiumExtra: process.env.VITE_PRECO_PREMIUM_EXTRA
};

const usuario = ref({
  nome: localStorage.getItem('userNome') || '',
  email: '',
  role: localStorage.getItem('userRole') || 'user',
  status: 'ativo',
  plano: {
    tipo: 'lite',
    limiteTemplates: 1,
    premium: false
  }
});

const curriculos = ref([]);
const loading = ref(false);
const carregandoUsuario = ref(false);

const modalUpgradeAberto = ref(false);
const tipoSolicitacaoUpgrade = ref('pro');

const nomeExibicao = computed(() => {
  return usuario.value?.nome?.trim() || 'Usuário';
});

const planoAtual = computed(() => usuario.value?.plano?.tipo || 'lite');
const premiumAtivo = computed(() => Boolean(usuario.value?.plano?.premium));

const mostrarMarcaDagua = computed(() => {
  if (premiumAtivo.value) return false;
  return planoAtual.value !== 'vitalicio';
});

const podeExcluirTemplate = computed(() => planoAtual.value !== 'lite');

const podeCriarTemplate = computed(() => {
  if (planoAtual.value === 'lite' && curriculos?.value?.length >= 1) return false;
  if (planoAtual.value === 'vitalicio') return true;
  return curriculos.value.length < 5;
});

const mensagemUpgrade = computed(() => {
  const nome = usuario.value?.nome || '';
  const plano =
    planoAtual.value === 'pro'
      ? 'PRO'
      : planoAtual.value === 'vitalicio'
      ? 'VITALÍCIO'
      : 'LITE';

  const solicitacao =
    tipoSolicitacaoUpgrade.value === 'premium'
      ? 'Remover marca d’água'
      : tipoSolicitacaoUpgrade.value === 'vitalicio'
      ? 'Migrar para VITALÍCIO'
      : 'Migrar para PRO';

  return `Olá! Gostaria de solicitar uma atualização no CV Studio.

Nome: ${nome}
Plano atual: ${plano}
Solicitação: ${solicitacao}

Horário de atendimento informado no app: ${SUPORTE_HORARIO}.
Obrigado!`;
});

const carregarUsuario = async () => {
  carregandoUsuario.value = true;

  try {
    const { data } = await api.get('/me');

    usuario.value = {
      nome: data?.nome || localStorage.getItem('userNome') || '',
      email: data?.email || '',
      role: data?.role || localStorage.getItem('userRole') || 'user',
      status: data?.status || 'ativo',
      plano: {
        tipo: data?.plano?.tipo || 'lite',
        limiteTemplates: data?.plano?.limiteTemplates ?? 1,
        premium: Boolean(data?.plano?.premium)
      }
    };

    if (data?.nome) {
      localStorage.setItem('userNome', data.nome);
    }

    if (data?.role) {
      localStorage.setItem('userRole', data.role);
    }
  } catch (error) {
    console.error('Erro ao carregar usuário:', error);
  } finally {
    carregandoUsuario.value = false;
  }
};

const carregarCurriculos = async () => {
  try {
    const response = await api.get('/my-cvs');
    curriculos.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Erro ao carregar currículos:', error);
    curriculos.value = [];
    toast.error('Não foi possível carregar os currículos.');
  }
};

const carregarDados = async () => {
  loading.value = true;

  try {
    await Promise.all([carregarUsuario(), carregarCurriculos()]);
  } finally {
    loading.value = false;
  }
};

const editarCV = (cv) => {
  router.push(`/dashboard/cv/${cv._id}`);
};

const excluirCV = async (cv) => {
  if (!podeExcluirTemplate.value) {
    abrirModalUpgrade('pro');
    return;
  }

  try {
    await api.delete(`/cv/${cv._id}`);
    toast.success('Currículo excluído com sucesso.');
    await carregarCurriculos();
  } catch {
    toast.error('Não foi possível excluir o currículo.');
  }
};

const criarNovoCV = async () => {
  if (!podeCriarTemplate.value) {
    abrirModalUpgrade('pro');
    return;
  }

  try {
    const { data } = await api.post('/cv/new', {
      tituloDocumento: `Currículo ${curriculos.value.length + 1}`
    });

    toast.success('Currículo criado com sucesso.');
    router.push(`/dashboard/cv/${data._id}`);
  } catch {
    toast.error('Não foi possível criar o currículo.');
  }
};

const abrirModalUpgrade = (tipo = 'pro') => {
  tipoSolicitacaoUpgrade.value = tipo;
  modalUpgradeAberto.value = true;
};

const fecharModalUpgrade = () => {
  modalUpgradeAberto.value = false;
};

const solicitarUpgradeWhatsApp = () => {
  const texto = encodeURIComponent(mensagemUpgrade.value);
  window.open(`https://wa.me/${SUPORTE_WHATSAPP}?text=${texto}`, '_blank');
};

const solicitarUpgradeEmail = () => {
  const assunto = encodeURIComponent('Solicitação de atualização de plano - CV Studio');
  const corpo = encodeURIComponent(mensagemUpgrade.value);
  window.location.href = `mailto:${SUPORTE_EMAIL}?subject=${assunto}&body=${corpo}`;
};

const handleLogout = () => {
  localStorage.clear();
  window.location.href = '/login';
};

onMounted(carregarDados);
</script>

<template>
  <div class="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
    <div class="max-w-7xl mx-auto space-y-6">
      <header class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="text-lg font-black tracking-tight text-slate-900">
            CV Studio
          </div>
          <div class="text-[10px] uppercase tracking-[0.25em] text-slate-400">
            Resume Creator
          </div>
          <div class="mt-3 text-sm text-slate-600">
            <template v-if="carregandoUsuario">
              Carregando dados...
            </template>
            <template v-else>
              Olá, <span class="font-bold text-slate-800">{{ nomeExibicao }}</span>
            </template>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            @click="criarNovoCV"
            type="button"
            class="px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2"
          >
            <Plus size="14" />
            Novo currículo
          </button>

          <button
            @click="handleLogout"
            type="button"
            class="px-4 py-3 rounded-2xl bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest flex items-center gap-2"
          >
            <LogOut size="14" />
            Sair
          </button>
        </div>
      </header>

      <PlanSummaryCard
        :plano-atual="planoAtual"
        :premium-ativo="premiumAtivo"
        :mostrar-marca-dagua="mostrarMarcaDagua"
        :suporte-horario="SUPORTE_HORARIO"
        @upgrade="abrirModalUpgrade('pro')"
        @premium="abrirModalUpgrade('premium')"
      />

      <section class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="text-lg font-black text-slate-800">Meus currículos</h2>
            <p class="text-sm text-slate-500">
              Escolha um template para editar ou criar um novo.
            </p>
          </div>
        </div>

        <div v-if="loading" class="text-sm text-slate-400">
          Carregando currículos...
        </div>

        <div
          v-else-if="!curriculos.length"
          class="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center"
        >
          <p class="text-sm font-bold text-slate-700">
            Nenhum currículo encontrado.
          </p>

          <p class="text-xs text-slate-400 mt-2">
            Crie seu primeiro template para começar.
          </p>

          <button
            @click="criarNovoCV"
            type="button"
            class="mt-4 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest inline-flex items-center gap-2"
          >
            <Plus size="14" />
            Novo currículo
          </button>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <TemplateCard
            v-for="cv in curriculos"
            :key="cv._id"
            :cv="cv"
            :pode-excluir="podeExcluirTemplate"
            @edit="editarCV"
            @delete="excluirCV"
          />

          <button
            type="button"
            @click="criarNovoCV"
            class="min-h-[240px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-3"
            :class="podeCriarTemplate ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-400'"
          >
            <Plus size="24" />
            <span class="text-sm font-black uppercase tracking-widest">
              {{ podeCriarTemplate ? 'Novo currículo' : 'Plano limitado' }}
            </span>
            <span class="text-xs max-w-[220px] text-center">
              {{
                podeCriarTemplate
                  ? 'Crie um novo template para outra vaga.'
                  : 'Seu plano atual não permite criar novos templates.'
              }}
            </span>
          </button>
        </div>
      </section>
    </div>

    <UpgradeModal
      :open="modalUpgradeAberto"
      :selected-type="tipoSolicitacaoUpgrade"
      :suporte-horario="SUPORTE_HORARIO"
      :precos="PRECOS_PLANOS"
      @close="fecharModalUpgrade"
      @select="tipoSolicitacaoUpgrade = $event"
      @whatsapp="solicitarUpgradeWhatsApp"
      @email="solicitarUpgradeEmail"
    />
  </div>
</template>