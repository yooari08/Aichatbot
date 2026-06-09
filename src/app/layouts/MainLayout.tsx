import { Outlet } from "react-router";

const Layout = () => {
  return (
    <div className="h-full">
      <Outlet />
    </div>
  );
}

export default Layout
