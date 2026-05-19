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

/* ── Animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

export default function AboutUsPage() {
  return (
    <div
      className="min-h-screen font-sans pb-28"
      style={{ background: "var(--paper-bg)" }}
    >
      {/* ── Decorative blobs ── */}
      <div
        className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
          transform: "translate(-40%, -40%)",
        }}
      />
      <div
        className="fixed bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)",
          transform: "translate(30%, 30%)",
        }}
      />

      <div className="container-main pt-14 md:pt-20">

        {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
        <motion.div
          className="text-center mb-20"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 mb-6"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <span
              className="sticker-badge"
              style={{ background: "#fff3e8", color: "var(--ink)" }}
            >
              ✦ About The Platform
            </span>
          </motion.div>

          <motion.h1
            className="display-heading mb-6 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Built For Students,{" "}
            <br className="hidden md:block" />
            <span style={{ color: "var(--primary-blue)" }}>By the Students.</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium"
            style={{ color: "var(--muted-ink)" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Bridging the gap between exam panic and preparation with organized
            resources at your fingertips.
          </motion.p>
        </motion.div>

        {/* ══════════════════════════════════════
            STORY CARDS
        ══════════════════════════════════════ */}
        <motion.div
          className="grid md:grid-cols-2 gap-6 mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {/* The Problem */}
          <motion.div
            className="paper-card p-8 md:p-10 flex flex-col justify-center"
            variants={fadeUp}
            custom={0}
          >
            <div
              className="w-12 h-12 rounded-xl border-2 flex items-center justify-center mb-6"
              style={{
                background: "#fff5f5",
                borderColor: "#fca5a5",
                boxShadow: "3px 3px 0 #fca5a5",
              }}
            >
              <MdRocketLaunch className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-4" style={{ color: "var(--ink)" }}>
              The Origin Story
            </h2>
            <p className="leading-7 mb-4" style={{ color: "var(--muted-ink)" }}>
              It started with a familiar situation: the night before an exam.
              The syllabus was buried in chat logs, notes were scattered across
              groups, and previous year questions (PYQs) were nowhere to be found.
            </p>
            <p className="leading-7" style={{ color: "var(--muted-ink)" }}>
              The realization hit hard — the problem wasn&apos;t the exam itself, but
              the{" "}
              <strong style={{ color: "var(--ink)" }}>Disorganized Resources</strong>.
              Students needed a single, reliable source of truth to focus on what
              matters: studying.
            </p>
          </motion.div>

          {/* The Solution */}
          <motion.div
            className="rounded-2xl p-8 md:p-10 flex flex-col justify-center border-2"
            style={{
              background: "var(--dark-card)",
              borderColor: "var(--border-ink)",
              boxShadow: "var(--hard-shadow)",
            }}
            variants={fadeUp}
            custom={0.1}
          >
            <div
              className="w-12 h-12 rounded-xl border-2 flex items-center justify-center mb-6"
              style={{
                background: "var(--primary-blue)",
                borderColor: "rgba(255,255,255,0.3)",
                boxShadow: "3px 3px 0 rgba(255,255,255,0.15)",
              }}
            >
              <MdLibraryBooks className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-white">
              The Solution
            </h2>
            <p className="leading-7 mb-5" style={{ color: "#9ca3af" }}>
              <strong className="text-white">Sharda Online Library</strong> was born
              to solve this chaos. A centralized platform where you can access:
            </p>
            <ul className="space-y-3">
              {[
                { color: "#4ade80", label: "Comprehensive Syllabus" },
                { color: "#fb923c", label: "Organized Lecture Notes" },
                { color: "#c084fc", label: "Verified PYQs Repository" },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: item.color }}
                  />
                  <span className="font-semibold text-white">{item.label}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* ══════════════════════════════════════
            OFFICIAL STATEMENT
        ══════════════════════════════════════ */}
        <motion.div
          className="mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          custom={0}
        >
          <div className="paper-card p-8 md:p-10">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm"
                style={{
                  background: "#eff6ff",
                  borderColor: "var(--primary-blue)",
                }}
              >
                📋
              </div>
              <h2 className="text-2xl md:text-3xl font-black" style={{ color: "var(--ink)" }}>
                Official Statement
              </h2>
            </div>
            <p className="leading-7 mb-4" style={{ color: "var(--muted-ink)" }}>
              This platform is a student-led initiative created to support students
              by organizing academic resources in one place. It is{" "}
              <strong style={{ color: "var(--ink)" }}>not an official initiative</strong>{" "}
              of Sharda University, nor does it represent the University in any capacity.
            </p>
            <p className="leading-7" style={{ color: "var(--muted-ink)" }}>
              All resources available on this platform are copyrighted and are the
              property of Sharda University. The materials are shared solely for
              educational reference in accordance with applicable policies and guidelines.
            </p>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════
            MEET THE TEAM
        ══════════════════════════════════════ */}
        <div className="mb-20">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="section-title mb-3">Meet The Team</h2>
            <div
              className="w-16 h-1.5 mx-auto rounded-full"
              style={{ background: "var(--ink)" }}
            />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Admin Card */}
            <motion.div
              className="paper-card p-8 flex flex-col items-center text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              whileHover={{ y: -4 }}
            >
              <div
                className="w-20 h-20 rounded-full border-2 flex items-center justify-center mb-5"
                style={{
                  background: "#f3e8ff",
                  borderColor: "var(--border-ink)",
                  boxShadow: "4px 4px 0 var(--border-ink)",
                }}
              >
                <FaUserSecret className="w-9 h-9" style={{ color: "var(--accent-purple)" }} />
              </div>
              <h3 className="text-2xl font-black mb-1" style={{ color: "var(--ink)" }}>
                Admin Team
              </h3>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: "var(--muted-ink)" }}
              >
                Platform Developers
              </p>
              <p className="leading-relaxed mb-7 text-sm" style={{ color: "var(--muted-ink)" }}>
                Dedicated to building and maintaining the infrastructure that keeps
                this library running 24/7.
              </p>
              <a
                href="mailto:admin@shardaonlinelibrary.com"
                className="btn-primary w-full justify-center"
                style={{ padding: "10px 20px", fontSize: "0.875rem" }}
              >
                <BiSupport className="w-4 h-4" />
                Contact Admin Team
              </a>
            </motion.div>

            {/* Mods Card */}
            <motion.div
              className="paper-card p-8 flex flex-col items-center text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0.1}
              whileHover={{ y: -4 }}
            >
              <div
                className="w-20 h-20 rounded-full border-2 flex items-center justify-center mb-5"
                style={{
                  background: "#fff3e8",
                  borderColor: "var(--border-ink)",
                  boxShadow: "4px 4px 0 var(--border-ink)",
                }}
              >
                <FaUserShield className="w-9 h-9" style={{ color: "var(--accent-orange)" }} />
              </div>
              <h3 className="text-2xl font-black mb-1" style={{ color: "var(--ink)" }}>
                Mod Team
              </h3>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: "var(--muted-ink)" }}
              >
                Content Guardians
              </p>
              <p className="leading-relaxed mb-7 text-sm" style={{ color: "var(--muted-ink)" }}>
                Ensuring that every note, syllabus, and PYQ is verified, organized,
                and relevant for you.
              </p>
              <a
                href="mailto:mods@shardaonlinelibrary.com"
                className="btn-secondary w-full justify-center"
                style={{ padding: "10px 20px", fontSize: "0.875rem" }}
              >
                <MdEmail className="w-4 h-4" />
                Contact Mod Team
              </a>
            </motion.div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            FOOTER / SOCIALS
        ══════════════════════════════════════ */}
        <motion.div
          className="text-center pb-8 pt-12 max-w-sm mx-auto"
          style={{ borderTop: "2px dashed #c8c3ba" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <p className="font-bold mb-6 text-sm" style={{ color: "var(--muted-ink)" }}>
            Stay connected with our journey
          </p>
          <div className="flex justify-center gap-3">
            {[
              { href: "#", icon: <FaInstagram className="w-5 h-5" />, label: "Instagram" },
              {
                href: "https://www.linkedin.com/posts/nandalalshukla_shardauniversity-btech-engineering-activity-7417953428888293376-ToZ4",
                icon: <FaLinkedin className="w-5 h-5" />,
                label: "LinkedIn",
              },
              {
                href: "https://github.com/nandalalshukla/notes-pyqssharda-frontend",
                icon: <FaGithub className="w-5 h-5" />,
                label: "GitHub",
              },
            ].map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target={social.href !== "#" ? "_blank" : undefined}
                rel={social.href !== "#" ? "noopener noreferrer" : undefined}
                aria-label={social.label}
                className="p-3 rounded-full border-2 transition-all"
                style={{
                  background: "var(--paper-surface)",
                  borderColor: "var(--border-ink)",
                  boxShadow: "3px 3px 0 var(--border-ink)",
                  color: "var(--ink)",
                }}
                whileHover={{ y: -3, scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
