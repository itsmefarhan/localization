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
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Globe className="text-indigo-400 w-8 h-8" />
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                CultureSync Agent Pro
              </h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">Multi-Node LangGraph Agent with Live Memory & Tavily Search Audit.</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 border border-slate-800 rounded-lg">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400 font-mono">Thread ID:</span>
            <input
              type="text"
              value={threadId}
              onChange={(e) => setThreadId(e.target.value)}
              className="bg-transparent border-none text-xs text-purple-300 focus:outline-none w-32 font-mono"
            />
          </div>
        </div>

        {/* Input Parameters Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-slate-300">Campaign Pitch Copy</label>
            <textarea
              className="w-full h-44 p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-200 resize-none font-sans"
              placeholder="Enter product text..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
            />
          </div>

          <div className="bg-slate-950 p-6 border border-slate-800 rounded-xl flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Localization Targets</h3>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Target Language</label>
                <input type="text" value={targetLang} onChange={e => setTargetLang(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Target Culture/Region</label>
                <input type="text" value={targetCulture} onChange={e => setTargetCulture(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none" />
              </div>
            </div>

            <button
              onClick={handleLocalizeStream}
              disabled={loading || !sourceText}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              Execute Agentic Workflow
            </button>
          </div>
        </div>

        {/* Live Streaming Execution Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Box 1: Translator Step */}
          <div className={`p-5 border rounded-xl transition ${stepData.translator.active ? 'border-indigo-500 bg-slate-950 shadow-lg shadow-indigo-500/10' : 'border-slate-800 bg-slate-950/50'}`}>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Literal Base Translation</h4>
              {stepData.translator.active && <Loader2 className="animate-spin w-4 h-4 text-indigo-400" />}
              {stepData.translator.done && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            </div>
            {stepData.translator.trans ? (
              <div className="space-y-3 text-sm">
                <p className="text-slate-200 italic">"{stepData.translator.trans}"</p>
                <div className="pt-2 border-t border-slate-900">
                  <span className="text-[11px] font-bold text-amber-400 block mb-1">Detected Friction Areas:</span>
                  <p className="text-xs text-slate-400 font-mono">{stepData.translator.notes}</p>
                </div>
              </div>
            ) : <p className="text-xs text-slate-600 italic">Awaiting pipeline initialization...</p>}
          </div>

          {/* Box 2: Search Verification Step */}
          <div className={`p-5 border rounded-xl transition ${stepData.verifier.active ? 'border-amber-500 bg-slate-950 shadow-lg shadow-amber-500/10' : 'border-slate-800 bg-slate-950/50'}`}>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Live Tavily Verification</h4>
              {stepData.verifier.active && <Loader2 className="animate-spin w-4 h-4 text-amber-400" />}
              {stepData.verifier.done && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            </div>
            {stepData.verifier.context ? (
              <div className="text-xs font-mono text-slate-300 max-h-48 overflow-y-auto space-y-2">
                <div className="flex items-center gap-1 text-amber-400"><Search className="w-3 h-3" /> External Verification Context Found:</div>
                <p className="bg-slate-900 p-2 border border-slate-800 rounded leading-relaxed">{stepData.verifier.context.substring(0, 450)}...</p>
              </div>
            ) : <p className="text-xs text-slate-600 italic">Awaiting preceding node output...</p>}
          </div>

          {/* Box 3: Final Output Step */}
          <div className={`p-5 border rounded-xl transition ${stepData.adapter.active ? 'border-emerald-500 bg-slate-950 shadow-lg shadow-emerald-500/10' : 'border-slate-800 bg-slate-950/50'}`}>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">3. Culturally Fluent Copy</h4>
              {stepData.adapter.active && <Loader2 className="animate-spin w-4 h-4 text-emerald-400" />}
              {stepData.adapter.done && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            </div>
            {stepData.adapter.final ? (
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg">
                <p className="text-slate-100 text-sm font-medium leading-relaxed">{stepData.adapter.final}</p>
              </div>
            ) : <p className="text-xs text-slate-600 italic">Awaiting final execution output...</p>}
          </div>

        </div>

      </div>
    </main>
  );
}