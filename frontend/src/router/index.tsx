import { createBrowserRouter } from "react-router-dom";
import HomeContainer from "../presentation/containers/Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeContainer />
  }
]);

export default router;
