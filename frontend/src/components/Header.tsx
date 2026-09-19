import { Button } from "@/components/ui/button";
import { Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
            <Stethoscope className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold font-manrope">GlaucoScan</h1>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium hover:text-primary transition-medical">
            Home
          </a>
          <a href="#upload" className="text-sm font-medium hover:text-primary transition-medical">
            Upload
          </a>
          <a href="#result" className="text-sm font-medium hover:text-primary transition-medical">
            Results
          </a>
          <a href="#faq" className="text-sm font-medium hover:text-primary transition-medical">
            FAQ
          </a>
        </nav>

        {/* <Link to="/auth">
          <Button variant="hero">Sign In / Sign Up</Button>
        </Link> */}
      </div>
    </header>
  );
};