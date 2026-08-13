import { createBrowserRouter } from "react-router-dom";
import AuditContainer from "../presentation/containers/Audit";
import FeatureFlagDetailContainer from "../presentation/containers/FeatureFlagDetail";
import FlagsContainer from "../presentation/containers/Flags";
import HomeContainer from "../presentation/containers/Home";
import LoginContainer from "../presentation/containers/Login";
import ProjectDetailContainer from "../presentation/containers/ProjectDetail";
import ProjectFlagsContainer from "../presentation/containers/ProjectFlags";
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
    path: "/audit",
    element: (
      <ProtectedRouteContainer>
        <AuditContainer />
      </ProtectedRouteContainer>
    )
  },
  {
    path: "/flags",
    element: (
      <ProtectedRouteContainer>
        <FlagsContainer />
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
    path: "/projects/:projectId/flags",
    element: (
      <ProtectedRouteContainer>
        <ProjectFlagsContainer />
      </ProtectedRouteContainer>
    )
  },
  {
    path: "/projects/:projectId/flags/:flagId",
    element: (
      <ProtectedRouteContainer>
        <FeatureFlagDetailContainer />
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
