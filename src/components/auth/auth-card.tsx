import type { ReactNode } from "react";

/** The centred card every auth page sits in. */
export function AuthCard({
  title,
  intro,
  children,
  footer,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-md px-4 py-12">
      <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {intro && <p className="mt-2 text-muted-foreground">{intro}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </section>
  );
}
