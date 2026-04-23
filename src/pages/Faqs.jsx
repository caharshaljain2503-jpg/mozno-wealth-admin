import React, { useEffect, useMemo, useState } from "react";
import { HelpCircle, Trash2, Edit3, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  useAllFaqs,
  useCreateFaq,
  useUpdateFaq,
  useDeleteFaq,
  useToggleFaqStatus,
} from "../api/hooks/useFaqs";

const Faqs = () => {
  const [q, setQ] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [status, setStatus] = useState("draft");
  const [order, setOrder] = useState(0);

  const [editingId, setEditingId] = useState(null);

  const {
    data: faqsData,
    isLoading,
    error,
    refetch,
  } = useAllFaqs();

  const faqs = useMemo(() => faqsData?.faqs || [], [faqsData]);

  const createMutation = useCreateFaq({
    onSuccess: () => {
      resetForm();
      refetch();
    },
  });

  const updateMutation = useUpdateFaq({
    onSuccess: () => {
      setEditingId(null);
      resetForm();
      refetch();
    },
  });

  const deleteMutation = useDeleteFaq({
    onSuccess: () => refetch(),
  });

  const toggleStatusMutation = useToggleFaqStatus({
    onSuccess: () => refetch(),
  });

  useEffect(() => {
    if (!faqs || faqs.length === 0) return;
  }, [faqs]);

  const resetForm = () => {
    setQ("");
    setAnswerText("");
    setStatus("draft");
    setOrder(0);
  };

  const startEdit = (faq) => {
    setEditingId(faq._id);
    setQ(faq.q || "");
    setAnswerText(Array.isArray(faq.a) ? faq.a.join("\n") : String(faq.a || ""));
    setStatus(faq.status || "draft");
    setOrder(typeof faq.order === "number" ? faq.order : parseInt(faq.order, 10) || 0);
  };

  const buildPayload = () => {
    const a = answerText
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean);

    return {
      q: q.trim(),
      a,
      status,
      order: typeof order === "number" ? order : parseInt(order, 10) || 0,
    };
  };

  const handleSubmit = () => {
    const question = q.trim();
    const payload = buildPayload();

    if (!question) {
      alert("Question is required");
      return;
    }

    if (!payload.a || payload.a.length === 0) {
      alert("Answer is required (at least 1 line)");
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this FAQ?")) return;
    deleteMutation.mutate(id);
  };

  const handleToggleStatus = (id) => {
    toggleStatusMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <HelpCircle className="w-10 h-10 mx-auto text-slate-400" />
          <p className="mt-3 text-slate-600">Failed to load FAQs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/25">
          <HelpCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">FAQs</h1>
          <p className="text-sm text-slate-500">Add questions/answers and publish to the main site.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {editingId ? "Edit FAQ" : "Add New FAQ"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Question</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500"
                placeholder="e.g. How do I get started?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Answer (one line = one paragraph)</label>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                rows={7}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500"
                placeholder={"Type answer...\nLine2...\nLine3..."}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Order</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white rounded-xl font-semibold hover:from-fuchsia-600 hover:to-pink-700 transition-all shadow-lg shadow-fuchsia-500/25 disabled:opacity-50"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                <span>{editingId ? "Update FAQ" : "Add FAQ"}</span>
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    resetForm();
                  }}
                  className="px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">All FAQs</h2>
            <div className="text-sm text-slate-500">{faqs.length} total</div>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-auto pr-2">
            {faqs.length === 0 ? (
              <div className="text-center py-10 text-slate-500">No FAQs found.</div>
            ) : (
              faqs.map((faq) => (
                <div
                  key={faq._id}
                  className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {faq.q}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-lg text-[12px] font-semibold ${
                            faq.status === "published"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-50 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {faq.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 break-words">
                        {(Array.isArray(faq.a) ? faq.a : []).slice(0, 2).join(" • ")}
                        {Array.isArray(faq.a) && faq.a.length > 2 ? " ..." : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(faq._id)}
                        disabled={toggleStatusMutation.isPending}
                        className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                        aria-label="Toggle publish status"
                      >
                        {faq.status === "published" ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => startEdit(faq)}
                        className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                        aria-label="Edit FAQ"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(faq._id)}
                        className="p-2 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 transition-colors"
                        aria-label="Delete FAQ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faqs;

