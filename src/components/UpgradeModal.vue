<script setup>
import { computed } from 'vue';
import { X, MessageCircle, Mail } from 'lucide-vue-next';

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  selectedType: {
    type: String,
    default: 'pro'
  },
  suporteHorario: {
    type: String,
    default: '08h às 20h'
  },
  precos: {
    type: Object,
    default: () => ({
      lite: 'R$ 24,90',
      pro: 'R$ 54,90',
      vitalicio: 'R$ 119,90',
      premiumExtra: 'R$ 19,90'
    })
  }
});

const emit = defineEmits(['close', 'select', 'whatsapp', 'email']);

const cardClass = (tipo) =>
  props.selectedType === tipo
    ? 'border-emerald-500 bg-emerald-50'
    : 'border-slate-200 bg-white';

const premiumCardClass = computed(() =>
  props.selectedType === 'premium'
    ? 'border-amber-500 bg-amber-50'
    : 'border-slate-200 bg-white'
);
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
  >
    <div class="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div>
          <h2 class="text-lg font-black text-slate-800">Atualizar plano</h2>
          <p class="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-bold">
            Atendimento de {{ suporteHorario }}
          </p>
        </div>

        <button @click="emit('close')" type="button" class="p-2 rounded-xl hover:bg-slate-100">
          <X size="18" class="text-slate-500" />
        </button>
      </div>

      <div class="p-6 space-y-4">
        <div class="grid gap-3">
          <button
            type="button"
            @click="emit('select', 'pro')"
            :class="cardClass('pro')"
            class="w-full text-left rounded-2xl border p-4"
          >
            <div class="flex items-center justify-between gap-4">
              <div>
                <div class="text-sm font-black text-slate-800">Plano PRO</div>
                <div class="text-xs text-slate-500 mt-1">
                  Até 5 templates, exclusão liberada e marca d’água ativa.
                </div>
              </div>
              <div class="text-sm font-black text-emerald-600">
                {{ precos.pro }}
              </div>
            </div>
          </button>

          <button
            type="button"
            @click="emit('select', 'vitalicio')"
            :class="cardClass('vitalicio')"
            class="w-full text-left rounded-2xl border p-4"
          >
            <div class="flex items-center justify-between gap-4">
              <div>
                <div class="text-sm font-black text-slate-800">Plano VITALÍCIO</div>
                <div class="text-xs text-slate-500 mt-1">
                  Templates ilimitados, exclusão liberada e sem marca d’água.
                </div>
              </div>
              <div class="text-sm font-black text-emerald-600">
                {{ precos.vitalicio }}
              </div>
            </div>
          </button>

          <button
            type="button"
            @click="emit('select', 'premium')"
            :class="premiumCardClass"
            class="w-full text-left rounded-2xl border p-4"
          >
            <div class="flex items-center justify-between gap-4">
              <div>
                <div class="text-sm font-black text-slate-800">Remover marca d’água</div>
                <div class="text-xs text-slate-500 mt-1">
                  Recurso adicional para LITE ou PRO.
                </div>
              </div>
              <div class="text-sm font-black text-amber-600">
                {{ precos.premiumExtra }}
              </div>
            </div>
          </button>
        </div>

        <div class="rounded-2xl bg-slate-50 border border-slate-100 p-4">
          <div class="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Atendimento
          </div>
          <p class="mt-2 text-sm text-slate-600">
            Suporte disponível de <strong>{{ suporteHorario }}</strong>.
          </p>
        </div>
      </div>

      <div class="px-6 py-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
        <button
          @click="emit('whatsapp')"
          type="button"
          class="flex-1 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <MessageCircle size="14" />
          Solicitar via WhatsApp
        </button>

        <button
          @click="emit('email')"
          type="button"
          class="flex-1 px-4 py-3 rounded-2xl bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <Mail size="14" />
          Solicitar por e-mail
        </button>
      </div>
    </div>
  </div>
</template>