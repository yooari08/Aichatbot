import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import ChatbotPage from "./components/ChatbotPage";
import AdminPage from "./components/AdminPage";

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
