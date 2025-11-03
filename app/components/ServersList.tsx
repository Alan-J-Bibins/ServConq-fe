import { useEffect, useState } from "react";
import CustomDialog from "./Dialog";
import { Form } from "react-router";

type ServerMetrics = {
    pid: {
        cpu: number;
        ram: number;
        conns: number;
    };
    os: {
        cpu: number;
        ram: number;
        total_ram: number;
        load_avg: number;
        conns: number;
    };
};

type MetricsBatch = {
    [serverId: string]: {
        metrics?: ServerMetrics;
        success: boolean;
        error?: string;
    };
};

export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function ServersList({
    servers,
    centerId
}: {
    servers: { id: string; hostname: string }[],
    centerId: string
}) {

    const [latestBatch, setLatestBatch] = useState<MetricsBatch | null>(null);

    useEffect(() => {

        const eventSource = new EventSource(`${import.meta.env.VITE_API_URL}/stream/${centerId}`);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setLatestBatch(data)
            } catch (e) {
                console.error("Failed to parse SSE data", e);
            }
        };

        eventSource.onerror = (err) => {
            console.error("SSE error:", err);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [centerId, servers]);

    return (
        <div className="w-full flex gap-4 flex-col">
            {servers.map((server) => {
                const osCpu = latestBatch?.[server.id]?.metrics?.os?.cpu;
                const osRam = latestBatch?.[server.id]?.metrics?.os.ram;
                const osTotalRam = latestBatch?.[server.id]?.metrics?.os.total_ram;
                return (
                    <div key={server.id} className="flex flex-col gap-4 p-4 bg-secondary/20 rounded-2xl border border-secondary">
                        <div className="flex justify-between items-center w-full">
                            <span className="text-3xl font-bold text-primary"> {server.hostname} </span>
                            <CustomDialog
                                title="Edit Server"
                                trigger={
                                    <button className="clickable">Edit</button>
                                }
                                submit={
                                    <button
                                        type="submit"
                                        form="editServerForm"
                                        className="clickable"
                                    >
                                        Submit
                                    </button>
                                }
                                cancel={
                                    <></>
                                }
                            >
                                <Form
                                    id="editServerForm"
                                    method="PATCH"
                                    action={`/center/${centerId}/overview`}
                                    className="flex flex-col gap-4"
                                >
                                    <label>Hostname</label>
                                    <input
                                        type="text"
                                        name="editServerHostname"
                                        required
                                        defaultValue={server.hostname}
                                    />
                                    <label>Connection String</label>
                                    <input
                                        type="text"
                                        name="editServerConnectionString"
                                        placeholder="Leave Empty to continue using current connection string"
                                    />
                                    <input
                                        name="editServerId"
                                        readOnly hidden
                                        value={server.id}
                                    />
                                    <input
                                        name="actionType"
                                        readOnly hidden
                                        value={"editServer"}
                                    />
                                </Form>
                            </CustomDialog>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-primary">CPU Usage</span>
                            <span className="text-4xl font-bold">{osCpu?.toFixed(2)} %</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-primary">RAM Usage:</span>
                            <span className="text-4xl font-bold">{formatBytes(osRam || 0, 2)} / {formatBytes(Math.ceil(osTotalRam || 0), 2)}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    )
}

