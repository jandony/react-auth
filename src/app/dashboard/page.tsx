import { auth, currentUser } from "@clerk/nextjs";
import Image from 'next/image'

export default async function Dashboard() {
    const { userId } = auth();
    const user = await currentUser();
    const emails = user?.emailAddresses;
    return (
        <main className="min-h-80 mx-6 p-6 rounded-lg shadow-md bg-white text-center">
            <h1 className="text-2xl py-2">{userId ? `${user?.firstName}'s Dashboard` : ""}</h1>

            <div className="flex flex-col md:flex-row min-h-96 w-100 max-w-screen-md mx-auto gap-6 justify-center items-center">
                <div className="w-100 md:w-1/2 p-6">
                    <img src={user?.imageUrl} width={500} height={500} alt="Picture of the author" className="rounded-full" />
                </div>
                <div className="text-left w-100 md:w-1/2 0 p-6">
                    <div className="p-4 mb-2">
                        <p className="text-sm text-gray-500">Name:</p>
                        <p className="text-xl">{user?.fullName ? user?.fullName : `${user?.firstName} ${user?.lastName}`}</p>
                    </div>
                    <div className="p-4 mb-2">
                        <p className="text-sm text-gray-500">Username:</p>
                        <p className="text-xl">{user?.username}</p>
                    </div>
                    <div className="p-4 mb-2">
                        <p className="text-sm text-gray-500">Email:</p>
                        <p className="text-xl">{emails && emails[0].emailAddress}</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
