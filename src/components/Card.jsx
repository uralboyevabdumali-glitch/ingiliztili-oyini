export default function Card({ as: Tag = 'div', hover = false, className = '', children, ...rest }) {
  return (
    <Tag
      className={`rounded-3xl border border-slate-200/80 bg-white shadow-card dark:border-night-line dark:bg-night-card ${
        hover ? 'transition duration-200 hover:-translate-y-1 hover:shadow-lift motion-reduce:hover:translate-y-0' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function SectionTitle({ title, subtitle, right }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-xl font-extrabold leading-tight sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-mute dark:text-night-soft">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
