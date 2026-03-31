import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What does “Glaucoma Detected” mean ?",
    answer:
      "It means the model found patterns in the fundus image that are associated with glaucoma risk (especially around the optic nerve head). It’s a screening signal, not a final diagnosis."
  },
  {
    question: "What is CDR (Cup-to-Disc Ratio) and why is it important?",
    answer:
      "CDR compares the optic cup size to the optic disc size. A higher CDR can indicate optic nerve cupping, which is commonly associated with glaucoma—especially if it’s high or asymmetric."
  },
  {
    question: "What does the Grad-CAM heatmap show?",
    answer:
      "Grad-CAM highlights the image regions that most influenced the model’s prediction. Hotter colors usually indicate stronger influence, often near the optic disc when glaucoma-related features are present."
  },
  {
    question: "What does the vessel segmentation image mean?",
    answer:
      "It shows the retinal blood vessel map detected by the model. Vessel changes can be a supportive signal in risk assessment, but they should be interpreted together with clinical findings."
  },
  {
    question: "What should I do after getting a high-risk result here?",
    answer:
      "Book a comprehensive eye exam with an ophthalmologist (IOP measurement, OCT/optic nerve evaluation, and visual field testing). Early follow-up is the safest next step."
  }
];

export const FAQSection = () => {
  return (
    <section id="faq" className="container py-16 md:py-20">
      <div className="space-y-12 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold font-manrope text-center">FAQ</h2>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-card border-border rounded-xl px-6 py-2"
            >
              <AccordionTrigger className="text-left hover:text-primary transition-medical">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-gray-100">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};