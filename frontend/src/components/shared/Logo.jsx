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
            className="font-extrabold tracking-tight text-black"
            style={{ fontSize: size * 0.45 }}
          >
            Attendzo
          </span>
          <span
            className="font-semibold tracking-widest uppercase text-zinc-500"
            style={{ fontSize: size * 0.22 }}
          >
            Attendance System
          </span>
        </div>
      )}
    </div>
  );
}
