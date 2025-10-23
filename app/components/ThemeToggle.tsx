import { useFetcher } from "react-router";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ initTheme }: { initTheme: string }) {
    const fetcher = useFetcher();
    const initialTheme = fetcher.data?.theme || (typeof document !== "undefined"
        ? document.documentElement.getAttribute("data-theme") || "dark"
        : "dark");

    const [theme, setTheme] = useState<string>(initTheme);
    useEffect(() => {
        if(theme === "dark" || theme === "light") {
            document.documentElement.setAttribute("data-theme", theme);
            fetcher.submit(
                { theme },
                { method: "post", action: "/theme" }
            );
        }
    }, [theme]);

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative w-fit h-fit flex items-center justify-center motion-preset-focus-md p-5 rounded-2xl
            bg-gradient-to-t from-primary/10 to-secondary/10 text-primary overflow-hidden 
            border border-t-secondary/40 border-b-primary/40 border-x-primary/10 
            hover:border-b-primary hover:cursor-pointer hover:shadow-custom hover:shadow-primary/25 hover:bg-secondary/10 
            hover:border-x-transparent hover:border-t-secondary/15 hover:scale-[101%] hover:text-shadow-md hover:text-shadow-primary/25 transition-all
            "
        >
            <Sun
                size={24}
                className={`absolute  ${theme === "dark" ? 'motion-rotate-out-90 motion-opacity-out-0 motion-translate-y-out-100' : 'motion-rotate-in-90 motion-preset-focus-md -motion-translate-y-in-100'}`}
            />
            <Moon
                size={24}
                className={`absolute ${theme === "dark" ? 'motion-preset-focus-md -motion-rotate-in-90 -motion-translate-y-in-100' : '-motion-rotate-out-90 motion-opacity-out-0 motion-translate-y-out-100'}`}
            />
        </button>
    );
}
