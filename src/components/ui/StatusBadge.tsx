import { getStatusInfo } from "@/lib/utils";

export function StatusBadge({ statusi }: { statusi: string }) {
  const s = getStatusInfo(statusi);
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
