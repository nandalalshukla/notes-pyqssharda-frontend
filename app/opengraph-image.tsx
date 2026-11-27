import { ImageResponse } from "next/og";

export const alt = "Sharda Social: student library, PYQs, notes and syllabus";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#101b29", color: "#fff", fontFamily: "sans-serif" }}>
      <div style={{ fontSize: 30, color: "#b8ecc8", marginBottom: 28 }}>BUILT BY STUDENTS, FOR STUDENTS</div>
      <div style={{ fontSize: 88, fontWeight: 700 }}>Sharda Social</div>
      <div style={{ fontSize: 38, marginTop: 30 }}>PYQs · Notes · Syllabus · Study Guides</div>
      <div style={{ fontSize: 25, marginTop: 55, color: "#b9c4d1" }}>An independent Sharda University student community</div>
    </div>,
    size,
  );
}
