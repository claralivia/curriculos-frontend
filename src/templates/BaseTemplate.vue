<script setup>
import { computed } from 'vue';

const props = defineProps({
  cv: {
    type: Object,
    required: true
  },
  mostrarMarcaDagua: {
    type: Boolean,
    default: true
  }
});

const corPrincipal = computed(() => props.cv?.estilizacao?.corPrincipal || '#4f9d76');
const fonteClasse = computed(() => props.cv?.estilizacao?.fontFamily || 'font-sans');

const dados = computed(() => props.cv?.dados || {});
const contato = computed(() => dados.value?.contato || {});
const secoes = computed(() => (Array.isArray(props.cv?.secoes) ? props.cv.secoes : []));

const temFoto = computed(() => {
  return Boolean(props.cv?.estilizacao?.exibirFoto && dados.value?.foto);
});

const exibirSubtitulo = computed(() => {
  return Boolean(props.cv?.estilizacao?.exibirSubtitulo && dados.value?.subtitulo);
});

const caixaAlta = computed(() => {
  return props.cv?.estilizacao?.caixaAlta || {
    nome: true,
    cargo: true,
    contatos: true,
    titulosSecao: true,
    titulosItem: true,
    subtitulosItem: true,
    textosGerais: false
  };
});

const estiloFoto = computed(() => {
  const tamanho = props.cv?.estilizacao?.tamanhoFoto || 'medio';
  const formato = props.cv?.estilizacao?.formatoFoto || 'circulo';
  
  let size = '30mm';
  if (tamanho === 'pequeno') size = '22mm';
  if (tamanho === 'grande') size = '38mm';
  
  let radius = '50%';
  if (formato === 'quadrado') radius = '0px';
  if (formato === 'arredondado') radius = '6mm';
  
  return {
    width: size,
    height: size,
    borderRadius: radius
  };
});

const infoContatoHeader = computed(() => {
  const itens = [];

  if (contato.value?.email) itens.push({ key: 'email', label: contato.value.email });
  if (contato.value?.telemovel) itens.push({ key: 'telemovel', label: contato.value.telemovel });
  if (contato.value?.endereco) itens.push({ key: 'endereco', label: contato.value.endereco });
  if (dados.value?.nacionalidade) itens.push({ key: 'nacionalidade', label: dados.value.nacionalidade });
  if (dados.value?.autorizacaoTrabalho) itens.push({ key: 'autorizacaoTrabalho', label: dados.value.autorizacaoTrabalho });

  return itens;
});
</script>

<template>
  <div
    :class="[
      'cv-page w-[210mm] bg-white mx-auto overflow-hidden print:shadow-none relative',
      fonteClasse,
      'espacamento-' + (cv.estilizacao?.espacamento || 'padrao'),
      'modelo-' + (cv.estilizacao?.modeloCabecalho || 'modelo1')
    ]"
    :style="{ '--cor-principal': corPrincipal }"
  >
    <div v-if="mostrarMarcaDagua" class="cv-watermark">
      CV STUDIO
    </div>

    <table class="w-full border-collapse relative z-1">
      <thead class="print-spacer">
        <tr>
          <td><div class="header-space"></div></td>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td>
            <header class="cv-header text-white" :style="{ backgroundColor: corPrincipal }">
              <div class="cv-header__layout">
                <div v-if="temFoto" class="cv-header__photo" :style="estiloFoto">
                  <img :src="dados.foto" alt="Foto do currículo" class="w-full h-full object-cover">
                </div>

                <div class="cv-header__content">
                  <div class="cv-header__identity">
                    <h1 class="cv-header__name" :style="{ textTransform: caixaAlta.nome ? 'uppercase' : 'none' }">
                      {{ dados.nome || 'Nome Completo' }}
                    </h1>

                    <p v-if="exibirSubtitulo" class="cv-header__role" :style="{ textTransform: caixaAlta.cargo ? 'uppercase' : 'none' }">
                      {{ dados.subtitulo }}
                    </p>
                  </div>

                  <div v-if="infoContatoHeader.length" class="cv-header__meta">
                    <div
                      v-for="item in infoContatoHeader"
                      :key="item.key"
                      class="cv-header__meta-item"
                      :style="{ textTransform: caixaAlta.contatos ? 'uppercase' : 'none' }"
                    >
                      <span class="cv-header__meta-icon" aria-hidden="true">
                        <svg v-if="item.key === 'email'" viewBox="0 0 24 24" class="cv-header__meta-icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
                          <path d="m3 7 9 7 9-7" />
                        </svg>
                        <svg v-else-if="item.key === 'telemovel'" viewBox="0 0 24 24" class="cv-header__meta-icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.85 19.85 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.85 19.85 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.62a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.46-1.28a2 2 0 0 1 2.11-.45c.84.29 1.72.5 2.62.62A2 2 0 0 1 22 16.92Z" />
                        </svg>
                        <svg v-else-if="item.key === 'endereco'" viewBox="0 0 24 24" class="cv-header__meta-icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 22s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z" />
                          <circle cx="12" cy="11" r="2.5" />
                        </svg>
                        <svg v-else-if="item.key === 'nacionalidade'" viewBox="0 0 24 24" class="cv-header__meta-icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M3 12h18" />
                          <path d="M12 3c2.7 2.4 4.2 5.6 4.2 9s-1.5 6.6-4.2 9c-2.7-2.4-4.2-5.6-4.2-9s1.5-6.6 4.2-9Z" />
                        </svg>
                        <svg v-else viewBox="0 0 24 24" class="cv-header__meta-icon-svg" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span class="cv-header__meta-label">{{ item.label }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <main class="cv-content">
              <section v-if="dados?.sobre" class="cv-section">
                <h2 class="cv-section__title" :style="{ color: corPrincipal, borderColor: corPrincipal, textTransform: caixaAlta.titulosSecao ? 'uppercase' : 'none' }">
                  Sobre Mim
                </h2>

                <p class="cv-section__text text-justify whitespace-pre-line" :style="{ textTransform: caixaAlta.textosGerais ? 'uppercase' : 'none' }">
                  {{ dados.sobre }}
                </p>
              </section>

              <template v-for="secao in secoes" :key="secao.id">
                <section
                  v-if="secao.visivel !== false"
                  class="cv-section"
                >
                  <h2 class="cv-section__title" :style="{ color: corPrincipal, borderColor: corPrincipal, textTransform: caixaAlta.titulosSecao ? 'uppercase' : 'none' }">
                    {{ secao.titulo }}
                  </h2>

                  <div v-if="secao.tipo === 'texto'" class="cv-section__text whitespace-pre-line" :style="{ textTransform: caixaAlta.textosGerais ? 'uppercase' : 'none' }">
                    {{ secao.conteudo }}
                  </div>

                  <div v-else class="cv-items">
                    <template v-for="(item, index) in secao.itens || []" :key="item.id || `${secao.id}-${index}`">
                      <article
                        v-if="item.visivel !== false"
                        class="cv-item"
                      >
                        <div class="cv-item__header">
                          <h3 class="cv-item__title" :style="{ textTransform: caixaAlta.titulosItem ? 'uppercase' : 'none' }">
                            {{ item.titulo }}
                          </h3>

                          <span v-if="item.subtitulo" class="cv-item__subtitle" :style="{ textTransform: caixaAlta.subtitulosItem ? 'uppercase' : 'none' }">
                            {{ item.subtitulo }}
                          </span>
                        </div>

                        <p v-if="item.descricao" class="cv-item__description whitespace-pre-line" :style="{ textTransform: caixaAlta.textosGerais ? 'uppercase' : 'none' }">
                          {{ item.descricao }}
                        </p>
                      </article>
                    </template>
                  </div>
                </section>
              </template>
            </main>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.cv-page {
  min-height: 297mm;
}

.cv-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-28deg);
  font-size: 108px;
  font-weight: 900;
  letter-spacing: 0.18em;
  color: rgba(15, 23, 42, 0.045);
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
  z-index: 0;
}

.cv-header {
  width: 100%;
  padding: 12mm 14mm 10mm;
}

.cv-header__layout {
  display: flex;
  align-items: flex-start;
  gap: 8mm;
}

.cv-header__photo {
  overflow: hidden;
  flex-shrink: 0;
  border: 1.2mm solid rgb(255 255 255 / 0.22);
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.18);
}

.cv-header__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4mm;
}

.cv-header__name {
  margin: 0;
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.04em;
  word-break: break-word;
}

.cv-header__role {
  margin-top: 4px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.22em;
  opacity: 0.9;
  word-break: break-word;
}

.cv-header__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2.5mm 4mm;
  padding-top: 3mm;
  border-top: 1px solid rgb(255 255 255 / 0.22);
}

.cv-header__meta-item {
  position: relative;
  display: block;
  width: 100%;
  padding-left: 18px;
  min-height: 14px;
  min-width: 0;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.35;
  word-break: break-word;
}

.cv-header__meta-icon {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  line-height: 0;
}

.cv-header__meta-icon-svg {
  width: 12px;
  height: 12px;
  display: block;
  color: rgb(255 255 255 / 0.95);
  opacity: 0.95;
}

.cv-header__meta-label {
  display: block;
  min-width: 0;
  line-height: 1.35;
}

.cv-content {
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

.cv-section {
  break-inside: avoid;
  page-break-inside: avoid;
}

.cv-section__title {
  margin: 0;
  border-bottom-width: 1.5px;
  border-bottom-style: solid;
  font-size: 13px;
  font-weight: 900;
  font-style: italic;
  line-height: 1.2;
}

.cv-section__text {
  font-size: 11px;
  line-height: 1.7;
  color: rgb(71 85 105);
}

.cv-items {
  display: flex;
  flex-direction: column;
}

.cv-item {
  break-inside: avoid;
  page-break-inside: avoid;
}

.cv-item__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 1.5mm;
}

.cv-item__title {
  margin: 0;
  font-size: 12px;
  font-weight: 900;
  line-height: 1.3;
  color: rgb(15 23 42);
}

.cv-item__subtitle {
  font-size: 9px;
  font-weight: 700;
  color: rgb(148 163 184);
  text-align: right;
  line-height: 1.3;
}

.cv-item__description {
  margin: 0;
  font-size: 11px;
  line-height: 1.7;
  color: rgb(71 85 105);
}

/* Espaçamentos */
.espacamento-compacto .cv-content {
  padding: 8mm 14mm 10mm;
  gap: 4mm;
}
.espacamento-compacto .cv-section__title {
  padding-bottom: 1.5mm;
  margin-bottom: 2mm;
}
.espacamento-compacto .cv-items {
  gap: 2.5mm;
}

.espacamento-padrao .cv-content {
  padding: 10mm 14mm 12mm;
  gap: 6mm;
}
.espacamento-padrao .cv-section__title {
  padding-bottom: 1.5mm;
  margin-bottom: 3mm;
}
.espacamento-padrao .cv-items {
  gap: 4mm;
}

.espacamento-espacoso .cv-content {
  padding: 12mm 14mm 14mm;
  gap: 8mm;
}
.espacamento-espacoso .cv-section__title {
  padding-bottom: 2.5mm;
  margin-bottom: 4mm;
}
.espacamento-espacoso .cv-items {
  gap: 6.5mm;
}

/* Modelos de Cabeçalho */
.modelo-modelo2 .cv-header__layout {
  flex-direction: row-reverse;
}

.modelo-modelo3 .cv-header {
  background-color: #ffffff !important;
  color: #0f172a !important;
  border-bottom: 4mm solid var(--cor-principal);
  padding-top: 14mm;
}
.modelo-modelo3 .cv-header__meta-icon-svg {
  color: var(--cor-principal) !important;
  opacity: 1;
}
.modelo-modelo3 .cv-header__role {
  color: var(--cor-principal) !important;
}
.modelo-modelo3 .cv-header__meta {
  border-top-color: rgb(15 23 42 / 0.1);
}
.modelo-modelo3 .cv-header__photo {
  border-color: var(--cor-principal);
}

.font-sans {
  font-family: 'Inter', sans-serif;
}

.font-serif {
  font-family: 'Playfair Display', serif;
}

.font-mono {
  font-family: 'Fira Code', monospace;
}

@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .cv-page {
    width: 210mm !important;
    min-height: auto;
    margin: 0 auto;
  }

  .cv-watermark {
    color: rgba(15, 23, 42, 0.05);
  }
}
</style>
