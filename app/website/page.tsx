"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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

const defaultData: HackathonWebsiteData = {
  eventName: "Hackathon 2026",
  tagline: "Build. Create. Innovate.",
  description: "Join us for 48 hours of innovation and collaboration!",
  date: "March 15-17, 2026",
  location: "Virtual / Hybrid",
  prizes: {
    first: "$5,000",
    second: "$3,000",
    third: "$1,000",
  },
  faqs: [
    { question: "Who can participate?", answer: "Anyone with a passion for coding!" },
  ],
  socialLinks: {
    twitter: "",
    linkedin: "",
    discord: "",
    github: "",
  },
};

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

type EditingField = {
  type: "text" | "textarea" | "nested" | "array";
  path: string;
  arrayIndex?: number;
  arrayKey?: string;
  parent?: string;
  field?: string;
} | null;

export default function WebsiteBuilderPage() {
  const [websiteData, setWebsiteData] = useState<HackathonWebsiteData>(
    normalizeWebsiteData(defaultData)
  );
  const [isEditing, setIsEditing] = useState<EditingField>(null);
  const [editValue, setEditValue] = useState("");
  const [editMode, setEditMode] = useState(true); // Edit mode toggle
  const [isLoading, setIsLoading] = useState(true); // Loading state for fetching data
  const [websiteStatus, setWebsiteStatus] = useState<string>("DRAFT"); // Track publish status
  const [websiteSlug, setWebsiteSlug] = useState<string>(""); // Track slug for public URL
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      if (inputRef.current) inputRef.current.focus();
      if (textareaRef.current) textareaRef.current.focus();
    }
  }, [isEditing]);

  // Fetch admin's websites on mount
  useEffect(() => {
    const loadAdminWebsite = async () => {
      try {
        const adminId = localStorage.getItem('adminId');
        
        if (!adminId) {
          // No admin logged in, use default data
          console.log('No admin logged in, using default data');
          setIsLoading(false);
          return;
        }

        console.log('Fetching websites for admin:', adminId);
        
        const response = await fetch(`${API_URL}/websites/admin/${adminId}`);
        
        if (!response.ok) {
          console.error('Failed to fetch websites:', response.statusText);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        console.log('Fetched websites:', data);

        if (data.success && data.websites && data.websites.length > 0) {
          // Load the most recent website (they're already ordered by updatedAt desc)
          const mostRecentWebsite = data.websites[0];
          
          console.log('Loading most recent website:', mostRecentWebsite);
          
          // Set the website data from the database
          setWebsiteData(normalizeWebsiteData(mostRecentWebsite.websiteData));
          setWebsiteStatus(mostRecentWebsite.status || "DRAFT");
          setWebsiteSlug(mostRecentWebsite.slug || "");
          
          // Save the current website ID for updates
          localStorage.setItem('currentWebsiteId', mostRecentWebsite.id.toString());
          
          toast.success('Loaded your saved website', {
            description: `Last updated: ${new Date(mostRecentWebsite.updatedAt).toLocaleDateString()}`,
            duration: 3000,
          });
        } else {
          // Admin has no websites, use default data and clear any old website ID
          console.log('No websites found for admin, using default data');
          localStorage.removeItem('currentWebsiteId'); // Clear old website ID
        }
      } catch (error) {
        console.error('Error loading admin website:', error);
        toast.error('Failed to load your website', {
          description: 'Using default content instead',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminWebsite();
  }, []); // Run once on mount

  const handleDoubleClick = (
    path: string,
    value: string,
    type: "text" | "textarea" = "text",
    parent?: string,
    field?: string,
    arrayIndex?: number,
    arrayKey?: string
  ) => {
    setEditValue(value);
    // Automatically determine the correct type based on parameters
    let actualType: "text" | "textarea" | "nested" | "array" = type;
    if (arrayIndex !== undefined && arrayKey) {
      actualType = "array";
    } else if (parent && field) {
      actualType = "nested";
    }
    setIsEditing({ type: actualType, path, parent, field, arrayIndex, arrayKey });
  };

  const handleSave = () => {
    if (!isEditing) return;

    if (isEditing.type === "nested" && isEditing.parent && isEditing.field) {
      setWebsiteData((prev) => ({
        ...prev,
        [isEditing.parent!]: {
          ...(prev as any)[isEditing.parent!],
          [isEditing.field!]: editValue,
        },
      }));
    } else if (isEditing.type === "array" && isEditing.arrayIndex !== undefined && isEditing.arrayKey) {
      setWebsiteData((prev) => {
        const currentValue = (prev as any)[isEditing.path];
        const arrayValue = Array.isArray(currentValue) ? currentValue : [];
        const newArray = [...arrayValue];
        newArray[isEditing.arrayIndex!] = {
          ...newArray[isEditing.arrayIndex!],
          [isEditing.arrayKey!]: editValue,
        };
        return { ...prev, [isEditing.path]: newArray };
      });
    } else {
      setWebsiteData((prev) => ({
        ...prev,
        [isEditing.path]: editValue,
      }));
    }

    toast.success("Changes saved!", { duration: 2000 });
    setIsEditing(null);
    setEditValue("");
  };

  const handleCancel = () => {
    setIsEditing(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && isEditing?.type === "text") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  const addArrayItem = (field: string, template: any) => {
    setWebsiteData((prev) => {
      const currentValue = (prev as any)[field];
      const arrayValue = Array.isArray(currentValue) ? currentValue : [];
      return {
        ...prev,
        [field]: [...arrayValue, template],
      };
    });
    toast.success("Item added!", { duration: 2000 });
  };

  const removeArrayItem = (field: string, index: number) => {
    const toastId = toast.custom((t) => (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <p className="font-medium mb-3 text-gray-900 dark:text-white">Delete this item?</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setWebsiteData((prev) => {
                const currentValue = (prev as any)[field];
                const arrayValue = Array.isArray(currentValue) ? currentValue : [];
                return {
                  ...prev,
                  [field]: arrayValue.filter((_: any, i: number) => i !== index),
                };
              });
              toast.dismiss(t);
              toast.success("Item deleted");
            }}
          >
            Delete
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.dismiss(t)}>
            Cancel
          </Button>
        </div>
      </div>
    ), { duration: 10000 });
  };


  const saveWebsiteToDatabase = async (shouldPublish = false) => {
    try {
      // Get adminId from localStorage or your auth context
      const adminId = localStorage.getItem('adminId');

      if (!adminId) {
        toast.error("Please login first", {
          description: "You need to login to save your website",
          duration: 4000,
        });
        return;
      }

      const websiteId = localStorage.getItem('currentWebsiteId'); // If editing existing

      console.log('Saving website...', {
        API_URL,
        adminId,
        websiteId,
        hasWebsiteData: !!websiteData,
      });

      const payload = {
        websiteData: normalizeWebsiteData(websiteData),
        adminId: adminId,
        websiteId: websiteId || undefined,
      };

      console.log('Payload:', payload);

      const response = await fetch(`${API_URL}/website/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status, response.statusText);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', await response.text());
        toast.error("Server error: Invalid response format", {
          description: "The backend is not returning JSON. Check if the server is running.",
          duration: 5000,
        });
        return;
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        // Save website ID for future updates
        localStorage.setItem('currentWebsiteId', data.website.id.toString());

        toast.success("Website saved successfully! 💾", {
          description: `Website ID: ${data.website.id}`,
          duration: 3000,
        });

        // If should publish, call publish endpoint
        if (shouldPublish) {
          await publishWebsiteToDatabase(data.website.id);
        }

        return data.website;
      } else {
        const errorMessage = data.error || data.details || "Failed to save website";
        console.error('Server error:', errorMessage, data);
        toast.error(errorMessage, {
          description: data.details ? `Details: ${data.details}` : undefined,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error saving website:", error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error("Cannot connect to backend server", {
          description: `Make sure the backend is running at ${API_URL}`,
          duration: 5000,
        });
      } else {
        toast.error("Network error. Please try again.", {
          description: error instanceof Error ? error.message : String(error),
          duration: 5000,
        });
      }
    }
  };
  const publishWebsiteToDatabase = async (websiteId: number) => {
    try {
      const adminId = localStorage.getItem('adminId');
      
      const response = await fetch(`${API_URL}/website/${websiteId}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminId }),
      });

      const data = await response.json();

      if (response.ok) {
        const publicUrl = `${window.location.origin}/w/${data.website.slug}`;
        
        // Update local state
        setWebsiteStatus("PUBLISHED");
        setWebsiteSlug(data.website.slug);
        
        toast.success("Website published! 🎉", {
          description: `Access at: ${publicUrl}`,
          duration: 6000,
        });
        
        // Copy to clipboard
        navigator.clipboard.writeText(publicUrl).then(() => {
          toast.info("URL copied to clipboard! 📋", {
            duration: 3000,
          });
        });
      } else {
        toast.error(data.error || "Failed to publish website");
      }
    } catch (error) {
      console.error("Error publishing website:", error);
      toast.error("Network error. Please try again.");
    }
  };



  const handlePublish = async () => {
    await saveWebsiteToDatabase(true);
  };

  const handleSaveDraft = async () => {
    await saveWebsiteToDatabase(false);
  };

  const handlePreview = () => {
    localStorage.setItem('websitePreviewData', JSON.stringify(normalizeWebsiteData(websiteData)));
    window.open('/preview', '_blank');
    toast.info("Preview opened in new tab", { duration: 2000 });
  };

  // Show loading screen while fetching data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] text-blue-600" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your website...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster richColors position="top-right" />

      {/* Edit Mode Indicator - Floating Pill */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="fixed top-4 left-4 z-[200] bg-[#1877F2] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <span>Edit Mode</span>
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => {
              setEditMode(!editMode);
              toast.success(editMode ? "Edit mode disabled" : "Edit mode enabled", { duration: 2000 });
            }}
            size="sm"
            className={`shadow-lg ${editMode
              ? "bg-[#1877F2] hover:bg-[#0C44AE] text-white"
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
          >
            {editMode ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Editing
              </span>
            ) : (
              "Enable Edit"
            )}
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handlePreview}
            size="sm"
            className="shadow-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-400 hover:bg-gray-900 hover:text-white hover:border-gray-900"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handlePublish}
            className="bg-gray-900 hover:bg-gray-700 shadow-lg text-white"
            size="sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Publish
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleSaveDraft}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg text-white"
            size="sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Draft
          </Button>
        </motion.div>
      </div>

      {/* Canvas Area */}
      <div className="pb-8">
        <div className="max-w-7xl mx-auto">
          <HackathonTemplate
            data={websiteData}
            setWebsiteData={setWebsiteData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            editValue={editValue}
            setEditValue={setEditValue}
            handleDoubleClick={handleDoubleClick}
            handleSave={handleSave}
            handleCancel={handleCancel}
            handleKeyDown={handleKeyDown}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
            inputRef={inputRef}
            textareaRef={textareaRef}
            editMode={editMode}
            websiteStatus={websiteStatus}
            websiteSlug={websiteSlug}
            stickyNavTop={0}
          />
        </div>
      </div>
    </div>
  );
}

// Editable Text Component
function EditableText({
  value,
  path,
  onDoubleClick,
  isEditing,
  editValue,
  setEditValue,
  onSave,
  onCancel,
  onKeyDown,
  inputRef,
  className = "",
  multiline = false,
  textareaRef,
  parent,
  field,
  arrayIndex,
  arrayKey,
  editMode = true,
}: any) {
  const isCurrentlyEditing =
    isEditing &&
    isEditing.path === path &&
    isEditing.arrayIndex === arrayIndex &&
    isEditing.arrayKey === arrayKey;

  if (isCurrentlyEditing) {
    if (multiline) {
      return (
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={onSave}
            onKeyDown={(e) => {
              if (e.key === "Escape") onCancel();
            }}
            className={`${className} border-2 border-[#1877F2] shadow-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 rounded-lg min-h-[100px] w-full focus:border-[#0C44AE] transition-all`}
          />
        </motion.div>
      );
    }

    return (
      <motion.input
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={onSave}
        onKeyDown={onKeyDown}
        className={`${className} border-2 border-[#1877F2] shadow-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 rounded-lg focus:border-[#0C44AE] transition-all`}
      />
    );
  }

  return (
    <span
      onClick={editMode ? () =>
        onDoubleClick(
          path,
          value,
          multiline ? "textarea" : "text",
          parent,
          field,
          arrayIndex,
          arrayKey
        ) : undefined}
      className={`${className
        } ${editMode
          ? "cursor-pointer group relative hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1 -mx-2 -my-1 transition-all duration-200"
          : ""
        }`}
      title={editMode ? "Click to edit" : ""}
    >
      {value || "Click to add text"}
      {editMode && (
        <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center">
          <svg className="w-3 h-3 text-[#1877F2]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </span>
      )}
    </span>
  );
}

// Template Component
function HackathonTemplate({
  data,
  setWebsiteData,
  isEditing,
  setIsEditing,
  editValue,
  setEditValue,
  handleDoubleClick,
  handleSave,
  handleCancel,
  handleKeyDown,
  addArrayItem,
  removeArrayItem,
  inputRef,
  textareaRef,
  editMode,
  websiteStatus,
  websiteSlug,
  stickyNavTop = 0,
}: any) {
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
      <nav style={{ top: stickyNavTop }} className="sticky z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm">
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
                Highlights
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

      {/* Published Status Banner - sticky below navbar */}
      <AnimatePresence>
        {websiteStatus === "PUBLISHED" && websiteSlug && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            style={{ top: stickyNavTop + 64 }}
            className="sticky z-30 bg-green-600 text-white py-2 px-4 text-sm font-medium shadow-md"
          >
            <div className="flex items-center justify-center gap-3">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="shrink-0">Website Published!</span>
              <span className="hidden md:inline shrink-0">•</span>
              <a
                href={`/w/${websiteSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline underline hover:text-green-100 truncate min-w-0"
              >
                {typeof window !== 'undefined' ? window.location.origin : ''}/w/{websiteSlug}
              </a>
              <button
                onClick={() => {
                  const publicUrl = `${window.location.origin}/w/${websiteSlug}`;
                  navigator.clipboard.writeText(publicUrl).then(() => {
                    toast.success("Link copied to clipboard!", {
                      description: publicUrl,
                      duration: 3000,
                    });
                  }).catch(() => {
                    toast.error("Failed to copy link");
                  });
                }}
                className="shrink-0 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors"
              >
                Copy Link
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-white dark:bg-gray-900 py-20 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold mb-4 text-gray-900 dark:text-white"
          >
            <EditableText
              value={data.eventName}
              path="eventName"
              onDoubleClick={handleDoubleClick}
              isEditing={isEditing}
              editValue={editValue}
              setEditValue={setEditValue}
              onSave={handleSave}
              onCancel={handleCancel}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
              className="text-5xl md:text-7xl font-bold"
              editMode={editMode}
            />
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl md:text-3xl mb-6 text-gray-600 dark:text-gray-400"
          >
            <EditableText
              value={data.tagline}
              path="tagline"
              onDoubleClick={handleDoubleClick}
              isEditing={isEditing}
              editValue={editValue}
              setEditValue={setEditValue}
              onSave={handleSave}
              onCancel={handleCancel}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
              className="text-2xl md:text-3xl"
              editMode={editMode}
            />
          </motion.p>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl mb-8 text-gray-500 dark:text-gray-400 max-w-3xl mx-auto"
          >
            <EditableText
              value={data.description}
              path="description"
              onDoubleClick={handleDoubleClick}
              isEditing={isEditing}
              editValue={editValue}
              setEditValue={setEditValue}
              onSave={handleSave}
              onCancel={handleCancel}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
              textareaRef={textareaRef}
              multiline={true}
              className="text-xl"
              editMode={editMode}
            />
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col md:flex-row gap-4 justify-center items-center mb-10"
          >
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700">
              <span className="text-lg text-gray-700 dark:text-gray-300">
                📅{" "}
                <EditableText
                  value={data.date}
                  path="date"
                  onDoubleClick={handleDoubleClick}
                  isEditing={isEditing}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  onKeyDown={handleKeyDown}
                  inputRef={inputRef}
                  className="text-lg"
                  editMode={editMode}
                />
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700">
              <span className="text-lg text-gray-700 dark:text-gray-300">
                📍{" "}
                <EditableText
                  value={data.location}
                  path="location"
                  onDoubleClick={handleDoubleClick}
                  isEditing={isEditing}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  onKeyDown={handleKeyDown}
                  inputRef={inputRef}
                  className="text-lg"
                  editMode={editMode}
                />
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
              { title: "🥇 First Prize", key: "first", amount: data.prizes.first },
              { title: "🥈 Second Prize", key: "second", amount: data.prizes.second },
              { title: "🥉 Third Prize", key: "third", amount: data.prizes.third },
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
                <p className="text-5xl font-bold text-[#1877F2]">
                  <EditableText
                    value={prize.amount}
                    path="prizes"
                    parent="prizes"
                    field={prize.key}
                    onDoubleClick={handleDoubleClick}
                    isEditing={isEditing}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onKeyDown={handleKeyDown}
                    inputRef={inputRef}
                    className="text-5xl font-bold"
                    editMode={editMode}
                  />
                </p>
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
            {(data.faqs || []).map((faq: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 group relative transition-all"
              >
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  <EditableText
                    value={faq.question}
                    path="faqs"
                    arrayIndex={idx}
                    arrayKey="question"
                    onDoubleClick={handleDoubleClick}
                    isEditing={isEditing}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onKeyDown={handleKeyDown}
                    inputRef={inputRef}
                    className="text-xl font-bold"
                    editMode={editMode}
                  />
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  <EditableText
                    value={faq.answer}
                    path="faqs"
                    arrayIndex={idx}
                    arrayKey="answer"
                    onDoubleClick={handleDoubleClick}
                    isEditing={isEditing}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onKeyDown={handleKeyDown}
                    inputRef={inputRef}
                    textareaRef={textareaRef}
                    multiline={true}
                    className="text-base"
                    editMode={editMode}
                  />
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeArrayItem("faqs", idx)}
                  className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-full w-8 h-8 p-0 shadow-lg"
                >
                  ✕
                </Button>
              </motion.div>
            ))}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => addArrayItem("faqs", { question: "", answer: "" })}
                variant="outline"
                className="w-full border-2 border-gray-400 hover:border-gray-900 hover:bg-gray-900 hover:text-white text-gray-900 dark:text-white font-bold py-6 rounded-2xl transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add FAQ
              </Button>
            </motion.div>
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