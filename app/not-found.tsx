import Link from "next/link";
import { FiCompass } from "react-icons/fi";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <FiCompass size={32} />
      </div>
      <h1 className="text-4xl font-black text-foreground">404</h1>
      <p className="mt-2 text-lg font-semibold text-foreground">
        Page not found
      </p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved.
      </p>
      <Link href="/" className="mt-8">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
