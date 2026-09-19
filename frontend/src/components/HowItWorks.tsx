import { Search, Clock, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: Search,
    title: "Upload Image",
    description: "Upload your fundus eye image"
  },
  {
    icon: Clock,
    title: "Instant Analysis",
    description: "AI processes your image in seconds"
  },
  {
    icon: BarChart3,
    title: "Clear Results",
    description: "Get detailed CDR analysis"
  }
];

export const HowItWorks = () => {
  return (
    <section className="container py-20">
      <div className="space-y-12">
        <h2 className="text-3xl font-bold font-manrope">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="bg-card border-border hover:shadow-medical transition-medical">
              <CardContent className="p-6 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground text-white">{step.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};