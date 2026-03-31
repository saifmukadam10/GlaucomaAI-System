import { useState, useRef, useEffect } from "react";
import heroImage from "@/assets/hero-eye-examination.jpg";
import { ResultsCard } from "./ResultsCard";

export const HeroSection = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<{ question: string; answer: string }[]>([]);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

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

  const handleAskQuestion = async () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;
    setAsking(true);
    setAskError(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: trimmedQuestion }),
      });
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const data = await res.json();
      setChatHistory((prev) => [
        ...prev,
        { question: trimmedQuestion, answer: data.answer ?? "No response received." },
      ]);
      setQuestion("");
    } catch (err) {
      console.error("Error asking LLM:", err);
      setAskError("Unable to get a response right now. Please try again.");
    } finally {
      setAsking(false);
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
        <div id="result" ref={resultSectionRef} className="mt-10">
          <ResultsCard
            imageUrl={URL.createObjectURL(selectedFile)}
            prediction={result.prediction}
            //confidence={result.confidence}
            //risk={result.risk_score}
            cdr={result.cdr}
            //explanation={result.explanation}
            filename={selectedFile.name}
            vessel_risk={result.vessel_risk}
            disc_box={result.disc_box}
            cup_box={result.cup_box}
            detections={result.detections}
            image_width={result.image_width}
            image_height={result.image_height}
            gradcam={result.gradcam}
            vessel_bw={result.vessel_bw}
          />
        </div>
      )}

      {/* Glaucoma Q&A Section (always visible on homepage) */}
      <section className="max-w-3xl mx-auto bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mt-10">
        <h3 className="text-2xl font-semibold text-white mb-2">
          Ask a Glaucoma Question
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          This assistant is specialized only in{" "}
          <span className="font-semibold text-primary">glaucoma-related</span> questions
          (risk factors, optic nerve, CDR, treatment options, follow-up, etc.). It does not
          replace consultation with an ophthalmologist.
        </p>

        <div className="rounded-xl border border-gray-800 bg-gray-950/50 p-4 mb-4 max-h-[420px] overflow-y-auto space-y-4">
          {chatHistory.length === 0 ? (
            <p className="text-sm text-gray-500">
              Ask your first glaucoma question below.
            </p>
          ) : (
            chatHistory.map((item, index) => (
              <div key={`${item.question}-${index}`} className="space-y-2">
                <div className="rounded-lg bg-gray-900 border border-gray-800 p-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Prompt</p>
                  <p className="text-sm text-gray-100 whitespace-pre-line">{item.question}</p>
                </div>
                <div className="rounded-lg bg-black/30 border border-primary/30 p-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    LLM Response
                  </p>
                  <p className="text-sm text-gray-100 whitespace-pre-line">{item.answer}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            className="w-full rounded-lg bg-gray-950 border border-gray-700 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Example: What does a high cup-to-disc ratio mean in terms of glaucoma risk?"
          />
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleAskQuestion}
              disabled={asking || !question.trim()}
              className={`px-5 py-2 rounded-lg text-sm font-semibold ${
                asking || !question.trim()
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
            >
              {asking ? "Asking..." : "Ask Glaucoma Assistant"}
            </button>
            {askError && <span className="text-xs text-red-400">{askError}</span>}
          </div>
        </div>
      </section>
    </section>
  );
};
