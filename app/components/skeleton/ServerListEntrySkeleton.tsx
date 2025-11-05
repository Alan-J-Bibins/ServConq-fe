import { Pencil, SquareTerminal, Trash2 } from "lucide-react";

export default function ServerListEntrySkeleton() {

    return (
        <div className="flex justify-between gap-4 p-4 bg-secondary/20 rounded-2xl border border-secondary text-transparent">
            <div className="flex flex-col h-full gap-4 items-start">
                <div className="flex justify-between items-center w-full">
                    <span className="text-3xl font-bold rounded-lg bg-secondary/20 animate-pulse"> Server Hostname </span>
                </div>
                <div className="flex flex-col">
                    <span className="rounded-lg bg-secondary/20 animate-pulse">CPU Usage</span>
                    <span className="text-4xl font-bold rounded-lg bg-secondary/20 animate-pulse">20 %</span>
                </div>
                <div className="flex flex-col">
                    <span className="rounded-lg bg-secondary/20 animate-pulse">RAM Usage:</span>
                    <span className="text-4xl font-bold rounded-lg bg-secondary/20 animate-pulse">20.00 / 20.00</span>
                </div>
            </div>
            <div className="flex flex-col gap-4 justify-between items-end">
                <div className="flex justify-center gap-2">
                    <button className="clickableButAccent" > <Trash2 size={20} /> </button>
                    <button className="clickable"><Pencil size={20} /></button>
                </div>
                <button className="clickable flex gap-2 items-center">
                    <SquareTerminal size={20} />
                    Terminal
                </button>
            </div>
        </div>
    );

}

