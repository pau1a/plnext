import Link from "next/link";
import "@/styles/globals.scss";
import BootstrapClient from "@/components/bootstrap-client";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata = {
  title: "Paula Livingstone",
  description: "Cybersecurity • AI • Engineering",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <BootstrapClient />
          <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
              <Link className="navbar-brand" href="/">
                <i className="fa-solid fa-shield-halved me-2" />
                Paula Livingstone
              </Link>
              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
                <span className="navbar-toggler-icon" />
              </button>
              <div className="collapse navbar-collapse" id="nav">
                <ul className="navbar-nav ms-auto">
                  <li className="nav-item"><Link className="nav-link" href="/about">About</Link></li>
                  <li className="nav-item"><Link className="nav-link" href="/projects">Projects</Link></li>
                  <li className="nav-item"><Link className="nav-link" href="/palettes">Palettes</Link></li>
                  <li className="nav-item"><Link className="nav-link" href="/contact">Contact</Link></li>
                </ul>
              </div>
            </div>
          </nav>

          <main className="container py-4">{children}</main>

          <footer className="text-center text-muted py-4">
            <small>
              <i className="fa-regular fa-copyright me-1" />
              {new Date().getFullYear()} Paula Livingstone
            </small>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}

