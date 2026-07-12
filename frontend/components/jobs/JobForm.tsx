import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import TextareaField from "@/components/ui/TextareaField";
import type { JobType } from "@/lib/types";

export type JobFormValues = {
  title: string;
  company: string;
  description: string;
  requirements: string;
  skills: string;
  location: string;
  salary: string;
  jobType: JobType;
  category: string;
  deadline: string;
};

type JobFormProps = {
  value: JobFormValues;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  saving: boolean;
  submitLabel: string;
};

const jobTypes: JobType[] = [
  "Full-time",
  "Part-time",
  "Internship",
  "Remote",
  "Contract",
];

export default function JobForm({
  value,
  onChange,
  onSubmit,
  saving,
  submitLabel,
}: JobFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Job overview
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <InputField
            label="Job title"
            name="title"
            value={value.title}
            onChange={onChange}
            placeholder="Senior Frontend Developer"
            required
          />
          <InputField
            label="Company name"
            name="company"
            value={value.company}
            onChange={onChange}
            placeholder="JobPilot Labs"
            required
          />
          <div className="md:col-span-2">
            <TextareaField
              label="Job description"
              name="description"
              value={value.description}
              onChange={onChange}
              placeholder="Describe the role, team, and impact."
              rows={6}
              required
            />
          </div>
          <div className="md:col-span-2">
            <TextareaField
              label="Requirements"
              name="requirements"
              value={value.requirements}
              onChange={onChange}
              placeholder="List the experience, skills, and expectations for applicants."
              rows={6}
              required
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Skills and logistics
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <InputField
            label="Skills"
            name="skills"
            value={value.skills}
            onChange={onChange}
            placeholder="React, Next.js, TypeScript"
            hint="Separate skills with commas."
            required
          />
          <InputField
            label="Location"
            name="location"
            value={value.location}
            onChange={onChange}
            placeholder="Colombo or Remote"
            required
          />
          <InputField
            label="Salary"
            name="salary"
            value={value.salary}
            onChange={onChange}
            placeholder="Rs. 250,000"
          />
          <SelectField
            label="Job type"
            name="jobType"
            value={value.jobType}
            onChange={onChange}
            required
          >
            {jobTypes.map((jobType) => (
              <option key={jobType} value={jobType}>
                {jobType}
              </option>
            ))}
          </SelectField>
          <InputField
            label="Category"
            name="category"
            value={value.category}
            onChange={onChange}
            placeholder="Software Development"
            required
          />
          <InputField
            label="Application deadline"
            type="date"
            name="deadline"
            value={value.deadline}
            onChange={onChange}
            required
          />
        </div>
      </section>

      <Button type="submit" size="lg" disabled={saving}>
        {saving ? `${submitLabel}...` : submitLabel}
      </Button>
    </form>
  );
}
