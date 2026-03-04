/**
 * Shared icon name to Lucide component map for palette rendering.
 *
 * Used by both the desktop EntityPalette/PaletteItem and the
 * mobile MobilePalette to resolve icon name strings from the
 * entity registry into renderable Lucide components.
 */

import {
  Building2,
  Shield,
  ShieldCheck,
  ShieldHalf,
  Landmark,
  Handshake,
  FileSignature,
  TrendingUp,
  Rocket,
  User,
  type LucideIcon,
} from 'lucide-react';

/** Map icon name strings from entity registry to Lucide components */
export const PALETTE_ICONS: Record<string, LucideIcon> = {
  'building-2': Building2,
  'shield': Shield,
  'shield-check': ShieldCheck,
  'shield-half': ShieldHalf,
  'landmark': Landmark,
  'handshake': Handshake,
  'file-signature': FileSignature,
  'trending-up': TrendingUp,
  'rocket': Rocket,
  'user': User,
};
