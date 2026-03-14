<script setup>
import { computed, reactive, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import _ from 'lodash';
import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { supabase } from '../lib/supabase';
import api from '../lib/api';
import BaseTemplate from '../templates/BaseTemplate.vue';
import PlanSummaryCard from '../components/PlanSummaryCard.vue';
import UpgradeModal from '../components/UpgradeModal.vue';
import {
  ArrowLeft,
  Printer,
  Plus,
  Trash2,
  Palette,
  Upload,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  FileText,
  ImageMinus,
  X,
  AlertTriangle,
  Eye,
  PencilLine,
  LogOut,
  GripVertical
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const router = useRouter();
const route = useRoute();

const SUPORTE_HORARIO = process.env.VITE_SUPORTE_HORARIO;
const SUPORTE_EMAIL = process.env.VITE_SUPORTE_EMAIL;
const SUPORTE_WHATSAPP = process.env.VITE_SUPORTE_WHATSAPP;

const PRECOS_PLANOS = {
  lite: process.env.VITE_PRECO_LITE,
  pro: process.env.VITE_PRECO_PRO,
  vitalicio: process.env.VITE_PRECO_VITALICIO,
  premiumExtra: process.env.VITE_PRECO_PREMIUM_EXTRA
};

const idAtivo = computed(() => route.params.id);

const loading = reactive({
  user: false,
  cv: false,
  action: false,
  pdf: false,
  upload: false
});

const modals = reactive({
  section: false,
  deleteCv: false,
  removePhoto: false,
  upgrade: false
});

const erro = ref('');
const abaMobile = ref('editar');
const novaSecaoTitulo = ref('');
const tipoSolicitacaoUpgrade = ref('pro');

const usuario = ref({
  nome: '',
  email: '',
  plano: {
    tipo: 'lite',
    limiteTemplates: 1,
    premium: false
  }
});

const cv = reactive({
  tituloDocumento: '',
  estilizacao: {
    corPrincipal: '#4f9d76',
    fontFamily: 'font-sans',
    exibirFoto: true,
    exibirSubtitulo: true
  },
  secoes: [],
  dados: {
    nome: '',
    subtitulo: '',
    foto: null,
    fotoPath: null,
    sobre: '',
    nacionalidade: '',
    autorizacaoTrabalho: '',
    contato: {
      telemovel: '',
      email: '',
      endereco: ''
    }
  }
});

const coresRapidas = ['#4f9d76', '#0f766e', '#1d4ed8', '#7c3aed', '#be123c', '#ea580c', '#334155', '#111827'];
const fontesDisponiveis = [
  {
    value: 'font-sans',
    titulo: 'Moderna',
    subtitulo: 'Sans',
    previewFamily: "'Inter', ui-sans-serif, system-ui, sans-serif"
  },
  {
    value: 'font-serif',
    titulo: 'Elegante',
    subtitulo: 'Serif',
    previewFamily: "'Playfair Display', Georgia, serif"
  },
  {
    value: 'font-mono',
    titulo: 'Técnica',
    subtitulo: 'Mono',
    previewFamily: "'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace"
  }
];

const corPrincipalHex = computed(() => {
  const valor = cv.estilizacao.corPrincipal || '#4f9d76';
  return valor.toUpperCase();
});

const planoAtual = computed(() => usuario.value?.plano?.tipo || 'lite');
const premiumAtivo = computed(() => Boolean(usuario.value?.plano?.premium));

const permissoes = computed(() => ({
  podeExcluir: planoAtual.value !== 'lite',
  podeEditarNome: planoAtual.value === 'vitalicio',
  marcaDagua: !premiumAtivo.value && planoAtual.value !== 'vitalicio'
}));

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

Horário de atendimento: ${SUPORTE_HORARIO}.

Obrigado!`;
});

const criarId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const getNomeArquivo = () => {
  const nome = cv.dados?.nome?.trim() || 'Curriculo';
  return nome.replace(/\s+/g, '_');
};

const normalizarSecao = (secao = {}) => ({
  id: secao.id || criarId(),
  titulo: secao.titulo || '',
  tipo: secao.tipo === 'itens' ? 'itens' : 'texto',
  conteudo: secao.conteudo || '',
  itens: Array.isArray(secao.itens)
    ? secao.itens.map((item) => ({
        id: item.id || criarId(),
        titulo: item.titulo || '',
        subtitulo: item.subtitulo || '',
        descricao: item.descricao || ''
      }))
    : []
});

const carregarDadosIniciais = async () => {
  loading.user = true;
  loading.cv = true;
  erro.value = '';

  try {
    const [{ data: userRes }, { data: cvRes }] = await Promise.all([
      api.get('/me'),
      api.get(`/cv/${route.params.id}`)
    ]);

    usuario.value = {
      nome: userRes?.nome || '',
      email: userRes?.email || '',
      plano: {
        tipo: userRes?.plano?.tipo || 'lite',
        limiteTemplates: userRes?.plano?.limiteTemplates ?? 1,
        premium: Boolean(userRes?.plano?.premium)
      }
    };

    Object.assign(cv, {
      tituloDocumento: cvRes?.tituloDocumento || '',
      estilizacao: {
        corPrincipal: cvRes?.estilizacao?.corPrincipal || '#4f9d76',
        fontFamily: cvRes?.estilizacao?.fontFamily || 'font-sans',
        exibirFoto: cvRes?.estilizacao?.exibirFoto ?? true,
        exibirSubtitulo: cvRes?.estilizacao?.exibirSubtitulo ?? true
      },
      secoes: Array.isArray(cvRes?.secoes) ? cvRes.secoes.map(normalizarSecao) : [],
      dados: {
        nome: cvRes?.dados?.nome || userRes?.nome || '',
        subtitulo: cvRes?.dados?.subtitulo || '',
        foto: cvRes?.dados?.foto || null,
        fotoPath: cvRes?.dados?.fotoPath || null,
        sobre: cvRes?.dados?.sobre || '',
        nacionalidade: cvRes?.dados?.nacionalidade || '',
        autorizacaoTrabalho: cvRes?.dados?.autorizacaoTrabalho || '',
        contato: {
          telemovel: cvRes?.dados?.contato?.telemovel || '',
          email: cvRes?.dados?.contato?.email || '',
          endereco: cvRes?.dados?.contato?.endereco || ''
        }
      }
    });
  } catch (error) {
    console.error(error);
    erro.value = 'Falha ao sincronizar dados.';
  } finally {
    loading.user = false;
    loading.cv = false;
  }
};

const salvar = _.debounce(async () => {
  if (!idAtivo.value) return;

  try {
    await api.put(`/cv/${idAtivo.value}`, cv, { silent: true });
  } catch (error) {
    console.error(error);
  }
}, 1000);

const handlePhoto = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  loading.upload = true;

  try {
    if (cv.dados.fotoPath) {
      await supabase.storage.from('avatars').remove([cv.dados.fotoPath]);
    }

    const path = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

    const { error } = await supabase.storage.from('avatars').upload(path, file);
    if (error) throw error;

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);

    cv.dados.foto = data.publicUrl;
    cv.dados.fotoPath = path;

    toast.success('Foto atualizada');
  } catch (error) {
    console.error(error);
    toast.error('Erro no upload');
  } finally {
    loading.upload = false;
    event.target.value = '';
  }
};

const removerFoto = async () => {
  loading.upload = true;

  try {
    if (cv.dados.fotoPath) {
      await supabase.storage.from('avatars').remove([cv.dados.fotoPath]);
    }

    cv.dados.foto = null;
    cv.dados.fotoPath = null;
    modals.removePhoto = false;

    toast.success('Foto removida com sucesso.');
  } catch (error) {
    console.error(error);
    toast.error('Erro ao remover foto.');
  } finally {
    loading.upload = false;
  }
};

const excluirCV = async () => {
  loading.action = true;

  try {
    await api.delete(`/cv/${idAtivo.value}`);
    toast.success('Currículo excluído.');
    router.push('/dashboard');
  } catch (error) {
    console.error(error);
    toast.error('Não foi possível excluir.');
  } finally {
    loading.action = false;
    modals.deleteCv = false;
  }
};

const adicionarSecao = () => {
  const titulo = novaSecaoTitulo.value.trim();
  if (!titulo) return;

  cv.secoes.push(
    normalizarSecao({
      titulo
    })
  );

  novaSecaoTitulo.value = '';
  modals.section = false;
  toast.success('Seção adicionada.');
};

const adicionarItem = (secao) => {
  if (!Array.isArray(secao.itens)) {
    secao.itens = [];
  }

  secao.itens.push({
    id: criarId(),
    titulo: '',
    subtitulo: '',
    descricao: ''
  });
};

const aplicarCorPrincipal = (valor = '') => {
  const normalizado = valor.trim();
  if (!/^#[0-9A-Fa-f]{6}$/.test(normalizado)) return;
  cv.estilizacao.corPrincipal = normalizado;
};

const alternarTipo = (secao) => {
  const novoTipo = secao.tipo === 'texto' ? 'itens' : 'texto';
  secao.tipo = novoTipo;

  if (novoTipo === 'texto') {
    secao.conteudo = secao.conteudo ?? '';
    return;
  }

  if (!Array.isArray(secao.itens)) {
    secao.itens = [];
  }

  secao.itens = secao.itens.map((item) => ({
    id: item.id || criarId(),
    titulo: item.titulo || '',
    subtitulo: item.subtitulo || '',
    descricao: item.descricao || ''
  }));

  if (secao.itens.length === 0) {
    adicionarItem(secao);
  }
};

const canvasColorContext = document.createElement('canvas').getContext('2d');

const normalizeCssColorValue = (value = '', fallback = '#000000') => {
  if (!value) return fallback;
  if (!/(oklch|oklab|color\()/i.test(value)) return value;

  try {
    if (!canvasColorContext) return fallback;
    canvasColorContext.fillStyle = '#000000';
    canvasColorContext.fillStyle = value;
    return canvasColorContext.fillStyle || fallback;
  } catch {
    return fallback;
  }
};

const aplicarFallbackCoresNoClone = (doc) => {
  const win = doc.defaultView;
  if (!win) return;

  const propsToInline = ['color', 'background-color', 'border-color', 'fill', 'stroke'];
  const nodes = [doc.documentElement, doc.body, ...doc.querySelectorAll('*')];

  nodes.forEach((node) => {
    if (!(node instanceof win.HTMLElement)) return;

    const computed = win.getComputedStyle(node);

    propsToInline.forEach((prop) => {
      const raw = computed.getPropertyValue(prop);
      const fallback = prop === 'background-color' ? '#ffffff' : '#0f172a';
      const safe = normalizeCssColorValue(raw, fallback);
      if (safe) {
        node.style.setProperty(prop, safe, 'important');
      }
    });

    const bgImage = computed.getPropertyValue('background-image');
    if (/(oklch|oklab|color\()/i.test(bgImage)) {
      node.style.setProperty('background-image', 'none', 'important');
    }
  });

  doc.documentElement.style.setProperty('background-color', '#ffffff', 'important');
  doc.body.style.setProperty('background-color', '#ffffff', 'important');

  const metaItems = doc.querySelectorAll('.cv-header__meta-item');
  metaItems.forEach((item) => {
    if (!(item instanceof win.HTMLElement)) return;
    item.style.setProperty('position', 'relative', 'important');
    item.style.setProperty('display', 'block', 'important');
    item.style.setProperty('width', '100%', 'important');
    item.style.setProperty('padding-left', '18px', 'important');
    item.style.setProperty('min-height', '14px', 'important');
    item.style.setProperty('line-height', '1.35', 'important');
  });

  const metaIcons = doc.querySelectorAll('.cv-header__meta-icon');
  metaIcons.forEach((iconWrap) => {
    if (!(iconWrap instanceof win.HTMLElement)) return;
    iconWrap.style.setProperty('position', 'absolute', 'important');
    iconWrap.style.setProperty('left', '0', 'important');
    iconWrap.style.setProperty('top', '50%', 'important');
    iconWrap.style.setProperty('transform', 'translateY(-50%)', 'important');
    iconWrap.style.setProperty('display', 'inline-flex', 'important');
    iconWrap.style.setProperty('align-items', 'center', 'important');
    iconWrap.style.setProperty('justify-content', 'center', 'important');
    iconWrap.style.setProperty('width', '12px', 'important');
    iconWrap.style.setProperty('height', '12px', 'important');
    iconWrap.style.setProperty('line-height', '0', 'important');
  });

  const iconSvgs = doc.querySelectorAll('.cv-header__meta-icon-svg');
  iconSvgs.forEach((svg) => {
    if (!(svg instanceof win.SVGElement)) return;
    svg.style.setProperty('display', 'block', 'important');
    svg.style.setProperty('width', '12px', 'important');
    svg.style.setProperty('height', '12px', 'important');
    svg.style.setProperty('overflow', 'visible', 'important');
    svg.style.setProperty('vertical-align', 'middle', 'important');
    svg.style.setProperty('color', 'rgba(255, 255, 255, 0.95)', 'important');
  });

  const metaLabels = doc.querySelectorAll('.cv-header__meta-label');
  metaLabels.forEach((label) => {
    if (!(label instanceof win.HTMLElement)) return;
    label.style.setProperty('display', 'block', 'important');
    label.style.setProperty('line-height', '1.35', 'important');
  });
};

const baixarPDF = () => {
  const previewContainer = document.getElementById('cv-preview-container');
  const elemento = previewContainer?.querySelector('.cv-page');
  if (!(elemento instanceof HTMLElement) || loading.pdf) return;

  loading.pdf = true;
  const nomeArquivo = `${getNomeArquivo()}.pdf`;
  const canvasWidth = elemento.scrollWidth;
  const canvasHeight = elemento.scrollHeight;

  toCanvas(elemento, {
    cacheBust: true,
    backgroundColor: '#ffffff',
    pixelRatio: 2,
    skipAutoScale: true,
    width: canvasWidth,
    height: canvasHeight,
    canvasWidth: canvasWidth * 2,
    canvasHeight: canvasHeight * 2,
    style: {
      transform: 'none',
      boxShadow: 'none',
      margin: '0'
    }
  })
    .then((canvas) => {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageWidth = pageWidth;
      const pageContentHeight = pageHeight;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      const imageData = canvas.toDataURL('image/png');
      const pageTolerance = 0.5;

      if (imageHeight <= pageContentHeight + pageTolerance) {
        pdf.addImage(imageData, 'PNG', 0, 0, imageWidth, imageHeight);
      } else {
        let heightLeft = imageHeight;
        let position = 0;

        pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight);
        heightLeft -= pageContentHeight;

        while (heightLeft > pageTolerance) {
          position -= pageContentHeight;
          pdf.addPage();
          pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight);
          heightLeft -= pageContentHeight;
        }
      }

      pdf.save(nomeArquivo);
      toast.success('Download concluído');
    })
    .catch((error) => {
      console.error(error);
      toast.error('Não foi possível gerar o PDF automaticamente.');
    })
    .finally(() => {
      loading.pdf = false;
    });
};

const imprimirCV = () => {
  const tituloOriginal = document.title;
  document.title = `Impressao_${getNomeArquivo()}`;

  window.print();

  setTimeout(() => {
    document.title = tituloOriginal;
  }, 500);
};

const mostrarEditorMobile = computed(() => abaMobile.value === 'editar');
const mostrarPreviewMobile = computed(() => abaMobile.value === 'visualizar');

const editorPaneClass = computed(() => ({
  flex: mostrarEditorMobile.value,
  hidden: !mostrarEditorMobile.value,
  'md:flex': true
}));

const previewPaneClass = computed(() => ({
  flex: mostrarPreviewMobile.value,
  hidden: !mostrarPreviewMobile.value,
  'md:flex': true
}));

const solicitarUpgradeWhatsApp = () => {
  const texto = encodeURIComponent(mensagemUpgrade.value);
  window.open(`https://wa.me/${SUPORTE_WHATSAPP}?text=${texto}`, '_blank');
};

const logout = () => {
  localStorage.clear();
  window.location.href = '/login';
};

watch(
  cv,
  () => {
    salvar();
  },
  { deep: true }
);

onMounted(carregarDadosIniciais);
</script>

<template>
  <div class="dashboard-editor-page flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-[#F8FAFC] text-slate-900 font-sans antialiased">
    <nav class="md:hidden no-print sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 p-3">
      <div class="flex bg-slate-100 p-1 rounded-xl">
        <button
          v-for="aba in ['editar', 'visualizar']"
          :key="aba"
          @click="abaMobile = aba"
          :class="abaMobile === aba ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'"
          class="flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <component :is="aba === 'editar' ? PencilLine : Eye" size="14" />
          {{ aba }}
        </button>
      </div>
    </nav>

    <aside
      :class="editorPaneClass"
      class="w-full md:w-96 lg:w-105 bg-white border-r border-slate-200 md:h-screen md:overflow-hidden flex-col no-print shrink-0"
    >
      <header class="sticky top-0 p-6 border-b border-slate-100 flex justify-between items-center bg-white z-20">
        <div class="flex items-center gap-3">
          <button @click="router.push('/dashboard')" class="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size="20" class="text-slate-400" />
          </button>

          <div>
            <h1 class="text-xl font-black tracking-tight bg-linear-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent">
              CV Studio
            </h1>
            <p class="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400">
              Builder Professional
            </p>
          </div>
        </div>

        <button @click="logout" class="group p-2 hover:bg-red-50 rounded-xl transition-all">
          <LogOut size="18" class="text-slate-300 group-hover:text-red-500" />
        </button>
      </header>

      <div class="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        <PlanSummaryCard
          :plano-atual="planoAtual"
          :premium-ativo="premiumAtivo"
          :mostrar-marca-dagua="permissoes.marcaDagua"
          :suporte-horario="SUPORTE_HORARIO"
          @upgrade="() => { tipoSolicitacaoUpgrade = 'pro'; modals.upgrade = true; }"
          @premium="() => { tipoSolicitacaoUpgrade = 'premium'; modals.upgrade = true; }"
        />

        <div v-if="erro" class="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {{ erro }}
        </div>

        <div v-if="loading.cv" class="flex flex-col items-center py-12 text-slate-400">
          <Loader2 class="animate-spin mb-2" />
          <span class="text-xs font-medium">Sincronizando currículo...</span>
        </div>

        <div v-else class="space-y-10 pb-24">
          <section class="group relative bg-slate-50 rounded-4xl p-5 border border-slate-100 transition-all hover:border-emerald-200">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-400">
                <Palette size="14" />
                Estilo & Design
              </div>

              <button
                v-if="permissoes.podeExcluir"
                @click="modals.deleteCv = true"
                class="text-red-400 hover:text-red-600 p-1"
              >
                <Trash2 size="16" />
              </button>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-4">
              <label
                v-for="opt in [{ l: 'FOTO', v: 'exibirFoto' }, { l: 'CARGO', v: 'exibirSubtitulo' }]"
                :key="opt.v"
                class="flex items-center justify-between p-3 bg-white rounded-2xl shadow-sm border border-transparent hover:border-emerald-100 cursor-pointer transition-all"
              >
                <span class="text-[10px] font-bold text-slate-500">{{ opt.l }}</span>
                <input
                  type="checkbox"
                  v-model="cv.estilizacao[opt.v]"
                  class="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-white p-2">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Selecionar fonte do currículo">
                <button
                  v-for="fonte in fontesDisponiveis"
                  :key="fonte.value"
                  type="button"
                  role="radio"
                  :aria-checked="cv.estilizacao.fontFamily === fonte.value"
                  @click="cv.estilizacao.fontFamily = fonte.value"
                  class="text-left rounded-xl border px-3 py-2.5 transition-all"
                  :class="cv.estilizacao.fontFamily === fonte.value
                    ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'"
                  :style="{ fontFamily: fonte.previewFamily }"
                >
                  <span class="block text-xs font-black uppercase tracking-wide text-slate-700">
                    {{ fonte.titulo }}
                  </span>
                  <span class="block text-[11px] text-slate-500">
                    {{ fonte.subtitulo }}
                  </span>
                </button>
              </div>
            </div>

            <div class="mt-3 rounded-2xl border border-slate-200 bg-white p-3 space-y-3">
              <div class="flex items-center gap-3">
                <label class="relative h-10 w-12 shrink-0 rounded-xl border border-slate-200 overflow-hidden cursor-pointer">
                  <input
                    type="color"
                    v-model="cv.estilizacao.corPrincipal"
                    class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  <span class="block h-full w-full" :style="{ backgroundColor: cv.estilizacao.corPrincipal }" />
                </label>

                <input
                  :value="corPrincipalHex"
                  @input="aplicarCorPrincipal($event.target.value)"
                  maxlength="7"
                  spellcheck="false"
                  class="flex-1 px-3 py-2 bg-slate-50 rounded-xl text-xs font-black tracking-wider uppercase border border-slate-200 outline-none focus:bg-white focus:border-emerald-500"
                  placeholder="#4F9D76"
                />
              </div>

              <div class="grid grid-cols-8 gap-2">
                <button
                  v-for="cor in coresRapidas"
                  :key="cor"
                  type="button"
                  @click="cv.estilizacao.corPrincipal = cor"
                  class="h-6 w-full rounded-lg border transition-all"
                  :class="cv.estilizacao.corPrincipal.toLowerCase() === cor.toLowerCase() ? 'border-slate-900 scale-105' : 'border-slate-200 hover:border-slate-400'"
                  :style="{ backgroundColor: cor }"
                  :title="`Usar ${cor}`"
                  :aria-label="`Usar cor ${cor}`"
                />
              </div>
            </div>
          </section>

          <section class="space-y-4">
            <h3 class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
              <User size="14" />
              Informações Pessoais
            </h3>

            <div class="flex gap-4 items-center mb-6">
              <div class="relative w-24 h-24 rounded-3xl bg-slate-100 border-4 border-white shadow-md overflow-hidden group">
                <img v-if="cv.dados.foto" :src="cv.dados.foto" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                  <User size="32" />
                </div>
                <div v-if="loading.upload" class="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <Loader2 class="animate-spin text-emerald-500" />
                </div>
              </div>

              <div class="flex-1 space-y-2">
                <label class="flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl cursor-pointer text-[10px] font-black uppercase transition-all">
                  <Upload size="14" />
                  {{ cv.dados.foto ? 'Alterar' : 'Subir Foto' }}
                  <input type="file" class="hidden" @change="handlePhoto" accept="image/*" />
                </label>

                <button
                  v-if="cv.dados.foto"
                  @click="modals.removePhoto = true"
                  class="flex items-center justify-center gap-2 w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase transition-all"
                >
                  <ImageMinus size="14" />
                  Remover
                </button>
              </div>
            </div>

            <div class="space-y-3">
              <div class="relative">
                <input
                  v-model="cv.dados.nome"
                  :disabled="!permissoes.podeEditarNome"
                  placeholder="Nome Completo"
                  class="w-full p-4 bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500 rounded-2xl text-sm font-semibold transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <div
                  v-if="!permissoes.podeEditarNome"
                  class="absolute right-4 top-4 text-[8px] font-black bg-slate-200 px-2 py-1 rounded text-slate-500 uppercase"
                >
                  Vitalício Only
                </div>
              </div>

              <input
                v-model="cv.dados.subtitulo"
                placeholder="Cargo ou Título Profissional"
                class="w-full p-4 bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500 rounded-2xl text-sm transition-all outline-none"
              />

              <div class="grid grid-cols-2 gap-3">
                <input
                  v-model="cv.dados.nacionalidade"
                  placeholder="Nacionalidade"
                  class="p-4 bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500 rounded-2xl text-sm transition-all outline-none"
                />

                <input
                  v-model="cv.dados.autorizacaoTrabalho"
                  placeholder="Visto/Autorização"
                  class="p-4 bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500 rounded-2xl text-sm transition-all outline-none"
                />
              </div>

              <textarea
                v-model="cv.dados.sobre"
                placeholder="Resumo profissional impactante..."
                class="w-full p-4 bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500 rounded-2xl text-sm transition-all outline-none h-32 resize-none shadow-inner"
              />
            </div>
          </section>

          <section class="space-y-4">
            <h3 class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
              <Mail size="14" />
              Contato
            </h3>

            <div class="space-y-3">
              <div class="flex items-center gap-3 bg-slate-50 border border-transparent focus-within:bg-white focus-within:border-emerald-500 rounded-2xl px-4 py-4 transition-all">
                <Mail size="16" class="text-slate-400 shrink-0" />
                <input
                  v-model="cv.dados.contato.email"
                  placeholder="E-mail"
                  class="w-full bg-transparent outline-none text-sm"
                />
              </div>

              <div class="flex items-center gap-3 bg-slate-50 border border-transparent focus-within:bg-white focus-within:border-emerald-500 rounded-2xl px-4 py-4 transition-all">
                <Phone size="16" class="text-slate-400 shrink-0" />
                <input
                  v-model="cv.dados.contato.telemovel"
                  placeholder="Telefone / Telemóvel"
                  class="w-full bg-transparent outline-none text-sm"
                />
              </div>

              <div class="flex items-center gap-3 bg-slate-50 border border-transparent focus-within:bg-white focus-within:border-emerald-500 rounded-2xl px-4 py-4 transition-all">
                <MapPin size="16" class="text-slate-400 shrink-0" />
                <input
                  v-model="cv.dados.contato.endereco"
                  placeholder="Endereço"
                  class="w-full bg-transparent outline-none text-sm"
                />
              </div>
            </div>
          </section>

          <section class="space-y-4">
            <h3 class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
              <FileText size="14" />
              Documento
            </h3>

            <input
              v-model="cv.tituloDocumento"
              placeholder="Nome do template"
              class="w-full p-4 bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500 rounded-2xl text-sm transition-all outline-none"
            />
          </section>

          <section class="space-y-6">
            <div class="flex justify-between items-center border-b border-slate-100 pb-2">
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Conteúdo Adicional
              </span>

              <button
                @click="modals.section = true"
                class="p-2 bg-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all"
              >
                <Plus size="18" />
              </button>
            </div>

            <div
              v-for="(secao, i) in cv.secoes"
              :key="secao.id"
              class="p-5 bg-slate-50 rounded-4xl border border-slate-100 space-y-4 group/sec relative"
            >
              <div class="flex items-center gap-3">
                <GripVertical size="16" class="text-slate-300 cursor-grab active:cursor-grabbing" />

                <input
                  v-model="secao.titulo"
                  class="font-black bg-transparent border-none text-[11px] uppercase outline-none text-slate-700 flex-1 focus:text-emerald-600"
                />

                <div class="flex gap-1">
                  <button
                    @click="alternarTipo(secao)"
                    class="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[8px] font-black uppercase text-slate-500 hover:border-emerald-500 transition-all"
                  >
                    {{ secao.tipo }}
                  </button>

                  <button
                    @click="cv.secoes.splice(i, 1)"
                    class="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size="14" />
                  </button>
                </div>
              </div>

              <textarea
                v-if="secao.tipo === 'texto'"
                v-model="secao.conteudo"
                placeholder="Descreva aqui..."
                class="w-full bg-white p-4 rounded-2xl text-xs outline-none border border-slate-200 focus:border-emerald-500 shadow-sm h-28 resize-none"
              />

              <div v-else class="space-y-3">
                <div
                  v-for="(item, j) in secao.itens"
                  :key="item.id"
                  class="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2"
                >
                  <div class="flex justify-between">
                    <span class="text-[8px] font-black text-slate-300 uppercase">
                      Item #{{ j + 1 }}
                    </span>

                    <button @click="secao.itens.splice(j, 1)" class="text-slate-300 hover:text-red-400">
                      <X size="12" />
                    </button>
                  </div>

                  <input
                    v-model="item.titulo"
                    placeholder="Título (Ex: Empresa X)"
                    class="w-full p-2 bg-slate-50 rounded-lg text-xs font-bold outline-none"
                  />

                  <input
                    v-model="item.subtitulo"
                    placeholder="Subtítulo (Ex: 2022 - 2024)"
                    class="w-full p-2 bg-slate-50 rounded-lg text-[11px] outline-none"
                  />

                  <textarea
                    v-model="item.descricao"
                    placeholder="Principais conquistas..."
                    class="w-full p-2 bg-slate-50 rounded-lg text-[11px] outline-none h-20 resize-none"
                  />
                </div>

                <button
                  @click="adicionarItem(secao)"
                  class="w-full py-3 border-2 border-dashed border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-emerald-500 rounded-2xl text-[10px] font-black uppercase transition-all"
                >
                  + Adicionar Item
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer class="sticky bottom-0 p-6 bg-white border-t border-slate-100 grid grid-cols-2 gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] z-20">
        <button
          @click="imprimirCV"
          class="flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all active:scale-95"
        >
          <Printer size="16" />
          Imprimir
        </button>

        <button
          @click="baixarPDF"
          :disabled="loading.pdf"
          class="flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95"
        >
          <Loader2 v-if="loading.pdf" size="16" class="animate-spin" />
          <FileText v-else size="16" />
          {{ loading.pdf ? 'Gerando...' : 'Baixar PDF' }}
        </button>
      </footer>
    </aside>

    <main
      :class="previewPaneClass"
      class="flex-1 md:h-screen md:overflow-y-auto bg-slate-200 p-4 md:p-12 justify-center items-start print:p-0 print:bg-white"
    >
      <div class="w-full flex justify-center">
        <div
          id="cv-preview-container"
          class="preview-card shadow-2xl bg-white print:shadow-none mx-auto transform transition-transform duration-500 hover:scale-[1.01]"
        >
          <BaseTemplate
            v-if="idAtivo"
            :cv="cv"
            :mostrar-marca-dagua="permissoes.marcaDagua"
          />
        </div>
      </div>
    </main>

    <div
      v-if="modals.section"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div class="w-full max-w-sm bg-white rounded-4xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 class="text-xl font-black text-slate-800 mb-1">Nova Seção</h2>
        <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-6">
          Personalize seu currículo
        </p>

        <input
          v-model="novaSecaoTitulo"
          @keyup.enter="adicionarSecao"
          placeholder="Ex: Idiomas, Hard Skills..."
          class="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 mb-6 font-semibold"
        />

        <div class="flex gap-3">
          <button
            @click="modals.section = false"
            class="flex-1 py-4 text-xs font-black uppercase text-slate-400"
          >
            Cancelar
          </button>

          <button
            @click="adicionarSecao"
            class="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase shadow-lg shadow-emerald-200"
          >
            Criar
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="modals.removePhoto"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div class="w-full max-w-sm bg-white rounded-4xl p-8 shadow-2xl">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
            <AlertTriangle size="20" class="text-red-500" />
          </div>
          <h2 class="text-xl font-black text-slate-800">Remover Foto?</h2>
        </div>

        <p class="text-sm text-slate-500 mb-6">
          A foto será removida permanentemente do currículo e do armazenamento.
        </p>

        <div class="flex gap-3">
          <button
            @click="modals.removePhoto = false"
            class="flex-1 py-4 text-xs font-black uppercase text-slate-400 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all"
          >
            Cancelar
          </button>

          <button
            @click="removerFoto"
            :disabled="loading.upload"
            class="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-xs font-black uppercase shadow-lg shadow-red-200 transition-all disabled:opacity-70"
          >
            Remover
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="modals.deleteCv"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div class="w-full max-w-sm bg-white rounded-4xl p-8 shadow-2xl">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
            <AlertTriangle size="20" class="text-red-500" />
          </div>
          <h2 class="text-xl font-black text-slate-800">Excluir Currículo?</h2>
        </div>

        <p class="text-sm text-slate-500 mb-6">
          Esta ação é irreversível. O currículo será apagado permanentemente.
        </p>

        <div class="flex gap-3">
          <button
            @click="modals.deleteCv = false"
            class="flex-1 py-4 text-xs font-black uppercase text-slate-400 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all"
          >
            Cancelar
          </button>

          <button
            @click="excluirCV"
            :disabled="loading.action"
            class="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-xs font-black uppercase shadow-lg shadow-red-200 transition-all disabled:opacity-70"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>

    <UpgradeModal
      :open="modals.upgrade"
      :selected-type="tipoSolicitacaoUpgrade"
      :suporte-horario="SUPORTE_HORARIO"
      :precos="PRECOS_PLANOS"
      @close="modals.upgrade = false"
      @select="tipoSolicitacaoUpgrade = $event"
      @whatsapp="solicitarUpgradeWhatsApp"
    />
  </div>
</template>

<style scoped>
.preview-card {
  width: 210mm;
  min-height: 297mm;
  background: white;
  transform-origin: top center;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

.pdf-exporting {
  background: #ffffff !important;
}

.pdf-exporting * {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

@media (max-width: 768px) {
  .preview-card {
    width: 210mm;
    zoom: 0.45;
  }
}

@media print {
  .dashboard-editor-page {
    display: block !important;
    height: auto !important;
    overflow: visible !important;
    background: #ffffff !important;
  }

  .dashboard-editor-page main {
    display: block !important;
    height: auto !important;
    overflow: visible !important;
    padding: 0 !important;
    margin: 0 !important;
    background: #ffffff !important;
  }

  .dashboard-editor-page .preview-card {
    width: 210mm !important;
    min-height: auto !important;
    margin: 0 auto !important;
  }

  .no-print {
    display: none !important;
  }

  body {
    background: white !important;
  }

  .preview-card {
    zoom: 1 !important;
    transform: none !important;
    box-shadow: none !important;
  }
}
</style>