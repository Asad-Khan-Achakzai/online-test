import { notFound } from "next/navigation";
import { ExamShell } from "@/components/exam/ExamShell";
import { EXAM_CONFIG } from "@/config/examConfig";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ testId: EXAM_CONFIG.testId }];
}

export const metadata = {
  title: "Examination",
};

export default async function TestPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  if (testId !== EXAM_CONFIG.testId) notFound();
  return <ExamShell testId={testId} />;
}
