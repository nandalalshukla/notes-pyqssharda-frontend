/**
 * FAQ copy, shared between the rendered page and its FAQPage structured
 * data.
 *
 * Deliberately one source: Google's structured data policy requires the
 * marked-up answer to be visible on the page, and keeping two copies is
 * how they drift apart until the markup describes text nobody can see.
 *
 * The questions are phrased the way students actually search — "where can
 * I find Sharda University previous year question papers" rather than
 * "PYQ availability" — because matching real queries is what earns the
 * answer a place in results.
 */

export interface Faq {
  question: string;
  answer: string;
}

export const HOME_FAQS: Faq[] = [
  {
    question: "What is Sharda Social?",
    answer:
      "Sharda Social is a free, student-run platform for Sharda University, Greater Noida. It combines an online library of previous year question papers, semester notes and syllabus PDFs with a campus feed where students post announcements, events and lost & found items. It is independent and not an official university website.",
  },
  {
    question:
      "Where can I find Sharda University previous year question papers?",
    answer:
      "Every past paper is in the PYQs section of the library. You can filter by programme, semester, academic year or course code, or search by subject name — for example 'operating systems' or 'CSE252'. The collection covers all nine schools, including engineering, law, pharmacy, nursing, medical, dental, allied health, humanities and education.",
  },
  {
    question: "Are Sharda University notes and syllabus available too?",
    answer:
      "Yes. The Notes section holds unit-wise study notes shared by students, and the Syllabus section holds the official unit breakdown for each course, so you can see exactly what is examinable before you start revising.",
  },
  {
    question: "Do I need an account to use the Sharda online library?",
    answer:
      "No. Browsing, searching and downloading study material is open to everyone with no sign-up. You only need a free account — using your @ug.sharda.ac.in email — to upload your own material, post on the campus feed, comment or follow other students.",
  },
  {
    question: "Is Sharda Social free to use?",
    answer:
      "Yes, completely. It is built and run by Sharda students, and there is no charge for browsing or downloading anything in the library.",
  },
  {
    question: "Can I contribute my own notes or question papers?",
    answer:
      "Yes, and it is the main way the library grows. Sign in with your Sharda email and upload from your dashboard. Uploads are checked by a moderator before they go live, so the library stays accurate and relevant.",
  },
];
