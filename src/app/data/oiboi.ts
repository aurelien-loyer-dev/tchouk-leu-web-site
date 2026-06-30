export interface OiboiRanking {
  rank: number;
  team: string;
  origin?: string;
}

export interface OiboiEdition {
  id: string;
  title: string;
  edition: number;
  dates: string;
  venues: string[];
  participants: {
    adultes: number;
    u12u15: number;
  };
  origins: string[];
  description: string[];
  rankingAdultes: OiboiRanking[];
  logos: Array<{ file: string; alt: string; highlight?: boolean }>;
  legalNotice: string;
}

export const OIBOI_EDITIONS: OiboiEdition[] = [
  {
    id: "oiboi-2025",
    title: "OIBOI 2ème édition",
    edition: 2,
    dates: "Samedi 7 et dimanche 8 mars 2026",
    venues: ["Boucan Canot", "Terrain de beach de Saint-Leu"],
    participants: {
      adultes: 8,
      u12u15: 5,
    },
    origins: ["La Réunion", "Madagascar"],
    description: [
      "La 2ème édition de l'Open International de Beach de l'Océan Indien (OIBOI) s'est tenue les 7 et 8 mars 2026, réunissant des équipes venues de La Réunion et de Madagascar sur deux spots emblématiques de l'île : Boucan Canot et le terrain de beach de Saint-Leu. Un événement qui confirme la dimension régionale et inter-îles de ce tournoi unique dans l'océan Indien.",
      "Avec 8 équipes adultes et 5 équipes en catégories U12/U15, la compétition a rassemblé des joueurs de tous niveaux et de toutes générations, dans l'esprit fair-play et convivial qui caractérise le tchoukball. La présence de clubs malgaches comme Bel Avenir et Aina a donné à la rencontre une saveur vraiment internationale, renforçant les liens sportifs entre les îles de l'océan Indien.",
      "Ce tournoi est le fruit d'un partenariat solide entre Tchouk'Leu et ses homologues malgaches, soutenu par le programme INTERREG. Il incarne la volonté commune de développer le tchoukball à l'échelle régionale, de créer des échanges humains et sportifs durables, et de faire rayonner ce sport dans tout le bassin de l'océan Indien.",
    ],
    rankingAdultes: [
      { rank: 1, team: "WST 1" },
      { rank: 2, team: "SBTB 2" },
      { rank: 3, team: "WST 2" },
      { rank: 4, team: "Bel Avenir", origin: "Madagascar" },
      { rank: 5, team: "LRTB" },
      { rank: 6, team: "Aina", origin: "Madagascar" },
      { rank: 7, team: "SBTB 1" },
      { rank: 8, team: "SDT" },
    ],
    logos: [
      { file: "/images/interreg.png", alt: "INTERREG", highlight: true },
      { file: "/images/saintpaul.png", alt: "Ville de Saint-Paul" },
      { file: "/images/tco.png", alt: "TCO" },
      { file: "/images/reunion.svg.png", alt: "Région Réunion" },
    ],
    legalNotice:
      "Ce projet est financé par l'Union européenne dans le cadre du programme INTERREG VI océan Indien dont l'Autorité de gestion est la Région Réunion.",
  },
];
