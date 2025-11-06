import { LogOut, UserRound, UserRoundPen } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useEffect, useRef, useState } from "react";
import { Form, NavLink, useNavigation } from "react-router";

export default function Header({ initialTheme }: { initialTheme: string }) {
    return (
        <header className="w-full flex items-center justify-between p-4 border border-b-secondary border-transparent">
            <img
                src="/Logo.svg"
            />
            <div className="flex items-center gap-4">
                <ThemeToggle initTheme={initialTheme} />
                <UserDetailsBox />
            </div>
        </header>
    )
}


function UserDetailsBox() {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const navigation = useNavigation();

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (navigation.state === 'loading') {
            setIsOpen(false);
        }
    }, [navigation.state]);

    useEffect(() => {
        if (!isOpen) return;

        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);



    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className="clickableButAccent"
                onClick={() => setIsOpen(!isOpen)}
            >
                <UserRound />
            </button>
            {isOpen && (
                <div className="absolute flex flex-col gap-4 top-12 right-0 z-50 p-4 bg-background/20 rounded-2xl 
                    border border-secondary/40 hover:border-secondary hover:bg-background/34 transition-all backdrop-blur-md
                    motion-blur-in -motion-translate-y-in motion-duration-150">
                    <NavLink to="/profile" className="clickable text-nowrap flex items-center gap-2"><UserRoundPen /> Profile</NavLink>
                    <Form
                        method="POST"
                        action="/signout"
                        className="w-full"
                    >
                        <button
                            type="submit"
                            className="clickableButAccent text-nowrap w-full flex items-center gap-2"
                        >
                            <LogOut />
                            Sign Out
                        </button>
                    </Form>

                </div>
            )}
        </div>
    );
}
