import { href, NavLink } from "react-router"

export default function Sidebar() {
    return (
        <aside className="h-full border border-transparent border-r-secondary">
            Sidebar
        </aside>
    )
}

function SidebarItem({ to }: { to: string }) {
    return (
        <NavLink to={to}>
        </NavLink>
    )
}
