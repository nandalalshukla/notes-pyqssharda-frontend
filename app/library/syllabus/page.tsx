import { connection } from "next/server";
import SyllabusLibrary from "./SyllabusLibrary";

export default async function SyllabusPage() {
  await connection();
  return <SyllabusLibrary />;
}
