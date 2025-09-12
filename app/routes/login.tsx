import { Form, redirect, useActionData, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { serverSessionStorage } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const session = await serverSessionStorage.getSession(request.headers.get("Cookie"));
    const token = session.get("token");

    if (token) {
        return redirect("/dashboard")
    }

}

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const userEmail = String(formData.get('userEmail'));
    const userPassword = String(formData.get('userPassword'));
    console.log("[app/routes/login.tsx:5] userEmail = ", userEmail)
    console.log("[app/routes/login.tsx:7] userPassword = ", userPassword)

    let req;
    try {
        req = await fetch(`${process.env.API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: userEmail,
                password: userPassword
            })
        })
    } catch (error) {
        return { err: error }
    }

    const { token, error } = await req.json();
    console.log("[app/routes/login.tsx:15] token = ", token)

    if (error) {
        return { err: error }
    } else if (!token) {
        return { err: "Login Failed" }
    }

    const session = await serverSessionStorage.getSession();
    session.set("token", token);

    return redirect("/dashboard", {
        headers: {
            "Set-Cookie": await serverSessionStorage.commitSession(session),
        },
    });
}

export default function Page() {
    const actionData = useActionData();

    return (
        <main>
            <h1 className="text-4xl font-bold">Login</h1>
            <br />
            <Form
                method="POST"
                action="/login"
                className="flex flex-col gap-4"
            >
                <label>Email: </label>
                <input
                    name="userEmail"
                    type="email"
                    required
                />
                <label>Password: </label>
                <input
                    name="userPassword"
                    type="password"
                    required
                />
                <button
                    type="submit"
                    className="p-4 bg-blue-400 w-fit"
                >
                    Submit
                </button>
                {actionData?.err && (
                    <h4 className="text-red-500">
                        {actionData?.err}
                    </h4>
                )}
            </Form>
        </main>
    )
}

