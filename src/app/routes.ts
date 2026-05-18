import { createBrowserRouter } from "react-router";
import Layout from "./layouts/MainLayout";
import ChatbotPage from "./pages/chat/ChatbotPage";
import AdminPage from "./pages/admin/AdminPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: ChatbotPage },
      { path: "admin", Component: AdminPage },
    ],
  },
]);
