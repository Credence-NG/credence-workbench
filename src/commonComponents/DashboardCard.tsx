
interface IProps {
    icon: string
    iconDark?: string
    backgroundColor: string
    label: string
    value: number
    onClickHandler?: () => void
    classes?: string
}

const DashboardCard = ({icon, iconDark, backgroundColor, label, value, onClickHandler, classes }: IProps) => {
    return (
        <button
            type="button"
            className={`items-center justify-between p-4 border border-gray-300 dark:border-slate-500 rounded-lg shadow-sm sm:flex sm:p-6 bg-transparent transform transition duration-500 hover:scale-103 hover:bg-gray-50 dark:hover:bg-slate-700/30 cursor-pointer min-h-[152px] overflow-hidden ${classes}`}
            onClick={() => {
                if (onClickHandler)
                    onClickHandler()
            }}
        >
            <div className='absolute bottom-0 -right-4 -z-10'>
                {/* Light mode icon */}
                <img src={icon} className="w-[150px] h-[125px] opacity-70 dark:hidden" alt="icon" />
                {/* Dark mode icon */}
                <img src={iconDark || icon} className="w-[150px] h-[125px] opacity-60 hidden dark:block" alt="icon" />
            </div>
            <div className="w-full text-start">
                <h3 className="text-base font-medium text-gray-700 dark:text-slate-300">
                    {label}
                </h3>
                <span className="text-2xl font-semi-bold leading-none text-gray-900 dark:text-slate-100 sm:text-3xl">
                    {value}
                </span>
            </div>
        </button>
    )
}

export default DashboardCard