import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { ClubPage } from "./pages/ClubPage";
import { TrainingPage } from "./pages/TrainingPage";
import { GalleryPage } from "./pages/GalleryPage";
import { ContactPage } from "./pages/ContactPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "club", Component: ClubPage },
      { path: "entrainements", Component: TrainingPage },
      { path: "galerie", Component: GalleryPage },
      { path: "contact", Component: ContactPage },
    ],
  },
]);
