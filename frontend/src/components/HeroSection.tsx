import { useState, useRef, useEffect } from "react";
import heroImage from "@/assets/hero-eye-examination.jpg";
import { ResultsCard } from "./ResultsCard";

export const HeroSection = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const resultSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (result && resultSectionRef.current) {
      resultSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [result]);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setResult(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleGetResult = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data); // now stores full result JSON
      console.log("disc" + data.disc_box)
      console.log('cup' + data.cup_box)
    } catch (err) {
      console.error("Error uploading image:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="upload" className="container py-20 lg:py-24">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight font-manrope">
              Early Detection of{" "}
              <span className="text-primary">Glaucoma</span> with AI
            </h1>
            <p className="text-xl leading-relaxed bg-black/40 text-white rounded-lg p-2 inline-block">
              Upload a fundus image, get results in seconds.
            </p>
          </div>

          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragActive
                ? "border-primary bg-primary/10"
                : "border-gray-300 hover:border-primary"
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center space-y-2">
                <svg
                  className="w-10 h-10 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <p className="text-lg font-medium text-gray-700">
                  {selectedFile.name}
                </p>
                <label
                  htmlFor="file-upload"
                  className="text-sm text-primary underline cursor-pointer"
                >
                  Change file
                </label>
              </div>
            ) : (
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center space-y-2 cursor-pointer"
              >
                <svg
                  className="w-10 h-10 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-lg font-medium text-gray-700">
                  Drag & drop your image here
                </span>
                <span className="text-sm text-gray-500">
                  or click to select from your device
                </span>
              </label>
            )}
          </div>

          {selectedFile && (
            <button
              onClick={handleGetResult}
              className={`mt-4 px-6 py-3 rounded-lg bg-primary text-white font-semibold transition-opacity duration-500 ${
                selectedFile ? "opacity-100" : "opacity-0"
              }`}
              disabled={loading}
            >
              {loading ? "Processing..." : "Get Result"}
            </button>
          )}
        </div>

        {/* Hero Image */}
        <div className="relative">
          <div className="aspect-video rounded-2xl overflow-hidden shadow-medical bg-gradient-subtle">
            <img
              src={heroImage}
              alt="Professional eye examination for glaucoma detection"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-accent rounded-full opacity-20 blur-xl"></div>
        </div>
      </div>

      {/* Results Section */}
      {result && selectedFile && (
        <div id="result" ref={resultSectionRef}>
          <ResultsCard
            imageUrl={URL.createObjectURL(selectedFile)}
            prediction={result.prediction}
            //confidence={result.confidence}
            //risk={result.risk_score}
            cdr = {result.cdr}
            //explanation={result.explanation}
            filename={selectedFile.name}
            vessel_risk = {result.vessel_risk}
            disc_box={result.disc_box}
            cup_box={result.cup_box}
            image_width={result.image_width}
            image_height={result.image_height}
            gradcam = {result.gradcam}
          />
        </div>
      )}
    </section>
  );
};
