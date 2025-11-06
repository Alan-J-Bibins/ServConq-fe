import { useEffect, useState, type MouseEvent, type ReactNode } from "react"
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useFetchers, useNavigation } from "react-router";
import { twMerge } from "tailwind-merge";

export default function CustomDialog({
    children,
    trigger,
    submit,
    cancel,
    title,
    triggerClassname,
    considerFetcherSubmission = true,
    considerFormSubmission = true,
}: {
    children: ReactNode,
    trigger: ReactNode,
    submit?: ReactNode,
    cancel?: ReactNode,
    title: string,
    triggerClassname?: string
    considerFetcherSubmission?: boolean
    considerFormSubmission?: boolean
}) {

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [mounted, setMounted] = useState<boolean>(false);
    const [isExiting, setIsExiting] = useState<boolean>(false);
    const navigation = useNavigation();
    const fetchers = useFetchers();

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsExiting(false);
        }, 150)
    }

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, [])

    useEffect(() => {
        if (isOpen) {
            if (considerFormSubmission && navigation.state === 'submitting') {
                handleClose();
                return;
            }
            if (considerFetcherSubmission && fetchers.some(f => f.state === 'submitting')) {
                handleClose();
                return;
            }
        }
    }, [navigation.state, fetchers, isOpen, considerFetcherSubmission, considerFormSubmission]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
            // Prevent space from closing dialog when focused inside
            if (e.key === ' ' && e.target !== document.body) {
                e.stopPropagation();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen])

    return (
        <>
            <div onClick={handleOpen} className={twMerge("cursor-pointer", triggerClassname)}>
                {trigger}
            </div>
            {mounted && isOpen && createPortal(
                <div
                    role="dialog"
                    aria-modal="true"
                    className={`bg-transparent z-40 size-full fixed inset-0 flex justify-center items-center backdrop-blur-xs
                    ${isExiting ? 'motion-opacity-out-0' : 'motion-preset-focus-md'} motion-duration-150`}
                    onClick={handleClose}
                >
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={(e: MouseEvent) => {
                            e.stopPropagation();
                        }}
                        className={`motion-duration-150  bg-background/80 border border-primary/20 p-4 min-w-xl max-w-3/4 max-h-3/4 rounded-2xl flex flex-col gap-4
                        shadow-custom shadow-secondary/25
                        ${isExiting ? 'motion-scale-out-75 motion-opacity-out-0' : 'motion-scale-in-75 motion-opacity-in-0'}
                        `}
                    >
                        <div className="flex justify-between items-center gap-2">
                            <h1 className="tracking-custom text-accent uppercase text-shadow-accent/25 text-shadow-lg text-base text-nowrap">{title}</h1>
                            <hr className="border-secondary w-full" />
                            <button type="button" onClick={handleClose} className="p-1 hover:bg-grey/10 cursor-pointer rounded-full transition-colors">
                                <X size={24} className="text-accent" />
                            </button>

                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {children}
                        </div>
                        <div className="flex items-center gap-2 flex-row-reverse">
                            {submit &&
                                <div>
                                    {submit}
                                </div>
                            }
                            {cancel &&
                                <div onClick={handleClose}>
                                    {cancel}
                                </div>
                            }
                        </div>
                    </div>
                </div>
                , document.body)}
        </>
    )
}



