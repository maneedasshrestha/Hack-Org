"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

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
  schedule: Array<{
    day: string;
    title: string;
    description: string;
    items: Array<{
      time: string;
      event: string;
      location: string;
    }>;
  }>;
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
    schedule: Array.isArray(data?.schedule) ? data.schedule : [],
    faqs: Array.isArray(data?.faqs) ? data.faqs : [],
    socialLinks: {
      twitter: data?.socialLinks?.twitter || "",
      linkedin: data?.socialLinks?.linkedin || "",
      discord: data?.socialLinks?.discord || "",
      github: data?.socialLinks?.github || "",
    },
  };
}

export default function WebsitePreviewPage() {
  const [websiteData, setWebsiteData] = useState<HackathonWebsiteData | null>(null);

  useEffect(() => {
    // Load website data from localStorage
    const storedData = localStorage.getItem('websitePreviewData');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setWebsiteData(normalizeWebsiteData(parsed));
    }
  }, []);

  if (!websiteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">Loading preview...</p>
        </div>
      </div>
    );
  }

  return <HackathonPreview data={websiteData} />;
}

// Preview Component (Pure Display - No Editing)
function HackathonPreview({ data }: { data: HackathonWebsiteData }) {
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
      <nav className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Hackathon Name */}
            <div className="flex-shrink-0">
              <button 
                onClick={() => scrollToSection('hero')}
                className="text-xl font-bold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100"
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
                  className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100"
                >
                  Register Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="bg-white dark:bg-gray-950 text-black py-20 border-b">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            {data.eventName}
          </h1>
          <p className="text-2xl md:text-3xl mb-6 opacity-90">
            {data.tagline}
          </p>
          <p className="text-xl mb-8 opacity-80">
            {data.description}
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
            <div className="flex items-center gap-2">
              <span className="text-lg">📅 {data.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📍 {data.location}</span>
            </div>
          </div>
          <Button
            size="lg"
            className="bg-gray-100 text-black hover:bg-gray-300 text-lg px-8 py-6"
          >
            Register Now
          </Button>
        </div>
      </section>

      {/* Prizes Section */}
      <section id="prizes" className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Prize Pool</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "🥇 First Prize", amount: data.prizes.first },
              { title: "🥈 Second Prize", amount: data.prizes.second },
              { title: "🥉 Third Prize", amount: data.prizes.third },
            ].map((prize, idx) => (
              <div
                key={idx}
                className="text-center p-8 rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-all"
              >
                <h3 className="text-2xl font-semibold mb-4">{prize.title}</h3>
                <p className="text-4xl font-bold text-primary">{prize.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* FAQs Section */}
      <section id="faqs" className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">FAQs</h2>
          <div className="space-y-6">
            {(data.faqs || []).map((faq, idx) => (
              <div key={idx} className="border-b pb-6">
                <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-6 mb-4">
            {Object.entries(data.socialLinks || {}).map(
              ([key, url]) =>
                url ? (
                  <a
                    key={key}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary capitalize"
                  >
                    {key}
                  </a>
                ) : null
            )}
          </div>
          <p className="text-sm opacity-70">© 2026 {data.eventName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
