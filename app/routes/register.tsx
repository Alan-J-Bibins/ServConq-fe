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
    const userFullName = String(formData.get('userFullName'));
    const userNickname = String(formData.get('userNickname'));
    const userPassword = String(formData.get('userPassword'));
    const userPasswordConfirm = String(formData.get('userPasswordConfirm'));

    if (userPassword !== userPasswordConfirm) {
        console.log("[app/routes/register.tsx:10] userPassword !== userPasswordConfirm = ", userPassword !== userPasswordConfirm)
        return { err: "Passwords Are Not Matching" };
    }
    // We need to check if the userNickname already exists, this is unique sooo


    return redirect("/login")

}

export default function Page() {
    const actionData = useActionData();
    return (
        <main>
            <h1 className="text-4xl font-bold">Register</h1>
            <br />
            <Form
                className="flex flex-col gap-4 "
                method="POST"
                action="/register"
            >
                <label>Enter Name: </label>
                <input
                    name="userFullName"
                    type="text"
                    required
                />
                <label>Enter Username: </label>
                <input
                    name="userNickname"
                    type="text"
                    required
                />
                <label>Enter Password: </label>
                <input
                    name="userPassword"
                    type="password"
                    required
                />
                <label>Confirm Password: </label>
                <input
                    name="userPasswordConfirm"
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

