import ReactMarkdown from "react-markdown";

export default function DailyAdviceCard({ advice, loading }) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 mb-6">
      <h2 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
        🤖 AI Daily Insight
      </h2>

      {loading ? (
        <p className="text-sm text-gray-500 italic">
          Analyzing your day…
        </p>
      ) : (
        <div className="text-sm text-gray-700">
          <ReactMarkdown>{advice}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
