'use client';

import React from 'react';
import { Send, Loader2, LayoutTemplate } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmailFormProps {
  subject: string;
  setSubject: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  onSend: (e: React.FormEvent) => void;
  isSending: boolean;
  recipientCount: number;
}

// Modern, sleek, monochromatic template
const TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap');
  body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; color: #18181b; }
  .container { width: 100%; max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
  .header { background: #ffffff; padding: 40px 40px 20px; text-align: center; }
  .logo { width: 80px; height: auto; margin-bottom: 0px; }
  .content { padding: 0 40px 40px; }
  .badge { display: inline-block; background: #18181b; color: #ffffff; padding: 6px 12px; border-radius: 100px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px; }
  h1 { font-size: 24px; font-weight: 600; margin: 0 0 16px; color: #18181b; letter-spacing: -0.5px; }
  p { font-size: 15px; line-height: 1.7; color: #52525b; margin-bottom: 24px; }
  .details-box { background: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; padding: 24px; margin: 32px 0; }
  .detail-item { display: flex; align-items: center; margin-bottom: 12px; }
  .detail-item:last-child { margin-bottom: 0; }
  .detail-label { width: 80px; font-size: 12px; text-transform: uppercase; color: #a1a1aa; font-weight: 600; letter-spacing: 0.5px; }
  .detail-value { font-size: 15px; font-weight: 500; color: #18181b; }
  .cta-button { display: block; width: 100%; background: #18181b; color: #ffffff !important; text-decoration: none; padding: 18px 0; border-radius: 8px; font-weight: 600; text-align: center; transition: opacity 0.2s; font-size: 15px; }
  .cta-button:hover { opacity: 0.9; }
  .footer { background: #fafafa; padding: 32px 40px; text-align: center; border-top: 1px solid #e4e4e7; }
  .footer p { font-size: 12px; color: #a1a1aa; margin: 0; }
  .social-links { margin-top: 16px; }
  .social-link { color: #71717a; text-decoration: none; margin: 0 8px; font-size: 12px; font-weight: 500; }
  .social-link:hover { color: #18181b; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="http://localhost:3000/it-circle-logo.png" alt="Khwopa IT Circle" class="logo">
    </div>
    <div class="content">
      <div style="text-align: center;">
        <span class="badge">Official Notice</span>
        <h1>Hackathon 2025</h1>
      </div>
      
      <p>Hello Participant,</p>
      <p>We are thrilled to welcome you to the upcoming Khwopa IT Circle Hackathon. This is your opportunity to innovate, collaborate, and build something extraordinary.</p>
      
      <div class="details-box">
        <div class="detail-item">
          <span class="detail-label">Date</span>
          <span class="detail-value">[Insert Date]</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Time</span>
          <span class="detail-value">[Insert Time]</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Venue</span>
          <span class="detail-value">Khwopa College of Engineering</span>
        </div>
      </div>
      
      <p>Please finalize your team registration by the deadline. If you have any inquiries, feel free to reach out to us directly.</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Khwopa IT Circle. All rights reserved.</p>
      <div class="social-links" style="margin-top: 20px;">
        <a href="#" style="text-decoration: none; margin: 0 12px; display: inline-block;">
            <img src="website.svg" width="20" height="20" alt="Website" style="border:0; opacity: 0.6;">
        </a>
        <a href="#" style="text-decoration: none; margin: 0 12px; display: inline-block;">
            <img src="instagram.svg" width="20" height="20" alt="Instagram" style="border:0; opacity: 0.6;">
        </a>
        <a href="#" style="text-decoration: none; margin: 0 12px; display: inline-block;">
            <img src="linkedin.svg" width="20" height="20" alt="LinkedIn" style="border:0; opacity: 0.6;">
        </a>
      </div>
    </div>
  </div>
</body>
</html>
`;

const EmailForm: React.FC<EmailFormProps> = ({
  subject,
  setSubject,
  message,
  setMessage,
  onSend,
  isSending,
  recipientCount
}) => {

  const insertTemplate = () => {
    setSubject('Official Notice: Khwopa IT Circle Hackathon 2025');
    setMessage(TEMPLATE.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xl mx-auto bg-white border border-slate-200 p-6 rounded-2xl shadow-xl shadow-slate-200/50"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <Send className="mr-2 text-indigo-600" size={20} />
          Compose
        </h2>
        <button
          type="button"
          onClick={insertTemplate}
          className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors flex items-center"
        >
          <LayoutTemplate size={14} className="mr-1" />
          Use Template
        </button>
      </div>

      <form onSubmit={onSend} className="space-y-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-slate-600 mb-1">Subject</label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="Hackathon Update..."
            required
            disabled={isSending}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-slate-600 mb-1">Message (HTML supported)</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all h-60 resize-none font-mono text-sm"
            placeholder="<html><body><h1>Hello!</h1>...</body></html>"
            required
            disabled={isSending}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSending || recipientCount === 0}
            className={`
                    w-full flex items-center justify-center py-3 px-6 rounded-lg font-bold text-white shadow-lg
                    transition-all duration-200 transform
                    ${isSending || recipientCount === 0
                ? 'bg-slate-400 cursor-not-allowed opacity-70'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0'
              }
                `}
          >
            {isSending ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Sending to {recipientCount} recipients...
              </>
            ) : (
              <>
                <Send className="mr-2" size={20} />
                Send to {recipientCount > 0 ? `${recipientCount} Recipients` : 'Add Recipients First'}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EmailForm;
