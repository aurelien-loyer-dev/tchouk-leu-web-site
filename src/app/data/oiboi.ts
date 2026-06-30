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
    u12u15?: number;
  };
  origins: string[];
  description: string[];
  rankingAdultes: OiboiRanking[];
  logos: Array<{ file: string; alt: string; highlight?: boolean }>;
}

export const OIBOI_EDITIONS: OiboiEdition[] = [
  {
    id: "oiboi-2024",
    title: "OIBOI 1ère édition",
    edition: 1,
    dates: "Samedi 9 novembre 2024",
    venues: ["Boucan Canot"],
    participants: {
      adultes: 7,
    },
    origins: ["La Réunion"],
    description: [
      "Le 9 novembre 2024 marquait une date historique pour le tchoukball réunionnais : la toute première édition de l'Open International de Beach de l'Océan Indien (OIBOI) voyait le jour sur le sable de Boucan Canot. Un projet porté avec enthousiasme par Tchouk'Leu, avec la volonté de créer un rendez-vous sportif inédit dans le bassin de l'océan Indien.",
      "Sept équipes de l'île se sont affrontées dans une ambiance festive et compétitive, incarnant parfaitement les valeurs de fair-play et de convivialité qui font la singularité du tchoukball. Cette première édition a posé les bases d'un tournoi qui a vocation à grandir et à rayonner bien au-delà de La Réunion.",
      "Lancée avec le soutien du programme INTERREG, cette initiative pionnière a démontré que La Réunion était prête à accueillir un événement inter-îles de qualité. Une belle première page d'une histoire qui ne fait que commencer.",
    ],
    rankingAdultes: [
      { rank: 1, team: "SBTB 1" },
      { rank: 2, team: "Tchouk'Leu 1" },
      { rank: 3, team: "Tampon" },
      { rank: 4, team: "SBTB 2" },
      { rank: 5, team: "Tchouk'Leu 2" },
      { rank: 6, team: "SBTB 3" },
      { rank: 7, team: "Bras Panon" },
    ],
    logos: [
      { file: "/images/interreg.png", alt: "INTERREG", highlight: true },
      { file: "/images/saintpaul.png", alt: "Ville de Saint-Paul" },
      { file: "/images/tco.png", alt: "TCO" },
      { file: "/images/reunion.svg.png", alt: "Région Réunion" },
    ],
  },
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
  },
];
