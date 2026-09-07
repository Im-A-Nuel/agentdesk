import Link from "next/link";
import { Shell } from "@/components/site/layout";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Shell><div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6">
          <Button variant="brass" size="lg" asChild><Link href="/">Go home</Link></Button>
        </div>
      </div>
    </div></Shell>
  );
}
