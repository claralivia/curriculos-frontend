<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { LogIn, Loader2, Mail, Lock, ShieldCheck } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import api from '../lib/api';

const router = useRouter();

const form = reactive({
  email: '',
  password: ''
});

const loading = ref(false);

const handleLogin = async () => {
  if (!form.email || !form.password || loading.value) return;

  loading.value = true;

  try {
    const { data } = await api.post(
      '/login',
      {
        email: form.email,
        password: form.password
      },
      {
        skipAuthRedirect: true
      }
    );

    localStorage.setItem('token', data.token);
    localStorage.setItem('userNome', data.nome);
    localStorage.setItem('userRole', data.role);

    toast.success('Login realizado com sucesso.');

    if (data.role === 'admin') {
      router.push('/admin');
      return;
    }

    router.push('/dashboard');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div class="px-8 pt-10 pb-6 text-center">
          <div class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <LogIn size="30" />
          </div>

          <div class="flex flex-col items-center">
            <h1 class="text-2xl font-black tracking-tight text-slate-900">
              CV Studio
            </h1>
            <p class="text-[10px] uppercase tracking-[0.25em] text-slate-400 mt-1">
              Resume Creator
            </p>
          </div>

          <div class="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-slate-500">
            <ShieldCheck size="14" />
            <span class="text-[10px] font-black uppercase tracking-widest">
              Acesso restrito
            </span>
          </div>
        </div>

        <div class="px-8 pb-8">
          <form @submit.prevent="handleLogin" class="space-y-4">
            <div class="space-y-3">
              <label class="block">
                <span class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  E-mail
                </span>
                <div class="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-4 shadow-sm">
                  <Mail size="16" class="text-slate-400 shrink-0" />
                  <input
                    v-model="form.email"
                    type="email"
                    placeholder="voce@empresa.com"
                    required
                    autocomplete="email"
                    class="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
                  />
                </div>
              </label>

              <label class="block">
                <span class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Senha
                </span>
                <div class="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-4 shadow-sm">
                  <Lock size="16" class="text-slate-400 shrink-0" />
                  <input
                    v-model="form.password"
                    type="password"
                    placeholder="Digite sua senha"
                    required
                    autocomplete="current-password"
                    class="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
                  />
                </div>
              </label>
            </div>

            <button
              type="submit"
              :disabled="loading || !form.email || !form.password"
              class="w-full mt-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <Loader2 v-if="loading" class="animate-spin" size="18" />
              <span>{{ loading ? 'Entrando...' : 'Acessar painel' }}</span>
            </button>
          </form>

          <div class="mt-8 pt-6 border-t border-slate-100 text-center">
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Conta inativa ou sem acesso?
            </p>
            <a
              href="`mailto:${process.env.VITE_SUPORTE_EMAIL}?subject=Solicitação de acesso ao CV Studio&body=Olá, gostaria de solicitar acesso ao CV Studio. Meu e-mail é ${form.email}.`"
              class="mt-2 inline-block text-sm font-semibold text-emerald-600 hover:underline"
            >
              Fale com a administração
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>