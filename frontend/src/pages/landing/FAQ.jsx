import { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { MOCK_FAQS } from '../../constants/mockData';

export default function FAQPage() {
  const [openFaq, setOpenFaq] = useState(null);
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <Breadcrumb items={[{ label: 'FAQ' }]} className="mb-6" />
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-3"><HelpCircle size={22} className="text-primary" /></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-500">Everything you need to know about SignSpeak</p>
      </div>
      <div className="space-y-3">
        {MOCK_FAQS.map((faq, i) => (
          <Card key={i} padding="none" className="overflow-hidden">
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium text-gray-900 pr-4">{faq.question}</span>
              <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
            </button>
            {openFaq === i && <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{faq.answer}</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}
