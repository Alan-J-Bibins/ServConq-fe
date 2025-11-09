import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Form, useLoaderData, type LoaderFunctionArgs } from "react-router";
import CustomDialog from "~/components/Dialog";
import { getUserToken } from "~/utils/helpers";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const centerId = params.centerId;
    const userToken = await getUserToken(request)
    console.log("[app/routes/_protected.center.$centerId.settings.tsx:6] userToken = ", userToken)

    try {
        const res1 = await fetch(`${process.env.API_URL}/dataCenter/${centerId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        if (!res1.ok) {
            return new Error("Failed to load datacenter information")
        }

        const data1 = await res1.json();

        const res2 = await fetch(`${process.env.API_URL}/teamMember/${centerId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        if (!res2.ok) {
            return new Error("Failed to load team member information")
        }
        const data2 = await res2.json();

        return { dataCenter: data1.dataCenter, teamMember: data2.teamMember, error: null }

    } catch (error) {
        return { dataCenter: null, teamMemberr: null, error: error }
    }
}

export default function Page() {
    const { dataCenter, teamMember } = useLoaderData() as { dataCenter: DataCenter, teamMember: TeamMember };
    const [isEditing, setIsEditing] = useState<boolean>(false);

    return (
        <div className="p-4 w-full flex flex-col gap-4 overflow-auto">
            <div className="flex items-center w-full gap-2">
                <h1 className="text-3xl font-bold text-nowrap">Settings</h1>
                <hr className="w-full border-secondary" />
                {teamMember.role === 'OWNER' && (
                    <CustomDialog
                        title="Delete Data Center"
                        trigger={
                            <button className="clickableButAccent text-nowrap flex items-center gap-2">
                                <Trash2 />
                                Delete Data Center
                            </button>
                        }
                        submit={
                            <button
                                type="submit"
                                form="deleteDataCenterForm"
                                className="clickableButAccent">
                                Confirm
                            </button>
                        }
                        cancel={
                            <button className="clickable">
                                Cancel
                            </button>
                        }
                    >
                        <Form
                            id="deleteDataCenterForm"
                            method="POST"
                            action="/center"
                        >
                            <label>Permanently Delete {dataCenter.name}?</label>
                            <input
                                name="actionType"
                                value="deleteDataCenter"
                                hidden readOnly
                            />
                            <input
                                name="deleteDataCenterId"
                                value={dataCenter.id}
                                hidden readOnly
                            />
                        </Form>
                    </CustomDialog>
                )}
            </div>
            {dataCenter && (
                <Form
                    id="editDataCenterForm"
                    method="POST"
                    action=""
                    className="w-full flex flex-col gap-4"
                >
                    <label>Datacenter name</label>
                    <input
                        required
                        disabled
                        defaultValue={dataCenter.name}
                        className="inputField w-full"
                    />
                    <label>Datacenter Description</label>
                    <input
                        required
                        disabled
                        defaultValue={dataCenter.description}
                        className="inputField w-full"
                    />
                    <label>Datacenter Location</label>
                    <input
                        required
                        disabled
                        defaultValue={dataCenter.location}
                        className="inputField w-full"
                    />
                    <label>Team Assigned: {dataCenter.team.name}</label>
                    <div className="w-full flex flex-row-reverse">
                        {
                            !isEditing && (
                                <button
                                    className="clickable"
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Profile
                                </button>
                            )
                        }
                    </div>
                </Form>
            )}
        </div>
    )
}

