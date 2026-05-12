import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, MapPin, Clock3, Trophy, Dumbbell, CalendarCheck } from "lucide-react";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { ActivityCategory, loadActivities, type Activity } from "../data/activities";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n/i18n";

const LOCALE_MAP: Record<string, string> = { fr: "fr-FR", en: "en-GB", zh: "zh-CN" };

const CATEGORY_STYLES: Record<ActivityCategory, { label: string; dot: string; badge: string }> = {
  entrainement: { label: "Entraînement", dot: "bg-[#5B7D95]", badge: "bg-[#5B7D95]/15 text-[#7BAEC8]" },
  tournoi: { label: "Tournoi", dot: "bg-violet-500", badge: "bg-violet-500/15 text-violet-300" },
  evenement: { label: "Événement", dot: "bg-emerald-500", badge: "bg-emerald-500/15 text-emerald-300" },
};

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;
}

function getRecurringTemplateId(id: string) {
  if (!id.startsWith("recurring:")) return null;
  const s = id.split(":");
  return s.length >= 3 ? s[1] : null;
}

function compareByDate(l: Activity, r: Activity) {
  return `${l.date}T${l.startTime}`.localeCompare(`${r.date}T${r.startTime}`);
}

function normalizeLocation(loc: string) {
  const t = (loc || "").trim();
  if (!t) return "Saint-Leu, La Réunion";
  const l = t.toLowerCase();
  if (l.includes("reunion") || l.includes("réunion") || l.includes("974") || l.includes("saint-leu")) return t;
  return `${t}, Saint-Leu, La Réunion`;
}

export function PlanningPage() {
  const { t } = useTranslation();
  const locale = LOCALE_MAP[(i18n.language ?? "fr").split("-")[0]] ?? "fr-FR";

  const dateFmt = useMemo(() => new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }), [locale]);
  const shortDateFmt = useMemo(() => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }), [locale]);
  const weekdays = t("planning.weekdays", { returnObjects: true }) as string[];

  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ActivityCategory | "all">("all");
  const [loadingError, setLoadingError] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  useEffect(() => {
    const load = async () => {
      try { setActivities(await loadActivities()); setLoadingError(""); }
      catch { setLoadingError(t("planning.loadingError")); }
      finally { setIsLoading(false); }
    };
    load();
    window.addEventListener("storage", load);
    window.addEventListener("focus", load);
    return () => { window.removeEventListener("storage", load); window.removeEventListener("focus", load); };
  }, [t]);

  const filtered = useMemo(() =>
    activeFilter === "all" ? activities : activities.filter((a) => a.category === activeFilter),
    [activities, activeFilter]);

  const todayIso = toIsoDate(new Date());

  const listedActivities = useMemo(() => {
    const byTemplate = new Map<string, Activity[]>();
    const nonRecurring: Activity[] = [];
    for (const a of filtered) {
      const tid = getRecurringTemplateId(a.id);
      if (!tid) { if (a.date >= todayIso) nonRecurring.push(a); continue; }
      const arr = byTemplate.get(tid) ?? [];
      arr.push(a);
      byTemplate.set(tid, arr);
    }
    const reps = Array.from(byTemplate.values()).map((arr) => {
      const sorted = [...arr].sort(compareByDate);
      return sorted.find((a) => a.date >= todayIso) ?? sorted[0];
    });
    return [...nonRecurring, ...reps].sort(compareByDate);
  }, [filtered, todayIso]);

  const recurringCountByTemplate = useMemo(() =>
    filtered.reduce<Record<string, number>>((acc, a) => {
      const tid = getRecurringTemplateId(a.id);
      if (!tid) return acc;
      acc[tid] = (acc[tid] ?? 0) + 1;
      return acc;
    }, {}),
    [filtered]);

  const activitiesByDate = useMemo(() =>
    filtered.reduce<Record<string, Activity[]>>((acc, a) => {
      acc[a.date] = [...(acc[a.date] ?? []), a];
      return acc;
    }, {}),
    [filtered]);

  const monthLabel = useMemo(() =>
    new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(currentMonth),
    [currentMonth, locale]);

  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: string; day: number } | null> = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push({ date: toIsoDate(new Date(year, month, d)), day: d });
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [currentMonth]);

  const nextActivity = listedActivities.find((a) => a.date >= todayIso) ?? null;
  const trainingCount = activities.filter((a) => a.category === "entrainement" && a.date >= todayIso).length;
  const tournamentCount = activities.filter((a) => a.category === "tournoi" && a.date >= todayIso).length;

  const filterOptions: Array<{ value: ActivityCategory | "all"; label: string }> = [
    { value: "all", label: t("planning.showAll") },
    { value: "entrainement", label: t("planning.categories.entrainement") },
    { value: "tournoi", label: t("planning.categories.tournoi") },
    { value: "evenement", label: t("planning.categories.evenement") },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-28 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1a26] to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#5B7D95]/10 blur-3xl rounded-full" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5B7D95] mb-3">Agenda</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-foreground">{t("planning.title")}</h1>
            <p className="text-slate-400 mb-8">{t("planning.subtitle")}</p>

            <div className="flex flex-wrap gap-3">
              <Card className="flex-1 min-w-[200px] max-w-sm bg-card border-white/[0.07]">
                <CardContent className="px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-2">{t("planning.nextEvent")}</p>
                  {isLoading ? (
                    <div className="space-y-1.5"><Skeleton className="h-4 w-32 bg-white/5" /><Skeleton className="h-3 w-24 bg-white/5" /></div>
                  ) : nextActivity ? (
                    <>
                      <p className="font-semibold text-foreground text-sm">{nextActivity.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{dateFmt.format(new Date(`${nextActivity.date}T00:00:00`))} · {nextActivity.startTime}</p>
                    </>
                  ) : <p className="text-sm text-slate-500">{t("planning.noActivity")}</p>}
                </CardContent>
              </Card>
              <div className="flex gap-3">
                <Card className="bg-card border-white/[0.07] min-w-[90px] text-center">
                  <CardContent className="px-4 py-4">
                    <Dumbbell className="h-4 w-4 text-[#5B7D95] mx-auto mb-1" />
                    {isLoading ? <Skeleton className="h-6 w-8 mx-auto bg-white/5" /> : <p className="text-2xl font-bold text-[#5B7D95]">{trainingCount}</p>}
                    <p className="text-xs text-slate-600 mt-0.5">{t("planning.categories.entrainement")}</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-violet-500/10 min-w-[90px] text-center">
                  <CardContent className="px-4 py-4">
                    <Trophy className="h-4 w-4 text-violet-400 mx-auto mb-1" />
                    {isLoading ? <Skeleton className="h-6 w-8 mx-auto bg-white/5" /> : <p className="text-2xl font-bold text-violet-400">{tournamentCount}</p>}
                    <p className="text-xs text-slate-600 mt-0.5">{t("planning.categories.tournoi")}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Separator className="bg-white/[0.06]" />

      {/* Filters */}
      <section className="px-6 py-3 bg-background sticky top-14 z-30 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto flex items-center gap-2 flex-wrap">
          {filterOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setActiveFilter(value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === value
                  ? value === "tournoi" ? "bg-violet-500 text-white"
                    : value === "evenement" ? "bg-emerald-500 text-white"
                    : "bg-[#5B7D95] text-white"
                  : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/[0.06]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="py-10 px-6">
        <div className="max-w-7xl mx-auto grid xl:grid-cols-[1fr_360px] gap-8">
          {/* Activity list */}
          <div>
            {loadingError && <p className="text-red-400 text-sm mb-4">{loadingError}</p>}
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-4 rounded-xl border border-white/[0.06] p-4 bg-card">
                    <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0 bg-white/5" />
                    <div className="flex-1 space-y-2"><Skeleton className="h-4 w-44 bg-white/5" /><Skeleton className="h-3 w-32 bg-white/5" /></div>
                  </div>
                ))}
              </div>
            ) : listedActivities.length > 0 ? (
              <div className="space-y-2">
                {listedActivities.map((activity, index) => {
                  const tid = getRecurringTemplateId(activity.id);
                  const recurringCount = tid ? (recurringCountByTemplate[tid] ?? 1) : null;
                  const style = CATEGORY_STYLES[activity.category];
                  const isSelected = selectedActivity?.id === activity.id;
                  return (
                    <motion.button
                      key={activity.id}
                      type="button"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
                      onClick={() => setSelectedActivity(activity === selectedActivity ? null : activity)}
                      className={`w-full text-left rounded-xl border transition-all ${
                        isSelected ? "border-[#5B7D95]/40 bg-[#5B7D95]/5" : "border-white/[0.06] hover:border-white/[0.12] bg-card"
                      }`}
                    >
                      <div className="flex gap-4 p-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-center ${style.badge}`}>
                          <span className="text-[10px] font-bold uppercase leading-none">
                            {new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(`${activity.date}T00:00:00`)).replace(".", "")}
                          </span>
                          <span className="text-lg font-bold leading-tight">{new Date(`${activity.date}T00:00:00`).getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-semibold text-foreground leading-tight truncate">{activity.title}</p>
                            <Badge className={`flex-shrink-0 text-xs border-0 ${style.badge}`}>{style.label}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" />{activity.startTime} – {activity.endTime}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{activity.location}</span>
                          </div>
                          {activity.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{activity.description}</p>}
                          {recurringCount && recurringCount > 1 && (
                            <p className="text-xs text-slate-600 mt-1">{t("planning.recurring")} · {recurringCount} {t("planning.sessions")}</p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/[0.08] py-16 text-center text-slate-500">
                <CalendarCheck className="h-8 w-8 mx-auto mb-3 opacity-30" />
                {t("planning.noMatchFilter")}
              </div>
            )}
          </div>

          {/* Calendar + Map */}
          <div className="space-y-4">
            <Card className="bg-card border-white/[0.07] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <p className="font-semibold capitalize text-sm text-foreground">{monthLabel}</p>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-slate-200 hover:bg-white/5" onClick={() => changeMonth(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-slate-200 hover:bg-white/5" onClick={() => changeMonth(1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-7 mb-1">
                  {weekdays.map((label) => (
                    <div key={label} className="text-center text-[10px] font-semibold text-slate-600 uppercase py-1">{label}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {calendarCells.map((cell, index) => {
                    if (!cell) return <div key={`e-${index}`} />;
                    const dayActivities = activitiesByDate[cell.date] ?? [];
                    const isToday = cell.date === todayIso;
                    const isSelected = selectedDate === cell.date;
                    return (
                      <button
                        key={cell.date}
                        type="button"
                        onClick={() => {
                          setSelectedDate(cell.date === selectedDate ? null : cell.date);
                          const d = activitiesByDate[cell.date];
                          if (d?.length) setSelectedActivity(d[0]);
                        }}
                        className={`relative flex flex-col items-center py-1.5 rounded-lg text-xs transition-colors ${
                          isSelected ? "bg-[#5B7D95] text-white" : isToday ? "bg-[#5B7D95]/15 font-bold text-[#7BAEC8]" : "hover:bg-white/5 text-slate-400"
                        }`}
                      >
                        <span className="font-medium leading-none">{cell.day}</span>
                        {dayActivities.length > 0 ? (
                          <div className="flex gap-0.5 mt-1">
                            {dayActivities.slice(0, 3).map((a) => (
                              <span key={a.id} className={`h-1 w-1 rounded-full ${isSelected ? "bg-white/70" : CATEGORY_STYLES[a.category].dot}`} />
                            ))}
                          </div>
                        ) : <div className="h-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              {selectedDate && (
                <div className="border-t border-white/[0.06] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-2">
                    {shortDateFmt.format(new Date(`${selectedDate}T00:00:00`))}
                  </p>
                  {(activitiesByDate[selectedDate] ?? []).length > 0 ? (
                    <div className="space-y-1">
                      {(activitiesByDate[selectedDate] ?? []).map((a) => (
                        <button key={a.id} type="button" onClick={() => setSelectedActivity(a)}
                          className="w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${CATEGORY_STYLES[a.category].dot}`} />
                            <span className="font-medium text-foreground truncate">{a.title}</span>
                          </div>
                          <p className="text-slate-600 pl-3.5">{a.startTime} – {a.endTime}</p>
                        </button>
                      ))}
                    </div>
                  ) : <p className="text-xs text-slate-500">{t("planning.noActivityThisDay")}</p>}
                </div>
              )}
            </Card>

            {selectedActivity ? (
              <motion.div key={selectedActivity.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="bg-card border-white/[0.07] overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="font-semibold text-sm text-foreground">{selectedActivity.title}</p>
                    <p className="text-xs text-slate-500">{selectedActivity.location}</p>
                  </div>
                  <iframe
                    key={selectedActivity.location}
                    title={t("planning.mapLabel")}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(normalizeLocation(selectedActivity.location))}&z=14&output=embed`}
                    className="w-full h-48"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="px-4 py-2.5">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(normalizeLocation(selectedActivity.location))}`}
                      target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#5B7D95] hover:text-[#7BAEC8] transition-colors"
                    >
                      {t("planning.openOnMaps")} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/[0.08] py-10 text-center">
                <CalendarDays className="h-6 w-6 mx-auto mb-2 text-slate-700" />
                <p className="text-sm text-slate-600">{t("planning.selectDate")}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
