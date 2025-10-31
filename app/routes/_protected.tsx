import { Outlet, redirect, useLoaderData, useNavigation, type LoaderFunctionArgs } from "react-router"
import Header from "~/components/Header";
import LoadingIndicator from "~/components/LoadingIndicator";
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
    const theme = cookie.theme || "dark";
    return { theme }
}

export default function Layout() {
    const { theme } = useLoaderData<typeof loader>();
    const navigation = useNavigation()
    const isNavigating = Boolean(navigation.location)
    return (
        <main className="w-full h-full flex flex-col justify-start items-start">
            <Header initialTheme={theme} />
            <div className="flex items-start justify-start h-full w-full">
                <Sidebar />
                <div className="bg-secondary/10 w-full h-full">
                    {isNavigating && <LoadingIndicator />}
                    <Outlet />
                </div>
            </div>
        </main>
    )
}

