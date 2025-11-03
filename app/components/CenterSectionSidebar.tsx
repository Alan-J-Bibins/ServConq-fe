import type { ReactNode } from "react";
import { NavLink, useParams } from "react-router";

export default function CenterSectionSidebar() {

    const { centerId } = useParams()

    return (
        <div className="flex flex-col items-center gap-4 p-4 border-r border-r-secondary bg-background/25 motion-preset-blur-right">
            <h3 className="tracking-custom text-accent uppercase text-shadow-accent/25 text-shadow-lg text-nowrap"> Data Center Ops </h3>
            <CenterSectionSidebarItem to={`/center/${centerId}/overview`}>Overview</CenterSectionSidebarItem>
            <CenterSectionSidebarItem to={`/center/${centerId}/logs`}>Logs</CenterSectionSidebarItem>
            <CenterSectionSidebarItem to={`/center/${centerId}/settings`}>Settings</CenterSectionSidebarItem>
        </div>
    )
}

function CenterSectionSidebarItem({ to, children }: { to: string, children: ReactNode }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => ` w-full text-center text-lg p-2 rounded-2xl border border-transparent
            transition-all
            ${isActive ?
                    "text-accent bg-gradient-to-b from-secondary/20 to-primary/20 border-t-secondary/40 \
                    border-b-accent border-x-transparent shadow-custom shadow-accent/25"
                    : "text-primary hover:border-secondary/40 hover:text-primary hover:bg-secondary/20"}`
            }
        >
            {children}
        </NavLink>
    );
}
