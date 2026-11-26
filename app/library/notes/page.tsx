import { connection } from "next/server";
import NotesLibrary from "./NotesLibrary";

export default async function NotesPage() {
  await connection();
  return <NotesLibrary />;
}
