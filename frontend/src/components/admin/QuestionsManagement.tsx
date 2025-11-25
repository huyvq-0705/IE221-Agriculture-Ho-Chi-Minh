"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageCircle, Trash2, Send, Package, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- HELPER: Get Headers (Matches your Dashboard pattern) ---
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

type Question = {
  id: number;
  product: number;
  product_name: string;
  product_slug: string;
  product_image?: string;
  author_name: string;
  content: string;
  answer?: string;
  created_at: string;
};

export default function QuestionsManagement() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"unanswered" | "all">("unanswered");
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const { toast } = useToast();

  // --- API FUNCTIONS (Client-Side) ---

  const fetchQuestions = async (status: "all" | "unanswered") => {
    try {
      const query = status === "unanswered" ? "?status=unanswered" : "";
      const res = await fetch(`${API_BASE}/api/admin/questions/${query}`, {
        headers: getAuthHeaders(),
        credentials: "include", // Try cookies first, but headers are there as backup
        cache: "no-store",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to fetch");
      }
      return await res.json();
    } catch (error) {
      console.error(error);
      return { results: [] };
    }
  };

  const replyToQuestionApi = async (id: number, answer: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/questions/${id}/`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ answer }),
      });
      return res.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const deleteQuestionApi = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/questions/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      return res.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // --- LOGIC ---

  const loadData = async (status: "unanswered" | "all") => {
    setLoading(true);
    const data = await fetchQuestions(status);
    // Handle Django pagination { count, results: [] } or raw array
    const list = Array.isArray(data) ? data : data.results || [];
    setQuestions(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  const handleReplySubmit = async (id: number) => {
    if (!replyText.trim()) return;
    
    setReplyingId(id);
    const success = await replyToQuestionApi(id, replyText);
    
    if (success) {
      toast({ title: "Thành công", description: "Đã gửi câu trả lời." });
      setReplyText("");
      loadData(activeTab);
    } else {
      toast({ title: "Lỗi", description: "Không thể gửi câu trả lời.", variant: "destructive" });
    }
    setReplyingId(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi này không?")) return;
    const success = await deleteQuestionApi(id);
    if (success) {
      toast({ title: "Đã xóa", description: "Câu hỏi đã bị xóa." });
      loadData(activeTab);
    } else {
      toast({ title: "Lỗi", description: "Không thể xóa.", variant: "destructive" });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Hỏi đáp sản phẩm</h2>
      </div>

      {/* Custom Tab Navigation */}
      <div className="w-full">
        <div className="flex border-b w-full">
          <button
            onClick={() => setActiveTab("unanswered")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "unanswered"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Cần trả lời
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "all"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Tất cả câu hỏi
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-10 text-gray-500 border rounded-lg bg-gray-50">
              {activeTab === "unanswered" 
                ? "Tuyệt vời! Không có câu hỏi nào cần trả lời." 
                : "Chưa có câu hỏi nào."}
            </div>
          ) : (
            questions.map((q) => (
              <Card key={q.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Product Info Column */}
                  <div className="w-full md:w-64 bg-gray-50 p-4 border-r flex flex-col items-center text-center space-y-3">
                    <div className="w-24 h-24 bg-white rounded border overflow-hidden flex items-center justify-center">
                      {q.product_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={q.product_image} alt={q.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm line-clamp-2" title={q.product_name}>{q.product_name}</h4>
                      <a href={`/products/${q.product_slug}`} target="_blank" className="text-xs text-blue-600 hover:underline mt-1 block">
                        Xem sản phẩm
                      </a>
                    </div>
                  </div>

                  {/* Question Content Column */}
                  <div className="flex-1 p-4 md:p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex gap-1">
                            <User className="w-3 h-3" /> {q.author_name}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatDate(q.created_at)}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="bg-blue-50/50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 flex gap-2">
                        <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        {q.content}
                      </h3>
                    </div>

                    {/* Answer Section */}
                    <div className="mt-2 space-y-3">
                        {q.answer ? (
                            <div className="pl-4 border-l-2 border-green-500">
                                <p className="text-sm font-semibold text-green-700 mb-1">Câu trả lời của shop:</p>
                                <p className="text-gray-700">{q.answer}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Textarea 
                                    placeholder="Nhập câu trả lời của bạn..." 
                                    className="min-h-[100px]"
                                    value={replyingId === q.id ? replyText : ""} 
                                    onChange={(e) => {
                                        setReplyingId(q.id);
                                        setReplyText(e.target.value);
                                    }}
                                    onFocus={() => {
                                        if (replyingId !== q.id) {
                                            setReplyingId(q.id);
                                            setReplyText("");
                                        }
                                    }}
                                />
                                <div className="flex justify-end">
                                    <Button 
                                        onClick={() => handleReplySubmit(q.id)} 
                                        disabled={replyingId !== q.id || !replyText.trim() || !replyingId}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {replyingId === q.id && loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                        Gửi trả lời
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}