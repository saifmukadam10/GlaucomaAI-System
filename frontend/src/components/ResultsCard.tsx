import { Card, CardContent } from "@/components/ui/card";

interface ResultsCardProps {
  imageUrl: string;
  cdr: number;
  filename: string;
  prediction: number;
  vessel_risk: number;
  gradcam: string;
}

export const ResultsCard = ({
  imageUrl,
  cdr,
  filename,
  prediction,
  vessel_risk,
  gradcam
}: ResultsCardProps) => {

  // ✅ Prediction → Human readable
  const isGlaucoma = prediction === 1;
  const status = isGlaucoma ? "Glaucoma Detected" : "Normal Eye";

  const statusColor = isGlaucoma
    ? "text-red-500"
    : "text-green-500";

  // ✅ CDR Interpretation
  const interpretCDR = (cdr: number) => {
    if (cdr < 0.4) return { text: "Normal", color: "text-green-500" };
    if (cdr < 0.6) return { text: "Borderline", color: "text-yellow-400" };
    return { text: "High (Possible Glaucoma)", color: "text-red-500" };
  };

  const cdrInfo = interpretCDR(cdr);

  // ✅ Vessel Risk
  const vesselRiskText = vessel_risk === 1 ? "High Risk" : "Low Risk";
  const vesselColor = vessel_risk === 1 ? "text-red-500" : "text-green-500";

  // ✅ User-friendly message
  const userMessage = isGlaucoma
    ? "⚠️ Signs of glaucoma detected. Please consult an eye specialist."
    : "✅ No significant signs of glaucoma detected.";

  // ✅ Recommendation
  const recommendation = isGlaucoma
    ? "Consult an ophthalmologist for further evaluation."
    : "Maintain regular eye check-ups for continued eye health.";

  return (
    <section id="result" className="container py-16">
      <Card className="bg-card border-border shadow-medical">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-10 items-start">

            {/* --- LEFT: REPORT --- */}
            <div className="space-y-6">

              <h2 className="text-3xl font-bold text-white">
                AI Analysis Report
              </h2>

              {/* Status */}
              <div>
                <p className="text-gray-400 text-sm">Diagnosis</p>
                <h3 className={`text-2xl font-bold ${statusColor}`}>
                  {status}
                </h3>
              </div>

              {/* File */}
              <p className="text-sm text-gray-500 italic">
                File: {filename}
              </p>

              {/* Metrics */}
              <div className="space-y-3">

                <div>
                  <p className="text-gray-400 text-sm">CDR (Cup-to-Disc Ratio)</p>
                  <p className="text-lg font-semibold">
                    {cdr.toFixed(2)} —{" "}
                    <span className={cdrInfo.color}>{cdrInfo.text}</span>
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Vessel Risk</p>
                  <p className={`text-lg font-semibold ${vesselColor}`}>
                    {vesselRiskText}
                  </p>
                </div>

              </div>

              {/* User Message */}
              <div className="bg-gray-800/40 p-4 rounded-lg">
                <p className={`font-medium ${statusColor}`}>
                  {userMessage}
                </p>
              </div>

              {/* Recommendation */}
              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700">
                <p className="text-blue-300 font-medium">
                  📌 Recommendation: {recommendation}
                </p>
              </div>

              {/* GradCAM */}
              <div>
                <p className="text-gray-400 text-sm mb-2">
                  AI Attention Map (Grad-CAM)
                </p>

                <img
                  src={`data:image/png;base64,${gradcam}`}
                  alt="GradCAM Heatmap"
                  className="rounded-lg border border-gray-700 w-full max-w-sm"
                />

                <p className="text-xs text-gray-500 mt-2">
                  Red/yellow regions indicate areas the AI focused on while making the decision.
                </p>
              </div>

              {/* AI Insight */}
              <div className="bg-gray-800/40 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">
                  🔍 AI Insight
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  This analysis uses deep learning models including{" "}
                  <span className="text-blue-400 font-semibold">ResNet</span>,{" "}
                  <span className="text-blue-400 font-semibold">RCNN</span>, and{" "}
                  <span className="text-blue-400 font-semibold">UNet</span> to evaluate optic nerve structure and vessel patterns for early glaucoma detection.
                </p>
              </div>
            </div>

            {/* --- RIGHT: ORIGINAL IMAGE --- */}
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">Uploaded Image</p>

              <div className="aspect-video rounded-xl overflow-hidden border border-gray-700">
                <img
                  src={imageUrl}
                  alt="Uploaded retinal image"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </section>
  );
};