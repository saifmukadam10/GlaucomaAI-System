export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-8">
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-medical text-white"
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-medical text-white"
            >
              Terms
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-medical text-white"
            >
              Contact
            </a>
          </div>
          
          <p className="text-center md:text-right text-muted-foreground text-sm text-white" >
            © 2025 Thousand Sunny &#128526;. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};