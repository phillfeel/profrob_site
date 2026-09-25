import type * as React from 'react';

export type IconName = 'arrow-right' | 'arrow-up-right' | 'plus' | 'minus' | 'check' | 'menu' | 'close' | 'chevron-down' | 'play' | 'phone' | 'mail';
export interface IconProps { name: IconName; size?: number; label?: string; className?: string }
export declare function Icon(props: IconProps): React.ReactElement;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'inverse';
  size?: 'lg' | 'md' | 'sm';
  icon?: IconName;
  iconOnly?: boolean;
  href?: string;
}
export declare function Button(props: ButtonProps): React.ReactElement;

export type NavLink = string | { label: string; href: string };
export interface NavBarProps { links?: NavLink[]; active?: string; logo?: React.ReactNode; logoSrc?: string; homeHref?: string; ctaLabel?: string; onCta?: () => void; className?: string }
export declare function NavBar(props: NavBarProps): React.ReactElement;

export interface SectionCounterProps { current: number; total: number; orientation?: 'vertical' | 'horizontal'; className?: string }
export declare function SectionCounter(props: SectionCounterProps): React.ReactElement;

export interface TagProps { children: React.ReactNode; dot?: boolean; className?: string }
export declare function Tag(props: TagProps): React.ReactElement;

export interface BadgeProps { tone?: 'success' | 'neutral' | 'accent' | 'warning' | 'danger' | 'lime'; dot?: boolean; children: React.ReactNode; className?: string }
export declare function Badge(props: BadgeProps): React.ReactElement;

export interface MetricsBarProps { items?: { value: string; label?: string }[]; status?: string | false; className?: string }
export declare function MetricsBar(props: MetricsBarProps): React.ReactElement;

export interface KpiProps { value: string; unit?: string; label: React.ReactNode; className?: string }
export declare function Kpi(props: KpiProps): React.ReactElement;

export interface SectionHeaderProps { index?: string; label?: string; title: React.ReactNode; lead?: React.ReactNode; align?: 'start' | 'center'; as?: 'h1' | 'h2' | 'h3'; children?: React.ReactNode; className?: string }
export declare function SectionHeader(props: SectionHeaderProps): React.ReactElement;

/** Always-dark graphite podium; sets data-theme="dark" so children switch tokens. */
export interface StageProps { glow?: boolean; children?: React.ReactNode; className?: string; style?: React.CSSProperties }
export declare function Stage(props: StageProps): React.ReactElement;

export interface ScanRingProps { width?: number; className?: string }
export declare function ScanRing(props: ScanRingProps): React.ReactElement;

export interface PartnerStripProps { partners?: (string | { name: string; src?: string })[]; label?: string; className?: string }
export declare function PartnerStrip(props: PartnerStripProps): React.ReactElement;

export interface RobotCardProps { tag?: string; vendor?: string; name: string; text?: string; image?: string; imageAlt?: string; specs?: { label: string; value: string }[]; price?: string; cta?: string; href?: string; className?: string }
export declare function RobotCard(props: RobotCardProps): React.ReactElement;

export interface IndustryCardProps { index: string; title: string; text?: string; tags?: string[]; href?: string; className?: string }
export declare function IndustryCard(props: IndustryCardProps): React.ReactElement;

export interface CaseCardProps { client: string; industry?: string; metric: string; metricLabel: string; text?: string; robots?: React.ReactNode; className?: string }
export declare function CaseCard(props: CaseCardProps): React.ReactElement;

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; hint?: string; error?: string; multiline?: boolean }
export declare function Field(props: FieldProps): React.ReactElement;

export interface SliderProps { label: string; min?: number; max?: number; step?: number; value?: number; defaultValue?: number; unit?: string; onChange?: (value: number) => void; className?: string }
export declare function Slider(props: SliderProps): React.ReactElement;

export type SegOption = string | { value: string; label: string };
export interface SegmentedProps { options: SegOption[]; value?: string; defaultValue?: string; onChange?: (value: string) => void; size?: 'md' | 'sm'; label?: string; className?: string }
export declare function Segmented(props: SegmentedProps): React.ReactElement;

export interface AccordionProps { items: { q: React.ReactNode; a: React.ReactNode }[]; defaultOpen?: number; className?: string }
export declare function Accordion(props: AccordionProps): React.ReactElement;

export interface FooterProps { columns?: { title: string; links: (string | { label: string; href: string })[] }[]; tagline?: string; legal?: React.ReactNode; logo?: React.ReactNode; logoSrc?: string; className?: string }
export declare function Footer(props: FooterProps): React.ReactElement;

declare global {
  interface Window {
    Profrobot: {
      Button: typeof Button; Icon: typeof Icon; NavBar: typeof NavBar; SectionCounter: typeof SectionCounter; Tag: typeof Tag; Badge: typeof Badge;
      MetricsBar: typeof MetricsBar; Kpi: typeof Kpi; SectionHeader: typeof SectionHeader; Stage: typeof Stage; ScanRing: typeof ScanRing;
      PartnerStrip: typeof PartnerStrip; RobotCard: typeof RobotCard; IndustryCard: typeof IndustryCard; CaseCard: typeof CaseCard;
      Field: typeof Field; Slider: typeof Slider; Segmented: typeof Segmented; Accordion: typeof Accordion; Footer: typeof Footer;
    };
  }
}
