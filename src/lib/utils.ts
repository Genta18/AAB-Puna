export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("sq-AL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export interface Countdown {
  text: string;
  cls: "urgent" | "soon" | "ok";
}

export function getCountdown(dateStr: string): Countdown {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return { text: "Mbyllur", cls: "urgent" };
  const days = Math.floor(diff / 86400000);
  if (days <= 3) return { text: `${days}d mbetur`, cls: "urgent" };
  if (days <= 10) return { text: `${days} ditë`, cls: "soon" };
  return { text: `${days} ditë`, cls: "ok" };
}

export interface StatusInfo {
  cls: string;
  label: string;
}

const STATUS_MAP: Record<string, StatusInfo> = {
  aktiv: { cls: "badge-green", label: "Aktiv" },
  mbyllur: { cls: "badge-red", label: "Mbyllur" },
  shqyrtim: { cls: "badge-yellow", label: "Në shqyrtim" },
  pranuar: { cls: "badge-green", label: "Pranuar" },
  refuzuar: { cls: "badge-red", label: "Refuzuar" },
  kaloi: { cls: "badge-green", label: "Kaloi" },
  pritje: { cls: "badge-yellow", label: "Në pritje" },
  publikuar: { cls: "badge-blue", label: "Publikuar" },
  zgjidhur: { cls: "badge-green", label: "E zgjidhur" },
};

export function getStatusInfo(statusi: string): StatusInfo {
  return STATUS_MAP[statusi] ?? { cls: "badge-gray", label: statusi };
}
