import type { Metadata } from 'next';
import TropeCloud from './trope-cloud';

export const metadata: Metadata = {
  title: 'Trope Cloud Generator',
  description: 'Generate AO3-style marketing cards for social media.',
  robots: { index: false, follow: false },
};

export default function TropeCloudPage() {
  return <TropeCloud />;
}
