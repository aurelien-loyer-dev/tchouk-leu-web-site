import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { ClubPage } from "./pages/ClubPage";
import { TrainingPage } from "./pages/TrainingPage";
import { GalleryPage } from "./pages/GalleryPage";
import { ContactPage } from "./pages/ContactPage";
import { PlanningPage } from "./pages/PlanningPage";
import { AdminPage } from "./pages/AdminPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "club", Component: ClubPage },
      { path: "planning", Component: PlanningPage },
      { path: "entrainements", Component: TrainingPage },
      { path: "galerie", Component: GalleryPage },
      { path: "contact", Component: ContactPage },
      { path: "admin", Component: AdminPage },
    ],
  },
]);
