import type { Metadata } from 'next';
import AO3Formatter from './ao3-formatter';

export const metadata: Metadata = {
  title: 'AO3 Formatter',
  alternates: { canonical: 'https://taylormcneil.dev/tools/ao3formatter' },
  robots: { index: false, follow: false },
};

export default function AO3FormatterPage() {
  return <AO3Formatter />;
}
