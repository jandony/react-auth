// Clerk auth imports
import { auth, currentUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";

// Chat app imports
import Chat from "@/components/Chat/Chat";

export default async function Home() {
    // Clerk variables
    const { userId } = auth();
    const user = await currentUser();

    return (
        <main className="min-h-96 mx-6 p-6 rounded-lg shadow-md bg-white">
            <div className="flex items-center justify-between max-w-screen-sm mx-auto">
                <h1 className="text-2xl py-2">Home Page</h1>
                <p className="">{userId ? `Welcome, ${user?.firstName}!` : ""}</p>
            </div>
            <div className="min-h-80 text-center py-12">
                {userId ? <Chat userName={user?.firstName} userImage={user?.imageUrl} /> : <p className="text-lg font-bold">Sign in to access Chat App!</p>}
                {!userId && <SignInButton className="bg-green-700 text-white hover:bg-green-800 w-fit uppercase py-3 px-8 m-6 rounded-full hover:shadow-lg" />}
            </div>
        </main>
    );
}
