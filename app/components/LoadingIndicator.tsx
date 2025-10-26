export default function LoadingIndicator() {
    return (
        <div className="absolute h-screen w-screen flex justify-center items-center z-50 motion-blur-in motion-duration-100 backdrop-blur-md bg-background/20">
            <span className="animate-spin text-4xl font-bold text-accent">
                Loading
            </span>
        </div>
    )
}

