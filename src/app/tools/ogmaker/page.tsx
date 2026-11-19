import type { Metadata } from 'next';
import OgImageMakerClient from './og-image-maker-client';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function OgMakerPage() {
  return <OgImageMakerClient />;
}
