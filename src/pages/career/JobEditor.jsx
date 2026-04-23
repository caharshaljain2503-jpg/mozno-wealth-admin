import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  TrendingUp, 
  Briefcase, 
  Users, 
  LineChart, 
  Shield, 
  DollarSign,
  MapPin,
  Clock,
  FileText,
  CheckCircle,
  Sparkles,
  Building,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useJob, useCreateJob, useUpdateJob } from "../../api/hooks/useJobPost";

const departments = [
  "Wealth Management",
  "Financial Advisory",
  "Investment Banking",
  "Portfolio Management",
  "Private Banking",
  "Risk Management",
  "Tax Planning",
  "Estate Planning",
  "Retirement Planning",
  "Alternative Investments",
  "Research & Analysis",
  "Compliance & Legal"
];

const jobTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Remote",
  "Hybrid",
  "On-site"
];

const JobEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const { 
    data: jobData, 
    isLoading: isLoadingJob, 
    isError: isJobError,
    error: jobError 
  } = useJob(id);

  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  const [formData, setFormData] = React.useState({
    jobTitle: "",
    department: "",
    location: "",
    experience: "",
    jobType: "Full-time",
    jobDescription: "",
    requirements: "",
    jobStatus: "open",
  });

  useEffect(() => {
    if (jobData?.data) {
      const job = jobData.data;
      setFormData({
        jobTitle: job.jobTitle || "",
        department: job.department || "",
        location: job.location || "",
        experience: job.experience?.toString() || "",
        jobType: job.jobType || "Full-time",
        jobDescription: job.jobDescription || "",
        requirements: job.requirements || "",
        jobStatus: job.jobStatus || "open",
      });
    }
  }, [jobData]);

  useEffect(() => {
    if (isJobError) {
      toast.error(jobError?.message || "Failed to load job");
      navigate("/jobs");
    }
  }, [isJobError, jobError, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.jobTitle.trim()) return toast.error("Job title is required");
    if (!formData.department.trim()) return toast.error("Department is required");
    if (!formData.location.trim()) return toast.error("Location is required");
    if (!formData.jobDescription.trim()) return toast.error("Job description is required");
    if (!formData.requirements.trim()) return toast.error("Requirements are required");

    const jobPayload = {
      jobTitle: formData.jobTitle.trim(),
      department: formData.department.trim(),
      location: formData.location.trim(),
      experience: parseInt(formData.experience) || 0,
      jobType: formData.jobType,
      jobDescription: formData.jobDescription.trim(),
      requirements: formData.requirements.trim(),
      jobStatus: formData.jobStatus,
    };

    if (isEditing) {
      updateJob.mutate({ id, data: jobPayload }, { onSuccess: () => navigate("/jobs") });
    } else {
      createJob.mutate(jobPayload, { onSuccess: () => navigate("/jobs") });
    }
  };

  const toggleJobStatus = () => {
    setFormData((prev) => ({
      ...prev,
      jobStatus: prev.jobStatus === "open" ? "closed" : "open",
    }));
  };

  const getDepartmentIcon = (dept) => {
    if (!dept) return Briefcase;
    if (dept.includes("Investment")) return TrendingUp;
    if (dept.includes("Portfolio") || dept.includes("Research")) return LineChart;
    if (dept.includes("Risk") || dept.includes("Compliance")) return Shield;
    if (dept.includes("Tax") || dept.includes("Estate")) return DollarSign;
    return Briefcase;
  };

  const isSaving = createJob.isPending || updateJob.isPending;

  // Loading State
  if (isLoadingJob) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Loading Job...</h3>
          <p className="text-slate-500 mt-1">Fetching job details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Back Button */}
            <button
              onClick={() => navigate("/jobs")}
              disabled={isSaving}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors self-start"
            >
              <div className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Back to Jobs</span>
            </button>

            <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 items-center justify-center shadow-lg shadow-violet-500/25">
                  {isEditing ? (
                    <Briefcase className="w-6 h-6 text-white" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-800">
                    {isEditing ? "Edit Job" : "Post New Job"}
                  </h1>
                  <p className="text-sm text-slate-500">
                    {isEditing ? "Update job details" : "Create a new position"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isEditing ? "Update Job" : "Post Job"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Branding Card */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg shadow-violet-500/25">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-white/20 rounded-xl">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">Mozno Wealth Advisory</h2>
            <p className="text-white/80 text-xs sm:text-sm">Building multi-generational wealth through expert guidance</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Job Details */}
        <FormSection
          icon={Briefcase}
          title="Job Details"
          subtitle="Basic information about the position"
        >
          <div className="space-y-4">
            <InputField
              label="Job Title"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="e.g. Senior Wealth Advisor"
              required
              disabled={isSaving}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                options={departments}
                placeholder="Select department"
                required
                disabled={isSaving}
                icon={getDepartmentIcon(formData.department)}
              />

              <InputField
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. New York, Remote"
                required
                disabled={isSaving}
                icon={MapPin}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Experience (Years)"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="e.g. 5"
                type="number"
                min="0"
                disabled={isSaving}
                helper="Enter 0 for entry level"
                icon={Clock}
              />

              <SelectField
                label="Job Type"
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                options={jobTypes}
                disabled={isSaving}
              />
            </div>
          </div>
        </FormSection>

        {/* Job Description */}
        <FormSection
          icon={FileText}
          title="Job Description"
          subtitle="Describe the role and responsibilities"
        >
          <div className="space-y-4">
            <TextAreaField
              label="Description"
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
              rows={5}
              required
              disabled={isSaving}
              helper="Include details about client types, investment strategies, and team culture"
            />

            <TextAreaField
              label="Requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="List the required qualifications, certifications, and experience..."
              rows={5}
              required
              disabled={isSaving}
              helper="Include certifications (CFA, CFP, CPA), years of experience, and technical skills"
            />
          </div>
        </FormSection>

        {/* Job Status */}
        <FormSection
          icon={Shield}
          title="Job Status"
          subtitle="Control visibility of this position"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-600">
                Toggle to open or close this position for applications
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  formData.jobStatus === "open"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    formData.jobStatus === "open" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                  }`} />
                  {formData.jobStatus === "open" ? "Open for applications" : "Closed"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleJobStatus}
              disabled={isSaving}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50 ${
                formData.jobStatus === "open"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                  formData.jobStatus === "open" ? "translate-x-9" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </FormSection>

        {/* Form Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/jobs")}
            disabled={isSaving}
            className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 order-1 sm:order-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEditing ? "Update Job" : "Post Job"}
          </button>
        </div>
      </form>
    </div>
  );
};

// Form Section Component
const FormSection = ({ icon: Icon, title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
    </div>
    <div className="p-4 sm:p-5">{children}</div>
  </div>
);

// Input Field Component
const InputField = ({ label, name, value, onChange, placeholder, type = "text", required, disabled, helper, icon: Icon, min }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Icon className="w-4 h-4 text-slate-400" />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        required={required}
        disabled={disabled}
        className={`w-full ${Icon ? "pl-10" : "px-4"} pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all text-sm sm:text-base placeholder:text-slate-400 disabled:opacity-50`}
      />
    </div>
    {helper && <p className="text-xs text-slate-500 mt-1.5">{helper}</p>}
  </div>
);

// Select Field Component
const SelectField = ({ label, name, value, onChange, options, placeholder, required, disabled, icon: Icon }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all text-sm sm:text-base appearance-none disabled:opacity-50"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        {Icon ? <Icon className="w-4 h-4 text-violet-500" /> : (
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </div>
  </div>
);

// TextArea Field Component
const TextAreaField = ({ label, name, value, onChange, placeholder, rows = 4, required, disabled, helper }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      required={required}
      disabled={disabled}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all text-sm sm:text-base placeholder:text-slate-400 resize-y min-h-[100px] disabled:opacity-50"
    />
    {helper && <p className="text-xs text-slate-500 mt-1.5">{helper}</p>}
  </div>
);

export default JobEditor;