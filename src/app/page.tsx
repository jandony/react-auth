import { auth, currentUser } from "@clerk/nextjs";

export default async function Home() {
    const { userId } = auth();
    const user = await currentUser();
    return (
        <main className="min-h-96 mx-6 p-6 rounded-lg shadow-md bg-white">
            <div className="flex items-center justify-between max-w-screen-xl mx-auto">
                <h1 className="text-2xl py-2">Home Page</h1>
                <p className="">{userId ? `Welcome, ${user?.firstName}!` : "Please login to continue"}</p>
            </div>
        </main>
    );
}
