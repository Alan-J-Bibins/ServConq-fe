import { OctagonAlert, Plus } from "lucide-react";
import { Form, useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import CustomDialog from "~/components/Dialog";
import TeamCard from "~/components/TeamCard";
import { serverSessionStorage } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const session = await serverSessionStorage.getSession(request.headers.get("Cookie"))
    const token = session.get("token")

    try {
        const res = await fetch(`${process.env.API_URL}/team`, {
            headers: { "Authorization": `Bearer ${token}` },
        });

        if (!res.ok) {
            return { teamList: [], errorMessage: `Failed to load teams (${res.status})` };
        }

        const data = await res.json();

        if (data.error) {
            return { teamList: [], errorMessage: data.error };
        }

        const teamList: TeamListEntry[] = data.teamList || []
        return { teamList, errorMessage: null };
    } catch (err) {
        return { teamList: [], errorMessage: "Unable to reach server" };
    }
};


export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const actionType = String(formData.get("actionType"));

    const session = await serverSessionStorage.getSession(request.headers.get("Cookie"))
    const token = session.get("token")

    switch (actionType) {
        case "newTeam":
            const teamName = String(formData.get("teamName"))
            const teamDescription = String(formData.get("teamDescription"))

            let res;
            try {
                res = await fetch(`${process.env.API_URL}/team`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: teamName,
                        description: teamDescription
                    })
                })
            } catch (error) {
                return { err: error }
            }

            if (!res.ok) {
                return { err: "Could not create Team" }
            }

            const data = await res.json()
            if (data.error) {
                return { err: data.error }
            } else {
                return { err: null }
            }
        default:
            console.log("Invalid action")
    }
}

export default function Page() {
    const { teamList, errorMessage } = useLoaderData<typeof loader>();

    return (
        <main className="p-4 flex flex-col w-full h-full justify-start items-start gap-4">
            <div className="flex items-center w-full gap-2">
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
                    cancel={
                        <></>
                    }
                >
                    <Form
                        id="newTeamForm"
                        method="POST"
                        action="/teams"
                        className="flex flex-col gap-2"
                    >
                        <label>Team Name</label>
                        <input required name="teamName" type="text" placeholder="Enter Team Name" />
                        <label>Description</label>
                        <textarea
                            name="teamDescription"
                            placeholder="Enter Team Description"
                            className="resize-y h-28"
                        />
                        <input hidden readOnly name="actionType" value="newTeam" />
                    </Form>
                </CustomDialog>
            </div>

            {errorMessage ? (
                <div className="text-red-500 flex justify-center w-full items-center gap-2">
                    <OctagonAlert size={48} />
                    <span className="text-2xl">{errorMessage}</span>
                </div>
            ) : teamList.length === 0 ? (
                <div className="text-secondary flex justify-center w-full items-center gap-2">
                    <OctagonAlert size={48} />
                    <span className="text-4xl">Create a Team to get started</span>
                </div>
            ) : (
                <div className="grid grid-cols-6 w-full gap-4">
                    {teamList.map((entry) => (
                        <TeamCard
                            key={entry.team.id}
                            teamId={entry.team.id}
                            teamName={entry.team.name}
                            memberCount={entry.memberCount}
                        />
                    ))}
                </div>
            )}
        </main>
    );
}

