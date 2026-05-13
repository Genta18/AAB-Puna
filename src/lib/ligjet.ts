// Baza ligjore e platformës eKonkursi
// Përmbajtja është nxjerrë nga tekstet zyrtare të Gazetës Zyrtare të Republikës
// së Kosovës (gzk.rks-gov.net) dhe burimeve të institucioneve përgjegjëse.

export type LigjLloji = "rregullore" | "ligj";

export interface LigjItem {
  id: string;
  numri: string;
  titulli: string;
  lloji: LigjLloji;
  /** Përshkrim i shkurtër (1 fjali) për shfaqje në kartë. */
  pershkrim: string;
  /** Citim i drejtpërdrejtë i Nenit 1 — Qëllimi i aktit. */
  qellimi: string;
  /** Institucioni miratues. */
  institucioni: string;
  /** Data e publikimit në Gazetën Zyrtare. */
  dataPublikimit: string;
  /** Lidhja zyrtare në Gazetën Zyrtare. */
  url: string;
  viti: string;
}

export const LIGJET: LigjItem[] = [
  {
    id: "rregullore-07-2025",
    numri: "Nr. 07/2025 (QRK-07/2025-RR)",
    titulli: "Rregullore për Procedurën e Pranimit në Shërbimin Civil",
    lloji: "rregullore",
    pershkrim:
      "Përcakton procedurën e rekrutimit, vlerësimit dhe emërimit të kandidatëve për të gjitha kategoritë e shërbimit civil, përfshirë verifikimin paraprak, testimin me shkrim dhe intervistën.",
    qellimi:
      "Qëllimi i kësaj Rregulloreje është përcaktimi i rregullave dhe procedurës për rekrutimin e kandidatëve për pranim në shërbimin civil, themelimin e komisioneve, vlerësimin dhe emërimin e kandidatëve në shërbimin civil.",
    institucioni: "Qeveria e Republikës së Kosovës",
    dataPublikimit: "09.01.2026",
    url: "https://gzk.rks-gov.net/ActDetail.aspx?ActID=115096",
    viti: "2025",
  },
  {
    id: "ligji-05-l-031",
    numri: "Nr. 05/L-031",
    titulli: "Ligji për Procedurën e Përgjithshme Administrative",
    lloji: "ligj",
    pershkrim:
      "Rregullon mënyrën e ushtrimit të veprimtarisë administrative nga organet publike dhe garanton mbrojtjen e të drejtave dhe interesave juridike të personave në procedurë administrative.",
    qellimi:
      "Ky Ligj ka për qëllim të sigurojë realizimin efektiv të autoritetit publik në shërbim të interesit publik, duke garantuar në të njëjtën kohë mbrojtjen e të drejtave dhe të interesave juridike të personave.",
    institucioni: "Kuvendi i Republikës së Kosovës",
    dataPublikimit: "21.06.2016",
    url: "https://gzk.rks-gov.net/ActDetail.aspx?ActID=12559",
    viti: "2016",
  },
  {
    id: "ligji-06-l-081",
    numri: "Nr. 06/L-081",
    titulli: "Ligji për Qasje në Dokumente Publike",
    lloji: "ligj",
    pershkrim:
      "Garanton të drejtën e çdo personi, pa diskriminim, për qasje në dokumentet publike të prodhuara, pranuara ose të mbajtura nga institucionet publike, si dhe ripërdorimin e dokumenteve të sektorit publik.",
    qellimi:
      "Qëllimi i këtij Ligji është të garantojë të drejtën e secilit person, pa diskriminim mbi çfarëdo baze, për të pasur qasje në dokumente publike, të prodhuara, pranuara, mbajtura apo kontrolluara nga institucionet publike, si dhe të drejtën për ripërdorimin e dokumenteve të sektorit publik.",
    institucioni: "Kuvendi i Republikës së Kosovës",
    dataPublikimit: "30.08.2019",
    url: "https://gzk.rks-gov.net/ActDetail.aspx?ActID=20505",
    viti: "2019",
  },
  {
    id: "ligji-06-l-082",
    numri: "Nr. 06/L-082",
    titulli: "Ligji për Mbrojtjen e të Dhënave Personale",
    lloji: "ligj",
    pershkrim:
      "Përcakton të drejtat, përgjegjësitë, parimet dhe masat ndëshkuese lidhur me mbrojtjen e të dhënave personale dhe privatësisë së individit, si dhe themelon institucionin përgjegjës për mbikëqyrjen e përpunimit të të dhënave.",
    qellimi:
      "Ky ligj përcakton të drejtat, përgjegjësitë, parimet dhe masat ndëshkuese lidhur me mbrojtjen e të dhënave personale dhe privatësisë së individit. Përmes këtij ligji përcaktohen përgjegjësitë e institucionit përgjegjës për mbikëqyrjen e legjitimitetit të përpunimit të të dhënave dhe qasjes në dokumente publike.",
    institucioni: "Kuvendi i Republikës së Kosovës",
    dataPublikimit: "25.02.2019",
    url: "https://gzk.rks-gov.net/ActDetail.aspx?ActID=18616",
    viti: "2019",
  },
  {
    id: "ligji-08-l-197",
    numri: "Nr. 08/L-197",
    titulli: "Ligji për Zyrtarët Publikë",
    lloji: "ligj",
    pershkrim:
      "Rregullon marrëdhënien e punës së zyrtarit publik në institucionet e Kosovës: pranimin, klasifikimin e pozitave, të drejtat, detyrimet, ndryshimin dhe përfundimin e marrëdhënies së punës për të pesë kategoritë e zyrtarëve.",
    qellimi:
      "Ky ligj ka për qëllim rregullimin e marrëdhënies së punës së zyrtares/it publik në institucionet e Republikës së Kosovës, përkatësisht përcaktimin e rregullave dhe parimeve që rregullojnë pranimin, klasifikimin e pozitave, ndryshimin, përfundimin e marrëdhënies së punës, të drejtat dhe detyrimet në raport me marrëdhënien e punës, si dhe çështjet tjera që kanë të bëjnë me marrëdhënien e punës së zyrtares/it publik në institucionet e Republikës së Kosovës.",
    institucioni: "Kuvendi i Republikës së Kosovës",
    dataPublikimit: "18.09.2023",
    url: "https://gzk.rks-gov.net/ActDetail.aspx?ActID=81430",
    viti: "2023",
  },
];
