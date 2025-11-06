import {
    Form,
    useLoaderData,
    useActionData,
    useNavigation,
    type LoaderFunctionArgs,
    type ActionFunctionArgs,
} from "react-router";
import { serverSessionStorage } from "~/session.server";
import { useEffect, useState } from "react";

/* ---------------- Types ---------------- */

interface User {
    id: string;
    name: string;
    email: string;
    createdAt?: string;
}

interface LoaderData {
    user: User | null;
    errorMessage: string | null;
}

/* ---------------- Loader ---------------- */

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const session = await serverSessionStorage.getSession(
        request.headers.get("Cookie")
    );
    const token = session.get("token");

    try {
        const res = await fetch(`${process.env.API_URL}/user`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok)
            return { user: null, errorMessage: `Failed to load user (${res.status})` };

        const data = await res.json();
        return { user: data.user ?? null, errorMessage: null };
    } catch {
        return { user: null, errorMessage: "Unable to reach server" };
    }
};

/* ---------------- Action ---------------- */

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();

    const name = String(formData.get("name"));
    const email = String(formData.get("email"));

    const session = await serverSessionStorage.getSession(
        request.headers.get("Cookie")
    );
    const token = session.get("token");

    try {
        const res = await fetch(`${process.env.API_URL}/user`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email }),
        });

        if (!res.ok) return { error: "Failed to update profile" };

        return { success: "Profile updated successfully" };
    } catch {
        return { error: "Network error updating profile" };
    }
};

/* ---------------- Page ---------------- */

export default function ProfilePage() {
    const { user, errorMessage } = useLoaderData<LoaderData>();
    const actionData = useActionData() as any;
    const nav = useNavigation();

    const [isEditing, setIsEditing] = useState(false);
    const loading = nav.state !== "idle";

    /* 🔥 Auto-exit edit mode when update succeeds */
    useEffect(() => {
        if (actionData?.success) {
            setIsEditing(false);
        }
    }, [actionData]);

    if (errorMessage)
        return <main className="p-4 text-red-500">{errorMessage}</main>;

    if (!user)
        return <main className="p-4 text-secondary">User not found.</main>;

    return (
        <main className="p-6 max-w-2xl mx-auto flex flex-col gap-6">

            <h1 className="text-3xl font-bold">Profile</h1>

            {/* ✅ Inline update messages */}
            {actionData?.error && (
                <div className="text-red-500">{actionData.error}</div>
            )}
            {actionData?.success && (
                <div className="text-green-500">{actionData.success}</div>
            )}

            <Form method="POST" className="flex flex-col gap-6">

                {/* Username */}
                <label className="flex flex-col gap-1">
                    <span className="text-sm opacity-75">Username</span>
                    <input
                        className="inputField"
                        type="text"
                        name="name"
                        defaultValue={user.name}
                        disabled={!isEditing}
                    />
                </label>

                {/* Email */}
                <label className="flex flex-col gap-1">
                    <span className="text-sm opacity-75">Email</span>
                    <input
                        className="inputField"
                        type="email"
                        name="email"
                        defaultValue={user.email}
                        disabled={!isEditing}
                    />
                </label>

                {/* Buttons */}
                {isEditing ? (
                    <div className="flex gap-3 mt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="clickable"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>

                        <button
                            type="button"
                            className="clickable"
                            onClick={() => setIsEditing(false)}
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        className="clickable w-fit mt-2"
                        onClick={() => setIsEditing(true)}
                    >
                        Edit Profile
                    </button>
                )}

            </Form>

            {user.createdAt && (
                <p className="text-sm opacity-70">
                    Account Created:{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                </p>
            )}
        </main>
    );
}
