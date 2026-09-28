import { notFound } from "next/navigation";
import { QrDisplay } from "@/components/exam/QrDisplay";
import { EXAM_CONFIG } from "@/config/examConfig";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ testId: EXAM_CONFIG.testId }];
}

export const metadata = {
  title: "Venue QR",
};

export default async function DisplayPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  if (testId !== EXAM_CONFIG.testId) notFound();
  return <QrDisplay testId={testId} />;
}
