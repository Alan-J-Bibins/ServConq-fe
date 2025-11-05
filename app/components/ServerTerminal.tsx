import { useEffect, useRef, useState, type FormEvent } from "react";
import { useFetcher } from "react-router";

export default function ServerTerminal({ centerId, serverId }: { centerId: string, serverId: string }) {
    const terminalFetcher = useFetcher();
    const [terminalMessages, setTerminalMessages] = useState<{ content: string, type: "output" | "error" | "input" | "breaker" }[]>([]);

    const isSubmitting = terminalFetcher.state !== "idle";

    useEffect(() => {
        console.log("[app/components/ServerTerminal.tsx:11] terminalFetcher.data?.output = ", terminalFetcher.data)
        if (terminalFetcher.data?.output !== undefined) {
            setTerminalMessages(prev => [...prev, { content: terminalFetcher.data.output, type: "output" }]);
            setTerminalMessages(prev => [...prev, { content: terminalFetcher.data.error, type: "error" }]);
            setTerminalMessages(prev => [...prev, { content: ` `, type: "breaker" }]);
        }
    }, [terminalFetcher.data]);

    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (!isSubmitting) {
            inputRef.current?.focus();
        }
    }, [isSubmitting]);


    return (
        <terminalFetcher.Form
            className="w-full rounded-2xl bg-secondary/20 flex flex-col
            border border-secondary/20 p-4 font-mono overflow-y-scroll"
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const command = String(formData.get("command"))
                switch (command) {
                    case "clear": {
                        setTerminalMessages([])
                        e.currentTarget.reset();
                        break;
                    }
                    case "hello": {
                        setTerminalMessages(prev => [...prev, { content: "hello", type: "input" }])
                        setTerminalMessages(prev => [...prev, { content: "Welcome to ServConq!", type: "output" }])
                        setTerminalMessages(prev => [...prev, { content: "", type: "breaker" }])
                        e.currentTarget.reset();
                        break;
                    }
                    default: {
                        setTerminalMessages(prev => [...prev, { content: command, type: "input" }])
                        formData.append("serverId", serverId)
                        formData.append("actionType", "runCommand")
                        terminalFetcher.submit(formData, { method: "POST", action: `/center/${centerId}/overview` })
                        e.currentTarget.reset();
                    }
                }
            }}
        >
            {terminalMessages.map((message, index) => {
                if (message.type === "breaker") {
                    return (
                        <span key={index}>
                            <br />
                            <hr className="border-secondary" />
                            <br />
                        </span>
                    );
                }
                if (message.type === "output") {
                    return (
                        <pre key={index} className="text-text whitespace-pre overflow-x-auto">
                            {message.content}
                        </pre>
                    );
                }
                return (
                    <span key={index} className={message.type === "error" ? "text-accent" : message.type === "input" ? "text-primary" : "text-text"}>
                        {message.content}
                    </span>
                );
            })}
            <span
                className="flex items-center gap-2"
            >$
                <input
                    ref={inputRef}
                    className="w-full focus:outline-none"
                    name="command"
                    autoComplete="off"
                    autoFocus
                    disabled={isSubmitting}
                />
            </span>
        </terminalFetcher.Form>
    )
}

