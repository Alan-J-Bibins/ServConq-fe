import { Workflow } from "lucide-react";
import { Link } from "react-router";

export default function TeamCard({ teamId, teamName, memberCount }: { teamId: string, teamName: string, memberCount: number }) {
    return (
        <Link
            to={`/teams/${teamId}`}
            className="flex justify-start items-center gap-2 p-4
            bg-secondary/10 border border-secondary rounded-2xl 
            relative overflow-hidden group shadow-custom shadow-primary/25
            hover:border-b-primary hover:border-x-secondary/40 hover:bg-secondary/20 hover:shadow-lg hover:scale-[101%] transition-all"
        >
            <Workflow className="text-primary"/>
            <div className="flex flex-col gap-0 z-10">
                <span className="text-xl font-bold"> {teamName} </span>
                <span className="text-primary"> {memberCount} {memberCount === 1 ? "Member" : "Members"} </span>
            </div>
            <div className="absolute -bottom-2 left-0 w-full h-1/4 bg-secondary blur-xl rounded-full -z-0 
                group-hover:blur-lg group-hover:bottom-2 transition-all"/>
        </Link>
    )
}

