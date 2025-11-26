"use client";

import React, { useEffect, useState } from "react";
import { Send, User, MessageCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Question = {
  id: number;
  author_name: string;
  content: string;
  answer: string | null;
  created_at: string;
};

type Props = {
  productSlug: string;
};

export default function ProductQuestions({ productSlug }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // 1. Fetch Questions
  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products/${productSlug}/questions/`);
      if (res.ok) {
        const data = await res.json();
        // Pagination logic might be needed later, assuming list for now or .results
        const list = Array.isArray(data) ? data : data.results || [];
        setQuestions(list);
      }
    } catch (error) {
      console.error("Failed to load questions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [productSlug]);

  // 2. Submit Question
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/products/${productSlug}/questions/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author_name: authorName,
          content: content,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Có lỗi xảy ra, vui lòng thử lại.");
      }

      // Success: Clear form and reload list
      setAuthorName("");
      setContent("");
      setSubmitStatus("success");
      fetchQuestions(); // Refresh list to show new question immediately
    } catch (err: any) {
      setSubmitStatus("error");
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 mt-12" id="product-questions">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-emerald-600" />
        <h2 className="text-2xl font-bold text-gray-900">Hỏi đáp về sản phẩm</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: List of Questions */}
        <div className="md:col-span-2 space-y-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Đang tải câu hỏi...</div>
          ) : questions.length === 0 ? (
            <Card className="bg-gray-50 border-dashed">
              <CardContent className="py-8 text-center text-gray-500">
                Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi!
              </CardContent>
            </Card>
          ) : (
            questions.map((q) => (
              <Card key={q.id} className="border-l-4 border-l-emerald-500 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  {/* User Question */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      <User size={16} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-baseline justify-between">
                        <span className="font-semibold text-gray-900">{q.author_name}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(q.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <p className="text-gray-700">{q.content}</p>
                    </div>
                  </div>

                  {/* Admin Answer */}
                  {q.answer && (
                    <div className="ml-11 mt-3 bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                      <div className="flex gap-2 items-start">
                        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                          AgriHCM trả lời
                        </Badge>
                      </div>
                      <p className="text-emerald-900 mt-2 text-sm leading-relaxed">
                        {q.answer}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Right Column: Ask Form */}
        <div className="md:col-span-1">
          <Card className="sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Đặt câu hỏi mới</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Tên của bạn <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    placeholder="Nhập tên..."
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium text-gray-700">
                    Câu hỏi <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="content"
                    placeholder="Viết câu hỏi của bạn..."
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>

                {submitStatus === "success" && (
                  <Alert className="bg-green-50 text-green-800 border-green-200 py-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Gửi thành công! Câu hỏi của bạn sẽ sớm được trả lời.
                    </AlertDescription>
                  </Alert>
                )}

                {submitStatus === "error" && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {errorMessage || "Gửi thất bại. Vui lòng thử lại."}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang gửi..." : (
                    <>
                      <Send className="w-4 h-4 mr-2" /> Gửi câu hỏi
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}