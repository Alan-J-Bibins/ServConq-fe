import { Outlet, redirect, type LoaderFunctionArgs } from "react-router"
import Header from "~/components/Header";
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
        <main className="w-full h-full flex flex-col justify-start items-start">
            <Header />
            <div className="flex items-start justify-start h-full w-full">
                <Sidebar />
                <div className="bg-secondary/10 w-full h-full">
                    <Outlet />
                </div>
            </div>
        </main>
    )
}

