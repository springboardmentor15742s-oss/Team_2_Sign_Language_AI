import { useEffect, useState } from 'react';
import { Activity, BarChart2, CheckCircle, AlertTriangle, Layers, RefreshCw, FileText, Cpu, Target, Play, ShieldCheck, HelpCircle, GitCompareArrows, Clock } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { assessmentService } from '../../services/assessmentService';

export default function ModelEvaluation() {
  const [report, setReport] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reportRes, comparisonRes] = await Promise.all([
        assessmentService.getModelEvaluation(),
        assessmentService.getModelComparison().catch(() => null),
      ]);
      setReport(reportRes.data);
      if (comparisonRes) setComparison(comparisonRes.data);
    } catch (err) {
      console.error('Failed to load evaluation metrics:', err);
      setError(err.response?.data?.detail || 'Unable to load model evaluation results. Please ensure backend server is running and staff authorization is present.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunEvaluation = async () => {
    setIsEvaluating(true);
    setSuccessMsg(null);
    setError(null);
    try {
      const res = await assessmentService.runEvaluation();
      setSuccessMsg('Evaluation completed successfully against the live dataset. Model metrics updated.');
      if (res.data?.report) {
        setReport(res.data.report);
      } else {
        await fetchReport();
      }
      if (res.data?.comparison) {
        setComparison(res.data.comparison);
      }
    } catch (err) {
      console.error('Evaluation run failed:', err);
      setError(err.response?.data?.detail || 'Failed to run model evaluation. Ensure test dataset is initialized.');
    } finally {
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const perClass = report?.per_class_metrics || {};
  const classList = Object.keys(perClass);
  const cm = report?.confusion_matrix || [];

  // Safely format metrics to percentage string
  const formatPercent = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '0.00%';
    const pct = val <= 1.0 ? val * 100 : val;
    return `${pct.toFixed(2)}%`;
  };

  const accuracyPct = report?.accuracy ? report.accuracy * 100 : 0;
  const precisionPct = report?.precision_macro ? report.precision_macro * 100 : 0;
  const recallPct = report?.recall_macro ? report.recall_macro * 100 : 0;
  const f1Pct = report?.f1_macro ? report.f1_macro * 100 : 0;

  const totalSamples = report?.test_samples || report?.total_samples || 0;
  const correctCount = report?.correct_predictions ?? Math.round((report?.accuracy || 0) * totalSamples);
  const incorrectCount = report?.incorrect_predictions ?? (totalSamples - correctCount);

  const liveModelMatches = report?.live_model_matches_evaluated ?? true;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'Admin', path: '/admin' }, { label: 'Model Evaluation' }]} />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary mb-1">
            <Cpu size={14} /> MODEL EVALUATION DASHBOARD
          </div>
          <h1 className="text-2xl font-bold text-white">Sign Assessment Model Evaluation</h1>
          <p className="text-sm text-slate-300 mt-1">
            Live accuracy metrics, dataset breakdown, per-class performance, and multiclass confusion matrix.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={handleRunEvaluation}
            disabled={isEvaluating || loading}
            className="bg-primary hover:bg-primary-600 text-white"
          >
            <Play size={14} className={isEvaluating ? 'animate-spin' : ''} />
            {isEvaluating ? 'Evaluating model...' : 'Run Evaluation'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchReport}
            disabled={loading}
            className="text-slate-200 border-slate-700 hover:bg-slate-800"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} /> {successMsg}
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {error && (
        <Card className="bg-red-950/80 border-red-800 text-red-200">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <AlertTriangle size={18} className="text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Live Model Verification Warning */}
      {!liveModelMatches && (
        <div className="p-4 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-200 text-xs font-semibold flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-400 shrink-0" />
          <span>
            <strong>Warning:</strong> The evaluated model version ({report?.model_version}) and deployed live model version ({report?.live_model_version}) are different.
          </span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
          <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-primary" />
          <p className="text-sm font-semibold text-white">Loading authoritative model evaluation results...</p>
        </div>
      ) : !report || report.total_samples === 0 ? (
        <Card className="bg-slate-900 border-slate-800 text-center p-8">
          <AlertTriangle size={32} className="text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Evaluation Results Unavailable</h3>
          <p className="text-sm text-slate-300 mt-1 max-w-md mx-auto">
            {report?.message || 'No evaluation report binary found. Please click "Run Evaluation" above to compute live test metrics.'}
          </p>
          <Button size="sm" onClick={handleRunEvaluation} className="mt-4">
            <Play size={14} /> Compute Evaluation Metrics
          </Button>
        </Card>
      ) : (
        <>
          {/* Top 4 Primary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card padding="medium" className="bg-slate-900 border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accuracy</span>
                <Target size={18} className="text-emerald-400" />
              </div>
              <div className="mt-2 text-3xl font-extrabold text-white">
                {formatPercent(report.accuracy)}
              </div>
              <span className="text-xs text-emerald-400 font-semibold mt-1 inline-block">
                Correct: {correctCount} / {totalSamples}
              </span>
            </Card>

            <Card padding="medium" className="bg-slate-900 border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Precision</span>
                <BarChart2 size={18} className="text-blue-400" />
              </div>
              <div className="mt-2 text-3xl font-extrabold text-white">
                {formatPercent(report.precision_macro)}
              </div>
              <span className="text-xs text-blue-400 font-semibold mt-1 inline-block">Macro Average</span>
            </Card>

            <Card padding="medium" className="bg-slate-900 border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recall</span>
                <Activity size={18} className="text-indigo-400" />
              </div>
              <div className="mt-2 text-3xl font-extrabold text-white">
                {formatPercent(report.recall_macro)}
              </div>
              <span className="text-xs text-indigo-400 font-semibold mt-1 inline-block">Macro Average</span>
            </Card>

            <Card padding="medium" className="bg-slate-900 border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">F1 Score</span>
                <ShieldCheck size={18} className="text-violet-400" />
              </div>
              <div className="mt-2 text-3xl font-extrabold text-white">
                {formatPercent(report.f1_macro)}
              </div>
              <span className="text-xs text-violet-400 font-semibold mt-1 inline-block">Macro F1 Score</span>
            </Card>
          </div>

          {/* Evaluation Dataset Explanation -- where these numbers actually come from */}
          <Card className="bg-slate-900 border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
              <Layers size={18} className="text-primary" /> Evaluation Dataset
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              These metrics are calculated from the <span className="font-semibold text-white">{report.dataset_name || 'configured evaluation dataset'}</span>,
              using a reproducible train/validation/test split. The model is evaluated only against the{' '}
              <span className="font-semibold text-white">test</span> split -- samples it never saw during training -- so the
              reported accuracy reflects genuine generalization, not memorization.
            </p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block font-medium">Training Samples</span>
                <span className="text-lg font-bold text-white">{report.train_samples || '—'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block font-medium">Validation Samples</span>
                <span className="text-lg font-bold text-white">{report.val_samples || '—'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block font-medium">Unseen Test Samples</span>
                <span className="text-lg font-bold text-blue-400">{totalSamples || '—'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block font-medium">Evaluated</span>
                <span className="text-sm font-bold text-white">{report.evaluated_at ? new Date(report.evaluated_at).toLocaleDateString() : 'Unknown'}</span>
              </div>
            </div>
          </Card>

          {/* Dataset & Split Summary + Accuracy Progress Visualization */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900 border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers size={18} className="text-primary" /> Dataset & Evaluation Split Summary
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block font-medium">Total Samples</span>
                  <span className="text-xl font-bold text-white">{totalSamples}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block font-medium">Unseen Test Samples</span>
                  <span className="text-xl font-bold text-blue-400">{totalSamples}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block font-medium">Correct Predictions</span>
                  <span className="text-xl font-bold text-emerald-400">{correctCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block font-medium">Incorrect Predictions</span>
                  <span className="text-xl font-bold text-rose-400">{incorrectCount}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/60 text-xs text-blue-200">
                <strong>Formula:</strong> Accuracy = Correct Predictions / Total Test Samples × 100
                <br />
                <span className="font-mono text-emerald-300">
                  {correctCount} / {totalSamples} × 100 = {accuracyPct.toFixed(2)}%
                </span>
              </div>
            </Card>

            <Card className="bg-slate-900 border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart2 size={18} className="text-primary" /> Metric Visualizations
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1 text-slate-200">
                    <span>Accuracy</span>
                    <span className="text-emerald-400">{accuracyPct.toFixed(2)}%</span>
                  </div>
                  <div className="h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${accuracyPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1 text-slate-200">
                    <span>Precision</span>
                    <span className="text-blue-400">{precisionPct.toFixed(2)}%</span>
                  </div>
                  <div className="h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${precisionPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1 text-slate-200">
                    <span>Recall</span>
                    <span className="text-indigo-400">{recallPct.toFixed(2)}%</span>
                  </div>
                  <div className="h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${recallPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1 text-slate-200">
                    <span>F1 Score</span>
                    <span className="text-violet-400">{f1Pct.toFixed(2)}%</span>
                  </div>
                  <div className="h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${f1Pct}%` }} />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Model Information Metadata Card */}
          <Card padding="medium" className="bg-slate-900 border-slate-800">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <FileText size={18} className="text-primary" /> Model Architecture & Pipeline Metadata
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block font-sans">Model Name</span>
                <span className="text-white font-bold">{report.model_name || 'RandomForestSignClassifier'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">Model Version</span>
                <span className="text-white font-bold">{report.model_version || 'v1.0.0-rf'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">Dataset</span>
                <span className="text-white font-bold">{report.dataset_name || 'ASL Alphabet Test Set'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">Classes</span>
                <span className="text-white font-bold">{classList.length || 29} ASL Signs</span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">Feature Count</span>
                <span className="text-white font-bold">{report.feature_count ? `${report.feature_count} Features` : 'Not yet evaluated'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">Train / Val / Test</span>
                <span className="text-white font-bold">
                  {report.train_samples || report.val_samples
                    ? `${report.train_samples} / ${report.val_samples} / ${totalSamples}`
                    : 'Not yet evaluated'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">Live vs Evaluated</span>
                <span className={`font-bold ${liveModelMatches ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {liveModelMatches ? 'Matched' : 'Mismatched'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">Landmarks</span>
                <span className="text-white font-bold">MediaPipe 21 3D Points</span>
              </div>
              <div className="col-span-2 md:col-span-4 flex items-center gap-1.5 pt-2 border-t border-slate-800/60">
                <Clock size={13} className="text-slate-500" />
                <span className="text-slate-400 font-sans">Last evaluated:</span>
                <span className="text-white font-bold">
                  {report.evaluated_at ? new Date(report.evaluated_at).toLocaleString() : 'Unknown'}
                </span>
              </div>
            </div>
          </Card>

          {/* Per-Class Metrics Table */}
          <Card className="bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Per-Class Performance Breakdown</h3>
                <p className="text-xs text-slate-400">Precision, Recall, and F1 Score for all {classList.length} ASL sign classes</p>
              </div>
              <span className="text-xs font-semibold text-slate-400 font-mono">{classList.length} Classes</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-300 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Support</th>
                    <th className="py-3 px-4">Correct</th>
                    <th className="py-3 px-4">Incorrect</th>
                    <th className="py-3 px-4">Precision</th>
                    <th className="py-3 px-4">Recall</th>
                    <th className="py-3 px-4">F1 Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
                  {classList.map((clsName) => {
                    const m = perClass[clsName] || {};
                    const precPct = formatPercent(m.precision);
                    const recPct = formatPercent(m.recall);
                    const f1Pct = formatPercent(m.f1_score);
                    const isPerfect = m.correct_count === m.sample_count && m.sample_count > 0;

                    return (
                      <tr key={clsName} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-4 font-bold text-white">{clsName}</td>
                        <td className="py-2.5 px-4 text-slate-300">{m.sample_count || 0}</td>
                        <td className="py-2.5 px-4 text-emerald-400 font-bold">{m.correct_count || 0}</td>
                        <td className="py-2.5 px-4 text-slate-400">{m.incorrect_count || 0}</td>
                        <td className="py-2.5 px-4 text-blue-300">{precPct}</td>
                        <td className="py-2.5 px-4 text-indigo-300">{recPct}</td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            isPerfect ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300' : 'bg-slate-800 text-slate-200'
                          }`}>
                            {f1Pct}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Multiclass Confusion Matrix Heatmap */}
          {cm.length > 0 && (
            <Card className="bg-slate-900 border-slate-800">
              <div className="mb-4">
                <h3 className="text-base font-bold text-white">Multiclass Confusion Matrix ({classList.length} × {classList.length})</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Rows represent true target sign classes; columns represent model predicted classes.
                </p>
              </div>

              <div className="overflow-x-auto p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px]">
                <div
                  className="grid gap-1"
                  style={{ gridTemplateColumns: `40px repeat(${classList.length}, minmax(24px, 1fr))` }}
                >
                  {/* Top Header Row */}
                  <div className="p-1 font-bold text-slate-500 text-center">T \ P</div>
                  {classList.map((cls) => (
                    <div key={`col-${cls}`} className="p-1 font-bold text-center text-primary-400">
                      {cls}
                    </div>
                  ))}

                  {/* Matrix Rows */}
                  {classList.map((rowCls, rIdx) => (
                    <div key={`row-group-${rowCls}`} className="contents">
                      <div className="p-1 font-bold text-primary-400 flex items-center justify-center">
                        {rowCls}
                      </div>
                      {cm[rIdx]?.map((val, cIdx) => (
                        <div
                          key={`cell-${rIdx}-${cIdx}`}
                          className={`p-1 text-center rounded flex items-center justify-center ${
                            rIdx === cIdx
                              ? 'bg-emerald-600/90 text-white font-bold'
                              : val > 0
                              ? 'bg-amber-600/80 text-white font-bold'
                              : 'bg-slate-900/80 text-slate-700'
                          }`}
                          title={`True: ${rowCls}, Predicted: ${classList[cIdx]}, Count: ${val}`}
                        >
                          {val}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Model Comparison Table */}
          <Card className="bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <GitCompareArrows size={18} className="text-primary" /> Model Comparison
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Alternative classifiers fit and evaluated on the identical train/test feature split as the deployed model.
                </p>
              </div>
            </div>
            {!comparison || !comparison.models || comparison.models.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                {comparison?.message || 'No model comparison available yet. Click "Run Evaluation" to generate one.'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-300 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Model</th>
                      <th className="py-3 px-4">Accuracy</th>
                      <th className="py-3 px-4">Precision</th>
                      <th className="py-3 px-4">Recall</th>
                      <th className="py-3 px-4">F1</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
                    {comparison.models.map((m) => (
                      <tr key={m.model_name} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-4 font-bold text-white font-sans">{m.model_name}</td>
                        {m.status === 'failed' ? (
                          <td colSpan={4} className="py-2.5 px-4 text-rose-400">Failed: {m.error}</td>
                        ) : (
                          <>
                            <td className="py-2.5 px-4">{formatPercent(m.accuracy)}</td>
                            <td className="py-2.5 px-4 text-blue-300">{formatPercent(m.precision_macro)}</td>
                            <td className="py-2.5 px-4 text-indigo-300">{formatPercent(m.recall_macro)}</td>
                            <td className="py-2.5 px-4">{formatPercent(m.f1_macro)}</td>
                          </>
                        )}
                        <td className="py-2.5 px-4 font-sans">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            m.status === 'current'
                              ? 'bg-primary-500/20 border border-primary-500/40 text-primary-300'
                              : m.status === 'failed'
                              ? 'bg-rose-950/80 border border-rose-800 text-rose-300'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {m.status === 'current' ? 'Current (Deployed)' : m.status === 'failed' ? 'Failed' : 'Candidate'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Assessment System Integration Banner */}
          <Card className="bg-slate-950 border-slate-800">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary-500/20 text-primary flex items-center justify-center shrink-0">
                <HelpCircle size={20} />
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-white text-sm">Real-Time Practice & Assessment Connection</h4>
                <p className="text-slate-300 leading-relaxed">
                  Both the offline accuracy evaluation system and live webcam practice run on the exact same MediaPipe 3D landmark extractor, {report.feature_count || 'N'}-dimensional feature vector, and trained <code className="text-primary font-bold">sign_classifier.joblib</code> model binary.
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
