import { Outlet, redirect, type LoaderFunctionArgs } from "react-router"
import Sidebar from "~/components/Sidebar";
import { serverSessionStorage } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const session = await serverSessionStorage.getSession(request.headers.get("Cookie"));
    const token = session.get("token");
    if (!token) {
        return redirect("/login", {
            headers: {
                "Set-Cookie": await serverSessionStorage.destroySession(session)
            }
        })
    }
}

export default function Layout() {
    return (
        <main className="flex items-start justify-start">
            <Sidebar />
            <Outlet />
        </main>
    )
}

