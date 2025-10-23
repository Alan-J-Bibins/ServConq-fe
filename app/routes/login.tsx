import { Form, Link, redirect, useActionData, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
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
        console.log("Unkodes")
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
        console.log("OOOPP", error)
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
        <main className="h-screen flex justify-center items-center">
            <div className="bg-secondary/10 border border-secondary rounded-2xl p-4 w-full min-w-96 max-w-1/4 motion-blur-in motion-scale-in-105">
                <div className="flex gap-4 items-center">
                    <h1 className="tracking-custom text-accent uppercase text-shadow-accent/25 text-shadow-lg text-base">Login</h1>
                    <hr className="border-secondary w-full"/>
                </div>
                <br />
                <Form
                    method="POST"
                    action="/login"
                    className="flex flex-col gap-4"
                >
                    <label>Email </label>
                    <input
                        name="userEmail"
                        type="email"
                        placeholder="Enter Email"
                        required
                    />
                    <label>Password </label>
                    <input
                        name="userPassword"
                        type="password"
                        placeholder="Enter Password"
                        required
                    />
                    <br />
                    <button
                        type="submit"
                        className="clickable"
                    >
                        Submit
                    </button>
                    <p className="text-center text-lg w-full">Don't have an account?&nbsp;
                        <Link to="/register" className="text-accent hover:underline">Create an Account</Link>
                    </p>
                    {actionData?.err && (
                        <h4 className="text-red-500 text-center bg-red-500/20 rounded-2xl">
                            {String(actionData?.err)}
                        </h4>
                    )}
                </Form>
            </div>
        </main>
    )
}

