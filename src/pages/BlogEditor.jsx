import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Eye,
  Upload,
  X,
  Loader2,
  Globe,
  Lock,
  Tag,
  Image as ImageIcon,
  FileText,
  Sparkles,
  Check,
  AlertCircle,
  Clock,
  ExternalLink,
  Trash2,
  PenLine,
  Search,
  Type,
  AlignLeft,
  User,
} from "lucide-react";
import {
  useAddBlog,
  useEditBlog,
  useAdminBlogById,
  useToggleBlogVisibility,
} from "../api/hooks/useBlogs";
import { useAdmins } from "../api/hooks/useAdmin";
import TextEditor from "../components/TextEditor";

const CATEGORIES = [
  "Product Info",
  "Price Updates",
  "Technical Guides",
  "Market Insights",
  "Personal Finance",
  "Tax Planning",
  "Investments",
  "Insurance",
  "Retirement",
  "Succession",
  "Wealth Management",
  "Other",
];

const stripHtml = (html = "") =>
  String(html)
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const PLACEHOLDER_PHRASES = [
  "write and publish amazing content",
  "start writing your amazing content",
  "your blog content preview",
];

const createBlogTemplate = (title, category) => `
  <h2>Introduction</h2>
  <p>Start with the reader's problem or question. Explain why this topic matters and what they will understand by the end of the article.</p>
  <h2>Key Takeaways</h2>
  <ul>
    <li>Share the first practical takeaway for the reader.</li>
    <li>Add a second point that connects to ${category || "the selected category"}.</li>
    <li>Include one action the reader can take next.</li>
  </ul>
  <h2>${title || "Main Topic"} Explained</h2>
  <p>Write the main explanation here. Keep paragraphs short, use examples, and avoid placing the whole article inside a table.</p>
  <h3>What readers should watch for</h3>
  <p>Add risks, common mistakes, or important details that help the article feel useful and complete.</p>
  <h2>Conclusion</h2>
  <p>Close with a clear summary and a simple next step for the reader.</p>
`;

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id && id !== "new" && id !== "undefined");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showWebsitePreview, setShowWebsitePreview] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subTitle: "",
    paragraph: "",
    description: "",
    category: "",
    author: "",
    isPublished: false,
    image: null,
  });

  const getAuthorName = (author) => {
    if (!author || typeof author !== "object") return "Admin";
    const fullName = [author.firstName, author.lastName].filter(Boolean).join(" ");
    return fullName || author.name || author.email || "Admin";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

  // React Query Hooks
  const addBlog = useAddBlog({
    onSuccess: () => navigate("/blogs"),
    onError: (error) => {
      console.error("Failed to create blog:", error);
      alert(getErrorMessage(error, "Failed to create blog. Please try again."));
    },
  });

  const editBlog = useEditBlog({
    onSuccess: () => navigate("/blogs"),
    onError: (error) => {
      console.error("Failed to update blog:", error);
      alert(getErrorMessage(error, "Failed to update blog. Please try again."));
    },
  });

  const toggleVisibility = useToggleBlogVisibility({
    onSuccess: (data) => {
      setFormData((prev) => ({ ...prev, isPublished: data.isPublished }));
    },
    onError: (error) => {
      console.error("Failed to toggle status:", error);
      alert("Failed to update publish status");
    },
  });

  const {
    data: blog,
    isLoading,
    error: fetchError,
  } = useAdminBlogById(id, {
    enabled: isEditing,
  });
  const { data: adminsResponse } = useAdmins({ limit: 100 });
  const admins = adminsResponse?.data || [];
  const selectedAuthor =
    admins.find((admin) => (admin._id || admin.id) === formData.author) ||
    blog?.author;
  const plainContent = stripHtml(formData.description);
  const articleText = [formData.paragraph, plainContent]
    .filter(Boolean)
    .join(" ")
    .trim();
  const contentWords = articleText ? articleText.split(/\s+/).length : 0;
  const estimatedReadTime = Math.max(1, Math.ceil(contentWords / 180));

  useEffect(() => {
    if (blog && isEditing) {
      setFormData((prev) => ({
        ...prev,
        title: blog.title || "",
        subTitle: blog.subTitle || "",
        paragraph: blog.paragraph || "",
        description: blog.description || "",
        category: blog.category || "",
        author: blog.author?._id || blog.author?.id || "",
        isPublished: blog.isPublished ?? false,
        image: null,
      }));
      if (blog.image) {
        setPreviewImage(blog.image);
      }
    }
  }, [blog, isEditing]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (content) => {
    setFormData((prev) => ({ ...prev, description: content }));
  };

  const handleUseTemplate = () => {
    if (
      plainContent &&
      !window.confirm("Replace the current article content with the blog template?")
    ) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      description: createBlogTemplate(prev.title, prev.category),
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData((prev) => ({ ...prev, image: file }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setFormData((prev) => ({ ...prev, image: null }));
  };

  const handleSubmit = (publish) => {
    const cleanContent = stripHtml(formData.description);
    const hasPlaceholderContent = PLACEHOLDER_PHRASES.some((phrase) =>
      cleanContent.toLowerCase().includes(phrase),
    );

    if (!formData.title?.trim()) {
      alert("Title is required");
      return;
    }
    if (formData.title.length < 3) {
      alert("Title must be at least 3 characters");
      return;
    }
    if (formData.title.length > 150) {
      alert("Title must be less than 150 characters");
      return;
    }
    if (!formData.subTitle?.trim()) {
      alert("Summary is required. It appears on blog cards and search previews.");
      return;
    }
    if (!formData.paragraph?.trim()) {
      alert("Opening paragraph is required.");
      return;
    }
    if (!cleanContent) {
      alert("Content is required");
      return;
    }
    if (publish && hasPlaceholderContent) {
      alert("Please replace the placeholder/sample content before publishing.");
      return;
    }
    if (!formData.category) {
      alert("Category is required");
      return;
    }
    if (!isEditing && !formData.image && !previewImage) {
      alert("Featured image is required");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title.trim());
    formDataToSend.append("subTitle", formData.subTitle.trim());
    formDataToSend.append("paragraph", formData.paragraph.trim());
    formDataToSend.append("description", formData.description.trim());
    formDataToSend.append("category", formData.category);
    if (formData.author) {
      formDataToSend.append("author", formData.author);
    }
    formDataToSend.append("isPublished", publish.toString());
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }

    if (isEditing) {
      editBlog.mutate({ blogId: id, formData: formDataToSend });
    } else {
      addBlog.mutate(formDataToSend);
    }
  };

  const handleTogglePublish = () => {
    if (!id) return;
    toggleVisibility.mutate(id);
  };

  const isSaving = addBlog.isPending || editBlog.isPending;
  const isToggling = toggleVisibility.isPending;
  const qualityChecks = [
    {
      label: "Clear title",
      passed:
        formData.title.trim().length >= 3 && formData.title.trim().length <= 150,
    },
    {
      label: "Card summary",
      passed: Boolean(formData.subTitle.trim()),
    },
    {
      label: "Opening paragraph",
      passed: Boolean(formData.paragraph.trim()),
    },
    {
      label: "Featured image",
      passed: Boolean(previewImage || formData.image),
    },
    {
      label: "Category selected",
      passed: Boolean(formData.category),
    },
    {
      label: "Article body",
      passed: Boolean(plainContent),
    },
  ];

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full animate-bounce flex items-center justify-center">
              <PenLine className="w-3 h-3 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-800">Loading Editor...</h3>
          <p className="text-slate-500 mt-1">Preparing your workspace</p>
        </div>
      </div>
    );
  }

  // Error State
  if (fetchError && isEditing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Failed to Load Blog
          </h2>
          <p className="text-slate-500 mb-6">
            {fetchError?.message || "Something went wrong while loading the blog"}
          </p>
          <button
            onClick={() => navigate("/blogs")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6">
          {/* Top Section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/blogs")}
              disabled={isSaving}
              className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex-shrink-0 self-start"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 items-center justify-center shadow-lg shadow-violet-500/25">
                  {isEditing ? (
                    <PenLine className="w-6 h-6 text-white" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                    {isEditing ? "Edit Blog Post" : "Create New Blog"}
                  </h1>
                  <p className="text-slate-500 text-sm mt-0.5">
                    {isEditing ? "Update your content and settings" : "Write and publish amazing content"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowWebsitePreview(true)}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Website Preview</span>
            </button>

            {isEditing && blog?.slug && (
              <button
                onClick={() => window.open(`/blog/${blog.slug}`, "_blank")}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Live</span>
              </button>
            )}

            {isEditing && (
              <button
                onClick={handleTogglePublish}
                disabled={isToggling || isSaving}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  formData.isPublished
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                } disabled:opacity-50`}
              >
                {isToggling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : formData.isPublished ? (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Published</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Unpublished</span>
                  </>
                )}
              </button>
            )}

            <div className="flex gap-3 sm:ml-auto">
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSaving}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isEditing && formData.isPublished ? "Unpublish" : "Save Draft"}</span>
              </button>

              <button
                onClick={() => handleSubmit(true)}
                disabled={isSaving}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
                <span>
                  {isEditing
                    ? formData.isPublished
                      ? "Update Published"
                      : "Publish"
                    : "Publish"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Type className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Blog Title</h3>
                  <p className="text-xs text-slate-500">Give your post a compelling title</p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-2">
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter an engaging title..."
                  className="w-full px-4 py-3 text-lg sm:text-xl font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-normal"
                  disabled={isSaving}
                  maxLength={150}
                />
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs text-slate-400">Required • 3-150 characters</span>
                  <span className={`text-xs font-medium ${
                    formData.title.length > 140 ? "text-amber-500" : "text-slate-400"
                  }`}>
                    {formData.title.length}/150
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Subtitle Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <AlignLeft className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Summary</h3>
                  <p className="text-xs text-slate-500">
                    Required • Shown on website cards
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-2">
                <input
                  name="subTitle"
                  value={formData.subTitle}
                  onChange={handleInputChange}
                  placeholder="Write a useful 1-2 line summary for readers..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all placeholder:text-slate-400"
                  disabled={isSaving}
                />
                <div className="flex justify-between px-1">
                  <span className="text-xs text-slate-400">
                    Required • no character limit
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {formData.subTitle.length} characters
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Opening Paragraph Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <AlignLeft className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Opening Paragraph</h3>
                  <p className="text-xs text-slate-500">
                    Required • First paragraph shown in the article
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-2">
                <textarea
                  name="paragraph"
                  value={formData.paragraph}
                  onChange={handleInputChange}
                  placeholder="Write the first real paragraph of the blog here..."
                  className="min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base leading-7 text-slate-800 transition-all placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  disabled={isSaving}
                />
                <div className="flex justify-between px-1">
                  <span className="text-xs text-slate-400">
                    Required • no character limit
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {formData.paragraph.length} characters
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Editor Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-800">Content</h3>
                  <p className="text-xs text-slate-500">
                    Use headings, short paragraphs, lists, links, and inline images
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUseTemplate}
                  disabled={isSaving}
                  className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-violet-100 px-3 py-2 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-200 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  Use Blog Template
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <button
                type="button"
                onClick={handleUseTemplate}
                disabled={isSaving}
                className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-100 px-3 py-2.5 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-200 disabled:opacity-50 sm:hidden"
              >
                <Sparkles className="h-4 w-4" />
                Use Blog Template
              </button>
              <TextEditor
                value={formData.description || ""}
                onChange={handleEditorChange}
                minHeight="350px"
                maxHeight="500px"
                placeholder="Write the full article here. Use headings, short paragraphs, and lists for a readable blog."
                disabled={isSaving}
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>{contentWords} words • about {estimatedReadTime} min read</span>
                <span className={plainContent ? "text-emerald-600" : "text-amber-500"}>
                  {plainContent ? "Ready" : "Content required"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Featured Image Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Featured Image</h3>
                  <p className="text-xs text-slate-500">Required • Max 5MB</p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              {previewImage ? (
                <div className="relative group rounded-xl overflow-hidden">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-40 sm:h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button
                    onClick={handleRemoveImage}
                    disabled={isSaving}
                    className="absolute top-3 right-3 w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium truncate">Image uploaded</p>
                  </div>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-violet-400 hover:bg-violet-50/50 transition-all group">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {uploadingImage ? (
                          <Loader2 className="w-7 h-7 text-violet-600 animate-spin" />
                        ) : (
                          <Upload className="w-7 h-7 text-violet-600" />
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">
                        {uploadingImage ? "Uploading..." : "Click to upload"}
                      </p>
                      <p className="text-xs text-slate-400">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage || isSaving}
                    />
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Category Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Category</h3>
                  <p className="text-xs text-slate-500">Organize your content</p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all appearance-none cursor-pointer"
                disabled={isSaving}
              >
                <option value="">Select category...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, category: cat }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      formData.category === cat
                        ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/25"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                    disabled={isSaving}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  formData.isPublished ? "bg-emerald-100" : "bg-amber-100"
                }`}>
                  {formData.isPublished ? (
                    <Globe className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Status</h3>
                  <p className="text-xs text-slate-500">Publish settings</p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <div className={`flex items-center justify-between p-4 rounded-xl ${
                formData.isPublished 
                  ? "bg-gradient-to-r from-emerald-50 to-teal-50 ring-1 ring-emerald-200" 
                  : "bg-gradient-to-r from-amber-50 to-orange-50 ring-1 ring-amber-200"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    formData.isPublished ? "bg-emerald-500" : "bg-amber-500"
                  } animate-pulse`} />
                  <span className={`font-semibold ${
                    formData.isPublished ? "text-emerald-700" : "text-amber-700"
                  }`}>
                    {formData.isPublished ? "Published" : "Unpublished"}
                  </span>
                </div>
                {isEditing && (
                  <button
                    onClick={handleTogglePublish}
                    disabled={isToggling || isSaving}
                    className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                      formData.isPublished 
                        ? "text-emerald-700 hover:bg-emerald-100" 
                        : "text-amber-700 hover:bg-amber-100"
                    } disabled:opacity-50`}
                  >
                    {isToggling ? "..." : formData.isPublished ? "Unpublish" : "Publish"}
                  </button>
                )}
              </div>
              
              {!isEditing && (
                <p className="text-xs text-slate-500 mt-3 text-center">
                  You can change the status after saving
                </p>
              )}
            </div>
          </div>

          {/* Post Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Post Details</h3>
                  <p className="text-xs text-slate-500">Author and metadata</p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-5 space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Author
                </label>
                <select
                  value={formData.author}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, author: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all"
                  disabled={isSaving || admins.length === 0}
                >
                  <option value="">
                    {getAuthorName(blog?.author)}
                  </option>
                  {admins.map((admin) => (
                    <option key={admin._id || admin.id} value={admin._id || admin.id}>
                      {getAuthorName(admin)} ({admin.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-800 text-right truncate max-w-[180px]">
                  {selectedAuthor?.email || "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Created</span>
                <span className="font-medium text-slate-800">
                  {formatDate(blog?.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Updated</span>
                <span className="font-medium text-slate-800">
                  {formatDate(blog?.updatedAt)}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  URL Slug
                </label>
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 break-all">
                  /{blog?.slug || "generated-after-save"}
                </div>
              </div>
            </div>
          </div>

          {/* Publish Checklist Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Publish Checklist</h3>
                  <p className="text-xs text-slate-500">Required for a clean blog card</p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              {qualityChecks.map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
                      item.passed
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className={item.passed ? "text-slate-800" : "text-slate-500"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Preview Card */}
          {isEditing && blog?.slug && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Search className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">SEO Preview</h3>
                    <p className="text-xs text-slate-500">Search appearance</p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-5">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <p className="text-xs text-emerald-600 truncate font-medium">
                    mozno.in/blog/{blog.slug}
                  </p>
                  <p className="text-base font-semibold text-blue-700 line-clamp-2 hover:underline cursor-pointer">
                    {formData.title || "Your Blog Title"}
                  </p>
                  <p className="text-slate-600 text-sm line-clamp-2">
                    {formData.subTitle ||
                      formData.description?.replace(/<[^>]*>/g, "").slice(0, 160) ||
                      "Your blog description will appear here..."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Tips Card */}
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-violet-500/25">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-semibold">Writing Tips</h3>
            </div>
            <ul className="space-y-2 text-sm text-white/90">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Use compelling headlines</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Add relevant images</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Keep paragraphs short</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Include a call-to-action</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {showWebsitePreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-4 sm:px-6 py-4 bg-white border-b border-slate-200">
              <div>
                <h2 className="font-semibold text-slate-900">Website Preview</h2>
                <p className="text-xs text-slate-500">
                  {formData.isPublished ? "Published post" : "Unpublished preview"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWebsitePreview(false)}
                className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <article className="bg-stone-50">
              <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
                    <Tag className="w-4 h-4" />
                    {formData.category || "Category"}
                  </span>
                  <span className="text-sm text-slate-500">
                    {formatDate(blog?.createdAt || new Date())}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-bold text-slate-950 leading-tight">
                  {formData.title || "Your blog title"}
                </h1>

                {formData.subTitle && (
                  <p className="mt-5 text-lg sm:text-xl text-slate-600 leading-8">
                    {formData.subTitle}
                  </p>
                )}

                <div className="mt-6 flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {getAuthorName(selectedAuthor).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {getAuthorName(selectedAuthor)}
                    </p>
                    <p>{selectedAuthor?.role || "Admin"}</p>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl overflow-hidden bg-slate-200 aspect-video">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={formData.title || "Blog featured"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      Featured image preview
                    </div>
                  )}
                </div>

                {formData.paragraph && (
                  <p className="mt-10 text-xl leading-9 text-slate-700">
                    {formData.paragraph}
                  </p>
                )}

                <div
                  className="mt-8 prose prose-slate max-w-none prose-headings:text-slate-950 prose-p:leading-8 prose-img:rounded-xl prose-table:w-full prose-td:border prose-td:border-slate-300 prose-td:p-3 prose-th:border prose-th:border-slate-300 prose-th:p-3"
                  dangerouslySetInnerHTML={{
                    __html:
                      formData.description ||
                      "<p>Your blog content preview will appear here.</p>",
                  }}
                />
              </div>
            </article>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogEditor;
