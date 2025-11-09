import { Form, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { serverSessionStorage } from "~/session.server";
import { Copy, Pencil } from "lucide-react";
import { useState } from "react";
import CustomDialog from "~/components/Dialog";

/* ------------------------- Types ------------------------- */

interface Team {
    id: string;
    name: string;
    description?: string;
    createdAt?: Date;
    joinToken?: string;
    teamMembers: TeamMember[]
}

interface TeamMember {
    id: string
    joinedAt: Date
    role: "OPERATOR" | "ADMIN" | "OWNER"
    teamId: string
    user: User
}

interface User {
    id: string
    name: string
    email: string
}

interface LoaderData {
    team: Team | null;
    errorMessage: string | null;
    userMember: TeamMember | null;
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
            return { team: null, userMember: null, errorMessage: `Failed to load team (${res.status})` };
        }

        const data = await res.json();

        const res2 = await fetch(`${process.env.API_URL}/team/${teamId}/teamMember`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (!res2.ok) {
            return { team: null, userMember: null, errorMessage: `Failed to load team (${res.status})` };
        }
        const data2 = await res2.json();
        return {
            team: data.team ?? null,
            errorMessage: null,
            userMember: data2.teamMember ?? null,
        };
    } catch {
        return { team: null, userMember: null, errorMessage: "Unable to reach server" };
    }
};

/* ------------------------- Page ------------------------- */

export default function TeamDetailPage() {
    const { team, errorMessage, userMember } = useLoaderData() as LoaderData;
    console.log("[app/routes/_protected.teams.$teamId.tsx:86] userMember = ", userMember)
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
            <section className="flex justify-between">
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
                                    className="bg-secondary/20 px-4 py-2 rounded-2xl text-lg font-mono"
                                >
                                    {team.joinToken}
                                </span>

                                <button
                                    onClick={handleCopy}
                                    className="flex gap-2 items-center clickable px-4 py-2 bg-secondary/20 hover:bg-secondary/40 transition"
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
            </section>
            <h2 className="text-xl font-bold text-primary">Members</h2>
            <div className="bg-background/80 border border-secondary/40 rounded-2xl p-4">
                <table className="w-full border-collapse">
                    <thead className="text-lg text-left text-primary">
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {team.teamMembers.map((member) => (
                            <tr key={member.id}>
                                <td>{member.user.name}</td>
                                <td>{member.user.email}</td>
                                <td className="uppercase text-accent tracking-custom">{member.role}</td>
                                {userMember?.role === 'OWNER' && member.role !== 'OWNER' && (
                                    <td className="w-0">
                                        <CustomDialog
                                            title={`Edit Member "${member.user.name}"`}
                                            trigger={
                                                <button className="clickable"><Pencil size={16} className="text-primary" /></button>
                                            }
                                            submit={
                                                <button className="clickable">
                                                    Submit
                                                </button>
                                            }
                                            cancel={
                                                <button className="clickableButAccent">
                                                    Cancel
                                                </button>
                                            }
                                        >
                                            <Form
                                                id="editTeamMemberRoleForm"
                                                method="POST"
                                                className="flex flex-col gap-4"
                                            >
                                                <label>Role</label>
                                                <select name="memberRole" defaultValue={member.role} className="inputField">
                                                    <option>ADMIN</option>
                                                    <option>OPERATOR</option>
                                                </select>
                                            </Form>
                                        </CustomDialog>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </main>
    );
}
