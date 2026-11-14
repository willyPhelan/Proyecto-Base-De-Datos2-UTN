import {
  Box,
  CircuitBoard,
  Cpu,
  Fan,
  HardDrive,
  Layers,
  MemoryStick,
  Monitor,
  Zap,
} from 'lucide-react';

type CategoryVisual = {
  Icon: typeof Cpu;
  gradientClass: string;
  accentClass: string;
};

export function getCategoryVisual(categoryName: string): CategoryVisual {
  const key = categoryName.toLowerCase();

  if (key.includes('procesador') || key.includes('cpu')) {
    return {
      Icon: Cpu,
      gradientClass: 'from-[#161B2E] via-[#11131C] to-[#0D1017]',
      accentClass: 'text-[#A3FF12]',
    };
  }
  if (key.includes('video') || key.includes('gpu') || key.includes('placa')) {
    return {
      Icon: Monitor,
      gradientClass: 'from-[#1A1629] via-[#11131C] to-[#0B0E14]',
      accentClass: 'text-emerald-400',
    };
  }
  if (key.includes('mother')) {
    return {
      Icon: CircuitBoard,
      gradientClass: 'from-[#132026] via-[#11131C] to-[#0B0D14]',
      accentClass: 'text-cyan-400',
    };
  }
  if (key.includes('ram') || key.includes('memoria')) {
    return {
      Icon: MemoryStick,
      gradientClass: 'from-[#1C1D2A] via-[#11131C] to-[#0D0E14]',
      accentClass: 'text-[#A3FF12]',
    };
  }
  if (key.includes('almacen') || key.includes('ssd') || key.includes('nvme') || key.includes('disco')) {
    return {
      Icon: HardDrive,
      gradientClass: 'from-[#141E24] via-[#11131C] to-[#0B0E14]',
      accentClass: 'text-sky-400',
    };
  }
  if (key.includes('fuente') || key.includes('psu') || key.includes('poder')) {
    return {
      Icon: Zap,
      gradientClass: 'from-[#221D15] via-[#11131C] to-[#0D0E14]',
      accentClass: 'text-amber-400',
    };
  }
  if (key.includes('gabinete') || key.includes('case')) {
    return {
      Icon: Box,
      gradientClass: 'from-[#1B1D24] via-[#11131C] to-[#0A0C12]',
      accentClass: 'text-slate-200',
    };
  }
  if (key.includes('refriger') || key.includes('cooler') || key.includes('fan')) {
    return {
      Icon: Fan,
      gradientClass: 'from-[#132022] via-[#11131C] to-[#0B0E14]',
      accentClass: 'text-teal-400',
    };
  }

  return {
    Icon: Layers,
    gradientClass: 'from-[#171A26] via-[#11131C] to-[#0B0D14]',
    accentClass: 'text-[#A3FF12]',
  };
}

export function CategoryIconPanel({
  category,
  size = 'md',
}: {
  category: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const { Icon, gradientClass, accentClass } = getCategoryVisual(category);
  const iconSize =
    size === 'lg' ? 'h-20 w-20' : size === 'sm' ? 'h-9 w-9' : 'h-14 w-14';
  const heightClass =
    size === 'lg' ? 'aspect-[4/3]' : size === 'sm' ? 'h-20 w-20' : 'aspect-[4/3]';

  return (
    <div
      className={`relative flex w-full items-center justify-center overflow-hidden rounded-lg border border-[#24293B] bg-gradient-to-br ${gradientClass} ${heightClass}`}
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(163,255,18,0.08),transparent_65%)]" />
      <Icon className={`${iconSize} ${accentClass} transition-transform duration-200 group-hover:scale-105`} strokeWidth={1.5} />
    </div>
  );
}
