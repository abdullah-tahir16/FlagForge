import { useNavigate } from "react-router-dom";
import { useCurrentOrganization } from "../../../infrastructure/hooks/Organization/useCurrentOrganization";
import { useAuthUseCase } from "../../../infrastructure/useCases/Auth/useAuthUseCase";
import { useProjectUseCase } from "../../../infrastructure/useCases/Project/useProjectUseCase";

export const useFlagsFeature = () => {
  const auth = useAuthUseCase();
  const currentOrganizationQuery = useCurrentOrganization();
  const navigate = useNavigate();
  const projects = useProjectUseCase();

  const onLogout = async () => {
    await auth.logout();
    navigate("/login");
  };

  return {
    currentOrganization: currentOrganizationQuery.data,
    currentUser: auth.currentUser,
    isLoadingProjects: projects.isLoadingProjects,
    onLogout,
    projects: projects.projects,
    projectsErrorMessage: projects.projectsError ? "Projects could not be loaded." : null,
    title: "Flags"
  };
};
