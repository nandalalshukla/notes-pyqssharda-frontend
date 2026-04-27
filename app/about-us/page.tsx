"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FaUserSecret,
  FaUserShield,
  FaLinkedin,
  FaGithub,
  FaInstagram,
} from "react-icons/fa";
import { MdEmail, MdLibraryBooks, MdRocketLaunch } from "react-icons/md";
import { BiSupport } from "react-icons/bi";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[#F2F4F8] text-black font-sans pb-24">
      {/* Decorative Background Elements similar to Home */}
      <div className="fixed top-20 left-20 w-32 h-32 bg-blue-400 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 right-20 w-40 h-40 bg-purple-400 rounded-full opacity-10 blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 pt-12 md:pt-20">
        {/* --- HERO SECTION --- */}
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="inline-block px-6 py-2 mb-6 rounded-full bg-[#FF9F66] border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide text-sm">
            About The Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            Built For Students, <br className="hidden md:block" />
            <span className="text-[#3B82F6]">By the Students.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
            Bridging the gap between exam panic and preparation with organized
            resources at your fingertips.
          </p>
        </div>

        {/* --- OUR STORY SECTION (Clean & Professional) --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8 mb-24"
        >
          {/* Left: The Problem */}
          <div className="bg-white p-8 md:p-10 rounded-2xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg border-2 border-black flex items-center justify-center mb-6 text-red-600">
              <MdRocketLaunch className="w-6 h-6" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-4">
              The Origin Story
            </h2>
            <p className="text-gray-700 leading-7 mb-4">
              It started with a familiar situation: the night before an exam.
              The syllabus was buried in chat logs, notes were scattered across
              groups, and previous year questions (PYQs) were nowhere to be
              found.
            </p>
            <p className="text-gray-700 leading-7">
              The realization hit hard—the problem wasn't the exam itself, but
              the <strong>Disorganized Resources</strong>. We realized that
              students needed a single, reliable source of truth to focus on
              what matters: studying.
            </p>
          </div>

          {/* Right: The Solution */}
          <div className="bg-[#2D334A] p-8 md:p-10 rounded-2xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-white flex flex-col justify-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg border-2 border-white flex items-center justify-center mb-6 text-white">
              <MdLibraryBooks className="w-6 h-6" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-4">
              The Solution
            </h2>
            <p className="text-gray-300 leading-7 mb-4">
              <strong>Sharda Online Library</strong> was born to solve this
              chaos. We created a centralized platform where you can access:
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-[#4ADE80] rounded-full"></span>
                <span className="font-medium">Comprehensive Syllabus</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-[#FF9F66] rounded-full"></span>
                <span className="font-medium">Organized Lecture Notes</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-[#C084FC] rounded-full"></span>
                <span className="font-medium">Verified PYQs repository</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* --- MEET THE TEAM SECTION --- */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Meet The Team
            </h2>
            <div className="w-20 h-1.5 bg-black mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Admin Card */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white p-8 rounded-xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-[#C084FC] rounded-full border-2 border-black flex items-center justify-center mb-6 shadow-sm">
                <FaUserSecret className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-2">Admin Team</h3>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
                Platform Developers
              </p>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Dedicated to building and maintaining the infrastructure that
                keeps this library running 24/7.
              </p>
              <a
                href="mailto:admin@shardaonlinelibrary.com"
                className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 font-bold rounded-lg transition-all"
              >
                <BiSupport className="w-5 h-5" />
                Contact Admin Team
              </a>
            </motion.div>

            {/* Mods Card */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white p-8 rounded-xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-[#FF9F66] rounded-full border-2 border-black flex items-center justify-center mb-6 shadow-sm">
                <FaUserShield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-2">Mod Team</h3>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
                Content Guardians
              </p>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Ensuring that every note, syllabus, and PYQ is verified,
                organized, and relevant for you.
              </p>
              <a
                href="mailto:mods@shardaonlinelibrary.com"
                className="flex items-center gap-2 px-6 py-3 bg-white text-black border-2 border-black hover:bg-gray-50 font-bold rounded-lg transition-all"
              >
                <MdEmail className="w-5 h-5" />
                Contact Mod Team
              </a>
            </motion.div>
          </div>
        </div>

        {/* --- FOOTER / SOCIALS --- */}
        <div className="text-center pb-8 border-t-2 border-gray-200 pt-12 max-w-2xl mx-auto">
          <p className="font-bold text-gray-600 mb-6">
            Stay connected with our journey
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="#"
              className="p-3 bg-white border-2 border-black rounded-full hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <FaInstagram className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/posts/nandalalshukla_shardauniversity-btech-engineering-activity-7417953428888293376-ToZ4?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAENPXPMBJ4aMSVhVHnrqUrH1E6gGnQdaGss"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-3 bg-white border-2 border-black rounded-full hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <FaLinkedin className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/nandalalshukla/notes-pyqssharda-frontend"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="p-3 bg-white border-2 border-black rounded-full hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <FaGithub className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
