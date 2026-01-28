
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Forest, Extraction, ProductType } from '../types';

interface AIInsightsProps {
  forests: Forest[];
  extractions: Extraction[];
  products: ProductType[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ forests, extractions, products }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const summaryData = {
        totalForests: forests.length,
        financials: {
          totalRevenue: extractions.reduce((sum, e) => sum + e.salePrice, 0),
          totalHarvestCost: extractions.reduce((sum, e) => sum + e.harvestingCost, 0),
          totalTransportCost: extractions.reduce((sum, e) => sum + e.transportCost, 0),
        },
        volumeSplit: {
          resold: extractions.filter(e => e.destination === 'Resold').reduce((sum, e) => sum + e.totalQuantity, 0),
          ownUse: extractions.filter(e => e.destination === 'Own Use').reduce((sum, e) => sum + e.totalQuantity, 0),
        },
        recentTransactions: extractions.slice(0, 10).map(e => ({
          forest: forests.find(f => f.id === e.forestId)?.name,
          productCount: e.items.length,
          dest: e.destination,
          qty: e.totalQuantity,
          net: e.salePrice - (e.harvestingCost + e.transportCost)
        }))
      };

      const prompt = `
        As a senior timber management consultant, analyze the following forestry data:
        1. Summarize business performance with emphasis on profit vs costs (all figures in EUR €).
        2. Analyze the efficiency of "Own Use" vs "Resold" strategy. Is the harvesting and transport overhead too high for the volume being extracted?
        3. Highlight the specific forest and product with the best margins after considering both harvesting and transport costs.
        4. Give 3 actionable sustainability or efficiency tips.
        
        Keep the tone professional and expert. Use Markdown. Use the Euro symbol (€).
        
        DATA:
        ${JSON.stringify(summaryData, null, 2)}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setInsight(response.text);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      setInsight("Error analyzing your forestry data. Please check your network or API settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Forester AI Advisor</h2>
          <p className="text-slate-500">Intelligent strategic analysis of your timber enterprise</p>
        </div>
        <button
          onClick={generateInsights}
          disabled={loading || extractions.length === 0}
          className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md ${
            loading || extractions.length === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-900/10 font-outfit'
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <span>🧠</span>
              Consult Forester AI
            </>
          )}
        </button>
      </header>

      {extractions.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center shadow-sm">
          <p className="text-slate-400 text-lg">Record your first extraction to unlock AI business insights.</p>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[400px]">
          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-8 bg-slate-100 rounded w-1/3" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-5/6" />
                <div className="h-4 bg-slate-100 rounded w-4/6" />
              </div>
              <div className="h-32 bg-slate-50 rounded-2xl w-full" />
            </div>
          ) : insight ? (
            <div className="prose prose-slate max-w-none animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider mb-8">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                Strategic Consultation Report
              </div>
              <div className="text-slate-700 leading-relaxed font-outfit text-lg">
                {insight}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 py-20">
              <span className="text-7xl mb-6 opacity-20">🌲</span>
              <p className="text-xl font-medium text-slate-400">Ready to analyze your harvest data.</p>
              <p className="text-sm">Click the button to generate a detailed cost-efficiency report.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIInsights;
