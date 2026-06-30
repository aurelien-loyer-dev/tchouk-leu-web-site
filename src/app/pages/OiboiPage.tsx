import { motion } from "motion/react";
import { MapPin, Users, Trophy, Calendar } from "lucide-react";
import { Separator } from "../components/ui/separator";
import { OIBOI_EDITIONS, type OiboiEdition } from "../data/oiboi";

const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function EditionCard({ edition }: { edition: OiboiEdition }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="rounded-2xl border border-white/[0.08] bg-[#0d1520] overflow-hidden"
    >
      {/* Header */}
      <div className="px-8 py-8 bg-gradient-to-br from-[#0d1a26] to-[#0a1218] border-b border-white/[0.06]">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#5B7D95] mb-2">
          Tournoi inter-îles
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{edition.title}</h2>
        <div className="flex flex-wrap gap-6 text-sm text-slate-400">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#5B7D95] flex-shrink-0" />
            {edition.dates}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#5B7D95] flex-shrink-0" />
            {edition.venues.join(" · ")}
          </span>
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#5B7D95] flex-shrink-0" />
            {edition.participants.adultes} équipes adultes
            {edition.participants.u12u15 ? ` · ${edition.participants.u12u15} équipes U12/U15` : ""}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {edition.origins.map((origin) => (
            <span
              key={origin}
              className="px-3 py-1 rounded-full text-xs font-medium bg-[#5B7D95]/15 text-[#7BAEC8] border border-[#5B7D95]/20"
            >
              {origin}
            </span>
          ))}
        </div>
      </div>

      <div className="px-8 py-8 space-y-10">
        {/* Description */}
        <section>
          <div className="space-y-4">
            {edition.description.map((para, i) => (
              <p key={i} className="text-slate-300 leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </section>

        <Separator className="bg-white/[0.06]" />

        {/* Classement adultes */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <Trophy className="h-5 w-5 text-[#5B7D95]" />
            <h3 className="text-lg font-semibold text-white">Classement final — Adultes</h3>
          </div>
          <div className="space-y-2">
            {edition.rankingAdultes.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors ${
                  entry.rank <= 3
                    ? "border-[#5B7D95]/30 bg-[#5B7D95]/5"
                    : "border-white/[0.05] bg-white/[0.02]"
                }`}
              >
                <span className="w-8 text-center text-base font-bold">
                  {RANK_MEDALS[entry.rank] ?? (
                    <span className="text-slate-500 text-sm">{entry.rank}</span>
                  )}
                </span>
                <span className="flex-1 font-medium text-slate-200">{entry.team}</span>
                {entry.origin && (
                  <span className="text-xs text-slate-500 italic">{entry.origin}</span>
                )}
              </div>
            ))}
          </div>
        </section>

        <Separator className="bg-white/[0.06]" />

        {/* Logos partenaires */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-6">
            Partenaires &amp; soutiens
          </p>
          <div className="flex flex-wrap items-center gap-6">
            {edition.logos.map((logo) => (
              <div
                key={logo.file}
                className={`flex items-center justify-center ${
                  logo.highlight ? "order-first" : ""
                }`}
              >
                <img
                  src={logo.file}
                  alt={logo.alt}
                  className={`object-contain ${
                    logo.highlight
                      ? "h-16 md:h-20"
                      : "h-10 md:h-12 opacity-70 hover:opacity-100 transition-opacity"
                  }`}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.article>
  );
}

export function OiboiPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-28 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1a26] to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#5B7D95]/8 blur-3xl rounded-full" />
        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight text-foreground">
              OIBOI
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl">
              Open International de Beach de l'Océan Indien.
            </p>
          </motion.div>
        </div>
      </section>

      <Separator className="bg-white/[0.06]" />

      {/* Éditions */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          {[...OIBOI_EDITIONS].reverse().map((edition) => (
            <EditionCard key={edition.id} edition={edition} />
          ))}
        </div>
      </section>
    </div>
  );
}
