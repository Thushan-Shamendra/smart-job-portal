type StatCardProps = {
  label: string;
  value: string | number;
  caption?: string;
};

export default function StatCard({ label, value, caption }: StatCardProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      {caption ? <p className="mt-2 text-sm text-slate-600">{caption}</p> : null}
    </div>
  );
}
