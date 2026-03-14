<script setup>
import { Mail, Phone, MapPin } from 'lucide-vue-next';

defineProps(['cv']);
</script>

<template>
  <div class="w-[210mm] min-h-[297mm] bg-white flex text-slate-800 shadow-sm overflow-hidden border">
    <aside 
      :style="{ backgroundColor: cv.config?.primaryColor || '#4f9d76' }" 
      class="w-[70mm] p-8 text-white flex flex-col items-center"
    >
      <div v-if="cv.config?.hasPhoto" class="w-44 h-44 rounded-full border-[6px] border-white/30 overflow-hidden mb-10 shadow-xl">
        <img 
          :src="cv.dados?.foto || 'https://via.placeholder.com/200'" 
          class="w-full h-full object-cover"
          alt="Foto de Perfil"
        >
      </div>

      <div class="w-full space-y-6">
        <div>
          <h3 class="text-sm font-black tracking-[0.2em] mb-4 border-b border-white/40 pb-1 uppercase">Contato</h3>
          <ul class="space-y-3 text-[13px] font-medium leading-relaxed">
            <li class="flex items-start gap-3">
              <Phone size="16" class="mt-0.5 shrink-0" />
              <span>{{ cv.dados?.contato?.telemovel || '(+351) 939566042' }}</span>
            </li>
            <li class="flex items-start gap-3">
              <Mail size="16" class="mt-0.5 shrink-0" />
              <span class="break-all">{{ cv.dados?.contato?.email || 'paulacoelhopaula40@gmail.com' }}</span>
            </li>
            <li class="flex items-start gap-3">
              <MapPin size="16" class="mt-0.5 shrink-0" />
              <span>{{ cv.dados?.contato?.morada || 'Sintra, Portugal' }}</span>
            </li>
          </ul>
        </div>

        <div v-if="cv.dados?.idiomas?.length">
          <h3 class="text-sm font-black tracking-[0.2em] mb-4 border-b border-white/40 pb-1 uppercase">Idiomas</h3>
          <ul class="space-y-1 text-[13px]">
            <li v-for="idioma in cv.dados.idiomas" :key="idioma.lingua">
              <span class="font-bold uppercase">{{ idioma.lingua }}:</span> {{ idioma.nivel }}
            </li>
          </ul>
        </div>
      </div>
    </aside>

    <main class="flex-1 p-12 bg-white">
      <header class="mb-12">
        <h1 class="text-4xl font-black text-slate-900 leading-tight uppercase tracking-tighter mb-2">
          {{ cv.dados?.nome }}
        </h1>
        <p class="text-emerald-600 font-bold text-sm tracking-wide">
          Autorização de trabalho: Portuguesa
        </p>
      </header>

      <section v-if="cv.dados?.sobre" class="mb-10">
        <h2 
          :style="{ color: cv.config?.primaryColor || '#4f9d76', borderColor: cv.config?.primaryColor || '#4f9d76' }"
          class="text-lg font-black tracking-widest border-b-2 mb-4 pb-1 uppercase"
        >
          Sobre Mim
        </h2>
        <p class="text-sm leading-relaxed text-slate-600 text-justify">
          {{ cv.dados.sobre }}
        </p>
      </section>

      <section class="mb-10">
        <h2 
          :style="{ color: cv.config?.primaryColor || '#4f9d76', borderColor: cv.config?.primaryColor || '#4f9d76' }"
          class="text-lg font-black tracking-widest border-b-2 mb-6 pb-1 uppercase"
        >
          Experiência Profissional
        </h2>
        
        <div v-if="!cv.dados?.experiencias?.length" class="italic text-slate-400 text-sm">
          Nenhuma experiência adicionada.
        </div>

        <div v-for="(exp, index) in cv.dados?.experiencias" :key="index" class="mb-8 last:mb-0">
          <div class="flex justify-between items-baseline mb-1">
            <h3 class="font-black text-[15px] uppercase text-slate-800">
              {{ exp.cargo }}
            </h3>
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {{ exp.empresa }}
            </span>
          </div>
          <p class="text-[13px] leading-relaxed text-slate-600">
            {{ exp.descricao }}
          </p>
        </div>
      </section>

      <section v-if="cv.dados?.formacao?.length">
        <h2 
          :style="{ color: cv.config?.primaryColor || '#4f9d76', borderColor: cv.config?.primaryColor || '#4f9d76' }"
          class="text-lg font-black tracking-widest border-b-2 mb-6 pb-1 uppercase"
        >
          Educação e Formação
        </h2>
        <div v-for="(edu, idx) in cv.dados.formacao" :key="idx" class="mb-4">
          <h4 class="font-bold text-sm text-slate-800 uppercase">{{ edu.curso }}</h4>
          <p class="text-xs text-slate-500">{{ edu.status }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
@media screen {
  main {
    min-width: 140mm;
  }
}
</style>