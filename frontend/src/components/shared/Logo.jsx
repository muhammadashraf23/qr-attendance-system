import Image from 'next/image';

export default function Logo({ size = 48, className = '' }) {
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
    </div>
  );
}
