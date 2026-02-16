'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';

interface EmailPreviewProps {
    subject: string;
    message: string;
}

const EmailPreview: React.FC<EmailPreviewProps> = ({ subject, message }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-200/60 backdrop-blur-sm"
        >
            <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-600 flex items-center text-sm">
                    <Eye size={16} className="mr-2 text-indigo-500" />
                    Preview
                </h3>
                <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80"></div>
                </div>
            </div>

            <div className="bg-slate-100/30 p-0 overflow-hidden min-h-[600px] flex flex-col">
                {/* Simulated Email Client Header */}
                <div className="px-6 py-4 border-b border-slate-100 bg-white">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subject</span>
                        <h4 className="text-lg font-bold text-slate-900 leading-snug break-words">
                            {subject || <span className="text-slate-300 font-normal italic">No Subject...</span>}
                        </h4>
                    </div>
                </div>

                {/* Iframe Content Area */}
                <div className="flex-1 bg-white relative">
                    {message ? (
                        <iframe
                            title="email-preview"
                            srcDoc={message}
                            className="w-full h-full border-0 absolute inset-0"
                            sandbox="allow-same-origin"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300 select-none pb-20">
                            <span className="text-sm">Start typing to see magic...</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default EmailPreview;
