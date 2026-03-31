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
  const [downloadingPdf, setDownloadingPdf] = useState(false);

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

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image for PDF export."));
      img.src = src;
    });

  const createAnnotatedFundusDataUrl = async () => {
    const sourceImg = await loadImage(imageUrl);
    const canvas = document.createElement("canvas");
    const width = sourceImg.naturalWidth || image_width || 1024;
    const height = sourceImg.naturalHeight || image_height || 1024;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return sourceImg.src;

    ctx.drawImage(sourceImg, 0, 0, width, height);

    const drawBox = (box: number[] | undefined, color: string, label: string) => {
      if (!box || box.length !== 4) return;
      const [x1, y1, x2, y2] = box;
      const boxW = Math.max(2, x2 - x1);
      const boxH = Math.max(2, y2 - y1);
      const lineW = Math.max(2, Math.round(width * 0.003));
      const fontSize = Math.max(12, Math.round(width * 0.02));

      ctx.strokeStyle = color;
      ctx.lineWidth = lineW;
      ctx.strokeRect(x1, y1, boxW, boxH);

      ctx.font = `${fontSize}px Arial`;
      const textW = ctx.measureText(label).width;
      const labelPad = 6;
      const labelW = textW + labelPad * 2;
      const labelH = fontSize + labelPad;
      const labelX = x1;
      const labelY = Math.max(0, y1 - labelH);

      ctx.fillStyle = color;
      ctx.fillRect(labelX, labelY, labelW, labelH);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, labelX + labelPad, labelY + fontSize);
    };

    drawBox(normalizedBoxes.disc, "#dc2626", "Disc");
    drawBox(normalizedBoxes.cup, "#16a34a", "Cup");

    return canvas.toDataURL("image/png");
  };

  const handleDownloadPdf = async () => {
    if (downloadingPdf) return;
    setDownloadingPdf(true);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 12;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const ensureSpace = (required: number) => {
        if (y + required > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      const addWrapped = (
        text: string,
        options?: {
          fontSize?: number;
          spacing?: number;
          color?: [number, number, number];
          fontStyle?: "normal" | "bold" | "italic";
        }
      ) => {
        const fontSize = options?.fontSize ?? 11;
        const spacing = options?.spacing ?? 5;
        const color = options?.color ?? [31, 41, 55];
        const fontStyle = options?.fontStyle ?? "normal";

        doc.setFont("helvetica", fontStyle);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, contentWidth);
        const required = lines.length * spacing + 1;
        ensureSpace(required);
        doc.text(lines, margin, y);
        y += required;
      };

      const addImageBlock = async (
        title: string,
        imgSrc: string,
        note: string
      ) => {
        ensureSpace(9);
        doc.setFillColor(239, 246, 255);
        doc.roundedRect(margin, y - 4.5, contentWidth, 8, 2, 2, "F");
        addWrapped(title, { fontSize: 12, spacing: 5.5, color: [30, 64, 175], fontStyle: "bold" });
        const img = await loadImage(imgSrc);
        const ratio = img.naturalHeight / img.naturalWidth || 0.75;
        const imgWidth = contentWidth;
        const imgHeight = imgWidth * ratio;
        ensureSpace(imgHeight + 8);
        doc.addImage(imgSrc, "PNG", margin, y, imgWidth, imgHeight);
        y += imgHeight + 4;
        addWrapped(note, { fontSize: 10.5, spacing: 4.8, color: [71, 85, 105] });
        y += 2;
      };

      const statusFill = isGlaucoma ? [254, 226, 226] : [220, 252, 231];
      const statusText = isGlaucoma ? [153, 27, 27] : [22, 101, 52];
      const statusBorder = isGlaucoma ? [239, 68, 68] : [34, 197, 94];

      doc.setFillColor(15, 23, 42);
      doc.roundedRect(margin, y, contentWidth, 16, 3, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Glaucoma AI Analysis Report", margin + 4, y + 7.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(191, 219, 254);
      doc.text("Automated screening summary and visual evidence", margin + 4, y + 12.5);
      y += 22;

      ensureSpace(11);
      doc.setFillColor(statusFill[0], statusFill[1], statusFill[2]);
      doc.setDrawColor(statusBorder[0], statusBorder[1], statusBorder[2]);
      doc.roundedRect(margin, y - 1.5, contentWidth, 9, 2, 2, "FD");
      addWrapped(`Diagnosis: ${status}`, {
        fontSize: 12,
        spacing: 5.2,
        color: [statusText[0], statusText[1], statusText[2]],
        fontStyle: "bold",
      });
      y += 1;

      addWrapped(`File: ${filename}`, { fontSize: 11, spacing: 5, color: [55, 65, 81] });
      addWrapped(`CDR (Cup-to-Disc Ratio): ${cdr.toFixed(2)} (${cdrInfo.text})`, {
        fontSize: 11,
        spacing: 5,
        color: [37, 99, 235],
      });
      addWrapped(`Vessel Risk: ${vesselRiskText}`, {
        fontSize: 11,
        spacing: 5,
        color: vessel_risk === 1 ? [185, 28, 28] : [21, 128, 61],
        fontStyle: "bold",
      });
      addWrapped(`Clinical Note: ${userMessage.replace(/[^\x00-\x7F]/g, "")}`, {
        fontSize: 10.8,
        spacing: 4.9,
        color: [75, 85, 99],
      });
      addWrapped(`Recommendation: ${recommendation}`, {
        fontSize: 10.8,
        spacing: 4.9,
        color: [30, 64, 175],
        fontStyle: "italic",
      });
      y += 2;

      const annotatedFundus = await createAnnotatedFundusDataUrl();
      const gradcamData = `data:image/png;base64,${gradcam}`;
      const vesselData = `data:image/png;base64,${vessel_bw}`;

      await addImageBlock(
        "1) Fundus Image with Disc/Cup Boxes",
        annotatedFundus,
        "Disc and cup boxes are used for cup-to-disc ratio estimation. A larger cup relative to disc may indicate glaucomatous optic nerve changes."
      );
      await addImageBlock(
        "2) Grad-CAM Attention Map",
        gradcamData,
        "Warm regions show where the model focused while deciding glaucoma risk."
      );
      await addImageBlock(
        "3) Vessel Segmentation Map",
        vesselData,
        "White regions represent segmented retinal vessels used as supportive structural features."
      );

      const safeName = filename.replace(/\.[^/.]+$/, "");
      doc.save(`${safeName}_ai_result.pdf`);
    } catch (error) {
      console.error("PDF download failed:", error);
    } finally {
      setDownloadingPdf(false);
    }
  };

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

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                downloadingPdf
                  ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
            >
              {downloadingPdf ? "Preparing PDF..." : "Download AI Result"}
            </button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};