import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Form, useActionData, useLoaderData, useNavigation, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
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

export const action = async ({ request, params }: ActionFunctionArgs) => {
    console.log("CHECKPOINT, REACHED AcTION")
    const formData = await request.formData();
    const name = String(formData.get("editDataCenterName"))
    const location = String(formData.get("editDataCenterLocation"))
    const description = String(formData.get("editDataCenterDescription"))
    const centerId = params.centerId;
    const userToken = await getUserToken(request)

    try {
        await fetch(`${process.env.API_URL}/dataCenter/${centerId}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${userToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                description,
                location
            })
        })
        console.log("hello there")
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}

export default function Page() {
    const { dataCenter, teamMember } = useLoaderData() as { dataCenter: DataCenter | null, teamMember: TeamMember | null };
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const navigation = useNavigation()
    const actionData = useActionData()

    useEffect(() => {
        if (actionData?.success) {
            setIsEditing(false);
        }
    }, [actionData]);

    const formRef = useRef<HTMLFormElement | null>(null)

    return (
        <div className="p-4 w-full flex flex-col gap-4 overflow-auto">
            <div className="flex items-center w-full gap-2">
                <h1 className="text-3xl font-bold text-nowrap">Settings</h1>
                <hr className="w-full border-secondary" />
                {teamMember && teamMember.role === 'OWNER' && (
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
                            <label>Permanently Delete {dataCenter?.name}?</label>
                            <input
                                name="actionType"
                                value="deleteDataCenter"
                                hidden readOnly
                            />
                            <input
                                name="deleteDataCenterId"
                                value={dataCenter?.id}
                                hidden readOnly
                            />
                        </Form>
                    </CustomDialog>
                )}
            </div>
            {dataCenter && (
                <Form
                    id="editDataCenterForm"
                    ref={formRef}
                    method="POST"
                    className="w-full flex flex-col gap-4"
                >
                    <label>Datacenter name</label>
                    <input
                        required
                        name="editDataCenterName"
                        disabled={!isEditing}
                        defaultValue={dataCenter.name}
                        className="inputField w-full"
                    />
                    <label>Datacenter Description</label>
                    <input
                        disabled={!isEditing}
                        name="editDataCenterDescription"
                        defaultValue={dataCenter.description}
                        className="inputField w-full"
                    />
                    <label>Datacenter Location</label>
                    <input
                        required
                        name="editDataCenterLocation"
                        disabled={!isEditing}
                        defaultValue={dataCenter.location}
                        className="inputField w-full"
                    />
                    <label>Team Assigned: {dataCenter.team.name}</label>
                    {teamMember?.role !== "OPERATOR" && (
                        <div className="w-full flex flex-row-reverse gap-4 items-center">
                            {!isEditing && (
                                <button
                                    className="clickable"
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Profile
                                </button>
                            )}

                            {isEditing && (
                                <>
                                    <button
                                        className="clickable"
                                        type="submit"
                                    >
                                        {navigation.state !== 'idle' ? "Saving" : "Save"}
                                    </button>
                                    <button
                                        className="clickable"
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false)
                                            formRef.current?.reset();
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </>

                            )}
                        </div>
                    )}
                </Form>
            )}
        </div>
    )
}

