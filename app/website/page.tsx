"use client";

import { useState, useRef, useEffect } from "react";
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
  schedule: [
    {
      day: "Day 1",
      title: "Codeyatra 2026",
      description: "Kickoff, onboarding, and team formation.",
      items: [
        { time: "09:00", event: "Registration & Check-in", location: "Venue" },
        { time: "10:30", event: "Opening Ceremony", location: "Main Hall" },
        { time: "12:00", event: "Problem Briefing", location: "Auditorium" },
        { time: "13:00", event: "Hackathon Starts", location: "Allocated Seats" },
      ],
    },
    {
      day: "Day 2",
      title: "CodeYatra 2026",
      description: "Build, learn, and collaborate with mentors.",
      items: [
        { time: "09:00", event: "Mentor Rounds", location: "Allocated Seats" },
        { time: "11:30", event: "Mini Session (Engagement Segment)", location: "Activity Space" },
        { time: "14:00", event: "Project Checkpoint", location: "Allocated Seats" },
        { time: "18:00", event: "Progress Review", location: "Allocated Seats" },
      ],
    },
    {
      day: "Day 3",
      title: "CodeYatra 2026",
      description: "Polish, present, and celebrate.",
      items: [
        { time: "10:00", event: "Submission Deadline", location: "Allocated Seats" },
        { time: "11:00", event: "Demos & Judging", location: "Main Hall" },
        { time: "14:30", event: "Awards & Closing", location: "Auditorium" },
      ],
    },
  ],
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

type EditingField = {
  type: "text" | "textarea" | "nested" | "array";
  path: string;
  arrayIndex?: number;
  arrayKey?: string;
  parent?: string;
  field?: string;
} | null;

export default function WebsiteBuilderPage() {
  const [websiteData, setWebsiteData] = useState<HackathonWebsiteData>(defaultData);
  const [isEditing, setIsEditing] = useState<EditingField>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      if (inputRef.current) inputRef.current.focus();
      if (textareaRef.current) textareaRef.current.focus();
    }
  }, [isEditing]);

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
    setIsEditing({ type, path, parent, field, arrayIndex, arrayKey });
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
        const array = [...(prev as any)[isEditing.path]];
        array[isEditing.arrayIndex!] = {
          ...array[isEditing.arrayIndex!],
          [isEditing.arrayKey!]: editValue,
        };
        return { ...prev, [isEditing.path]: array };
      });
    } else {
      setWebsiteData((prev) => ({
        ...prev,
        [isEditing.path]: editValue,
      }));
    }

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
    setWebsiteData((prev) => ({
      ...prev,
      [field]: [...(prev as any)[field], template],
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setWebsiteData((prev) => ({
      ...prev,
      [field]: (prev as any)[field].filter((_: any, i: number) => i !== index),
    }));
  };

  const handlePublish = async () => {
    alert("Website published! Participants can now access it.");
    console.log("Published data:", websiteData);
  };

  const handlePreview = () => {
    // Store website data in localStorage
    localStorage.setItem('websitePreviewData', JSON.stringify(websiteData));
    // Open preview in new tab
    window.open('/website/preview', '_blank');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
        <Button 
          onClick={handlePreview} 
          variant="outline" 
          size="sm"
          className="shadow-lg bg-white dark:bg-gray-800"
        >
          Preview
        </Button>
        <Button
          onClick={handlePublish}
          className="bg-white hover:bg-gray-100 shadow-lg text-black"
          size="sm"
        >
          Publish Website
        </Button>
      </div>

      {/* Canvas Area - No top padding needed, starts from top */}
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
}: any) {
  const isCurrentlyEditing =
    isEditing &&
    isEditing.path === path &&
    isEditing.arrayIndex === arrayIndex &&
    isEditing.arrayKey === arrayKey;

  if (isCurrentlyEditing) {
    if (multiline) {
      return (
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={onSave}
            onKeyDown={(e) => {
              if (e.key === "Escape") onCancel();
            }}
            className={`${className} border-2 border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded min-h-[100px] w-full`}
          />
        </div>
      );
    }

    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={onSave}
        onKeyDown={onKeyDown}
        className={`${className} border-2 border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1 rounded`}
      />
    );
  }

  return (
    <span
      onDoubleClick={() =>
        onDoubleClick(
          path,
          value,
          multiline ? "textarea" : "text",
          parent,
          field,
          arrayIndex,
          arrayKey
        )
      }
      className={`${className} cursor-text hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:outline hover:outline-2 hover:outline-blue-300 dark:hover:outline-blue-700 rounded px-1 transition-all`}
      title="Double-click to edit"
    >
      {value || "Double-click to add text"}
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
    <div className="min-h-screen bg-white dark:bg-gray-900 shadow-2xl">
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
                onClick={() => scrollToSection('schedule')}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Schedule
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
                Highlights
              </button>
              <button
                onClick={() => scrollToSection('schedule')}
                className="block w-full text-left px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Schedule
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
      <section id="hero" className="bg-white dark:bg-gray-950 text-black py-20 border-b ">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
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

            />
          </h1>
          <p className="text-2xl md:text-3xl mb-6 opacity-90">
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
            />
          </p>
          <p className="text-xl mb-8 opacity-80">
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
            />
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
            <div className="flex items-center gap-2">
              <span className="text-lg">
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
                />
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">
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
                />
              </span>
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
              { title: "🥇 First Prize", key: "first", amount: data.prizes.first },
              { title: "🥈 Second Prize", key: "second", amount: data.prizes.second },
              { title: "🥉 Third Prize", key: "third", amount: data.prizes.third },
            ].map((prize, idx) => (
              <div
                key={idx}
                className="text-center p-8 rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-all"
              >
                <h3 className="text-2xl font-semibold mb-4">{prize.title}</h3>
                <p className="text-4xl font-bold text-primary">
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
                    className="text-4xl font-bold"
                  />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Event Schedule</h2>
          
          {/* Days Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {data.schedule.map((day: any, dayIdx: number) => (
              <div
                key={dayIdx}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 relative group hover:shadow-xl transition-shadow"
              >
                

                {/* Day Header */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">
                    <EditableText
                      value={day.day}
                      path="schedule"
                      arrayIndex={dayIdx}
                      arrayKey="day"
                      onDoubleClick={handleDoubleClick}
                      isEditing={isEditing}
                      editValue={editValue}
                      setEditValue={setEditValue}
                      onSave={handleSave}
                      onCancel={handleCancel}
                      onKeyDown={handleKeyDown}
                      inputRef={inputRef}
                      className="text-sm font-semibold uppercase"
                    />
                  </h3>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    <EditableText
                      value={day.title}
                      path="schedule"
                      arrayIndex={dayIdx}
                      arrayKey="title"
                      onDoubleClick={handleDoubleClick}
                      isEditing={isEditing}
                      editValue={editValue}
                      setEditValue={setEditValue}
                      onSave={handleSave}
                      onCancel={handleCancel}
                      onKeyDown={handleKeyDown}
                      inputRef={inputRef}
                      className="text-2xl font-bold"
                    />
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    <EditableText
                      value={day.description}
                      path="schedule"
                      arrayIndex={dayIdx}
                      arrayKey="description"
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
                      className="text-sm"
                    />
                  </p>
                </div>

                {/* Schedule Items */}
                <div className="space-y-6">
                  {day.items.map((item: any, itemIdx: number) => (
                    <div key={itemIdx} className="relative group/item">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            <EditableText
                              value={item.event}
                              path={`schedule-${dayIdx}-items`}
                              arrayIndex={itemIdx}
                              arrayKey="event"
                              onDoubleClick={(path: string, value: string, type: string, parent?: string, field?: string, arrayIndex?: number, arrayKey?: string) => {
                                handleDoubleClick(path, value, type, parent, field, arrayIndex, arrayKey);
                              }}
                              isEditing={isEditing}
                              editValue={editValue}
                              setEditValue={setEditValue}
                              onSave={() => {
                                if (!isEditing) return;
                                setWebsiteData((prev: HackathonWebsiteData) => {
                                  const newSchedule = [...prev.schedule];
                                  newSchedule[dayIdx].items[itemIdx] = {
                                    ...newSchedule[dayIdx].items[itemIdx],
                                    [isEditing.arrayKey!]: editValue,
                                  };
                                  return { ...prev, schedule: newSchedule };
                                });
                                setIsEditing(null);
                                setEditValue("");
                              }}
                              onCancel={handleCancel}
                              onKeyDown={handleKeyDown}
                              inputRef={inputRef}
                              className="font-semibold text-base"
                            />
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <EditableText
                              value={item.location}
                              path={`schedule-${dayIdx}-items`}
                              arrayIndex={itemIdx}
                              arrayKey="location"
                              onDoubleClick={(path: string, value: string, type: string, parent?: string, field?: string, arrayIndex?: number, arrayKey?: string) => {
                                handleDoubleClick(path, value, type, parent, field, arrayIndex, arrayKey);
                              }}
                              isEditing={isEditing}
                              editValue={editValue}
                              setEditValue={setEditValue}
                              onSave={() => {
                                if (!isEditing) return;
                                setWebsiteData((prev: HackathonWebsiteData) => {
                                  const newSchedule = [...prev.schedule];
                                  newSchedule[dayIdx].items[itemIdx] = {
                                    ...newSchedule[dayIdx].items[itemIdx],
                                    [isEditing.arrayKey!]: editValue,
                                  };
                                  return { ...prev, schedule: newSchedule };
                                });
                                setIsEditing(null);
                                setEditValue("");
                              }}
                              onCancel={handleCancel}
                              onKeyDown={handleKeyDown}
                              inputRef={inputRef}
                              className="text-sm"
                            />
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            <EditableText
                              value={item.time}
                              path={`schedule-${dayIdx}-items`}
                              arrayIndex={itemIdx}
                              arrayKey="time"
                              onDoubleClick={(path: string, value: string, type: string, parent?: string, field?: string, arrayIndex?: number, arrayKey?: string) => {
                                handleDoubleClick(path, value, type, parent, field, arrayIndex, arrayKey);
                              }}
                              isEditing={isEditing}
                              editValue={editValue}
                              setEditValue={setEditValue}
                              onSave={() => {
                                if (!isEditing) return;
                                setWebsiteData((prev: HackathonWebsiteData) => {
                                  const newSchedule = [...prev.schedule];
                                  newSchedule[dayIdx].items[itemIdx] = {
                                    ...newSchedule[dayIdx].items[itemIdx],
                                    [isEditing.arrayKey!]: editValue,
                                  };
                                  return { ...prev, schedule: newSchedule };
                                });
                                setIsEditing(null);
                                setEditValue("");
                              }}
                              onCancel={handleCancel}
                              onKeyDown={handleKeyDown}
                              inputRef={inputRef}
                              className="text-sm font-medium"
                            />
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setWebsiteData((prev: HackathonWebsiteData) => {
                                const newSchedule = [...prev.schedule];
                                newSchedule[dayIdx].items = newSchedule[dayIdx].items.filter((_: any, i: number) => i !== itemIdx);
                                return { ...prev, schedule: newSchedule };
                              });
                            }}
                            className="opacity-0 group-hover/item:opacity-100 transition-opacity h-6 w-6 p-0"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Item Button */}
                  <Button
                    onClick={() => {
                      setWebsiteData((prev: HackathonWebsiteData) => {
                        const newSchedule = [...prev.schedule];
                        newSchedule[dayIdx].items.push({ time: "", event: "", location: "" });
                        return { ...prev, schedule: newSchedule };
                      });
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 text-sm"
                  >
                    + Add Item
                  </Button>
                </div>

                {/* Remove Day Button */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeArrayItem("schedule", dayIdx)}
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  Remove Day
                </Button>
              </div>
            ))}
          </div>

          {/* Add New Day Button */}
          <div className="text-center">
            <Button
              onClick={() => addArrayItem("schedule", { 
                day: "New Day", 
                title: "Event Title",
                description: "Event description",
                items: [{ time: "", event: "", location: "" }] 
              })}
              variant="outline"
              size="lg"
            >
              + Add New Day
            </Button>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">FAQs</h2>
          <div className="space-y-6">
            {data.faqs.map((faq: any, idx: number) => (
              <div key={idx} className="border-b pb-6 group relative">
                <h3 className="text-xl font-semibold mb-2">
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
                    className="text-xl font-semibold"
                  />
                </h3>
                <p className="text-muted-foreground">
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
                    className="text-muted-foreground"
                  />
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeArrayItem("faqs", idx)}
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button
              onClick={() => addArrayItem("faqs", { question: "", answer: "" })}
              variant="outline"
              className="w-full"
            >
              + Add FAQ
            </Button>
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