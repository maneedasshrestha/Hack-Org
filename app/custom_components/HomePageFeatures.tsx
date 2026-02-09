import React from "react";

const HomePageFeatures = () => {
  return (
    <section className="pt-10 bg-gray-50 sm:pt-20">
      <div className="px-6 mx-auto max-w-6xl sm:px-10 lg:px-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="px-8 text-2xl text-gray-600 font-inter">
            All-in-one hackathon management platform
          </h1>
          <p className="mt-6 text-5xl font-bold leading-tight text-gray-900 sm:leading-tight sm:text-5xl lg:text-6xl lg:leading-tight font-pj">
            The operating system for
            <span className="relative inline-block">
              <span className="bg-linear-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] blur-lg filter opacity-40 w-full h-full absolute inset-0 rounded-xl"></span>
              <span className="relative px-4 text-6xl leading-tight">
                {" "}
                hackathons.{" "}
              </span>
            </span>
          </p>
          <div className="px-12 sm:items-center sm:justify-center sm:px-0 sm:space-x-6 sm:flex mt-8">
            <a
              href="/login"
              title=""
              className="inline-flex items-center justify-center w-full px-4 py-2 mt-4 text-lg font-bold text-gray-900 transition-all duration-200 border-2 border-gray-400 sm:w-auto sm:mt-0 rounded-2xl font-pj focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-900 focus:bg-gray-900 hover:text-white focus:text-white hover:border-gray-900 focus:border-gray-900"
              role="button"
            >
              <svg
                className="w-5 h-5 mr-3"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.18003 13.4261C6.8586 14.3918 5 13.448 5 11.8113V5.43865C5 3.80198 6.8586 2.85821 8.18003 3.82387L12.5403 7.01022C13.6336 7.80916 13.6336 9.44084 12.5403 10.2398L8.18003 13.4261Z"
                  strokeWidth={2}
                  strokeMiterlimit={10}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Create a Hackathon
            </a>
          </div>
          <p className="mt-8 text-base text-gray-500 font-inter">
            Secure · Scalable · Organizer-first
          </p>
        </div>
      </div>
      <div className="pb-12 bg-white mt-8">
        <div className="relative flex justify-center items-center py-10">
          <div className="absolute inset-0 h-3/4 bg-gray-50 pointer-events-none"></div>
          <div className="relative w-full max-w-5xl flex justify-center items-center">
            <span
              className="absolute z-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-3xl bg-linear-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] blur-2xl opacity-50"
              aria-hidden="true"
            ></span>
            <img
              className="relative z-10 rounded-3xl shadow-2xl border-2 border-gray-200 object-cover w-full max-w-2xl"
              src="assets/dashboard_preview.png"
              alt="Dashboard preview"
              style={{ maxHeight: "60vh", minHeight: "320px" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePageFeatures;
