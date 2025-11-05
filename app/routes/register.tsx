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
    const userFullName = String(formData.get('userFullName'));
    const userEmail = String(formData.get('userEmail'));
    const userPassword = String(formData.get('userPassword'));
    const userPasswordConfirm = String(formData.get('userPasswordConfirm'));

    if (userPassword !== userPasswordConfirm) {
        console.log("[app/routes/register.tsx:10] userPassword !== userPasswordConfirm = ", userPassword !== userPasswordConfirm)
        return { err: "Passwords Are Not Matching" };
    }

    let req;
    try {
        req = await fetch(`${process.env.API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "applicaton/json"
            },
            body: JSON.stringify({
                name: userFullName,
                email: userEmail,
                password: userPassword,

            })
        })
    } catch (error) {
        return { err: error }
    }

    const { success, error } = await req.json();
    console.log("[app/routes/register.tsx:44] success = ", success)

    if (success && success === true) {
        return redirect("/login")
    } else if (error) {
        return { err: error }
    } else {
        return { err: "Registration Failed" }
    }


}

export default function Page() {
    const actionData = useActionData();
    return (
        <main className="h-screen flex justify-center items-center">
            <div className="bg-secondary/10 border border-secondary rounded-2xl p-4 w-full min-w-96 max-w-1/4 motion-blur-in motion-scale-in-105">
                <div className="flex gap-4 items-center">
                    <h1 className="tracking-custom text-accent uppercase text-shadow-accent/25 text-shadow-lg text-base">Register</h1>
                    <hr className="border-secondary w-full" />
                </div>
                <br />
                <Form
                    className="flex flex-col gap-4 "
                    method="POST"
                    action="/register"
                >
                    <label>Name </label>
                    <input className="inputField"
                        name="userFullName"
                        type="text"
                        placeholder="Enter Your Name"
                        required
                    />
                    <label>Email </label>
                    <input className="inputField"
                        name="userEmail"
                        type="email"
                        placeholder="Enter Your Email"
                        required
                    />
                    <label>Password </label>
                    <input className="inputField"
                        name="userPassword"
                        type="password"
                        placeholder="Enter Your Password"
                        required
                    />
                    <label>Confirm Password </label>
                    <input className="inputField"
                        name="userPasswordConfirm"
                        type="password"
                        placeholder="Enter Your Password Again"
                        required
                    />
                    <br />
                    <button
                        type="submit"
                        className="clickableButAccent"
                    >
                        Register
                    </button>
                    <p className="text-center text-lg w-full">Already have an account?&nbsp;
                        <Link to="/login" className="text-accent hover:underline">Login</Link>
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

