<script setup>
import { computed } from 'vue';
import { Crown, BadgeCheck, LifeBuoy } from 'lucide-vue-next';

const props = defineProps({
  planoAtual: {
    type: String,
    default: 'lite'
  },
  premiumAtivo: {
    type: Boolean,
    default: false
  },
  mostrarMarcaDagua: {
    type: Boolean,
    default: true
  },
  suporteHorario: {
    type: String,
    default: '08h às 20h'
  }
});

const emit = defineEmits(['upgrade', 'premium']);

const planoNome = computed(() => {
  if (props.planoAtual === 'pro') return 'PRO';
  if (props.planoAtual === 'vitalicio') return 'VITALÍCIO';
  return 'LITE';
});

const planoDescricaoCurta = computed(() => {
  if (props.planoAtual === 'vitalicio') {
    return 'Templates ilimitados, exclusão liberada e sem marca d’água.';
  }

  if (props.planoAtual === 'pro') {
    return 'Até 5 templates, exclusão liberada e marca d’água ativa.';
  }

  return '1 template, sem criação de novos, sem exclusão e com marca d’água ativa.';
});

const nomePlanoLimite = computed(() => {
  if (props.planoAtual === 'vitalicio') return 'Ilimitado';
  if (props.planoAtual === 'pro') return '5';
  return '1';
});

const planoBadgeClass = computed(() => {
  if (props.planoAtual === 'vitalicio') {
    return 'bg-emerald-50 text-emerald-600 border-emerald-200';
  }

  if (props.planoAtual === 'pro') {
    return 'bg-blue-50 text-blue-600 border-blue-200';
  }

  return 'bg-slate-100 text-slate-600 border-slate-200';
});
</script>

<template>
  <section class="p-5 bg-white rounded-4xl border border-slate-200 shadow-sm">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Seu plano
        </p>

        <div class="mt-2 flex items-center gap-2 flex-wrap">
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
            :class="planoBadgeClass"
          >
            <Crown size="12" />
            {{ planoNome }}
          </span>

          <span
            v-if="premiumAtivo"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-amber-50 text-amber-600 border-amber-200"
          >
            <BadgeCheck size="12" />
            Sem marca d’água
          </span>
        </div>

        <p class="mt-3 text-sm text-slate-600 leading-relaxed">
          {{ planoDescricaoCurta }}
        </p>
      </div>
    </div>

    <div class="mt-5 grid grid-cols-2 gap-3">
      <div class="rounded-2xl bg-slate-50 p-4 border border-slate-100">
        <div class="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Templates
        </div>
        <div class="mt-2 text-lg font-black text-slate-800">
          {{ nomePlanoLimite }}
        </div>
      </div>

      <div class="rounded-2xl bg-slate-50 p-4 border border-slate-100">
        <div class="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Marca d’água
        </div>
        <div class="mt-2 text-lg font-black text-slate-800">
          {{ mostrarMarcaDagua ? 'Ativa' : 'Removida' }}
        </div>
      </div>
    </div>

    <div class="mt-5 space-y-3">
      <button
        @click="emit('upgrade')"
        type="button"
        class="w-full px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest"
      >
        Mudar de plano
      </button>

      <button
        v-if="mostrarMarcaDagua"
        @click="emit('premium')"
        type="button"
        class="w-full px-4 py-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 text-xs font-black uppercase tracking-widest"
      >
        Remover marca d’água
      </button>

      <p class="text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
        <LifeBuoy size="12" />
        Suporte de {{ suporteHorario }}
      </p>
    </div>
  </section>
</template>
