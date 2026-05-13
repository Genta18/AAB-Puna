export type UserRole = "kandidat" | "admin";

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  code: string | null; // candidate code e.g. K-1025
  created_at: string;
}

export type KonkursStatus = "aktiv" | "mbyllur" | "shqyrtim";

export interface Konkurs {
  id: number;
  pozita: string;
  institucioni: string;
  afati: string; // date
  statusi: KonkursStatus;
  kategoria: string;
  vende: number;
  aplikime: number;
  paga: string;
  pershkrimi: string;
  created_at: string;
}

export type AplikimStatus = "shqyrtim" | "pranuar" | "refuzuar";

export interface Aplikim {
  id: number;
  kandidat_id: string;
  konkurs_id: number;
  data: string;
  statusi: AplikimStatus;
  hapi: string;
  pika_testi: number | null;
  pika_intervistes: number | null;
  cv_url: string | null;
  diploma_url: string | null;
  extra_urls: string[] | null;
  emri: string | null;
  mbiemri: string | null;
  email: string | null;
  tel: string | null;
  np: string | null;
  arsimi: string | null;
  adresa: string | null;
  created_at: string;
}

export type RezultatStatus = "kaloi" | "refuzuar" | "pritje";

export interface Rezultat {
  id: number;
  kodi: string;
  emri: string;
  konkurs: string;
  pika_testi: number;
  pika_intervistes: number;
  totali: number;
  vendi: number;
  statusi: RezultatStatus;
  created_at: string;
}

export type AnkesaStatus = "shqyrtim" | "zgjidhur" | "refuzuar";

export interface Ankesa {
  id: number;
  kandidat_id: string;
  tema: string;
  kategoria: string;
  data: string;
  statusi: AnkesaStatus;
  pershkrimi: string;
  konkurs_id: number | null;
  created_at: string;
}

export type NjoftimTip = "success" | "info" | "warning" | "error";

export interface Njoftim {
  id: number;
  kandidat_id: string | null; // null = broadcast
  tekst: string;
  data: string;
  lexuar: boolean;
  tip: NjoftimTip;
  created_at: string;
}
