import QuestionsManagement from "@/components/admin/QuestionsManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý hỏi đáp | Admin",
  description: "Trả lời câu hỏi từ khách hàng",
};

export default function QuestionsPage() {
  return (
    <div className="container mx-auto max-w-5xl">
      <QuestionsManagement />
    </div>
  );
}