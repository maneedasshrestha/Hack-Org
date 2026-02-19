"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface HackathonWebsiteData {
  eventName: string;
  tagline: string;
  description: string;
  date: string;
  location: string;
  prizes: {
    first: string;
    second: string;
    third: string;
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    discord?: string;
    github?: string;
  };
}

function normalizeWebsiteData(data: any): HackathonWebsiteData {
  return {
    eventName: data?.eventName || "Hackathon 2026",
    tagline: data?.tagline || "Build. Create. Innovate.",
    description:
      data?.description || "Join us for 48 hours of innovation and collaboration!",
    date: data?.date || "March 15-17, 2026",
    location: data?.location || "Virtual / Hybrid",
    prizes: {
      first: data?.prizes?.first || "$5,000",
      second: data?.prizes?.second || "$3,000",
      third: data?.prizes?.third || "$1,000",
    },
    faqs: Array.isArray(data?.faqs) ? data.faqs : [],
    socialLinks: {
      twitter: data?.socialLinks?.twitter || "",
      linkedin: data?.socialLinks?.linkedin || "",
      discord: data?.socialLinks?.discord || "",
      github: data?.socialLinks?.github || "",
    },
  };
}

export default function WorkspaceDashboardPage() {
  const params = useParams() as { slug?: string };
  const slug = params?.slug;
  const { data: session } = useSession();

  const [websiteData, setWebsiteData] = useState<HackathonWebsiteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        const response = await fetch(`${API_URL}/website/slug/${slug}`);

        if (!response.ok) {
          setError(response.status === 404 ? "Website not found" : "Failed to load website");
          setIsLoading(false);
          return;
        }

        const data = await response.json();

        if (data.success && data.website) {
          setWebsiteData(normalizeWebsiteData(data.website.websiteData));
        } else {
          setError("Website not found");
        }
      } catch (err) {
        console.error("Error loading website:", err);
        setError("Failed to load website");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) fetchWebsite();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-current border-r-transparent text-blue-600"
            role="status"
          />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading website...</p>
        </div>
      </div>
    );
  }

  if (error || !websiteData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {error || "Website not found"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The website you&apos;re looking for doesn&apos;t exist or is not published yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Welcome Banner */}
      {session?.user && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-6 py-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Welcome back,{" "}
            <span className="font-semibold">{session.user.name || session.user.email}</span>!
            You are viewing the dashboard for{" "}
            <span className="font-semibold">{websiteData.eventName}</span>.
          </p>
        </div>
      )}

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-white dark:bg-gray-900 py-20 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold mb-4 text-gray-900 dark:text-white"
          >
            {websiteData.eventName}
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl md:text-3xl mb-6 text-gray-600 dark:text-gray-400"
          >
            {websiteData.tagline}
          </motion.p>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl mb-8 text-gray-500 dark:text-gray-400 max-w-3xl mx-auto"
          >
            {websiteData.description}
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col md:flex-row gap-4 justify-center items-center"
          >
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700">
              <span className="text-lg text-gray-700 dark:text-gray-300">
                📅 {websiteData.date}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700">
              <span className="text-lg text-gray-700 dark:text-gray-300">
                📍 {websiteData.location}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Prizes Section */}
      <section id="prizes" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white"
          >
            Prize Pool
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "🥇 First Prize", amount: websiteData.prizes.first },
              { title: "🥈 Second Prize", amount: websiteData.prizes.second },
              { title: "🥉 Third Prize", amount: websiteData.prizes.third },
            ].map((prize, idx) => (
              <motion.div
                key={idx}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="text-center p-10 rounded-2xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-[#1877F2] shadow-lg hover:shadow-xl transition-all"
              >
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  {prize.title}
                </h3>
                <p className="text-5xl font-bold text-[#1877F2]">{prize.amount}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-6">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white"
          >
            FAQs
          </motion.h2>
          <div className="space-y-6">
            {websiteData.faqs.length > 0 ? (
              websiteData.faqs.map((faq: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all"
                >
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No FAQs available yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.h3
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-white mb-2"
          >
            {websiteData.eventName}
          </motion.h3>

          {Object.keys(websiteData.socialLinks || {}).some(
            (key) => (websiteData.socialLinks as any)[key]
          ) && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex justify-center gap-6 my-6"
            >
              {Object.entries(websiteData.socialLinks || {}).map(([key, url]) =>
                url ? (
                  <motion.a
                    key={key}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="text-gray-400 hover:text-white capitalize font-medium px-3 py-1 rounded transition-colors"
                  >
                    {key}
                  </motion.a>
                ) : null
              )}
            </motion.div>
          )}

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-500"
          >
            © 2026 {websiteData.eventName}. All rights reserved.
          </motion.p>
        </div>
      </footer>
    </div>
  );
}
