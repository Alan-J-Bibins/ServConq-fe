import { Outlet } from "react-router";
import CenterSectionSidebar from "~/components/CenterSectionSidebar";

export default function Layout() {
    return (
        <div className="h-full w-full flex">
            <CenterSectionSidebar />
            <Outlet />
        </div>
    )
}

