import { Navigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import PageLoader from "./PageLoader";

const AdminProtectedRoute = ({ children }) => {
  const { isLoading, authUser } = useAuthUser();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!authUser || authUser.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
