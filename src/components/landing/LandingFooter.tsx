import { Users } from "lucide-react";

export const LandingFooter = () => {
  const footerSections = [
    {
      title: "Product",
      links: ["How it Works", "Safety", "Pricing"]
    },
    {
      title: "Support", 
      links: ["Help Center", "Contact Us", "Community"]
    },
    {
      title: "Legal",
      links: ["Privacy Policy", "Terms of Service", "Safety Guidelines"]
    }
  ];

  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">Stride Together</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connecting fitness enthusiasts worldwide. Find your perfect workout buddy, 
              train together safely, and achieve your goals faster.
            </p>
          </div>
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                {section.links.map((link, linkIndex) => (
                  <div key={linkIndex}>{link}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t pt-8 mt-8 text-center text-sm text-muted-foreground">
          © 2025 Stride Together. All rights reserved. • Connecting fitness enthusiasts worldwide.
        </div>
      </div>
    </footer>
  );
};