import React from 'react';
import {
  BrainCircuitIcon,
  CodeXmlIcon,
  PaletteIcon,
  PlayCircleIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  SparklesIcon } from
'lucide-react';
import type { Service } from '../data/services';

const iconMap = {
  code: CodeXmlIcon,
  smartphone: SmartphoneIcon,
  brain: BrainCircuitIcon,
  palette: PaletteIcon,
  sparkles: SparklesIcon,
  play: PlayCircleIcon,
  shield: ShieldCheckIcon
};

type ServiceIconProps = {
  name: Service['icon'];
  className?: string;
};

export function ServiceIcon({ name, className = 'h-6 w-6' }: ServiceIconProps) {
  const Icon = iconMap[name];
  return <Icon className={className} aria-hidden="true" />;
}