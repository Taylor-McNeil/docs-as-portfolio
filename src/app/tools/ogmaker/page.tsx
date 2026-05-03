import type { Metadata } from 'next';
import OgImageMaker from './og-image-maker';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function OgMakerPage() {
  return <OgImageMaker />;
}
