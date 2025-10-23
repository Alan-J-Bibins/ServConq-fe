import { Outlet, redirect, useLoaderData, type LoaderFunctionArgs } from "react-router"
import Header from "~/components/Header";
import Sidebar from "~/components/Sidebar";
import { themeCookie } from "~/cookie.server";
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
    const cookieHeader = request.headers.get("Cookie")
    const cookie = (await themeCookie.parse(cookieHeader)) || {};
    console.log("[app/routes/_protected.tsx:18] cookie = ", cookie)
    const theme = cookie.theme || "dark";
    return { theme }
}

export default function Layout() {
    const { theme } = useLoaderData<typeof loader>();
    return (
        <main className="w-full h-full flex flex-col justify-start items-start">
            <Header initialTheme={theme}/>
            <div className="flex items-start justify-start h-full w-full">
                <Sidebar />
                <div className="bg-secondary/10 w-full h-full">
                    <Outlet />
                </div>
            </div>
        </main>
    )
}

