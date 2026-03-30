import { Card, CardContent } from "@/components/ui/card";

interface ResultsCardProps {
  imageUrl: string;
  //decision: string; // "Normal", "Suspicious", or "Glaucoma"
  //confidence: string; // "High" or "Moderate"
  //risk: number;
  cdr: number;
  //explanation: string;
  filename: string;
  prediction : number;
  vessel_risk : number;
  gradcam : string;
}

export const ResultsCard = ({
  imageUrl,
  //decision,
  //confidence,
  //risk,
  cdr,
  //explanation,
  filename,
  prediction,
  vessel_risk,
  gradcam
}: ResultsCardProps) => {
  // --- Determine status tone based on decision ---
  let status = "";
  let statusColor = "";
  let userMessage = "";

  return (
    <section id="result" className="container py-16">
      <Card className="bg-card border-border shadow-medical">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* --- Left side: Result details --- */}
            <div className="space-y-4">
              <p className="text-muted text-2xl font-bold uppercase tracking-wide text-white">
                Results
              </p>

              <div className="space-y-3">
                {/* Status */}
                <h3 className="text-2xl font-bold">
                  Status: <span className={`${statusColor}`}>{status}</span>
                </h3>

                {/* File info */}
                <p className="text-sm text-gray-400 italic">File: {filename}</p>

                {/* Prediction */}
                <p className="text-lg font-medium">
                  Prediction:{" "}
                  <span
                    className={"text-green-500"}
                  >
                    {prediction}
                  </span>
                </p>

                {/* CDR */}
                <p className="text-lg font-medium">
                  CDR:{" "}
                  <span
                    className={`${cdr < 0.6
                        ? "text-green-500"
                        : cdr < 0.7
                          ? "text-yellow-400"
                          : "text-red-500"
                      } font-semibold transition-colors`}
                  >
                    {cdr}
                  </span>
                </p>
                {/* Vessel Risk */}
                <p className="text-lg font-medium">
                  Vessel Risk:{" "}
                  <span
                    className={"text-green-500"}
                  >
                    {vessel_risk}
                  </span>
                </p>

                <img
                  src={`data:image/png;base64,${gradcam}`}
                  alt="GradCAM Heatmap"
                  style={{ marginTop: "10px", borderRadius: "10px" }}
                  width="300"
                  />

                {/* User message */}
                <div className="mt-3">
                  <p className={`${statusColor} font-medium`}>{userMessage}</p>
                </div>

                {/* AI Insight */}
                <div className="bg-gray-800/40 rounded-lg p-4 mt-4">
                  <h4 className="text-white font-semibold mb-2">
                    🔍 AI Insight
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    This result was generated using a deep learning pipeline
                    combining{" "}
                    <span className="font-semibold text-blue-400">ResNet</span>{" "}
                    (for disease classification),{" "}
                    <span className="font-semibold text-blue-400">YOLO</span>{" "}
                    (for optic disc localization), and{" "}
                    <span className="font-semibold text-blue-400">UNet</span>{" "}
                    (for vessel segmentation). These models collectively analyze
                    optic nerve patterns to assist in early glaucoma screening.
                  </p>
                </div>
              </div>
            </div>

            {/* --- Right side: Uploaded Image --- */}
            <div className="relative">
              <div className="aspect-video rounded-xl overflow-hidden bg-gradient-subtle border border-gray-700">
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
