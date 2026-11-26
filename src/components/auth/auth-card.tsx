import type { ReactNode } from "react";

/**
 * Every auth page: the reference `.auth-split` layout, a day and night picture
 * on one side and the title, form and footer links on the other.
 */
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
    <div className="v2 v2-root lms-scope">
      <div className="auth-wrap mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="auth-split">
          <div className="auth-art" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="auth-day" src="/reference/art/ticket.webp" alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="auth-night"
              src="/reference/art/ticket-night.webp"
              alt=""
              loading="lazy"
            />
          </div>
          <section className="auth-form w-full max-w-xl">
            <div className="auth-head">
              <h1>{title}</h1>
              {intro && <p>{intro}</p>}
            </div>
            {children}
            {footer && (
              <div className="auth-fine border-t border-line-blue pt-4">
                {footer}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
