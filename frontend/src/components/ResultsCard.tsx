import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ResultsCardProps {
  imageUrl: string;
  cdr: number;
  filename: string;
  prediction: number | number[];
  vessel_risk: number;
  gradcam: string;
  vessel_bw: string;
  disc_box?: number[];
  cup_box?: number[];
  detections?: { label?: string; box?: number[]; score?: number }[];
  image_width?: number;
  image_height?: number;
}

export const ResultsCard = ({
  imageUrl,
  cdr,
  filename,
  prediction,
  vessel_risk,
  gradcam,
  vessel_bw,
  disc_box,
  cup_box,
  detections,
  image_width,
  image_height
}: ResultsCardProps) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [renderedSize, setRenderedSize] = useState<{ w: number; h: number } | null>(null);

  const updateRenderedSize = () => {
    const img = imgRef.current;
    if (!img) return;
    setRenderedSize({ w: img.clientWidth, h: img.clientHeight });
  };

  useEffect(() => {
    updateRenderedSize();
    window.addEventListener("resize", updateRenderedSize);
    return () => window.removeEventListener("resize", updateRenderedSize);
    // imageUrl change should trigger a re-measure
  }, [imageUrl, image_width, image_height]);

  const scales = useMemo(() => {
    if (!renderedSize || !image_width || !image_height) return null;
    return {
      scaleX: renderedSize.w / image_width,
      scaleY: renderedSize.h / image_height,
    };
  }, [renderedSize, image_width, image_height]);

  const boxToRectStyle = (
  box?: number[],
  color?: string
): React.CSSProperties | null => {
  if (!box || !scales) return null;
  if (!Array.isArray(box) || box.length !== 4) return null;

  const [x1, y1, x2, y2] = box;

  const left = x1 * scales.scaleX;
  const top = y1 * scales.scaleY;
  const width = Math.max(2, (x2 - x1) * scales.scaleX);
  const height = Math.max(2, (y2 - y1) * scales.scaleY);

  return {
    position: "absolute", // ✅ now correctly typed
    left,
    top,
    width,
    height,
    border: `2px solid ${color ?? "#ffffff"}`,
    boxSizing: "border-box",
  };
};

  const normalizedPrediction = Array.isArray(prediction) ? prediction[0] : prediction;

  const normalizedBoxes = useMemo(() => {
    const fromDetections = Array.isArray(detections) ? detections : [];
    const discFromDetections = fromDetections.find((d) => d?.label === "disc" && Array.isArray(d.box) && d.box.length === 4)?.box;
    const cupFromDetections = fromDetections.find((d) => d?.label === "cup" && Array.isArray(d.box) && d.box.length === 4)?.box;

    return {
      disc: discFromDetections ?? disc_box,
      cup: cupFromDetections ?? cup_box,
    };
  }, [detections, disc_box, cup_box]);

  // ✅ Prediction → Human readable
  const isGlaucoma = normalizedPrediction === 1;
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="bg-gray-900/40 border border-gray-700 rounded-xl p-6 space-y-5">
              <h2 className="text-3xl font-bold text-white">AI Analysis Report</h2>

              <div>
                <p className="text-gray-400 text-sm">Diagnosis</p>
                <h3 className={`text-2xl font-bold ${statusColor}`}>{status}</h3>
              </div>

              <p className="text-sm text-gray-500 italic">File: {filename}</p>

              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">CDR (Cup-to-Disc Ratio)</p>
                  <p className="text-lg font-semibold">
                    {cdr.toFixed(2)} — <span className={cdrInfo.color}>{cdrInfo.text}</span>
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Vessel Risk</p>
                  <p className={`text-lg font-semibold ${vesselColor}`}>{vesselRiskText}</p>
                </div>
              </div>

              <div className="bg-gray-800/40 p-4 rounded-lg">
                <p className={`font-medium ${statusColor}`}>{userMessage}</p>
              </div>

              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700">
                <p className="text-blue-300 font-medium">Recommendation: {recommendation}</p>
              </div>
            </div>

            <div className="bg-gray-900/40 border border-gray-700 rounded-xl p-6 space-y-4">
              <p className="text-gray-300 font-semibold">CDR Region (Disc/Cup Boxes)</p>

              <div className="relative w-full rounded-xl overflow-hidden border border-gray-700 bg-black">
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="Uploaded retinal image with disc and cup boxes"
                  className="block w-full h-auto"
                  onLoad={updateRenderedSize}
                />

                <div className="pointer-events-none absolute inset-0">
                  {(() => {
                    const discStyle = boxToRectStyle(normalizedBoxes.disc, "rgba(255, 0, 0, 0.95)");
                    const cupStyle = boxToRectStyle(normalizedBoxes.cup, "rgba(0, 255, 0, 0.95)");

                    return (
                      <>
                        {discStyle && (
                          <div style={discStyle}>
                            <span className="absolute -top-2 left-1 bg-red-600 text-white text-[10px] px-1 rounded">
                              Disc
                            </span>
                          </div>
                        )}
                        {cupStyle && (
                          <div style={cupStyle}>
                            <span className="absolute -top-2 left-1 bg-green-600 text-white text-[10px] px-1 rounded">
                              Cup
                            </span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">
                Disc and cup boxes are used to compute CDR. A larger cup relative to disc can indicate possible glaucomatous damage.
              </p>
            </div>

            <div className="bg-gray-900/40 border border-gray-700 rounded-xl p-6 space-y-4">
              <p className="text-gray-300 font-semibold">Grad-CAM (Model Attention)</p>
              <img
                src={`data:image/png;base64,${gradcam}`}
                alt="GradCAM heatmap"
                className="rounded-lg border border-gray-700 w-full"
              />
              <p className="text-sm text-gray-300 leading-relaxed">
                Warm colors (red/yellow) show where the model focused most for glaucoma prediction, often near the optic nerve head.
              </p>
            </div>

            <div className="bg-gray-900/40 border border-gray-700 rounded-xl p-6 space-y-4">
              <p className="text-gray-300 font-semibold">Vessel Segmentation</p>
              <img
                src={`data:image/png;base64,${vessel_bw}`}
                alt="Vessel segmentation (black and white)"
                className="rounded-lg border border-gray-700 w-full"
              />
              <p className="text-sm text-gray-300 leading-relaxed">
                White regions are detected retinal vessels. Vessel thinning or irregular patterns can support glaucoma risk assessment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};