import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, MessageCircle, Mail, ChevronDown, ChevronRight, BookOpen, FileText, Shield } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { FAQS } from '../../constants/mockData';

export default function Help() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumb items={[{ label: 'Help & Support' }]} className="mb-6" />
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Help & Support</h1>
        <p className="text-gray-500">Find answers or get in touch with our team</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <Link to="/help/faq"><Card hover className="text-center p-6">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-3"><HelpCircle size={22} className="text-primary" /></div>
          <h3 className="font-semibold text-gray-900">FAQ</h3>
          <p className="text-xs text-gray-500 mt-1">Common questions answered</p>
        </Card></Link>
        <Link to="/help/contact"><Card hover className="text-center p-6">
          <div className="w-12 h-12 rounded-xl bg-success-50 flex items-center justify-center mx-auto mb-3"><MessageCircle size={22} className="text-success" /></div>
          <h3 className="font-semibold text-gray-900">Contact Us</h3>
          <p className="text-xs text-gray-500 mt-1">Get in touch with support</p>
        </Card></Link>
        <Link to="/help/about"><Card hover className="text-center p-6">
          <div className="w-12 h-12 rounded-xl bg-warning-50 flex items-center justify-center mx-auto mb-3"><BookOpen size={22} className="text-warning" /></div>
          <h3 className="font-semibold text-gray-900">About</h3>
          <p className="text-xs text-gray-500 mt-1">Learn about SignSpeak</p>
        </Card></Link>
      </div>

      <Card className="mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-900">{faq.question}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
