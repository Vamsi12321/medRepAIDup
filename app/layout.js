import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import QueryProvider from "@/components/QueryProvider";

export const metadata = {
  title: "MedRepAI - AI-Powered Pharma Intelligence Platform",
  description: "Connect medical reps, doctors, and pharma companies. Track visits, measure SFE, forecast demand, and grow prescriptions — all powered by AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white min-h-screen">
        <ErrorBoundary>
          <QueryProvider>{children}</QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
