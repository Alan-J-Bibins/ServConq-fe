import { useLoaderData, type LoaderFunctionArgs } from "react-router"
import { getUserToken } from "~/utils/helpers"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const userToken = await getUserToken(request);
    const centerId = params.centerId;

    try {
        const res = await fetch(`${process.env.API_URL}/dataCenter/${centerId}/log`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        if (!res.ok) {
            throw new Error("Could not retrieve datacenter logs")
        }

        const data = await res.json();
        const logs: Log[] = data.logs;

        return { logs, error: null }

    } catch (error) {
        return { logs: [], error }
    }
}

export default function Page() {
    const { logs } = useLoaderData<typeof loader>();

    return (
        <div className="p-4 w-full flex flex-col gap-4 overflow-auto scrollbar-hide">
            <div className="flex items-center w-full gap-2">
                <h1 className="text-3xl font-bold text-nowrap">Logs</h1>
                <hr className="w-full border-secondary" />
            </div>
            {logs.length === 0 ? (
                <div>
                    Do actions in your data center to see them here
                </div>
            ) : (
                <div className="bg-secondary/20 rounded-2xl border border-secondary overflow-visible">
                    <table className="border-collapse w-full">
                        <thead>
                            <tr className="text-left bg-primary/10 text-lg text-primary">
                                <th className="p-4">User</th>
                                <th className="p-4">Event</th>
                                <th className="p-4">Time</th>
                                <th className="p-4">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs
                                .map(log => ({
                                    ...log,
                                    createdAt: new Date(log.createdAt)
                                }))
                                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                                .map((log, index) => (
                                    <tr key={log.id} className={`text-left font-mono ${index % 2 !== 0 ? "bg-secondary/20" : ""}`}>
                                        <td className="p-4 flex items-center justify-start gap-2">
                                            <div className="shrink-0 bg-secondary/40 text-accent w-8 h-8 rounded-full flex justify-center items-center">
                                                {log.teamMember.user.name.slice(0, 1)}
                                            </div>
                                            {log.teamMember.user.name}
                                        </td>
                                        <td className="p-4">{log.message}</td>
                                        <td className="p-4">{log.createdAt.toLocaleTimeString()}</td>
                                        <td className="p-4">{log.createdAt.toLocaleDateString()}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="">
            </div>
        </div>
    )
}

