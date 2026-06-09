"use client";

import { useState } from "react";
import { Sparkles, Globe, Loader2, Database, Search, CheckCircle } from "lucide-react";

export default function Home() {
  const [sourceText, setSourceText] = useState("");
  const [targetLang, setTargetLang] = useState("Spanish");
  const [targetCulture, setTargetCulture] = useState("Argentina");
  const [threadId, setThreadId] = useState("session-unique-101");
  const [loading, setLoading] = useState(false);

  const [stepData, setStepData] = useState({
    translator: { active: false, done: false, trans: "", notes: "" },
    verifier: { active: false, done: false, context: "" },
    adapter: { active: false, done: false, final: "" }
  });

  const handleLocalizeStream = async () => {
    if (!sourceText) return;
    setLoading(true);

    // Reset component state metrics
    setStepData({
      translator: { active: true, done: false, trans: "", notes: "" },
      verifier: { active: false, done: false, context: "" },
      adapter: { active: false, done: false, final: "" }
    });

    try {
      const response = await fetch("http://127.0.0.1:8000/api/localize/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_text: sourceText,
          target_language: targetLang,
          target_culture: targetCulture,
          thread_id: threadId
        })
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          // 1. Verify the line starts with the SSE data prefix
          if (line.startsWith("data: ")) {
            try {
              // 2. Clean the line by removing 'data: ' and trimming trailing whitespaces
              const rawJson = line.replace("data: ", "").trim();

              // 3. Parse our cleanly stripped JSON payload
              const parsed = JSON.parse(rawJson);
              const node = parsed.node;
              const data = parsed.data;

              // 4. Correctly route the data to update the UI blocks
              if (node === "translator") {
                setStepData(prev => ({
                  ...prev,
                  translator: { active: false, done: true, trans: data.literal_translation, notes: data.cultural_notes },
                  verifier: { ...prev.verifier, active: true }
                }));
              } else if (node === "verifier") {
                setStepData(prev => ({
                  ...prev,
                  verifier: { active: false, done: true, context: data.search_context },
                  adapter: { ...prev.adapter, active: true }
                }));
              } else if (node === "adapter") {
                setStepData(prev => ({
                  ...prev,
                  adapter: { active: false, done: true, final: data.final_output }
                }));
              }
            } catch (err) {
              console.error("Error parsing stream chunk:", err, "Line content:", line);
            }
          }
        }
      }
    } catch (error) {
      console.error("Stream connection failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-200 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Globe className="text-indigo-600 w-8 h-8" />
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                CultureSync Agent Pro
              </h1>
            </div>
            <p className="text-slate-500 text-sm mt-1">Multi-Node LangGraph Agent with Live Memory & Tavily Search Audit.</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 border border-slate-200 rounded-lg shadow-sm">
            <Database className="w-4 h-4 text-indigo-500" />
            <span className="text-xs text-slate-500 font-mono">Thread ID:</span>
            <input
              type="text"
              value={threadId}
              onChange={(e) => setThreadId(e.target.value)}
              className="bg-transparent border-none text-xs text-indigo-600 focus:outline-none w-32 font-mono font-medium"
            />
          </div>
        </div>

        {/* Input Parameters Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-slate-700">Campaign Pitch Copy</label>
            <textarea
              className="w-full h-44 p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-slate-800 shadow-sm resize-none font-sans"
              placeholder="Enter product text..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
            />
          </div>

          <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Localization Targets</h3>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Target Language</label>
                <input type="text" value={targetLang} onChange={e => setTargetLang(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Target Culture/Region</label>
                <input type="text" value={targetCulture} onChange={e => setTargetCulture(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
              </div>
            </div>

            <button
              onClick={handleLocalizeStream}
              disabled={loading || !sourceText}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg font-medium transition flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              Execute Agentic Workflow
            </button>
          </div>
        </div>

        {/* Live Streaming Execution Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Box 1: Translator Step */}
          <div className={`p-5 border rounded-xl transition ${stepData.translator.active ? 'border-indigo-500 bg-white shadow-md' : 'border-slate-200 bg-white'}`}>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Literal Base Translation</h4>
              {stepData.translator.active && <Loader2 className="animate-spin w-4 h-4 text-indigo-600" />}
              {stepData.translator.done && <CheckCircle className="w-4 h-4 text-emerald-600" />}
            </div>
            {stepData.translator.trans ? (
              <div className="space-y-3 text-sm">
                <p className="text-slate-700 italic">"{stepData.translator.trans}"</p>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-amber-700 block mb-1">Detected Friction Areas:</span>
                  <p className="text-xs text-slate-600 font-mono whitespace-pre-line leading-relaxed">{stepData.translator.notes}</p>
                </div>
              </div>
            ) : <p className="text-xs text-slate-400 italic">Awaiting pipeline initialization...</p>}
          </div>

          {/* Box 2: Search Verification Step */}
          <div className={`p-5 border rounded-xl transition ${stepData.verifier.active ? 'border-amber-500 bg-white shadow-md' : 'border-slate-200 bg-white'}`}>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Live Tavily Verification</h4>
              {stepData.verifier.active && <Loader2 className="animate-spin w-4 h-4 text-amber-600" />}
              {stepData.verifier.done && <CheckCircle className="w-4 h-4 text-emerald-600" />}
            </div>
            {stepData.verifier.context ? (
              <div className="text-xs font-mono text-slate-700 max-h-48 overflow-y-auto space-y-2">
                <div className="flex items-center gap-1 text-amber-700 font-semibold"><Search className="w-3 h-3" /> External Verification Context Found:</div>
                <p className="bg-slate-50 p-2 border border-slate-200 rounded leading-relaxed">{stepData.verifier.context.substring(0, 450)}...</p>
              </div>
            ) : <p className="text-xs text-slate-400 italic">Awaiting preceding node output...</p>}
          </div>

          {/* Box 3: Final Output Step */}
          <div className={`p-5 border rounded-xl transition ${stepData.adapter.active ? 'border-emerald-500 bg-white shadow-md' : 'border-slate-200 bg-white'}`}>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">3. Culturally Fluent Copy</h4>
              {stepData.adapter.active && <Loader2 className="animate-spin w-4 h-4 text-emerald-600" />}
              {stepData.adapter.done && <CheckCircle className="w-4 h-4 text-emerald-600" />}
            </div>
            {stepData.adapter.final ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-slate-800 text-sm font-medium leading-relaxed">{stepData.adapter.final}</p>
              </div>
            ) : <p className="text-xs text-slate-400 italic">Awaiting final execution output...</p>}
          </div>

        </div>

      </div>
    </main>
  );
}