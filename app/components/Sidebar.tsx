import { HardDrive, LayoutDashboard, UserRoundPen, UsersRound, type LucideIcon } from "lucide-react"
import { NavLink } from "react-router"

export default function Sidebar() {
    return (
        <aside className="flex flex-col justify-start items-center p-4 gap-4
            h-full border border-transparent border-r-secondary">
            <SidebarItem to="/center" Icon={HardDrive} />
            <SidebarItem to="/teams" Icon={UsersRound} />
            <SidebarItem to="/profile" Icon={UserRoundPen} />
        </aside>
    )
}

function SidebarItem({ to, Icon }: { to: string, Icon: LucideIcon }) {
    return (
        <NavLink to={to} className={({ isActive }) => `p-2 rounded-2xl transition-all border
            ${isActive
                ?
                "text-primary bg-gradient-to-b from-secondary/20 to-primary/20 border-t-secondary/40 \
                border-b-accent border-x-transparent shadow-custom shadow-accent/25 \
                hover:shadow-accent/40"
                : "text-secondary border-transparent hover:border-secondary/40 hover:text-primary hover:bg-secondary/20"}
            `}>
            <Icon size={24} />
        </NavLink>
    )
}
