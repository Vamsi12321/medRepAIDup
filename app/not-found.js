import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            404
          </h1>
          <p className="text-2xl text-gray-600 mt-4">Page Not Found</p>
          <p className="text-gray-500 mt-2">The page you're looking for doesn't exist.</p>
        </div>
        <Link href="/">
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition-all transform hover:scale-105">
            Go Back Home
          </button>
        </Link>
      </div>
    </div>
  );
}
