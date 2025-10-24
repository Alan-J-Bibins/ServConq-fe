import { Server } from "lucide-react";
import { Link } from "react-router";

interface DataCenterCardProps {
    id: string;
    name: string;
    serversRunning: string;
    teamName: string;
}


export default function DataCenterCard({
    id,
    name,
    serversRunning,
    teamName,
}: DataCenterCardProps) {
    return (
        <Link
            to={`/center/${id}/configure`}
            className="flex flex-col justify-start items-start gap-2 p-4
            bg-secondary/10 border border-secondary rounded-2xl h-full w-full
            relative overflow-hidden group shadow-custom shadow-primary/25
            hover:border-b-primary hover:border-x-primary/20 hover:bg-secondary/20 hover:shadow-xl hover:scale-[101%] transition-all"
        >
            <div className="flex flex-col gap-2 w-full z-10">
                <Server size={24} className="text-primary" />
                <h2 className="text-xl">{name}</h2>
                <span className="text-green-600"> Servers running: {serversRunning ?? "5/5"} </span>
                <div className="flex justify-end w-full">
                    <span className="text-accent">
                        {teamName || "Unassigned"}
                    </span>
                </div>
            </div>
            <div className="absolute -bottom-2 left-0 w-full h-1/3 bg-secondary blur-2xl rounded-full -z-0 group-hover:blur-xl group-hover:bottom-2 transition-all" />
        </Link>
    );
}
