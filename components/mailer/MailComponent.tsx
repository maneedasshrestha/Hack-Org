"use client";

import React, { useState } from "react";
import axios from "axios";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import RecipientUploader from "./RecipientUploader";
import EmailForm from "./EmailForm";
import EmailPreview from "./EmailPreview";

export default function MailPage() {
  const [recipients, setRecipients] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Lifted state for Preview
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleRecipientsParsed = (data: any[]) => {
    setRecipients(data);
    setStatus({ type: null, message: "" });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recipients.length === 0) return;

    setIsSending(true);
    setStatus({ type: null, message: "" });

    try {
      // In a real app, use an env var for the API URL
      const response = await axios.post("http://localhost:5000/api/mail/send", {
        recipients,
        subject,
        message,
      });

      if (response.data.success) {
        setStatus({
          type: "success",
          message: `Successfully processed ${response.data.results.success.length} emails. ${response.data.results.failed.length} failed.`,
        });
        // Optional: clear form or keep it
      } else {
        setStatus({
          type: "error",
          message: "Failed to complete sending process.",
        });
      }
    } catch (error: any) {
      console.error(error);
      setStatus({
        type: "error",
        message:
          error.response?.data?.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 selection:bg-indigo-200 selection:text-indigo-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-200/40 via-white/0 to-white/0 pointer-events-none" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <RecipientUploader onRecipientsParsed={handleRecipientsParsed} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-12 items-start">
            <EmailForm
              subject={subject}
              setSubject={setSubject}
              message={message}
              setMessage={setMessage}
              onSend={handleSend}
              isSending={isSending}
              recipientCount={recipients.length}
            />

            <div className="space-y-4 xl:sticky xl:top-8 order-first xl:order-last">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xl font-bold text-slate-800">
                  Live Preview
                </h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-sm">
                  Device View
                </span>
              </div>
              <EmailPreview subject={subject} message={message} />
            </div>
          </div>

          {status.type && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`
                            mx-auto p-4 rounded-xl border flex items-center space-x-3 max-w-xl w-full shadow-lg
                            ${status.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"}
                        `}
            >
              {status.type === "success" ? (
                <CheckCircle size={24} />
              ) : (
                <AlertCircle size={24} />
              )}
              <span className="font-bold">{status.message}</span>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
