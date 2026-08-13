import { createBrowserRouter } from "react-router-dom";
import AuditContainer from "../presentation/containers/Audit";
import FeatureFlagDetailContainer from "../presentation/containers/FeatureFlagDetail";
import FlagsContainer from "../presentation/containers/Flags";
import HomeContainer from "../presentation/containers/Home";
import LoginContainer from "../presentation/containers/Login";
import ProjectAnalyticsContainer from "../presentation/containers/ProjectAnalytics";
import ProjectDetailContainer from "../presentation/containers/ProjectDetail";
import ProjectFlagsContainer from "../presentation/containers/ProjectFlags";
import ProjectSegmentsContainer from "../presentation/containers/ProjectSegments";
import ProjectsContainer from "../presentation/containers/Projects";
import ProtectedRouteContainer from "../presentation/containers/ProtectedRoute";
import RegisterContainer from "../presentation/containers/Register";
import SegmentDetailContainer from "../presentation/containers/SegmentDetail";
import SegmentsContainer from "../presentation/containers/Segments";

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
    path: "/segments",
    element: (
      <ProtectedRouteContainer>
        <SegmentsContainer />
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
    path: "/projects/:projectId/analytics",
    element: (
      <ProtectedRouteContainer>
        <ProjectAnalyticsContainer />
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
    path: "/projects/:projectId/segments",
    element: (
      <ProtectedRouteContainer>
        <ProjectSegmentsContainer />
      </ProtectedRouteContainer>
    )
  },
  {
    path: "/projects/:projectId/segments/:segmentId",
    element: (
      <ProtectedRouteContainer>
        <SegmentDetailContainer />
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
