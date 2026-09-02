import Link from "next/link";
import { Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col p-8">
      <Wordmark />
      <div className="m-auto flex max-w-90 flex-col items-center gap-4 text-center">
        <span className="text-[13px] font-medium text-accent">404</span>
        <h1 className="m-0 text-2xl font-semibold">That slide doesn&rsquo;t exist.</h1>
        <p className="m-0 text-t2">
          The page you followed has moved or was never published.
        </p>
        <Button variant="primary" asChild>
          <Link href="/dashboard">Back to carousels</Link>
        </Button>
      </div>
    </div>
  );
}
