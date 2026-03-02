import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/pages/HomePage.vue"),
    meta: { title: "AliDevHub" },
  },
  {
    path: "/post/:id",
    name: "Post",
    component: () => import("@/pages/PostDetail.vue"),
    meta: { title: "Post" },
  },
  {
    path: "/author/:id",
    name: "AuthorProfile",
    component: () => import("@/pages/AuthorProfile.vue"),
    meta: { title: "Author" },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/pages/LoginPage.vue"),
    meta: { title: "Login", guest: true },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/pages/RegisterPage.vue"),
    meta: { title: "Register", guest: true },
  },
  {
    path: "/create",
    name: "CreatePost",
    component: () => import("@/pages/CreatePost.vue"),
    meta: { title: "New Post", auth: true },
  },
  {
    path: "/edit/:id",
    name: "EditPost",
    component: () => import("@/pages/EditPost.vue"),
    meta: { title: "Edit Post", auth: true },
  },
  {
    path: "/admin",
    name: "Admin",
    component: () => import("@/pages/AdminDashboard.vue"),
    meta: { title: "Admin", admin: true },
  },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore();
  if (auth.token && !auth.user) await auth.fetchUser();
  if (to.meta.auth && !auth.isLoggedIn)
    return next({ name: "Login", query: { redirect: to.fullPath } });
  if (to.meta.guest && auth.isLoggedIn) return next({ name: "Home" });
  if (to.meta.admin && !auth.isAdmin) return next({ name: "Home" });
  next();
});

export default router;
