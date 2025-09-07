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
    const userNickname = String(formData.get('userNickname'));
    const userPassword = String(formData.get('userPassword'));
    console.log("[app/routes/login.tsx:5] userNickname = ", userNickname)
    console.log("[app/routes/login.tsx:7] userPassword = ", userPassword)

    // In reality, we should check the db if this username exists
    if (userNickname !== 'john') {
        return { err: "Username not recognized" }
    }

    const req = await fetch(`${process.env.API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: userNickname,
            password: userPassword
        })
    })
    const { token } = await req.json();
    console.log("[app/routes/login.tsx:15] token = ", token)

    if (!token) {
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
                <label>Username: </label>
                <input
                    name="userNickname"
                    type="text"
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

