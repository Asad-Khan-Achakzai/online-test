import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4">
      <h1 className="text-3xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-3 text-base leading-6 text-muted">
        This examination address is not valid.
      </p>
      <Link href="/" className="mt-6 text-base font-semibold text-navy">
        Return to the examination desk
      </Link>
    </main>
  );
}
