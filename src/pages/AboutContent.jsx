import React, { useMemo, useState } from "react";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { useSiteContent, useUpdateSiteContent } from "../api/hooks/useSiteContent";

const emptyStat = { value: "", label: "" };
const emptyMilestone = { year: "", title: "", description: "" };

const ToggleSwitch = ({ checked, onChange, label }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
        checked ? "bg-emerald-500" : "bg-slate-300"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-7" : "translate-x-1"
        }`}
      />
      <span className="sr-only">{label}</span>
    </button>
  </div>
);

const AboutContent = () => {
  const { data, isLoading } = useSiteContent();
  const update = useUpdateSiteContent();

  const initial = useMemo(
    () =>
      data || {
        published: false,
        aboutStats: { enabled: true, items: [emptyStat, emptyStat, emptyStat, emptyStat] },
        aboutJourney: {
          enabled: true,
          badgeText: "Our Journey",
          headingPrefix: "Milestones That",
          headingHighlight: "Define Us",
          description: "",
          items: [emptyMilestone],
        },
        contactStats: { enabled: true, items: [emptyStat, emptyStat, emptyStat, emptyStat] },
      },
    [data]
  );

  const [form, setForm] = useState(initial);
  React.useEffect(() => setForm(initial), [initial]);

  const setItems = (section, items) => {
    setForm((f) => ({ ...f, [section]: { ...f[section], items } }));
  };

  const save = () => update.mutate(form);

  if (isLoading) return <div className="p-6"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">About Content</h1>
        <button onClick={save} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white">
          {update.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
        </button>
      </div>

      <section className="bg-white p-4 rounded-xl border space-y-3">
        <ToggleSwitch
          checked={!!form.published}
          onChange={(next) => setForm((f) => ({ ...f, published: next }))}
          label="Publish edited content on website"
        />
      </section>

      <section className="bg-white p-4 rounded-xl border space-y-3">
        <ToggleSwitch
          checked={!!form.aboutStats?.enabled}
          onChange={(next) =>
            setForm((f) => ({ ...f, aboutStats: { ...f.aboutStats, enabled: next } }))
          }
          label="Show About quick stats"
        />
        <div className="grid md:grid-cols-2 gap-3">
          {(form.aboutStats?.items || []).map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <input className="border rounded-lg px-3 py-2" placeholder="Value" value={item.value || ""} onChange={(e) => setItems("aboutStats", form.aboutStats.items.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))} />
              <input className="border rounded-lg px-3 py-2" placeholder="Label" value={item.label || ""} onChange={(e) => setItems("aboutStats", form.aboutStats.items.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white p-4 rounded-xl border space-y-3">
        <ToggleSwitch
          checked={!!form.aboutJourney?.enabled}
          onChange={(next) =>
            setForm((f) => ({ ...f, aboutJourney: { ...f.aboutJourney, enabled: next } }))
          }
          label="Show About journey timeline"
        />
        <div className="grid md:grid-cols-2 gap-2">
          <input className="border rounded-lg px-3 py-2" value={form.aboutJourney?.badgeText || ""} onChange={(e) => setForm((f) => ({ ...f, aboutJourney: { ...f.aboutJourney, badgeText: e.target.value } }))} placeholder="Badge text" />
          <input className="border rounded-lg px-3 py-2" value={form.aboutJourney?.headingPrefix || ""} onChange={(e) => setForm((f) => ({ ...f, aboutJourney: { ...f.aboutJourney, headingPrefix: e.target.value } }))} placeholder="Heading prefix" />
          <input className="border rounded-lg px-3 py-2" value={form.aboutJourney?.headingHighlight || ""} onChange={(e) => setForm((f) => ({ ...f, aboutJourney: { ...f.aboutJourney, headingHighlight: e.target.value } }))} placeholder="Heading highlight" />
          <input className="border rounded-lg px-3 py-2" value={form.aboutJourney?.description || ""} onChange={(e) => setForm((f) => ({ ...f, aboutJourney: { ...f.aboutJourney, description: e.target.value } }))} placeholder="Description" />
        </div>
        <div className="space-y-2">
          {(form.aboutJourney?.items || []).map((m, i) => (
            <div key={i} className="grid md:grid-cols-4 gap-2">
              <input className="border rounded-lg px-3 py-2" placeholder="Year" value={m.year || ""} onChange={(e) => setItems("aboutJourney", form.aboutJourney.items.map((x, idx) => idx === i ? { ...x, year: e.target.value } : x))} />
              <input className="border rounded-lg px-3 py-2" placeholder="Title" value={m.title || ""} onChange={(e) => setItems("aboutJourney", form.aboutJourney.items.map((x, idx) => idx === i ? { ...x, title: e.target.value } : x))} />
              <input className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Description" value={m.description || ""} onChange={(e) => setItems("aboutJourney", form.aboutJourney.items.map((x, idx) => idx === i ? { ...x, description: e.target.value } : x))} />
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={() => setItems("aboutJourney", [...(form.aboutJourney?.items || []), { ...emptyMilestone }])} className="inline-flex items-center gap-1 px-3 py-2 border rounded-lg text-sm"><Plus className="w-4 h-4" /> Add milestone</button>
            <button onClick={() => setItems("aboutJourney", (form.aboutJourney?.items || []).slice(0, -1))} className="inline-flex items-center gap-1 px-3 py-2 border rounded-lg text-sm"><Trash2 className="w-4 h-4" /> Remove last</button>
          </div>
        </div>
      </section>

      <section className="bg-white p-4 rounded-xl border space-y-3">
        <ToggleSwitch
          checked={!!form.contactStats?.enabled}
          onChange={(next) =>
            setForm((f) => ({ ...f, contactStats: { ...f.contactStats, enabled: next } }))
          }
          label="Show Contact quick stats"
        />
        <div className="grid md:grid-cols-2 gap-3">
          {(form.contactStats?.items || []).map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <input className="border rounded-lg px-3 py-2" placeholder="Value" value={item.value || ""} onChange={(e) => setItems("contactStats", form.contactStats.items.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))} />
              <input className="border rounded-lg px-3 py-2" placeholder="Label" value={item.label || ""} onChange={(e) => setItems("contactStats", form.contactStats.items.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutContent;

