import React, { useMemo, useState } from "react";
import {
  Handshake,
  Loader2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ImagePlus,
} from "lucide-react";
import {
  useAdminPartnerLogos,
  useCreatePartnerLogo,
  useUpdatePartnerLogo,
  useDeletePartnerLogo,
  useReorderPartnerLogos,
} from "../api/hooks/usePartnerLogos";

const PartnerLogos = () => {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [replaceFile, setReplaceFile] = useState(null);

  const { data, isLoading, error, refetch } = useAdminPartnerLogos();
  const logos = useMemo(() => data?.partnerLogos || [], [data]);

  const createMutation = useCreatePartnerLogo({
    onSuccess: () => {
      setName("");
      setFile(null);
    },
  });
  const updateMutation = useUpdatePartnerLogo({
    onSuccess: () => {
      setEditingId(null);
      setEditName("");
      setReplaceFile(null);
    },
  });
  const deleteMutation = useDeletePartnerLogo();
  const reorderMutation = useReorderPartnerLogos();

  const handleAdd = () => {
    if (!file) {
      alert("Please choose a logo image");
      return;
    }
    const fd = new FormData();
    fd.append("image", file);
    fd.append("name", name.trim());
    fd.append("isActive", "true");
    createMutation.mutate(fd);
  };

  const saveEdit = (id) => {
    const fd = new FormData();
    fd.append("name", editName.trim());
    if (replaceFile) fd.append("image", replaceFile);
    const logo = logos.find((l) => l._id === id);
    if (logo) fd.append("isActive", logo.isActive ? "true" : "false");
    updateMutation.mutate({ id, formData: fd });
  };

  const toggleActive = (logo) => {
    const fd = new FormData();
    fd.append("name", logo.name || "");
    fd.append("isActive", logo.isActive ? "false" : "true");
    updateMutation.mutate({ id: logo._id, formData: fd });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Remove this partner logo?")) return;
    deleteMutation.mutate(id);
  };

  const move = (index, dir) => {
    const next = [...logos];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    reorderMutation.mutate(next.map((l) => l._id));
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
      <div className="min-h-[60vh] flex items-center justify-center text-slate-600">
        Failed to load partner logos
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <Handshake className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Partner logos</h1>
          <p className="text-sm text-slate-500">
            Upload logos for the homepage carousel. Drag order with arrows; inactive logos are hidden on the site.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Add logo</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Partner name (alt text)</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                placeholder="e.g. HDFC Bank"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Logo image</label>
              <label className="flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors">
                <ImagePlus className="w-8 h-8 text-slate-400" />
                <span className="text-sm text-slate-600">{file ? file.name : "PNG / JPG / SVG — max 5MB"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={createMutation.isPending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              Upload logo
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Homepage order</h2>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-sm text-emerald-700 font-medium hover:underline"
            >
              Refresh
            </button>
          </div>

          {logos.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No logos yet — add one on the left.</p>
          ) : (
            <ul className="space-y-3">
              {logos.map((logo, index) => (
                <li
                  key={logo._id}
                  className={`flex flex-wrap items-center gap-3 p-3 rounded-xl border ${
                    logo.isActive ? "border-slate-200 bg-slate-50/50" : "border-slate-100 bg-slate-50 opacity-70"
                  }`}
                >
                  <img
                    src={logo.imageUrl}
                    alt=""
                    className="h-12 w-24 object-contain grayscale"
                  />
                  <div className="flex-1 min-w-[160px]">
                    {editingId === logo._id ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                          placeholder="Name"
                        />
                        <label className="text-xs text-slate-500 flex items-center gap-1 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                          />
                          <span className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300">
                            {replaceFile ? replaceFile.name : "Replace image"}
                          </span>
                        </label>
                      </div>
                    ) : (
                      <p className="font-medium text-slate-800">{logo.name || "—"}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Move up"
                      disabled={index === 0 || reorderMutation.isPending}
                      onClick={() => move(index, -1)}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Move down"
                      disabled={index === logos.length - 1 || reorderMutation.isPending}
                      onClick={() => move(index, 1)}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!logo.isActive}
                      onChange={() => toggleActive(logo)}
                      disabled={updateMutation.isPending}
                    />
                    Active
                  </label>
                  {editingId === logo._id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => saveEdit(logo._id)}
                        disabled={updateMutation.isPending}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium disabled:opacity-60"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setReplaceFile(null);
                        }}
                        className="text-sm text-slate-600"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(logo._id);
                        setEditName(logo.name || "");
                        setReplaceFile(null);
                      }}
                      className="text-sm font-medium text-emerald-700 hover:underline"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(logo._id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerLogos;
