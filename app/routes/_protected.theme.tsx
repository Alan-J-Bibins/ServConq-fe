import { themeCookie } from "../cookie.server";
import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const theme = formData.get("theme") as string;
    console.log("+++++++++++++++++Received req to change theme to ", theme)
    const cookieHeader = await themeCookie.serialize({ theme });
    return new Response(null, {
        headers: { "Set-Cookie": cookieHeader }
    });
}

