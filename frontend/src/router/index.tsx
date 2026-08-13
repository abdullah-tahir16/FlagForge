import { createBrowserRouter } from "react-router-dom";
import HomeContainer from "../presentation/containers/Home";
import LoginContainer from "../presentation/containers/Login";
import ProjectDetailContainer from "../presentation/containers/ProjectDetail";
import ProjectsContainer from "../presentation/containers/Projects";
import ProtectedRouteContainer from "../presentation/containers/ProtectedRoute";
import RegisterContainer from "../presentation/containers/Register";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRouteContainer>
        <HomeContainer />
      </ProtectedRouteContainer>
    )
  },
  {
    path: "/projects",
    element: (
      <ProtectedRouteContainer>
        <ProjectsContainer />
      </ProtectedRouteContainer>
    )
  },
  {
    path: "/projects/:projectId",
    element: (
      <ProtectedRouteContainer>
        <ProjectDetailContainer />
      </ProtectedRouteContainer>
    )
  },
  {
    path: "/login",
    element: <LoginContainer />
  },
  {
    path: "/register",
    element: <RegisterContainer />
  }
]);

export default router;
