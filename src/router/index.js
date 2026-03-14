import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import DashboardHome from '../views/DashboardHome.vue';
import DashboardEditor from '../views/DashboardEditor.vue';
import Admin from '../views/Admin.vue';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'dashboard-home',
    component: DashboardHome
  },
  {
    path: '/dashboard/cv/:id',
    name: 'dashboard-editor',
    component: DashboardEditor
  },
  {
    path: '/admin',
    name: 'admin',
    component: Admin
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  if (to.path !== '/login' && !token) {
    next('/login');
    return;
  }

  if (to.path === '/login' && token) {
    next(role === 'admin' ? '/admin' : '/dashboard');
    return;
  }

  if (to.path.startsWith('/admin') && role !== 'admin') {
    next('/dashboard');
    return;
  }

  next();
});

export default router;