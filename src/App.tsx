import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import AuthLayout from "./layout/AuthLayout";
import MainLayout from "./layout/MainLayout";

import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import Feeds from "./pages/Feeds";
import FeedDetails from "./pages/FeedDetails";
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAuthRoute from "./components/ProtectedAuthRoute";

import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth/signin" replace />,
  },

  {
    path: "auth",
    element: <ProtectedAuthRoute />,
    errorElement: <NotFound />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="signin" replace />,
          },
          {
            path: "signin",
            element: <SignIn />,
          },
          {
            path: "signup",
            element: <SignUp />,
          },
        ],
      },
    ],
  },

  {
    path: "social",
    element: <ProtectedRoute />,
    errorElement: <NotFound />,
    children: [
      {
        element: <MainLayout />,
        children: [
          // /social has no standalone page
          {
            index: true,
            element: <NotFound />,
          },
          {
            path: "feed",
            element: <Feeds />,
            children: [
              {
                path: "details",
                element: <FeedDetails />,
                errorElement: <NotFound />,
              },
            ],
          },
          {
            path: "profile",
            element: <Profile />,
          },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
