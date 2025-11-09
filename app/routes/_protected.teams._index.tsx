import { OctagonAlert, Plus } from "lucide-react";
import {
    Form,
    useLoaderData,
    useActionData,
    type ActionFunctionArgs,
    type LoaderFunctionArgs,
} from "react-router";
import CustomDialog from "~/components/Dialog";
import TeamCard from "~/components/TeamCard";
import { serverSessionStorage } from "~/session.server";

/* -------------------- Types -------------------- */

export type TeamListEntry = {
    team: {
        id: string;
        name: string;
    };
    memberCount: number;
    role: "OWNER" | "ADMIN" | "OPERATOR";
};

interface LoaderData {
    teamList: TeamListEntry[];
    errorMessage: string | null;
}

/* -------------------- Loader -------------------- */

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const session = await serverSessionStorage.getSession(
        request.headers.get("Cookie"),
    );
    const token = session.get("token");

    try {
        const res = await fetch(`${process.env.API_URL}/team`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            return { teamList: [], errorMessage: `Failed to load teams (${res.status})` };
        }

        const data = await res.json();
        if (data.error) return { teamList: [], errorMessage: data.error };

        return { teamList: data.teamList ?? [], errorMessage: null };
    } catch {
        return { teamList: [], errorMessage: "Unable to reach server" };
    }
};

/* -------------------- Action -------------------- */

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const actionType = String(formData.get("actionType"));

    const session = await serverSessionStorage.getSession(
        request.headers.get("Cookie"),
    );
    const token = session.get("token");

    switch (actionType) {
        case "newTeam": {
            const teamName = String(formData.get("teamName"));
            const teamDescription = String(formData.get("teamDescription"));

            try {
                const res = await fetch(`${process.env.API_URL}/team`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name: teamName, description: teamDescription }),
                });

                if (!res.ok) return { error: "Could not create team" };

                return { success: "Team created successfully" };
            } catch {
                return { error: "Network error while creating team" };
            }
        }

        case "joinTeam": {
            const teamToken = String(formData.get("teamToken"));

            try {
                const res = await fetch(`${process.env.API_URL}/team/join`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token: teamToken }),
                });

                const data = await res.json();

                if (!res.ok) return { error: "Failed to join team" };

                if (data.alreadyJoined) {
                    if (data.role === "OWNER") {
                        return { warning: "You are already the owner of this team" };
                    }
                    return { warning: "You are already part of this team" };
                }

                return { success: "Successfully joined team" };
            } catch {
                return { error: "Network error while joining team" };
            }
        }

        default:
            return { error: "Invalid action type" };
    }
};

/* -------------------- UI Helper Components -------------------- */

function ErrorMessage({ message }: { message: string }) {
    return (
        <div className="text-red-500 flex justify-center w-full items-center gap-2">
            <OctagonAlert size={32} />
            <span>{message}</span>
        </div>
    );
}

function EmptyMessage({ text }: { text: string }) {
    return (
        <div className="text-secondary flex justify-center w-full items-center gap-2">
            <OctagonAlert size={32} />
            <span>{text}</span>
        </div>
    );
}

function TeamGrid({ list }: { list: TeamListEntry[] }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full gap-4">
            {list.map((entry) => (
                <TeamCard
                    key={entry.team.id}
                    teamId={entry.team.id}
                    teamName={entry.team.name}
                    memberCount={entry.memberCount}
                />
            ))}
        </div>
    );
}

/* -------------------- Page -------------------- */

export default function Page() {
    const { teamList, errorMessage } = useLoaderData<LoaderData>();
    const actionData = useActionData() as any;

    const ownedTeams: TeamListEntry[] = teamList.filter((t) =>
        ["OWNER"].includes(t.role),
    );

    const joinedTeams: TeamListEntry[] = teamList.filter((t) =>
        ["ADMIN", "OPERATOR"].includes(t.role),
    );      // no viewer role now

    return (
        <main className="p-4 flex flex-col w-full h-full justify-start items-start gap-4">

            {/* ----- Inline Action Feedback ----- */}
            {actionData?.error && <ErrorMessage message={actionData.error} />}
            {actionData?.warning && (
                <div className="text-yellow-400">{actionData.warning}</div>
            )}
            {actionData?.success && (
                <div className="text-green-400">{actionData.success}</div>
            )}

            {/* -------------------- OWNED TEAMS -------------------- */}
            <section className="flex items-center w-full gap-2">
                <h1 className="text-3xl font-bold text-nowrap">Teams You Own</h1>
                <hr className="w-full border-secondary" />

                <CustomDialog
                    title="New Team"
                    trigger={
                        <button className="clickable flex justify-center gap-2 items-center text-nowrap">
                            <Plus /> New Team
                        </button>
                    }
                    submit={
                        <button form="newTeamForm" type="submit" className="clickable">
                            Submit
                        </button>
                    }
                    cancel={<></>}
                >
                    <Form
                        id="newTeamForm"
                        method="POST"
                        action="/teams"
                        className="flex flex-col gap-2"
                    >
                        <label>Team Name</label>
                        <input className="inputField" required name="teamName" type="text" placeholder="Enter Team Name" />

                        <label>Description</label>
                        <textarea
                            name="teamDescription"
                            placeholder="Enter Team Description"
                            className="resize-y h-28 inputField"
                        />

                        <input hidden readOnly name="actionType" value="newTeam" />
                    </Form>
                </CustomDialog>
            </section>

            {errorMessage ? (
                <ErrorMessage message={errorMessage} />
            ) : ownedTeams.length === 0 ? (
                <EmptyMessage text="Create or join a team to get started" />
            ) : (
                <TeamGrid list={ownedTeams} />
            )}

            {/* -------------------- JOIN TEAM -------------------- */}
            <section className="flex items-center w-full gap-2 mt-10">
                <h1 className="text-3xl font-bold text-nowrap">Joined Teams</h1>
                <hr className="w-full border-secondary" />

                <CustomDialog
                    title="Join Team"
                    trigger={
                        <button className="clickable flex justify-center gap-2 items-center text-nowrap">
                            <Plus /> Join
                        </button>
                    }
                    submit={
                        <button form="joinTeamForm" type="submit" className="clickable">
                            Join
                        </button>
                    }
                    cancel={<></>}
                >
                    <Form
                        id="joinTeamForm"
                        method="POST"
                        action="/teams"
                        className="flex flex-col gap-2"
                    >
                        <label>Team Token</label>
                        <input className="inputField" required name="teamToken" type="text" placeholder="Enter Team Token" />

                        <input hidden readOnly name="actionType" value="joinTeam" />
                    </Form>
                </CustomDialog>
            </section>

            {joinedTeams.length === 0 ? (
                <EmptyMessage text="You haven't joined other teams" />
            ) : (
                <TeamGrid list={joinedTeams} />
            )}
        </main>
    );
}
