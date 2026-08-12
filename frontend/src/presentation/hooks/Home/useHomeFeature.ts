import { useAppUseCase } from "../../../infrastructure/useCases/App/useAppUseCase";

export const useHomeFeature = () => {
  const app = useAppUseCase();

  return {
    title: "FlagForge",
    sections: ["Projects", "Flags", "Environments", "Audit"],
    ...app
  };
};
