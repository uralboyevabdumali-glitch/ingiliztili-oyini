const VARIANTS = {
  primary: 'bg-brand text-white shadow-[0_4px_0_#1F3BB8] hover:bg-[#3A61F5]',
  gold: 'bg-gold text-ink shadow-[0_4px_0_#B98A00] hover:bg-[#FFC21A]',
  green: 'bg-leaf text-white shadow-[0_4px_0_#0F7A36] hover:bg-[#19B152]',
  red: 'bg-rose text-white shadow-[0_4px_0_#B91C1C] hover:bg-[#F25555]',
  violet: 'bg-grape text-white shadow-[0_4px_0_#5B21B6] hover:bg-[#8B4BF0]',
  soft: 'bg-white text-ink border-2 border-slate-200 shadow-[0_4px_0_#CBD5E1] hover:border-brand/40 dark:bg-night-card dark:text-slate-100 dark:border-night-line dark:shadow-[0_4px_0_#16202F]',
  ghost: 'bg-transparent text-ink-soft hover:bg-slate-200/60 dark:text-night-soft dark:hover:bg-white/5',
};

const SIZES = {
  sm: 'h-9 px-3 text-sm rounded-xl gap-1.5',
  md: 'h-11 px-5 text-[15px] rounded-2xl gap-2',
  lg: 'h-14 px-7 text-base rounded-2xl gap-2.5',
  icon: 'h-10 w-10 rounded-xl',
};

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }) {
  const pressable = variant !== 'ghost' ? 'active:translate-y-[4px] active:shadow-none' : '';
  return (
    <button
      type="button"
      className={`inline-flex select-none items-center justify-center font-bold transition-[transform,box-shadow,background-color,border-color] duration-100 disabled:pointer-events-none disabled:opacity-50 ${pressable} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
