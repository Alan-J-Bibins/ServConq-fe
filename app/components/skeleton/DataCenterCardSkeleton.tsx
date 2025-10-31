import { Server } from "lucide-react";

export default function DataCenterCardSkeleton() {
    return (
        <div
            className="flex flex-col justify-start items-start gap-2 p-4
            bg-secondary/10 border border-secondary rounded-2xl h-full w-full
            relative overflow-hidden shadow-custom shadow-primary/25
            motion-blur-in"
        >
            <div className="flex flex-col gap-2 w-full z-10">
                <Server size={24} className="text-primary animate-pulse" />
                <div className="text-xl text-transparent rounded-lg bg-secondary/20 animate-pulse">Server Name</div>
                <span className="text-transparent bg-secondary/20 w-fit rounded-lg animate-pulse"> Server Number </span>
                <div className="flex justify-end w-full">
                    <span className="text-transparent w-fit rounded-lg bg-secondary/20 animate-pulse">
                        Team Name
                    </span>
                </div>
            </div>
            <div className="absolute -bottom-2 left-0 w-full h-1/3 bg-secondary blur-2xl rounded-full" />
        </div>
    );
}
