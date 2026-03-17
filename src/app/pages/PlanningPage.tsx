import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, ExternalLink, Filter, MapPin, Trophy } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ActivityCategory, loadActivities, type Activity } from "../data/activities";
import { getSavedAttendanceIdentity, submitAttendanceVote, type AttendanceVote } from "../data/attendanceVotes";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n/i18n";

const LOCALE_MAP: Record<string, string> = { fr: "fr-FR", en: "en-GB", zh: "zh-CN" };

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRecurringTemplateId(activityId: string) {
  if (!activityId.startsWith("recurring:")) {
    return null;
  }

  const segments = activityId.split(":");
  if (segments.length < 3) {
    return null;
  }

  return segments[1];
}

function compareActivitiesByDate(left: Activity, right: Activity) {
  const leftValue = `${left.date}T${left.startTime}`;
  const rightValue = `${right.date}T${right.startTime}`;
  return leftValue.localeCompare(rightValue);
}

function normalizeLocationForMaps(location: string) {
  const trimmedLocation = (location || "").trim();

  if (!trimmedLocation) {
    return "Saint-Leu, La Réunion";
  }

  const lowerCaseLocation = trimmedLocation.toLowerCase();
  const alreadyLocalized =
    lowerCaseLocation.includes("reunion") ||
    lowerCaseLocation.includes("réunion") ||
    lowerCaseLocation.includes("974") ||
    lowerCaseLocation.includes("saint-leu");

  if (alreadyLocalized) {
    return trimmedLocation;
  }

  return `${trimmedLocation}, Saint-Leu, La Réunion`;
}

function toMapEmbedUrl(location: string) {
  const encodedLocation = encodeURIComponent(normalizeLocationForMaps(location));
  return `https://maps.google.com/maps?q=${encodedLocation}&z=14&output=embed`;
}

function toGoogleMapsUrl(location: string) {
  const encodedLocation = encodeURIComponent(normalizeLocationForMaps(location));
  return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
}

export function PlanningPage() {
  const { t } = useTranslation();
  const currentLocale = LOCALE_MAP[(i18n.language ?? "fr").split("-")[0]] ?? "fr-FR";
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(currentLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }), [currentLocale]);
  const weekdayLabels = t("planning.weekdays", { returnObjects: true }) as string[];

  const [activeFilter, setActiveFilter] = useState<ActivityCategory | "all">("all");
  const [loadingError, setLoadingError] = useState("");
  const [voteMessage, setVoteMessage] = useState("");
  const [voteByActivity, setVoteByActivity] = useState<Record<string, AttendanceVote>>({});
  const [votingActivityId, setVotingActivityId] = useState<string | null>(null);
  const [voterFirstName, setVoterFirstName] = useState("");
  const [voterLastName, setVoterLastName] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  useEffect(() => {
    const identity = getSavedAttendanceIdentity();
    setVoterFirstName(identity.firstName);
    setVoterLastName(identity.lastName);

    const fetchActivities = async () => {
      try {
        const nextActivities = await loadActivities();
        setActivities(nextActivities);
        setLoadingError("");
      } catch {
        setLoadingError(t("planning.loadingError"));
      }
    };

    fetchActivities();

    const syncActivities = () => {
      fetchActivities();
    };

    window.addEventListener("storage", syncActivities);
    window.addEventListener("focus", syncActivities);

    return () => {
      window.removeEventListener("storage", syncActivities);
      window.removeEventListener("focus", syncActivities);
    };
  }, []);

  const filteredActivities = useMemo(() => {
    if (activeFilter === "all") {
      return activities;
    }

    return activities.filter((activity) => activity.category === activeFilter);
  }, [activities, activeFilter]);

  const listedActivities = useMemo(() => {
    const todayIsoDate = toIsoDate(new Date());
    const recurringByTemplate = new Map<string, Activity[]>();
    const nonRecurringActivities: Activity[] = [];

    for (const activity of filteredActivities) {
      const recurringTemplateId = getRecurringTemplateId(activity.id);

      if (!recurringTemplateId) {
        nonRecurringActivities.push(activity);
        continue;
      }

      const templateActivities = recurringByTemplate.get(recurringTemplateId) ?? [];
      templateActivities.push(activity);
      recurringByTemplate.set(recurringTemplateId, templateActivities);
    }

    const recurringRepresentatives = Array.from(recurringByTemplate.values()).map((templateActivities) => {
      const sortedTemplateActivities = [...templateActivities].sort(compareActivitiesByDate);
      return sortedTemplateActivities.find((activity) => activity.date >= todayIsoDate) ?? sortedTemplateActivities[0];
    });

    return [...nonRecurringActivities, ...recurringRepresentatives].sort(compareActivitiesByDate);
  }, [filteredActivities]);

  const recurringOccurrencesCountByTemplate = useMemo(() => {
    return filteredActivities.reduce<Record<string, number>>((accumulator, activity) => {
      const recurringTemplateId = getRecurringTemplateId(activity.id);

      if (!recurringTemplateId) {
        return accumulator;
      }

      accumulator[recurringTemplateId] = (accumulator[recurringTemplateId] ?? 0) + 1;
      return accumulator;
    }, {});
  }, [filteredActivities]);

  const activitiesByDate = useMemo(() => {
    return filteredActivities.reduce<Record<string, Activity[]>>((accumulator, activity) => {
      const existing = accumulator[activity.date] ?? [];
      accumulator[activity.date] = [...existing, activity];
      return accumulator;
    }, {});
  }, [filteredActivities]);

  const monthLabel = useMemo(() => new Intl.DateTimeFormat(currentLocale, {
    month: "long",
    year: "numeric",
  }).format(currentMonth), [currentMonth, currentLocale]);

  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = (firstDayOfMonth.getDay() + 6) % 7;

    const cells: Array<{ date: string; day: number } | null> = [];

    for (let index = 0; index < firstWeekday; index += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const currentDate = new Date(year, month, day);
      cells.push({ date: toIsoDate(currentDate), day });
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [currentMonth]);

  const displayedDayActivities = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    return activitiesByDate[selectedDate] ?? [];
  }, [activitiesByDate, selectedDate]);

  const locationOptions = useMemo(() => {
    const uniqueLocations = Array.from(new Set(filteredActivities.map((activity) => activity.location))).filter(Boolean);
    return uniqueLocations;
  }, [filteredActivities]);

  useEffect(() => {
    if (locationOptions.length === 0) {
      setSelectedLocation("Saint-Leu, La Réunion");
      return;
    }

    if (!locationOptions.includes(selectedLocation)) {
      setSelectedLocation(locationOptions[0]);
    }
  }, [locationOptions, selectedLocation]);

  const changeMonth = (delta: number) => {
    setCurrentMonth((previousMonth) => new Date(previousMonth.getFullYear(), previousMonth.getMonth() + delta, 1));
    setSelectedDate(null);
  };

  const todayIsoDate = toIsoDate(new Date());
  const nextActivity = filteredActivities.find((activity) => activity.date >= todayIsoDate) ?? filteredActivities[0];
  const tournamentCount = activities.filter((activity) => activity.category === "tournoi").length;
  const trainingCount = activities.filter((activity) => activity.category === "entrainement").length;
  const quickVoteActivities = listedActivities.filter((activity) => activity.date >= todayIsoDate).slice(0, 3);

  const handleVote = async (activityId: string, vote: AttendanceVote) => {
    const safeFirstName = voterFirstName.trim();
    const safeLastName = voterLastName.trim();

    if (!safeFirstName || !safeLastName) {
      setVoteMessage(t("planning.fillName"));
      return;
    }

    setVotingActivityId(activityId);
    setVoteMessage("");

    try {
      await submitAttendanceVote(activityId, vote, safeFirstName, safeLastName);
      setVoteByActivity((current) => ({ ...current, [activityId]: vote }));
      setVoteMessage(t("planning.thankYouVote"));
    } catch (error) {
      if (error instanceof Error && error.message) {
        setVoteMessage(error.message);
      } else {
        setVoteMessage(t("planning.voteError"));
      }
    } finally {
      setVotingActivityId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#DDF4FF] via-[#F4FBFF] to-background dark:from-[#1a3a4a] dark:via-[#102733] dark:to-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl font-bold mb-6">{t("planning.title")}</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("planning.subtitle")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mt-14">
            <Card className="border-2 border-[#4C93C3]/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <CalendarDays className="h-6 w-6 text-[#4C93C3]" />
                  {t("planning.nextEvent")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {nextActivity ? (
                  <div className="space-y-2">
                    <p className="font-semibold text-lg">{nextActivity.title}</p>
                    <p className="text-muted-foreground">{dateFormatter.format(new Date(`${nextActivity.date}T00:00:00`))}</p>
                    <p className="text-muted-foreground">{nextActivity.startTime} - {nextActivity.endTime}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">{t("planning.noActivity")}</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 border-[#4C93C3]/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Clock3 className="h-6 w-6 text-[#4C93C3]" />
                  {t("planning.trainingsPlanned")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-[#4C93C3]">{trainingCount}</p>
                <p className="text-muted-foreground mt-2">{t("planning.trainingsVisible")}</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#4C93C3]/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Trophy className="h-6 w-6 text-[#4C93C3]" />
                  {t("planning.tournamentsAnnounced")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-[#4C93C3]">{tournamentCount}</p>
                <p className="text-muted-foreground mt-2">{t("planning.tournamentsAdded")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 px-6 bg-background border-b border-border/60">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>{t("planning.filterActivities")}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {(["all", "entrainement", "tournoi", "evenement"] as const).map((filter) => (
              <Button
                key={filter}
                type="button"
                variant={activeFilter === filter ? "default" : "outline"}
                className={activeFilter === filter ? "bg-[#4C93C3] text-white hover:bg-[#3a7ba8]" : ""}
                onClick={() => setActiveFilter(filter)}
              >
                {filter === "all" ? t("planning.showAll") : t(`planning.categories.${filter}`)}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 px-6 bg-background border-b border-border/60">
        <div className="max-w-7xl mx-auto">
          <Card className="border-2 border-[#4C93C3]/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Clock3 className="h-6 w-6 text-[#4C93C3]" />
                {t("planning.quickVote")}
              </CardTitle>
              <p className="text-muted-foreground">{t("planning.quickVoteDesc")}</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3 mb-4">
                <div>
                  <label htmlFor="vote-first-name" className="mb-1 block text-sm font-medium">{t("planning.firstName")}</label>
                  <Input
                    id="vote-first-name"
                    value={voterFirstName}
                    onChange={(event) => setVoterFirstName(event.target.value)}
                    placeholder={t("planning.firstNamePlaceholder")}
                  />
                </div>
                <div>
                  <label htmlFor="vote-last-name" className="mb-1 block text-sm font-medium">{t("planning.lastName")}</label>
                  <Input
                    id="vote-last-name"
                    value={voterLastName}
                    onChange={(event) => setVoterLastName(event.target.value)}
                    placeholder={t("planning.lastNamePlaceholder")}
                  />
                </div>
              </div>

              {quickVoteActivities.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-4">
                  {quickVoteActivities.map((activity) => (
                    <div key={`quick-vote-${activity.id}`} className="rounded-lg border border-border/70 bg-background p-4 space-y-3">
                      <div>
                        <p className="font-semibold">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {dateFormatter.format(new Date(`${activity.date}T00:00:00`))} • {activity.startTime} - {activity.endTime}
                        </p>
                        <p className="text-sm text-muted-foreground">{activity.location}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {([
                          { value: "present", label: t("planning.present") },
                          { value: "absent", label: t("planning.absent") },
                        ] as const).map((option) => (
                          <Button
                            key={`quick-${activity.id}-${option.value}`}
                            type="button"
                            size="sm"
                            variant={voteByActivity[activity.id] === option.value ? "default" : "outline"}
                            className={voteByActivity[activity.id] === option.value ? "bg-[#4C93C3] text-white hover:bg-[#3a7ba8]" : ""}
                            disabled={votingActivityId === activity.id}
                            onClick={() => void handleVote(activity.id, option.value)}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t("planning.noFutureVote")}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 px-6 bg-background border-b border-border/60">
        <div className="max-w-7xl mx-auto grid xl:grid-cols-[1.25fr_1fr] gap-8">
          <Card className="border-2 border-[#4C93C3]/25">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <CalendarDays className="h-6 w-6 text-[#4C93C3]" />
                  {t("planning.activityCalendar")}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="icon" onClick={() => changeMonth(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon" onClick={() => changeMonth(1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-muted-foreground capitalize">{monthLabel}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center mb-3">
                {weekdayLabels.map((label) => (
                  <p key={label} className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {label}
                  </p>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarCells.map((cell, index) => {
                  if (!cell) {
                    return <div key={`empty-${index}`} className="h-20 rounded-lg bg-muted/20" />;
                  }

                  const dayActivities = activitiesByDate[cell.date] ?? [];
                  const isSelected = selectedDate === cell.date;

                  return (
                    <button
                      key={cell.date}
                      type="button"
                      onClick={() => setSelectedDate(cell.date)}
                      className={`h-20 rounded-lg border p-2 text-left transition-colors ${
                        isSelected
                          ? "border-[#4C93C3] bg-[#4C93C3]/10"
                          : "border-border bg-background hover:border-[#4C93C3]/50"
                      }`}
                    >
                      <p className="text-sm font-semibold">{cell.day}</p>
                      {dayActivities.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {dayActivities.slice(0, 3).map((activity) => (
                            <span key={`${cell.date}-${activity.id}`} className="h-2 w-2 rounded-full bg-[#4C93C3]" />
                          ))}
                          {dayActivities.length > 3 ? <span className="text-[10px] text-[#4C93C3]">+{dayActivities.length - 3}</span> : null}
                        </div>
                      ) : (
                        <p className="mt-2 text-[11px] text-muted-foreground">{t("planning.noActivityDay")}</p>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-lg border border-border/70 bg-muted/20 p-4">
                <p className="font-semibold mb-2">
                  {selectedDate
                    ? `${t("planning.activitiesOf")} ${dateFormatter.format(new Date(`${selectedDate}T00:00:00`))}`
                    : t("planning.selectDate")}
                </p>
                {selectedDate ? (
                  displayedDayActivities.length > 0 ? (
                    <div className="space-y-2">
                      {displayedDayActivities.map((activity) => (
                        <button
                          key={`selected-${activity.id}`}
                          type="button"
                          onClick={() => setSelectedLocation(activity.location)}
                          className="w-full rounded-md bg-background p-3 border border-border/70 text-left hover:border-[#4C93C3]/60"
                        >
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.startTime} - {activity.endTime} • {activity.location}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("planning.noActivityThisDay")}</p>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">{t("planning.calendarHint")}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#4C93C3]/25">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <MapPin className="h-6 w-6 text-[#4C93C3]" />
                {t("planning.interactiveMap")}
              </CardTitle>
              <p className="text-muted-foreground">
                {t("planning.interactiveMapDesc")}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-border/80 bg-muted/10">
                <iframe
                  key={selectedLocation}
                  title={t("planning.mapLabel")}
                  src={toMapEmbedUrl(selectedLocation)}
                  className="w-full h-[360px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <a
                href={toGoogleMapsUrl(selectedLocation)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-[#4C93C3] hover:underline"
              >
                {t("planning.openOnMaps")}
                <ExternalLink className="h-4 w-4" />
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-20 px-6 bg-muted/30 dark:bg-muted/10">
        <div className="max-w-7xl mx-auto">
          {loadingError ? (
            <Card className="mb-8 border-red-300">
              <CardContent className="py-6 text-center text-red-700">{loadingError}</CardContent>
            </Card>
          ) : null}

          {voteMessage ? (
            <Card className="mb-8 border-[#4C93C3]/40">
              <CardContent className="py-4 text-center text-sm text-muted-foreground">{voteMessage}</CardContent>
            </Card>
          ) : null}

          <div className="grid lg:grid-cols-2 gap-8">
            {listedActivities.map((activity, index) => {
              const recurringTemplateId = getRecurringTemplateId(activity.id);
              const recurringOccurrencesCount = recurringTemplateId
                ? recurringOccurrencesCountByTemplate[recurringTemplateId] ?? 1
                : 1;

              return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
              >
                <Card
                  className="h-full border-2 hover:border-[#4C93C3] transition-colors cursor-pointer"
                  onClick={() => setSelectedLocation(activity.location)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle className="text-2xl">{activity.title}</CardTitle>
                      <span className="rounded-full bg-[#4C93C3]/10 px-3 py-1 text-sm font-medium text-[#4C93C3]">
                        {t(`planning.categories.${activity.category}`)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-lg">
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <CalendarDays className="h-5 w-5 text-[#4C93C3] mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">{t("planning.date")}</p>
                        <p>{dateFormatter.format(new Date(`${activity.date}T00:00:00`))}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <Clock3 className="h-5 w-5 text-[#4C93C3] mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">{t("planning.time")}</p>
                        <p>{activity.startTime} - {activity.endTime}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <MapPin className="h-5 w-5 text-[#4C93C3] mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">{t("planning.location")}</p>
                        <p>{activity.location}</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">{t("planning.audience")}</p>
                      <p className="text-muted-foreground">{activity.audience}</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">{t("planning.details")}</p>
                      <p className="text-muted-foreground">{activity.description}</p>
                    </div>
                    {recurringTemplateId ? (
                      <p className="text-sm text-muted-foreground">{t("planning.recurring")} • {recurringOccurrencesCount} {t("planning.sessions")}</p>
                    ) : null}
                  </CardContent>
                </Card>
              </motion.div>
              );
            })}
          </div>

          {listedActivities.length === 0 ? (
            <Card className="mt-8 border-dashed">
              <CardContent className="py-10 text-center text-muted-foreground">
                {t("planning.noMatchFilter")}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
