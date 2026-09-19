import { Eye, Heart, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: Eye,
    title: "Preserve Vision",
    description: "Early detection prevents irreversible vision loss"
  },
  {
    icon: Heart,
    title: "Improve Quality of Life",
    description: "Maintain independence and daily activities"
  },
  {
    icon: Shield,
    title: "Protect Your Future",
    description: "Timely treatment preserves long-term eye health"
  }
];

export const BenefitsSection = () => {
  return (
    <section className="container py-20">
      <div className="space-y-12">
        <h2 className="text-3xl font-bold font-manrope">Why Early Detection</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="bg-card border-border hover:shadow-medical transition-medical group">
              <CardContent className="p-6 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-medical">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground text-white">{benefit.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};