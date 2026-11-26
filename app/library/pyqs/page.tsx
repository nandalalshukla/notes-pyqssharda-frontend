import { connection } from "next/server";
import PyqsLibrary from "./PyqsLibrary";

export default async function PyqsPage() {
  await connection();
  return <PyqsLibrary />;
}
