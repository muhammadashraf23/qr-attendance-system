import Image from 'next/image';

export default function Logo({ size = 48, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <Image
          src="/logo.png"
          alt="Attendzo"
          width={size}
          height={size}
          className="object-contain drop-shadow-md"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span
            className="font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent"
            style={{ fontSize: size * 0.45 }}
          >
            Attendzo
          </span>
          <span
            className="font-semibold tracking-widest uppercase text-slate-400"
            style={{ fontSize: size * 0.22 }}
          >
            Academic SaaS
          </span>
        </div>
      )}
    </div>
  );
}
