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
            className="bg-secondary/20 border border-primary rounded-2xl shadow-glow
                 p-5 flex flex-col justify-between backdrop-blur-md
                 hover:scale-[1.02] transition-transform duration-300
                 hover:shadow-lg h-50 w-full"
        >
            {/* DataCenter Name  */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-primary">
                    <Server size={20} />
                    <h2 className="text-xl font-semibold tracking-wide">{name}</h2>
                </div>
                <span className="text-green-600 text-sm">
          Servers running: {serversRunning ?? "5/5"}
        </span>
            </div>

            {/* Team Name */}
            <div className="flex justify-end">
        <span className="text-accent text-sm font-medium">
  {teamName || "Unassigned"}
</span>

            </div>
        </Link>
    );
}
