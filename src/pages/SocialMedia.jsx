import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Loader2, Save, Plus, Trash2, Download } from "lucide-react";
import { useSiteContent, useUpdateSiteContent } from "../api/hooks/useSiteContent";
import adminClient from "../api/axios.instance";

const platforms = ["youtube", "linkedin", "instagram", "twitter", "facebook", "reddit"];

const emptyLink = () => ({ enabled: false, url: "" });

const emptyPost = () => ({
  title: "",
  url: "",
  embedUrl: "",
  videoId: "",
  views: "",
  badge: "",
  thumbnailUrl: "",
  authorName: "",
  enabled: true,
});

const Toggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
        checked ? "bg-emerald-500" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-6 w-6 rounded-full bg-white transition-transform ${
          checked ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

const PostBlock = ({ title, posts, setPosts, fields, hint }) => {
  const update = (i, patch) => {
    setPosts((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  };
  const remove = (i) => setPosts((prev) => prev.filter((_, j) => j !== i));
  const add = () => setPosts((prev) => [...prev, emptyPost()]);

  const show = (key) => fields.includes(key);

  return (
    <section className="bg-white p-4 rounded-xl border space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
        </div>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-medium text-slate-800"
        >
          <Plus className="w-4 h-4" /> Add post
        </button>
      </div>
      {posts.length === 0 && (
        <p className="text-sm text-slate-500 italic">No posts — add one or load samples below.</p>
      )}
      <div className="space-y-3">
        {posts.map((p, i) => (
          <div key={i} className="border rounded-lg p-3 space-y-2 bg-slate-50/80">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500">Post #{i + 1}</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={p.enabled !== false}
                    onChange={(e) => update(i, { enabled: e.target.checked })}
                  />
                  Visible on site
                </label>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Title"
              value={p.title || ""}
              onChange={(e) => update(i, { title: e.target.value })}
            />
            {show("authorName") && (
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Author name (optional, shown under title)"
                value={p.authorName || ""}
                onChange={(e) => update(i, { authorName: e.target.value })}
              />
            )}
            {show("url") && (
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder={
                  show("videoId")
                    ? "Video or Shorts link (youtube.com / youtu.be) — ID is extracted automatically"
                    : "Post / reel / share URL (we convert to embed when possible)"
                }
                value={p.url || ""}
                onChange={(e) => update(i, { url: e.target.value })}
              />
            )}
            {show("embedUrl") && (
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono text-xs"
                placeholder={
                  show("url")
                    ? "Optional: raw embed iframe URL (overrides link above)"
                    : "Embed URL (iframe src)"
                }
                value={p.embedUrl || ""}
                onChange={(e) => update(i, { embedUrl: e.target.value })}
              />
            )}
            {show("videoId") && (
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                placeholder="Or paste video ID only (11 characters)"
                value={p.videoId || ""}
                onChange={(e) => update(i, { videoId: e.target.value })}
              />
            )}
            {show("views") && (
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Views label (e.g. 12K)"
                value={p.views || ""}
                onChange={(e) => update(i, { views: e.target.value })}
              />
            )}
            {show("badge") && (
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Optional badge (e.g. AWARENESS ALERT)"
                value={p.badge || ""}
                onChange={(e) => update(i, { badge: e.target.value })}
              />
            )}
            {show("thumbnailUrl") && (
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Optional thumbnail image URL"
                value={p.thumbnailUrl || ""}
                onChange={(e) => update(i, { thumbnailUrl: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

const SocialMedia = () => {
  const { data, isLoading } = useSiteContent();
  const update = useUpdateSiteContent();
  const [loadingDefaults, setLoadingDefaults] = useState(false);

  const initial = useMemo(() => {
    const social = data?.socialMedia || {};
    const links = social.links || {};
    const normalizedLinks = {};
    platforms.forEach((p) => {
      normalizedLinks[p] = {
        enabled: !!links[p]?.enabled,
        url: links[p]?.url || "",
      };
    });
    return {
      enabled: social.enabled !== false,
      links: normalizedLinks,
      youtubeVideos: Array.isArray(social.youtubeVideos) ? social.youtubeVideos : [],
      linkedinPosts: Array.isArray(social.linkedinPosts) ? social.linkedinPosts : [],
      instagramPosts: Array.isArray(social.instagramPosts) ? social.instagramPosts : [],
      twitterPosts: Array.isArray(social.twitterPosts) ? social.twitterPosts : [],
      facebookPosts: Array.isArray(social.facebookPosts) ? social.facebookPosts : [],
      redditPosts: Array.isArray(social.redditPosts) ? social.redditPosts : [],
    };
  }, [data]);

  const [form, setForm] = useState(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const setPosts = useCallback((key) => {
    return (updater) => {
      setForm((f) => ({
        ...f,
        [key]: typeof updater === "function" ? updater(f[key]) : updater,
      }));
    };
  }, []);

  const loadServerDefaults = async () => {
    if (!window.confirm("Replace YouTube, LinkedIn & Instagram post lists with built-in samples? (Twitter / Facebook / Reddit unchanged.)")) {
      return;
    }
    setLoadingDefaults(true);
    try {
      const res = await adminClient.get("/site-content/social-defaults");
      const d = res.data?.data;
      if (!d) return;
      setForm((f) => ({
        ...f,
        youtubeVideos: d.youtubeVideos || [],
        linkedinPosts: d.linkedinPosts || [],
        instagramPosts: d.instagramPosts || [],
      }));
    } catch (e) {
      console.error(e);
      alert("Could not load defaults from server.");
    } finally {
      setLoadingDefaults(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const save = () => {
    update.mutate({
      socialMedia: {
        enabled: form.enabled,
        links: form.links,
        youtubeVideos: form.youtubeVideos,
        linkedinPosts: form.linkedinPosts,
        instagramPosts: form.instagramPosts,
        twitterPosts: form.twitterPosts,
        facebookPosts: form.facebookPosts,
        redditPosts: form.redditPosts,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Social Media</h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadServerDefaults}
            disabled={loadingDefaults}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300"
          >
            {loadingDefaults ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Load sample posts (YT / LI / IG)
          </button>
          <button
            type="button"
            onClick={save}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white"
          >
            {update.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
          </button>
        </div>
      </div>

      <section className="bg-white p-4 rounded-xl border space-y-3">
        <Toggle
          label="Show social media section on website"
          checked={form.enabled}
          onChange={(v) => setForm((f) => ({ ...f, enabled: v }))}
        />
      </section>

      <section className="bg-white p-4 rounded-xl border space-y-4">
        <h3 className="font-semibold text-slate-800">Platform links & tabs</h3>
        <p className="text-xs text-slate-500">
          Enable a platform and set its profile URL. Each platform can have its own post carousel on the site (add posts below).
        </p>
        {platforms.map((p) => (
          <div key={p} className="grid md:grid-cols-3 gap-2 items-center border-b border-slate-100 pb-3 last:border-0">
            <Toggle
              label={`${p[0].toUpperCase()}${p.slice(1)} tab enabled`}
              checked={!!form.links[p]?.enabled}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  links: { ...f.links, [p]: { ...(f.links[p] || emptyLink()), enabled: v } },
                }))
              }
            />
            <input
              className="md:col-span-2 border rounded-lg px-3 py-2 text-sm"
              placeholder={`${p} profile / channel URL`}
              value={form.links[p]?.url || ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  links: {
                    ...f.links,
                    [p]: { ...(f.links[p] || emptyLink()), url: e.target.value },
                  },
                }))
              }
            />
          </div>
        ))}
      </section>

      <PostBlock
        title="YouTube Shorts"
        hint="Paste a full video or Shorts URL, or an 11-character ID. Leave all posts empty to auto-pull from your channel URL."
        posts={form.youtubeVideos}
        setPosts={setPosts("youtubeVideos")}
        fields={["url", "videoId", "views", "badge"]}
      />

      <PostBlock
        title="LinkedIn"
        hint="Paste the normal post link (linkedin.com/posts/...activity-...) or an embed URL — the site converts post links for the player."
        posts={form.linkedinPosts}
        setPosts={setPosts("linkedinPosts")}
        fields={["url", "embedUrl", "authorName"]}
      />

      <PostBlock
        title="Instagram"
        hint="Reel or post link (instagram.com/reel/… or /p/…). Optional embed URL overrides. We open Instagram if embed is blocked."
        posts={form.instagramPosts}
        setPosts={setPosts("instagramPosts")}
        fields={["url", "embedUrl", "authorName"]}
      />

      <PostBlock
        title="X (Twitter)"
        hint="Post URL (x.com or twitter.com …/status/…) or embed URL — we build the player when possible."
        posts={form.twitterPosts}
        setPosts={setPosts("twitterPosts")}
        fields={["url", "embedUrl", "authorName", "views", "thumbnailUrl"]}
      />

      <PostBlock
        title="Facebook"
        hint="Post or share URL — we use Facebook’s embed player when possible; otherwise a clear “open” button on the site."
        posts={form.facebookPosts}
        setPosts={setPosts("facebookPosts")}
        fields={["url", "embedUrl", "authorName", "views", "thumbnailUrl"]}
      />

      <PostBlock
        title="Reddit"
        hint="Thread URL — we try embed mode; if it fails, visitors get an open-on-Reddit button."
        posts={form.redditPosts}
        setPosts={setPosts("redditPosts")}
        fields={["url", "embedUrl", "authorName", "views", "thumbnailUrl"]}
      />
    </div>
  );
};

export default SocialMedia;
