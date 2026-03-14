<script setup>
const props = defineProps({
  cv: {
    type: Object,
    required: true
  },
  podeExcluir: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['edit', 'delete']);

const corPrincipal = props.cv?.estilizacao?.corPrincipal || '#4f9d76';
</script>

<template>
  <article class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
    <div
      class="h-24 px-4 py-4 text-white flex items-start"
      :style="{ backgroundColor: corPrincipal }"
    >
      <div class="w-10 h-10 rounded-full bg-white/20 mr-3 shrink-0"></div>

      <div class="flex-1 min-w-0">
        <div class="text-sm font-black truncate">
          {{ cv.dados?.nome || 'Nome do candidato' }}
        </div>

        <div class="text-[10px] uppercase tracking-widest opacity-80 mt-1 truncate">
          {{ cv.dados?.subtitulo || 'Cargo' }}
        </div>
      </div>
    </div>

    <div class="p-4">
      <h3 class="text-sm font-black text-slate-800 truncate">
        {{ cv.tituloDocumento || 'Currículo sem título' }}
      </h3>

      <p class="mt-1 text-[11px] text-slate-400">
        Template salvo
      </p>

      <div class="mt-4 flex gap-2">
        <button
          @click="emit('edit', cv)"
          type="button"
          class="flex-1 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase"
        >
          Editar
        </button>

        <button
          @click="emit('delete', cv)"
          type="button"
          :disabled="!podeExcluir"
          class="px-4 py-3 rounded-2xl text-xs font-black uppercase border"
          :class="podeExcluir ? 'bg-red-50 text-red-500 border-red-100' : 'bg-slate-100 text-slate-300 border-slate-200'"
        >
          Excluir
        </button>
      </div>
    </div>
  </article>
</template>