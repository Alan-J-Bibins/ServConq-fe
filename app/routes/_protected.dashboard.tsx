import { Form, redirect, useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { serverSessionStorage } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const session = await serverSessionStorage.getSession(request.headers.get("Cookie"));
    const token = session.get("token");

    let res
    try {
        res = await fetch(`${process.env.API_URL}/restricted`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
    } catch (error) {
        console.log("Ah shit", error);
    }

    if (!res) {
        console.log("No response from server");
        return { msg: null };
    }

    const { msg } = await res.json();

    if (!msg) {
        console.log("Msg not received");
    }

    return { msg };
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const session = await serverSessionStorage.getSession(request.headers.get("Cookie"));

    return redirect("/login", {
        headers: {
            "Set-Cookie": await serverSessionStorage.destroySession(session),
        }
    })
}

export default function Page() {
    const { msg } = useLoaderData<typeof loader>();
    return (
        <div>
            <h1>{msg}</h1>
            Dashboard Page
            <Form
                method="POST"
                action="/dashboard"
            >
                <button
                    type="submit"
                >Sign Out</button>
            </Form>
        </div>
    )
}

