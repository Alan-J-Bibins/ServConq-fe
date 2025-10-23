import ThemeToggle from "./ThemeToggle";

export default function Header({ initialTheme }: { initialTheme: string }) {
    return (
        <header className="w-full flex items-center justify-between p-4 border border-b-secondary border-transparent">
            <img
                src="Logo.svg"
            />
            <div className="flex items-center gap-4">
                <ThemeToggle initTheme={initialTheme} />
                <div className="w-8 h-8 rounded-full bg-text" />
            </div>
        </header>
    )
}

