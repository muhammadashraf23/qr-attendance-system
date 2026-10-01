import DeanShell from '@/components/dean/DeanShell';

export const metadata = { title: 'Dean Console — Attendzo' };

export default function DeanLayout({ children }: { children: React.ReactNode }) {
  return <DeanShell>{children}</DeanShell>;
}
