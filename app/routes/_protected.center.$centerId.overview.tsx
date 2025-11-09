import { OctagonAlert, Plus } from "lucide-react";
import { Suspense } from "react";
import { Await, Form, useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import CustomDialog from "~/components/Dialog";
import ServersList from "~/components/ServersList";
import ServerListEntrySkeleton from "~/components/skeleton/ServerListEntrySkeleton";
import { getUserToken } from "~/utils/helpers";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
    const centerId = params.centerId;
    const userToken = await getUserToken(request)

    try {
        const res = await fetch(`${process.env.API_URL}/teamMember/${centerId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        });

        const serverPromise = fetch(`${process.env.API_URL}/dataCenter/${centerId}/server`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        }).then(async (res) => {
            if (!res.ok) return [];
            const json = await res.json()
            return (json.serverList || [])
        })

        if (!res.ok) {
            throw new Error("Failed to fetch team member details");
        }

        const data = await res.json();
        if (data.error) {
            return { teamMembershipData: null, centerId, error: data.error, serverPromise }
        }

        const teamMembershipData: TeamMember = data.teamMember;
        return { teamMembershipData, centerId, error: null, serverPromise }

    } catch (error) {
        console.log("AH SHIT: ", error);
        return { teamMembershipData: null, centerId, error, serverPromise: null }
    }
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const centerId = params.centerId;
    const formData = await request.formData();
    const actionType = String(formData.get("actionType"))
    const userToken = await getUserToken(request);
    switch (actionType) {
        case "newServer": {
            const newServerHostname = String(formData.get("newServerHostname"));
            const newServerConnectionString = String(formData.get("newServerConnectionString"));
            const dataCenterId = String(formData.get("dataCenterId"));
            const teamId = String(formData.get("teamId"));

            console.log("here wer go", {
                dataCenterId: dataCenterId,
                hostname: newServerHostname,
                connectionString: newServerConnectionString,
                teamId: teamId
            })

            try {
                await fetch(`${process.env.API_URL}/server`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${userToken}`
                    },
                    body: JSON.stringify({
                        dataCenterId: dataCenterId,
                        hostname: newServerHostname,
                        connectionString: newServerConnectionString,
                        teamId: teamId
                    })
                })
            } catch (error) {
                console.log("OOPs: ", error)
            }
            break;
        }
        case "editServer": {
            const editServerHostname = formData.get("editServerHostname");
            const editServerConnectionString = formData.get("editServerConnectionString");
            const editServerId = formData.get("editServerId");

            try {
                await fetch(`${process.env.API_URL}/server`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${userToken}`
                    },
                    body: JSON.stringify({
                        hostname: editServerHostname,
                        serverId: editServerId,
                        connectionString: editServerConnectionString
                    })
                })
            } catch (error) {
                console.log("AH HSIT: ", error)
            }
            break;
        }
        case "deleteServer": {
            const serverId = formData.get("deleteServerId")
            try {
                const res = await fetch(`${process.env.API_URL}/dataCenter/${centerId}/server/${serverId}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${userToken}`
                    },
                })
                console.log("[app/routes/_protected.center.$centerId.overview.tsx:112] res = ", res)
            } catch (error) {
                console.log("AH HSIT: ", error)
            }
            break;
        }
        case "runCommand": {
            const serverId = String(formData.get("serverId"))
            const command = String(formData.get("command"))
            const pwd = String(formData.get("pwd"))
            try {
                const res = await fetch(`${process.env.API_URL}/run/${serverId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        command: command,
                        pwd: pwd
                    })
                })

                if (!res.ok) {
                    throw new Error("Command execution failed");
                }
                const json = await res.json();
                console.log("[app/routes/_protected.center.$centerId.overview.tsx:143] json.response = ", json)
                return { output: json.response.output, error: json.response.error, pwd: json.response.pwd };

            } catch (error) {
                return { output: null, error: `${error}` };
            }
        }
    }
}

export default function Page() {
    const { centerId, teamMembershipData, serverPromise } = useLoaderData<typeof loader>() as {
        centerId: string,
        teamMembershipData: TeamMember | null
        serverPromise: Promise<{ id: string; hostname: string }[]>;
    }
    return (
        <div className="p-4 w-full flex flex-col gap-4 overflow-auto scrollbar-hide">
            <div className="flex items-center w-full gap-2">
                <h1 className="text-3xl font-bold text-nowrap">Servers</h1>
                <hr className="w-full border-secondary" />
                {teamMembershipData?.role !== 'OPERATOR' && (
                    <CustomDialog
                        title="New Server"
                        trigger={
                            <button className="clickable text-nowrap flex gap-2 items-center"><Plus />New Server</button>
                        }
                        submit={
                            <button
                                className="clickable"
                                form="newServerForm"
                                type="submit"
                            >
                                Submit
                            </button>
                        }
                    >
                        <Form
                            id="newServerForm"
                            method="POST"
                            action={`/center/${centerId}/overview`}
                            className="flex flex-col gap-4"
                        >
                            <label>Hostname</label>
                            <input
                                className="inputField"
                                required
                                type="text"
                                name="newServerHostname"
                                placeholder="Enter Server Name"
                            />
                            <label>Connection String</label>
                            <input className="inputField"
                                required
                                type="text"
                                name="newServerConnectionString"
                                placeholder="Enter Connection String Given By Agent Binary"
                            />
                            <input hidden readOnly name="dataCenterId" value={centerId} />
                            <input hidden readOnly name="teamId" value={teamMembershipData?.teamId} />
                            <input hidden readOnly name="actionType" value="newServer" />
                        </Form>
                    </CustomDialog>
                )}
            </div>
            {teamMembershipData && (
                <Suspense fallback={
                    <div className="w-full flex gap-4 flex-col">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <ServerListEntrySkeleton key={i} />
                        ))}
                    </div>
                }>
                    <Await resolve={serverPromise} errorElement={<div>Failed to load servers</div>}>
                        {(servers) => {
                            if (!servers || servers.length === 0) {
                                return (
                                    <div className="text-secondary flex justify-center w-full items-center gap-2">
                                        <OctagonAlert size={48} />
                                        <span className="text-4xl">Create a Server to get started</span>
                                    </div>
                                );
                            }
                            return (
                                <div className="w-full">
                                    <ServersList servers={servers} centerId={centerId} teamMembershipData={teamMembershipData} />
                                </div>
                            );
                        }}
                    </Await>
                </Suspense>
            )}
            <div>
            </div>
        </div>
    )
}

