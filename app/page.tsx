"use client";
import React, { useState } from "react";
import Navbar from "./custom_components/Navbar";
import HomePageFeatures from "./custom_components/HomePageFeatures";


const HomePage = () => {
  return (
    <div
      className="overflow-x-hidden bg-gray-50"
      style={{ fontFamily: 'system-ui, sans-serif', fontSize: 16 }}
    >
      <Navbar />
      <HomePageFeatures />
    </div>
  );
};

export default HomePage;
