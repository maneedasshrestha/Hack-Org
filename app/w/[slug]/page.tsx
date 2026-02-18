"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/toaster";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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

// Normalize data to ensure all required fields are present and valid
function normalizeWebsiteData(data: any): HackathonWebsiteData {
  return {
    eventName: data?.eventName || "Hackathon 2026",
    tagline: data?.tagline || "Build. Create. Innovate.",
    description: data?.description || "Join us for 48 hours of innovation and collaboration!",
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

export default function PublicWebsitePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [websiteData, setWebsiteData] = useState<HackathonWebsiteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        console.log(`Fetching website with slug: ${slug}`);
        
        const response = await fetch(`${API_URL}/website/slug/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Website not found");
          } else {
            setError("Failed to load website");
          }
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        console.log('Fetched website:', data);

        if (data.success && data.website) {
          // Check if website is published
          if (data.website.status !== 'PUBLISHED') {
            setError("This website is not published yet");
            setIsLoading(false);
            return;
          }
          
          // Set the website data
          setWebsiteData(normalizeWebsiteData(data.website.websiteData));
        } else {
          setError("Website not found");
        }
      } catch (error) {
        console.error('Error loading website:', error);
        setError("Failed to load website");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchWebsite();
    }
  }, [slug]);

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] text-blue-600" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading website...</p>
        </div>
      </div>
    );
  }

  // Show error screen
  if (error || !websiteData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {error || "Website not found"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The website you're looking for doesn't exist or is not published yet.
          </p>
          <Button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <HackathonTemplate data={websiteData} />
    </>
  );
}

// Public Template Component (No Edit Mode)
function HackathonTemplate({ data }: { data: HackathonWebsiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Hackathon Name */}
            <div className="flex-shrink-0">
              <button
                onClick={() => scrollToSection('hero')}
                className="text-xl font-bold text-gray-900 dark:text-white hover:text-[#1877F2] dark:hover:text-[#1877F2] transition-colors"
              >
                {data.eventName}
              </button>
            </div>

            {/* Middle: Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('hero')}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('prizes')}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Prize Pool
              </button>
              <button
                onClick={() => scrollToSection('faqs')}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                FAQ
              </button>
            </div>

            {/* Right: Register Button (Desktop) */}
            <div className="hidden md:block">
              <Button
                size="sm"
                className="bg-[#1877F2] hover:bg-[#0C44AE] text-white border-0 shadow-md transition-all"
              >
                Register Now
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => scrollToSection('hero')}
                className="block w-full text-left px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('prizes')}
                className="block w-full text-left px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Prize Pool
              </button>
              <button
                onClick={() => scrollToSection('faqs')}
                className="block w-full text-left px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                FAQ
              </button>
              <div className="px-3 py-2">
                <Button
                  size="sm"
                  className="w-full bg-[#1877F2] hover:bg-[#0C44AE] text-white border-0"
                >
                  Register Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-white dark:bg-gray-900 py-20 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold mb-4 text-gray-900 dark:text-white"
          >
            {data.eventName}
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl md:text-3xl mb-6 text-gray-600 dark:text-gray-400"
          >
            {data.tagline}
          </motion.p>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl mb-8 text-gray-500 dark:text-gray-400 max-w-3xl mx-auto"
          >
            {data.description}
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col md:flex-row gap-4 justify-center items-center mb-10"
          >
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700">
              <span className="text-lg text-gray-700 dark:text-gray-300">
                📅 {data.date}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700">
              <span className="text-lg text-gray-700 dark:text-gray-300">
                📍 {data.location}
              </span>
            </div>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              className="bg-gray-900 hover:bg-gray-700 text-white text-lg px-10 py-6 rounded-2xl font-bold shadow-xl transition-all"
            >
              Register Now
            </Button>
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
              { title: "🥇 First Prize", amount: data.prizes.first },
              { title: "🥈 Second Prize", amount: data.prizes.second },
              { title: "🥉 Third Prize", amount: data.prizes.third },
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
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{prize.title}</h3>
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
            {data.faqs.length > 0 ? (
              data.faqs.map((faq: any, idx: number) => (
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
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <h3 className="text-2xl font-bold text-white mb-2">
              {data.eventName}
            </h3>
          </motion.div>

          {Object.keys(data.socialLinks || {}).some(key => (data.socialLinks as any)[key]) && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex justify-center gap-6 mb-6"
            >
              {Object.entries(data.socialLinks || {}).map(
                ([key, url]) =>
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
            © 2026 {data.eventName}. All rights reserved.
          </motion.p>
        </div>
      </footer>
    </div>
  );
}
