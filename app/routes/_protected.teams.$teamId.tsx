import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { serverSessionStorage } from "~/session.server";
import { Copy } from "lucide-react";
import { useState } from "react";

/* ------------------------- Types ------------------------- */

interface Team {
    id: string;
    name: string;
    description?: string;
    createdAt?: string;
    joinToken?: string;
}

interface LoaderData {
    team: Team | null;
    errorMessage: string | null;
}

/* ------------------------- Loader ------------------------- */

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
    const session = await serverSessionStorage.getSession(
        request.headers.get("Cookie"),
    );
    const token = session.get("token");
    const { teamId } = params;

    if (!teamId) {
        return { team: null, errorMessage: "Missing team ID" };
    }

    try {
        const res = await fetch(`${process.env.API_URL}/team/${teamId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            return { team: null, errorMessage: `Failed to load team (${res.status})` };
        }

        const data = await res.json();
        return {
            team: data.team ?? null,
            errorMessage: null,
        };
    } catch {
        return { team: null, errorMessage: "Unable to reach server" };
    }
};

/* ------------------------- Page ------------------------- */

export default function TeamDetailPage() {
    const { team, errorMessage } = useLoaderData() as LoaderData;
    const [copied, setCopied] = useState(false);

    if (errorMessage)
        return <main className="p-4 text-red-500">{errorMessage}</main>;

    if (!team)
        return <main className="p-4 text-secondary">Team not found.</main>;

    const handleCopy = async () => {
        if (!team.joinToken) return;
        await navigator.clipboard.writeText(team.joinToken);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <main className="p-6 flex flex-col gap-6 w-full h-full">

            {/* Title Section */}
            <section className="flex flex-col gap-4">
                <h1 className="text-4xl font-bold">{team.name}</h1>
                {team.description && (
                    <p className="text-secondary text-xl">{team.description}</p>
                )}
                {team.createdAt && (
                    <p className="text-sm opacity-70">
                        Created: {new Date(team.createdAt).toLocaleDateString()}
                    </p>
                )}
            </section>

            {/* ✅ Team Join Token Section — Single Block */}
            {team.joinToken && (
                <section className="border border-secondary rounded-2xl p-6 bg-secondary/10 shadow-md max-w-xl">
                    <div className="flex w-full justify-between items-center gap-4 flex-wrap">
                        <h2 className="text-2xl font-semibold whitespace-nowrap">
                            Team Join Token
                        </h2>

                        <div className="flex items-center gap-4">
                            <span
                                className="bg-secondary/20 px-4 py-2 rounded-xl text-lg font-mono"
                            >
                                {team.joinToken}
                            </span>

                            <button
                                onClick={handleCopy}
                                className="flex gap-2 items-center clickable px-4 py-2 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition"
                            >
                                <Copy size={18} />
                                {copied ? "Copied!" : "Copy"}
                            </button>
                        </div>
                    </div>

                    <p className="text-sm mt-3 opacity-60">
                        Share this with someone to allow them to join your team.
                        Do not post publicly.
                    </p>
                </section>

            )}
        </main>
    );
}
