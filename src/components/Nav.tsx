"use client";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { EllipsisHorizontalCircleIcon } from "@heroicons/react/24/outline";

export default function Nav() {
    const pathname = usePathname();
    const { user, isLoaded } = useUser();


    const links = [
        { name: "Home", href: "/", icon: "" },
        { name: "Projects", href: "#", icon: "" },
        { name: "Dashboard", href: "/dashboard", icon: "" },
    ];

    return (
        <header>
            <nav className="bg-blue-500 border-gray-200 rounded-lg m-6 mb-4">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="darkblue" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FFF" className="w-12 h-12">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                        </svg>

                        <span className="self-center text-2xl font-semibold whitespace-nowrap text-white dark:text-white">React Portfolio</span>
                    </a>
                    <button data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
                        <span className="sr-only">Open main menu</span>
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                        </svg>
                    </button>
                    <div className="hidden w-full md:block md:w-auto" id="navbar-default">
                        <ul className="font-medium flex flex-col items-center p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-2 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-transparent dark:bg-gray-800 md:dark:bg-blue-500 dark:border-gray-700">
                            {links.map((link) => {
                                const LinkIcon = link.icon;
                                return (
                                    <a key={link.name} href={link.href} className={clsx("flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm text-white font-medium hover:bg-blue-600 md:flex-none md:justify-start md:p-2 md:px-3", { "bg-blue-700 text-white": pathname === link.href })}>
                                        <li key={link.name} className="flex items-center">
                                            <p className="hidden md:block">{link.name}</p>
                                        </li>
                                    </a>
                                );
                            })}
                            {user && isLoaded && <UserButton afterSignOutUrl="/" />}
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}
