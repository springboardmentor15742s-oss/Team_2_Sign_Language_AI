import { useEffect, useMemo, useState } from 'react';
import {
  Award,
  CalendarDays,
  CheckCircle2,
  Copy,
  ExternalLink,
  GraduationCap,
  Printer,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import certificateService from '../../services/certificateService';

const formatDate = (value) => {
  if (!value) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

function CertificatePreview({ certificate, onClose }) {
  if (!certificate) return null;

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(certificate.certificate_number || '');
    } catch {
      // Clipboard may be unavailable in some browsers.
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 bg-[#111827] text-slate-300 hover:text-white hover:border-slate-500 transition"
          >
            Close
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16d4d0] text-[#071014] font-bold hover:brightness-110 transition"
          >
            <Printer size={17} />
            Print / Save PDF
          </button>
        </div>

        <div
          id="certificate-print-area"
          className="relative overflow-hidden bg-[#f8fafc] text-slate-900 rounded-[28px] shadow-2xl border-[10px] border-white"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-100/60" />
            <div className="absolute -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full bg-teal-100/70" />
          </div>

          <div className="relative border-2 border-slate-900/10 m-3 md:m-6 px-6 py-12 md:px-16 md:py-16 text-center min-h-[650px] flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-[#0b1320] flex items-center justify-center shadow-xl mb-7">
              <Award size={40} className="text-[#16d4d0]" />
            </div>

            <div className="flex items-center gap-2 text-[#0f8f8c] text-xs font-extrabold uppercase tracking-[0.28em]">
              <Sparkles size={15} />
              SignSpeak AI Learning Platform
            </div>

            <h1 className="mt-6 text-4xl md:text-6xl font-black tracking-tight">
              Certificate
            </h1>

            <p className="mt-2 text-xl md:text-2xl text-slate-500 font-medium">
              of Completion
            </p>

            <div className="w-24 h-1 bg-[#16d4d0] rounded-full my-8" />

            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 font-semibold">
              This certificate recognizes successful completion of
            </p>

            <h2 className="mt-4 max-w-3xl text-2xl md:text-4xl font-extrabold text-slate-900">
              {certificate.title || 'SignSpeak Course'}
            </h2>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl text-left">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                  Certificate Number
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <p className="font-mono text-sm font-bold break-all">
                    {certificate.certificate_number || '—'}
                  </p>

                  <button
                    onClick={copyNumber}
                    className="print:hidden text-slate-400 hover:text-[#0f8f8c]"
                    title="Copy certificate number"
                  >
                    <Copy size={15} />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                  Issued On
                </p>
                <p className="mt-2 font-bold">
                  {formatDate(certificate.issued_at)}
                </p>
              </div>
            </div>

            <div className="mt-10 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <ShieldCheck size={18} className="text-[#0f8f8c]" />
              Verified by SignSpeak
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          #certificate-print-area,
          #certificate-print-area * {
            visibility: visible !important;
          }

          #certificate-print-area {
            position: fixed !important;
            inset: 0 !important;
            width: 100% !important;
            min-height: 100vh !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await certificateService.getCertificates();

      setCertificates(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          'Unable to load your certificates right now.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const latestCertificate = useMemo(() => {
    if (!certificates.length) return null;

    return [...certificates].sort(
      (a, b) =>
        new Date(b.issued_at || 0).getTime() -
        new Date(a.issued_at || 0).getTime()
    )[0];
  }, [certificates]);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={28}
            className="animate-spin text-[#16d4d0] mx-auto"
          />
          <p className="mt-4 text-sm text-slate-400">
            Loading your certificates...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-10">
      <section className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-[#0b111c] p-7 md:p-9">
        <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-[#16d4d0]/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-7">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16d4d0]/10 border border-[#16d4d0]/20 text-[#16d4d0] text-xs font-bold uppercase tracking-wider">
              <Award size={14} />
              Credentials
            </div>

            <h1 className="mt-5 text-3xl md:text-4xl font-black tracking-tight text-white">
              Your Certificates
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400 leading-relaxed">
              Your verified SignSpeak course completion credentials are
              collected here. View, print, or save your earned certificates.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-[280px]">
            <div className="rounded-2xl border border-slate-800 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Earned
              </p>
              <p className="mt-2 text-3xl font-black text-white">
                {certificates.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Latest
              </p>
              <p className="mt-2 text-sm font-bold text-slate-200">
                {latestCertificate
                  ? formatDate(latestCertificate.issued_at)
                  : 'Not earned yet'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 flex items-start justify-between gap-4">
          <div>
            <p className="font-bold text-red-300">Could not load certificates</p>
            <p className="text-sm text-red-300/70 mt-1">{error}</p>
          </div>

          <button
            onClick={loadCertificates}
            className="text-sm font-bold text-red-200 hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {!error && certificates.length === 0 ? (
        <section className="rounded-[26px] border border-slate-800 bg-[#0d131e] px-6 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#16d4d0]/10 border border-[#16d4d0]/20 flex items-center justify-center mx-auto">
            <GraduationCap size={30} className="text-[#16d4d0]" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-white">
            Your first certificate is waiting
          </h2>

          <p className="mt-2 max-w-md mx-auto text-sm leading-6 text-slate-400">
            Complete an enrolled course to unlock its SignSpeak certificate.
            Your earned credentials will appear here automatically.
          </p>

          <a
            href="/courses"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#16d4d0] px-5 py-2.5 text-sm font-bold text-[#071014] hover:brightness-110 transition"
          >
            Continue Learning
            <ExternalLink size={15} />
          </a>
        </section>
      ) : (
        <section>
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16d4d0]">
                Achievement Library
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">
                Earned Credentials
              </h2>
            </div>

            <button
              onClick={loadCertificates}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {certificates.map((certificate) => (
              <article
                key={certificate.id}
                className="group relative overflow-hidden rounded-[24px] border border-slate-800 bg-[#0d131e] p-6 hover:border-[#16d4d0]/30 transition"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#16d4d0]/5 blur-3xl rounded-full" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#16d4d0]/10 border border-[#16d4d0]/20 flex items-center justify-center shrink-0">
                      <Award size={23} className="text-[#16d4d0]" />
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-xs font-bold">
                      <CheckCircle2 size={13} />
                      Verified
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-white leading-snug">
                    {certificate.title || 'Certificate of Completion'}
                  </h3>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <CalendarDays size={16} className="text-slate-500" />
                      <span className="text-slate-500">Issued</span>
                      <span className="ml-auto font-semibold text-slate-300">
                        {formatDate(certificate.issued_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <ShieldCheck size={16} className="text-slate-500" />
                      <span className="text-slate-500">Credential</span>
                      <span className="ml-auto max-w-[220px] truncate font-mono text-xs text-slate-300">
                        {certificate.certificate_number || '—'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCertificate(certificate)}
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-white/[0.03] px-4 py-3 text-sm font-bold text-slate-200 hover:bg-[#16d4d0] hover:border-[#16d4d0] hover:text-[#071014] transition"
                  >
                    <Award size={16} />
                    View Certificate
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-[24px] border border-slate-800 bg-[#0d131e] p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
            <Sparkles size={20} className="text-violet-300" />
          </div>

          <div>
            <h3 className="font-bold text-white">
              How certificates are earned
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              Complete all required lessons in an enrolled course. Once the
              course reaches 100% completion, the course becomes eligible for
              a verified SignSpeak completion certificate.
            </p>
          </div>
        </div>
      </section>

      <CertificatePreview
        certificate={selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
      />
    </div>
  );
}
