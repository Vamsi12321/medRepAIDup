import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata = {
  title: "MedAware - Drug Awareness Platform",
  description: "Professional drug awareness platform for healthcare professionals",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white min-h-screen">
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
