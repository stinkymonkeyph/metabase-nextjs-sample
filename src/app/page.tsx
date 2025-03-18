import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-6">Next.js with Metabase</h1>
      <Link 
        href="/dashboard"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        View Dashboard
      </Link>
    </main>
  );
}
