import { OctagonAlert, Grid2x2Plus, ChevronDown } from "lucide-react";
import {
    Form,
    useLoaderData,
    type LoaderFunctionArgs,
    type ActionFunctionArgs,
    Await,
} from "react-router";
import CustomDialog from "~/components/Dialog";
import DataCenterCard from "~/components/DataCenterCard";
import { serverSessionStorage } from "~/session.server";
import { Listbox, ListboxOption, Transition } from "@headlessui/react";
import { Fragment, Suspense, useState } from "react";
import DataCenterCardSkeleton from "~/components/skeleton/DataCenterCardSkeleton";

// Type definition for one Data Center entry
export type DataCenterEntry = {
    id: string;
    name: string;
    description?: string;
    location?: string;
    team_id?: string;
    team_name?: string;
};

// 🧩 LOADER — Fetch Data Centers
export const loader = async ({ request }: LoaderFunctionArgs) => {
    const session = await serverSessionStorage.getSession(request.headers.get("Cookie"));
    const token = session.get("token");

    // Don't await, just create promises and return them via defer
    const dataCenterPromise = fetch(`${process.env.API_URL}/dataCenter`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then(async (res) => {
        if (!res.ok) return [];
        const json = await res.json();
        return (json.datacenters || []).map((dc: any) => ({
            id: dc.id,
            name: dc.name,
            description: dc.description,
            location: dc.location,
            team_id: dc.team_id,
            team_name: dc.team_name,
        }));
    });

    const teamPromise = fetch(`${process.env.API_URL}/team`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then(async (res) => {
        if (!res.ok) return [];
        const json = await res.json();
        return (json.teamList || []).map((entry: any) => ({
            id: entry.team.id,
            name: entry.team.name,
        }));
    });

    return { dataCenterPromise, teamPromise }
};


// 🧩 ACTION — Create New Data Center
export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const actionType = String(formData.get("actionType"));

    const session = await serverSessionStorage.getSession(request.headers.get("Cookie"));
    const token = session.get("token");

    switch (actionType) {
        case "newDataCenter": {
            const name = String(formData.get("centerName"));
            const location = String(formData.get("centerLocation"));
            const description = String(formData.get("centerDescription"));
            const teamId = String(formData.get("teamId"));

            try {
                const res = await fetch(`${process.env.API_URL}/dataCenter`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        location,
                        description,
                        teamId,
                    }),
                });

                if (!res.ok) {
                    return { err: `Could not create Data Center (${res.status})` };
                }

                const data = await res.json();

                if (!data.success) {
                    return { err: data.error || "Failed to create Data Center" };
                }

                return { err: null };
            } catch (err) {
                console.error("❌ Action failed:", err);
                return { err: "Unable to reach server" };
            }
        }

        default:
            return { err: "Invalid action" };
    }
};

// 🧱 PAGE COMPONENT
export default function Page() {
    const { dataCenterPromise, teamPromise } = useLoaderData() as {
        dataCenterPromise: Promise<DataCenterEntry[]>;
        teamPromise: Promise<{ id: string; name: string }[]>;
    };

    const [selectedTeam, setSelectedTeam] = useState<{ id: string; name: string } | null>(null);
    const [connectionError, setConnectionError] = useState<string | null>(null);



    return (
        <main className="p-4 flex flex-col w-full h-full justify-start items-start gap-4">
            {/* HEADER */}
            <div className="flex items-center w-full gap-2">
                <h1 className="text-3xl font-bold text-nowrap">Data Centers</h1>
                <hr className="w-full border-secondary" />

                {/* NEW DATACENTER DIALOG */}
                <CustomDialog
                    title="New Data Center"
                    trigger={
                        <button className="clickable flex justify-center gap-2 items-center text-nowrap">
                            <Grid2x2Plus /> New Data Center
                        </button>
                    }
                    submit={
                        <button
                            form="newDataCenterForm"
                            type="submit"
                            className="clickable"
                        >
                            Submit
                        </button>
                    }
                    cancel={<></>}
                >
                    <Form
                        id="newDataCenterForm"
                        method="POST"
                        action="/center"
                        className="flex flex-col gap-2"
                    >
                        <label>Data Center Name</label>
                        <input
                            required
                            name="centerName"
                            type="text"
                            placeholder="Enter Data Center Name"
                        />

                        <label>Location</label>
                        <input
                            required
                            name="centerLocation"
                            type="text"
                            placeholder="Enter Location"
                        />

                        <label>Description</label>
                        <textarea
                            name="centerDescription"
                            placeholder="Enter Description"
                            className="resize-y h-28"
                        />

                        <label>Team</label>
                        <Suspense fallback={
                            <input placeholder="Select a Team" disabled />
                        }>
                            <Await
                                errorElement={
                                    <div>Failed to Load Teams</div>
                                }
                                resolve={teamPromise}>
                                {(teamList) => (
                                    <Listbox value={selectedTeam} onChange={setSelectedTeam}>
                                        <div className="relative">
                                            {/* Button */}
                                            <Listbox.Button
                                                className="
                                    bg-secondary/20
                                    border border-primary/40
                                    text-primary
                                    rounded-2xl
                                    px-4 py-2
                                    w-full
                                    text-left
                                    appearance-none
                                    focus:border-primary
                                    focus:ring-2
                                    focus:ring-primary/40
                                    focus:outline-none
                                    hover:bg-secondary/30
                                    transition-all
                                    cursor-pointer
                                    flex justify-between items-center
                                  "
                                            >
                                                {selectedTeam ? selectedTeam.name : "Select a Team"}
                                                <ChevronDown size={18} className="text-primary ml-2" />
                                            </Listbox.Button>

                                            {/* Dropdown Options */}
                                            <Transition
                                                as={Fragment}
                                                leave="transition ease-in duration-100"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                            >
                                                <Listbox.Options
                                                    className="
                                                absolute mt-2 w-full
                                                bg-secondary/20
                                                border border-primary/40
                                                rounded-2xl
                                                shadow-lg
                                                backdrop-blur-md
                                                text-primary
                                                max-h-60 overflow-auto
                                                focus:outline-none
                                                z-10
                                                "
                                                >
                                                    {teamList.map((team) => (
                                                        <Listbox.Option
                                                            key={team.id}
                                                            value={team}
                                                            className={({ active }) =>
                                                                `cursor-pointer select-none px-4 py-2 rounded-xl ${active ? "bg-primary/30 text-primary font-semibold" : "text-primary"
                                                                }`
                                                            }
                                                        >
                                                            {team.name}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </Listbox>
                                )}
                            </Await>
                        </Suspense>

                        {/* Hidden input so form submission still includes team ID */}
                        <input type="hidden" name="teamId" value={selectedTeam?.id || ""} />
                        <input
                            hidden
                            readOnly
                            name="actionType"
                            value="newDataCenter"
                        />
                    </Form>
                </CustomDialog>
            </div>

            <Suspense fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <DataCenterCardSkeleton key={i} />
                    ))}
                </div>
            }>
                <Await resolve={dataCenterPromise} errorElement={<div>Error loading data centers</div>}>
                    {(dataCenters) =>
                        dataCenters.length === 0 ? (
                            <div className="text-secondary flex justify-center w-full items-center gap-2">
                                <OctagonAlert size={48} />
                                <span className="text-4xl">
                                    Create a Data Center to get started
                                </span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full gap-4">
                                {dataCenters.map((center) => (
                                    <DataCenterCard
                                        key={center.id}
                                        id={center.id}
                                        name={center.name}
                                        serversRunning="5/5"
                                        teamName={center.team_name || "No Team Assigned"}
                                    />
                                ))}
                            </div>
                        )
                    }
                </Await>
            </Suspense>

            {/* ERROR / EMPTY / DATA DISPLAY  */}
            {/* {errorMessage ? ( */}
            {/*     <div className="text-accent-500 flex justify-center w-full items-center gap-2"> */}
            {/*         <OctagonAlert size={48} /> */}
            {/*         <span className="text-2xl">{errorMessage}</span> */}
            {/*     </div> */}
            {/* ) : dataCenters.length === 0 ? ( */}
            {/*     <div className="text-secondary flex justify-center w-full items-center gap-2"> */}
            {/*         <OctagonAlert size={48} /> */}
            {/*         <span className="text-4xl"> */}
            {/*             Create a Data Center to get started */}
            {/*         </span> */}
            {/*     </div> */}
            {/* ) : ( */}
            {/*     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full gap-4"> */}
            {/*         {dataCenters.map((center) => ( */}
            {/*             <DataCenterCard */}
            {/*                 key={center.name} */}
            {/*                 id={center.id} */}
            {/*                 name={center.name} */}
            {/*                 serversRunning="5/5" */}
            {/*                 teamName={center.team_name || "No Team Assigned"} */}
            {/*             /> */}
            {/*         ))} */}
            {/*     </div> */}
            {/* )} */}
        </main>
    );
}
