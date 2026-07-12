"use client";

import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import type { JobType } from "@/lib/types";

export type JobFiltersValue = {
  search: string;
  location: string;
  category: string;
  jobType: string;
};

type JobFiltersProps = {
  value: JobFiltersValue;
  categories: string[];
  onChange: (next: JobFiltersValue) => void;
  onSubmit: () => void;
  onClear: () => void;
};

const jobTypes: JobType[] = [
  "Full-time",
  "Part-time",
  "Internship",
  "Remote",
  "Contract",
];

export default function JobFilters({
  value,
  categories,
  onChange,
  onSubmit,
  onClear,
}: JobFiltersProps) {
  return (
    <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <InputField
          label="Keyword"
          name="search"
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          placeholder="Job title, company, or skill"
        />

        <InputField
          label="Location"
          name="location"
          value={value.location}
          onChange={(e) => onChange({ ...value, location: e.target.value })}
          placeholder="City, state, or remote"
        />

        <SelectField
          label="Category"
          name="category"
          value={value.category}
          onChange={(e) => onChange({ ...value, category: e.target.value })}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Job Type"
          name="jobType"
          value={value.jobType}
          onChange={(e) => onChange({ ...value, jobType: e.target.value })}
        >
          <option value="">All job types</option>
          {jobTypes.map((jobType) => (
            <option key={jobType} value={jobType}>
              {jobType}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button onClick={onSubmit}>Apply Filters</Button>
        <Button variant="outline" onClick={onClear}>
         Clear Filters
        </Button>
      </div>
    </div>
  );
}
