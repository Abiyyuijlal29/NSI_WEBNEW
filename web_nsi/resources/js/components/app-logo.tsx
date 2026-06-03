export default function AppLogo() {
    return (
        <div className="flex items-center gap-3">
            <img
                src="/nsi-logo.png"
                alt="NSI Logo"
                className="h-10 w-10 object-contain rounded-lg"
            />
            <div className="flex flex-col text-left leading-tight">
                <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                    NSI
                </span>
                <span className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
                    Net Satu Internews
                </span>
            </div>
        </div>
    );
}
