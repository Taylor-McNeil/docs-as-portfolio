import type { Metadata } from "next";
import Ao3Previewer from "./ao3-previewer";

export const metadata: Metadata = {
  title: "AO3 Chapter Previewer",
  robots: { index: false, follow: false },
};

export default function Ao3PreviewPage() {
  return <Ao3Previewer />;
}
