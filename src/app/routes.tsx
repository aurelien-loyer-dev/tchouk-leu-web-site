import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { ClubPage } from "./pages/ClubPage";
import { ContactPage } from "./pages/ContactPage";
import { PlanningPage } from "./pages/PlanningPage";
import { AdminPage } from "./pages/AdminPage";
import { OiboiPage } from "./pages/OiboiPage";
import { NotFoundPage } from "./pages/NotFoundPage";

const GalleryPage = lazy(() => import("./pages/GalleryPage").then(m => ({ default: m.GalleryPage })));

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "club", Component: ClubPage },
      { path: "planning", Component: PlanningPage },
      { path: "oiboi", Component: OiboiPage },
      { path: "galerie", element: <Suspense fallback={null}><GalleryPage /></Suspense> },
      { path: "contact", Component: ContactPage },
      { path: "admin", Component: AdminPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
