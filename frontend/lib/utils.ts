export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const formatDate = (value?: string | Date) => {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const formatRelativeDate = (value?: string | Date) => {
  if (!value) {
    return "Recently posted";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently posted";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "1 day ago";
  }

  if (diffDays < 30) {
    return `${diffDays} days ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);

  if (diffMonths === 1) {
    return "1 month ago";
  }

  return `${diffMonths} months ago`;
};

export const isPastDate = (value?: string | Date) => {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getTime() < Date.now();
};

export const toSkillList = (value: string) =>
  value
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill !== "");

export const getInitials = (value?: string) => {
  if (!value) {
    return "JP";
  }

  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase())
    .join("");
};

export const getProfileCompletion = (fields: Array<string | undefined>) => {
  if (fields.length === 0) {
    return 0;
  }

  const completed = fields.filter((field) => field && field.trim() !== "").length;
  return Math.round((completed / fields.length) * 100);
};
