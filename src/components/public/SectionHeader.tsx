import Link from "next/link";

interface Props {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
}

export function SectionHeader({ icon, title, subtitle, href, hrefLabel = "شاهد الكل" }: Props) {
  return (
    <div className="flex items-end justify-between mb-7 pb-3 border-b-2 border-burgundy relative">
      {/* خط عنابي تحت العنوان */}
      <span className="absolute -bottom-[3px] right-0 w-20 h-1 bg-burgundy rounded-t" />

      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-rose-cream grid place-items-center text-burgundy">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-extrabold text-ink -tracking-[0.02em] flex items-center gap-2.5">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-ink-soft mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {href && (
        <Link
          href={href}
          className="text-sm text-burgundy font-bold hover:text-burgundy-dark hover:gap-3 flex items-center gap-2 transition-all"
        >
          {hrefLabel}
          <span className="text-base">←</span>
        </Link>
      )}
    </div>
  );
}
