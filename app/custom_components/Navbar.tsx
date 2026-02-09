"use client";
import React, { useState } from "react";

const Navbar = () => {
  const [expanded, setExpanded] = useState(false);
  return (
    <header className="py-2 md:py-3">
      <div className="container px-4 mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="shrink-0">
            <a
              href="#"
              title=""
              className="flex rounded outline-none focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
            >
              <img
                className="w-auto h-6"
                src="brand_images/hackorg_banner.png"
                alt=""
              />
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="text-gray-900"
              aria-expanded={expanded}
              aria-label="Toggle menu"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {!expanded ? (
                <svg
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="hidden lg:flex lg:ml-8 lg:items-center lg:justify-center lg:space-x-10 xl:space-x-6">
            <a
              href="#"
              title=""
              className="text-sm font-medium text-gray-900 transition-all duration-200 rounded focus:outline-none font-pj hover:text-opacity-50 focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
            >
              {" "}
              Hackathon Tools{" "}
            </a>
            <a
              href="#"
              title=""
              className="text-sm font-medium text-gray-900 transition-all duration-200 rounded focus:outline-none font-pj hover:text-opacity-50 focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
            >
              {" "}
              For Organizers{" "}
            </a>
            <a
              href="#"
              title=""
              className="text-sm font-medium text-gray-900 transition-all duration-200 rounded focus:outline-none font-pj hover:text-opacity-50 focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
            >
              {" "}
              Automation{" "}
            </a>
          </div>

          <div className="hidden lg:ml-auto lg:flex lg:items-center lg:space-x-10">
            <a
              href="/login"
              title=""
              className="inline-flex items-center justify-center px-3 py-2 text-sm font-bold text-white transition-all duration-200 bg-gray-900 border border-transparent rounded-2xl hover:bg-gray-600 font-pj focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              role="button"
            >
              Sign up
            </a>
          </div>
        </div>
        {/* Mobile menu */}
        {expanded && (
          <nav>
            <div className="px-1 py-8 shadow-xl">
              <div className="grid gap-y-7">
                <a
                  href="#"
                  title=""
                  className="flex items-center p-3 -m-3 text-sm font-medium text-gray-900 transition-all duration-200 rounded-xl hover:bg-gray-50 focus:outline-none font-pj focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
                >
                  {" "}
                  Hackathon Tools{" "}
                </a>
                <a
                  href="#"
                  title=""
                  className="flex items-center p-3 -m-3 text-sm font-medium text-gray-900 transition-all duration-200 rounded-xl hover:bg-gray-50 focus:outline-none font-pj focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
                >
                  {" "}
                  For Organizers{" "}
                </a>
                <a
                  href="#"
                  title=""
                  className="flex items-center p-3 -m-3 text-sm font-medium text-gray-900 transition-all duration-200 rounded-xl hover:bg-gray-50 focus:outline-none font-pj focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
                >
                  {" "}
                  Automation{" "}
                </a>

                <a
                  href="/login"
                  title=""
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white transition-all duration-200 bg-gray-900 border border-transparent rounded-xl hover:bg-gray-600 font-pj focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                  role="button"
                >
                  Sign up
                </a>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
