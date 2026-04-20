import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, MapPin, Clock3, Trophy, Dumbbell } from "lucide-react";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { ActivityCategory, loadActivities, type Activity } from "../data/activities";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n/i18n";

const LOCALE_MAP: Record<string, string> = { fr: "fr-FR", en: "en-GB", zh: "zh-CN" };

const CATEGORY_STYLES: Record<ActivityCategory, { label: string; dot: string; badge: string }> = {
  entrainement: {
    label: "Entraînement",
    dot: "bg-[#5B7D95]",
    badge: "bg-[#5B7D95]/10 text-[#5B7D95]",
  },
  tournoi: {
    label: "Tournoi",
    dot: "bg-violet-500",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  },
  evenement: {
    label: "Événement",
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
};

function toIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getRecurringTemplateId(activityId: string) {
  if (!activityId.startsWith("recurring:")) return null;
  const segments = activityId.split(":");
  return segments.length >= 3 ? segments[1] : null;
}

function compareActivitiesByDate(left: Activity, right: Activity) {
  return `${left.date}T${left.startTime}`.localeCompare(`${right.date}T${right.startTime}`);
}

function normalizeLocationForMaps(location: string) {
  const trimmed = (location || "").trim();
  if (!trimmed) return "Saint-Leu, La Réunion";
  const lower = trimmed.toLowerCase();
  if (lower.includes("reunion") || lower.includes("réunion") || lower.includes("974") || lower.includes("saint-leu")) {
    return trimmed;
  }
  return `${trimmed}, Saint-Leu, La Réunion`;
}

function toMapEmbedUrl(location: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(normalizeLocationForMaps(location))}&z=14&output=embed`;
}

function toGoogleMapsUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(normalizeLocationForMaps(location))}`;
}

export function PlanningPage() {
  const { t } = useTranslation();
  const currentLocale = LOCALE_MAP[(i18n.language ?? "fr").split("-")[0]] ?? "fr-FR";

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(currentLocale, { day: "numeric", month: "long", year: "numeric" }),
    [currentLocale],
  );
  const shortDateFormatter = useMemo(
    () => new Intl.DateTimeFormat(currentLocale, { day: "numeric", month: "short" }),
    [currentLocale],
  );
  const weekdayLabels = t("planning.weekdays", { returnObjects: true }) as string[];

  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ActivityCategory | "all">("all");
  const [loadingError, setLoadingError] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const next = await loadActivities();
        setActivities(next);
        setLoadingError("");
      } catch {
        setLoadingError(t("planning.loadingError"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
    window.addEventListener("storage", fetchActivities);
    window.addEventListener("focus", fetchActivities);
    return () => {
      window.removeEventListener("storage", fetchActivities);
      window.removeEventListener("focus", fetchActivities);
    };
  }, []);

  const filteredActivities = useMemo(() => {
    if (activeFilter === "all") return activities;
    return activities.filter((a) => a.category === activeFilter);
  }, [activities, activeFilter]);

  const listedActivities = useMemo(() => {
    const todayIso = toIsoDate(new Date());
    const recurringByTemplate = new Map<string, Activity[]>();
    const nonRecurring: Activity[] = [];

    for (const activity of filteredActivities) {
      const tid = getRecurringTemplateId(activity.id);
      if (!tid) { if (activity.date >= todayIso) nonRecurring.push(activity); continue; }
      const arr = recurringByTemplate.get(tid) ?? [];
      arr.push(activity);
      recurringByTemplate.set(tid, arr);
    }

    const recurringReps = Array.from(recurringByTemplate.values()).map((arr) => {
      const sorted = [...arr].sort(compareActivitiesByDate);
      return sorted.find((a) => a.date >= todayIso) ?? sorted[0];
    });

    return [...nonRecurring, ...recurringReps].sort(compareActivitiesByDate);
  }, [filteredActivities]);

  const recurringCountByTemplate = useMemo(() => {
    return filteredActivities.reduce<Record<string, number>>((acc, a) => {
      const tid = getRecurringTemplateId(a.id);
      if (!tid) return acc;
      acc[tid] = (acc[tid] ?? 0) + 1;
      return acc;
    }, {});
  }, [filteredActivities]);

  const activitiesByDate = useMemo(() => {
    return filteredActivities.reduce<Record<string, Activity[]>>((acc, a) => {
      acc[a.date] = [...(acc[a.date] ?? []), a];
      return acc;
    }, {});
  }, [filteredActivities]);

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(currentLocale, { month: "long", year: "numeric" }).format(currentMonth),
    [currentMonth, currentLocale],
  );

  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: string; day: number } | null> = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: toIsoDate(new Date(year, month, d)), day: d });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [currentMonth]);

  const todayIso = toIsoDate(new Date());

  const upcomingActivities = useMemo(
    () => listedActivities.filter((a) => a.date >= todayIso),
    [listedActivities, todayIso],
  );

  const nextActivity = upcomingActivities[0] ?? null;
  const trainingCount = activities.filter((a) => a.category === "entrainement" && a.date >= todayIso).length;
  const tournamentCount = activities.filter((a) => a.category === "tournoi" && a.date >= todayIso).length;

  const changeMonth = (delta: number) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    setSelectedDate(null);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date === selectedDate ? null : date);
    const dayActivities = activitiesByDate[date];
    if (dayActivities?.length) setSelectedActivity(dayActivities[0]);
  };

  const handleSelectActivity = (activity: Activity) => {
    setSelectedActivity(activity === selectedActivity ? null : activity);
  };

  const filterOptions: Array<{ value: ActivityCategory | "all"; label: string }> = [
    { value: "all", label: t("planning.showAll") },
    { value: "entrainement", label: t("planning.categories.entrainement") },
    { value: "tournoi", label: t("planning.categories.tournoi") },
    { value: "evenement", label: t("planning.categories.evenement") },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-24 pb-12 px-6 bg-gradient-to-b from-[#EAF2F6] to-background dark:from-[#1E2D36] dark:to-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">{t("planning.title")}</h1>
            <p className="text-lg text-muted-foreground mb-8">{t("planning.subtitle")}</p>

            <div className="flex flex-wrap gap-4">
              {/* Prochaine séance */}
              <div className="flex-1 min-w-[220px] max-w-sm rounded-xl border border-[#5B7D95]/25 bg-background px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {t("planning.nextEvent")}
                </p>
                {isLoading ? (
                  <div className="space-y-1.5">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                ) : nextActivity ? (
                  <>
                    <p className="font-semibold">{nextActivity.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {dateFormatter.format(new Date(`${nextActivity.date}T00:00:00`))}
                      {" · "}
                      {nextActivity.startTime}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("planning.noActivity")}</p>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <div className="rounded-xl border border-[#5B7D95]/25 bg-background px-5 py-4 text-center min-w-[100px]">
                  <div className="flex items-center justify-center mb-1">
                    <Dumbbell className="h-4 w-4 text-[#5B7D95]" />
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-7 w-8 mx-auto" />
                  ) : (
                    <p className="text-2xl font-bold text-[#5B7D95]">{trainingCount}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">{t("planning.categories.entrainement")}</p>
                </div>
                <div className="rounded-xl border border-violet-200 dark:border-violet-800/50 bg-background px-5 py-4 text-center min-w-[100px]">
                  <div className="flex items-center justify-center mb-1">
                    <Trophy className="h-4 w-4 text-violet-500" />
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-7 w-8 mx-auto" />
                  ) : (
                    <p className="text-2xl font-bold text-violet-500">{tournamentCount}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">{t("planning.categories.tournoi")}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="px-6 py-4 bg-background border-y border-border/40 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto flex items-center gap-2 flex-wrap">
          {filterOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setActiveFilter(value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === value
                  ? value === "tournoi"
                    ? "bg-violet-500 text-white"
                    : value === "evenement"
                    ? "bg-emerald-500 text-white"
                    : "bg-[#5B7D95] text-white"
                  : "bg-muted/60 hover:bg-muted text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Main content */}
      <section className="py-10 px-6 bg-background">
        <div className="max-w-7xl mx-auto grid xl:grid-cols-[1fr_380px] gap-8">

          {/* Activity list */}
          <div>
            {loadingError ? (
              <p className="text-red-600 text-sm mb-4">{loadingError}</p>
            ) : null}

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-4 rounded-xl border border-border/40 p-4">
                    <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : listedActivities.length > 0 ? (
              <div className="space-y-3">
                {listedActivities.map((activity, index) => {
                  const recurringTid = getRecurringTemplateId(activity.id);
                  const recurringCount = recurringTid ? (recurringCountByTemplate[recurringTid] ?? 1) : null;
                  const style = CATEGORY_STYLES[activity.category];
                  const isSelected = selectedActivity?.id === activity.id;

                  return (
                    <motion.button
                      key={activity.id}
                      type="button"
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.04 }}
                      onClick={() => handleSelectActivity(activity)}
                      className={`w-full text-left rounded-xl border transition-all ${
                        isSelected
                          ? "border-[#5B7D95] bg-[#5B7D95]/5 dark:bg-[#5B7D95]/10"
                          : "border-border/40 hover:border-[#5B7D95]/40 bg-background"
                      }`}
                    >
                      <div className="flex gap-4 p-4">
                        {/* Date badge */}
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center text-center ${style.badge}`}
                        >
                          <span className="text-[10px] font-bold uppercase leading-none">
                            {new Intl.DateTimeFormat(currentLocale, { month: "short" })
                              .format(new Date(`${activity.date}T00:00:00`))
                              .replace(".", "")}
                          </span>
                          <span className="text-lg font-bold leading-tight">
                            {new Date(`${activity.date}T00:00:00`).getDate()}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-semibold leading-tight truncate">{activity.title}</p>
                            <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}>
                              {style.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock3 className="h-3.5 w-3.5" />
                              {activity.startTime} – {activity.endTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {activity.location}
                            </span>
                          </div>
                          {activity.description ? (
                            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{activity.description}</p>
                          ) : null}
                          {recurringCount && recurringCount > 1 ? (
                            <p className="text-xs text-muted-foreground mt-1">
                              {t("planning.recurring")} · {recurringCount} {t("planning.sessions")}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 py-12 text-center text-muted-foreground">
                {t("planning.noMatchFilter")}
              </div>
            )}
          </div>

          {/* Right: Calendar + Map */}
          <div className="space-y-6">
            {/* Calendar */}
            <div className="rounded-xl border border-border/40 bg-background overflow-hidden">
              {/* Month nav */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
                <p className="font-semibold capitalize text-sm">{monthLabel}</p>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => changeMonth(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => changeMonth(1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-3">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 mb-1">
                  {weekdayLabels.map((label) => (
                    <div key={label} className="text-center text-[10px] font-semibold text-muted-foreground uppercase py-1">
                      {label}
                    </div>
                  ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarCells.map((cell, index) => {
                    if (!cell) return <div key={`e-${index}`} />;
                    const dayActivities = activitiesByDate[cell.date] ?? [];
                    const isToday = cell.date === todayIso;
                    const isSelected = selectedDate === cell.date;

                    return (
                      <button
                        key={cell.date}
                        type="button"
                        onClick={() => handleSelectDate(cell.date)}
                        className={`relative flex flex-col items-center py-1.5 rounded-lg text-sm transition-colors ${
                          isSelected
                            ? "bg-[#5B7D95] text-white"
                            : isToday
                            ? "bg-[#5B7D95]/10 font-bold text-[#5B7D95]"
                            : "hover:bg-muted/60"
                        }`}
                      >
                        <span className={`font-medium leading-none ${isSelected ? "text-white" : ""}`}>
                          {cell.day}
                        </span>
                        {dayActivities.length > 0 ? (
                          <div className="flex gap-0.5 mt-1">
                            {dayActivities.slice(0, 3).map((a) => (
                              <span
                                key={a.id}
                                className={`h-1 w-1 rounded-full ${isSelected ? "bg-white/70" : CATEGORY_STYLES[a.category].dot}`}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="h-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected day activities */}
              {selectedDate ? (
                <div className="border-t border-border/40 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    {shortDateFormatter.format(new Date(`${selectedDate}T00:00:00`))}
                  </p>
                  {(activitiesByDate[selectedDate] ?? []).length > 0 ? (
                    <div className="space-y-1.5">
                      {(activitiesByDate[selectedDate] ?? []).map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => handleSelectActivity(a)}
                          className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-muted/60 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${CATEGORY_STYLES[a.category].dot}`} />
                            <span className="font-medium truncate">{a.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground pl-3.5">{a.startTime} – {a.endTime}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("planning.noActivityThisDay")}</p>
                  )}
                </div>
              ) : null}
            </div>

            {/* Map */}
            {selectedActivity ? (
              <motion.div
                key={selectedActivity.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border border-border/40 overflow-hidden bg-background"
              >
                <div className="px-4 py-3 border-b border-border/40">
                  <p className="font-semibold text-sm">{selectedActivity.title}</p>
                  <p className="text-xs text-muted-foreground">{selectedActivity.location}</p>
                </div>
                <iframe
                  key={selectedActivity.location}
                  title={t("planning.mapLabel")}
                  src={toMapEmbedUrl(selectedActivity.location)}
                  className="w-full h-52"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="px-4 py-2.5">
                  <a
                    href={toGoogleMapsUrl(selectedActivity.location)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-[#5B7D95] hover:underline"
                  >
                    {t("planning.openOnMaps")}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </motion.div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/40 py-8 text-center text-sm text-muted-foreground">
                <CalendarDays className="h-6 w-6 mx-auto mb-2 opacity-40" />
                {t("planning.selectDate")}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
