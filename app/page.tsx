import Link from "next/link";

//create a attractive landing page for my sharda notes and pyqs website with welcome message and a button to go to dashboard and some divs constains random notes and pyqs with tailwind css
export default function HomePage() {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
            <h1 className="text-4xl font-bold mb-4 text-center">Welcome to Sharda Notes and Pyqs</h1>
            <p className="text-lg mb-8 text-center max-w-2xl">
                Your one-stop destination for comprehensive notes and previous year question papers to excel in your studies at Sharda University. Explore our vast collection and enhance your learning experience!
            </p>
            <Link   
                className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors mb-10"
                href="/dashboard"
            >
                Go to Dashboard
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                <div className="bg-white p-4 rounded-lg shadow-md"> 
                    <h2 className="text-2xl font-semibold mb-2">Notes</h2>
                    <p>Explore our extensive collection of notes across various subjects to aid your studies.</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-2">Previous Year Question Papers</h2>  
                    <p>Access past question papers to practice and prepare effectively for your exams.</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-2">Study Resources</h2>    
                    <p>Find additional study materials and resources to enhance your learning experience.</p>
                </div>
            </div>
        </div>
    );
}
