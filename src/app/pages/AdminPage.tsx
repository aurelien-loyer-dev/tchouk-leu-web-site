import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Eye, LockKeyhole, LogOut, Pencil, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  checkAdminSession,
  createEmptyActivity,
  defaultActivities,
  getCategoryLabel,
  loginAsAdmin,
  loadActivities,
  logoutAdmin,
  saveActivities,
  type Activity,
  type ActivityCategory,
} from "../data/activities";
import { loadAttendanceSummaryForAdmin, type AttendanceSummary } from "../data/attendanceVotes";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

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

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Activity>(createEmptyActivity());
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [attendanceSummaryByActivity, setAttendanceSummaryByActivity] = useState<Record<string, AttendanceSummary>>({});
  const [attendancePeriodFilter, setAttendancePeriodFilter] = useState<"upcoming" | "past" | "all">("upcoming");
  const [attendanceCategoryFilter, setAttendanceCategoryFilter] = useState<ActivityCategory | "all">("all");
  const [attendanceOnlyWithVotes, setAttendanceOnlyWithVotes] = useState(false);

  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        const authenticated = await checkAdminSession();
        setIsAuthenticated(authenticated);

        if (!authenticated) {
          return;
        }

        const loadedActivities = await loadActivities();
        setActivities(loadedActivities);
        setSelectedId(loadedActivities[0]?.id ?? null);
        setDraft(loadedActivities[0] ?? createEmptyActivity());
        await refreshAttendanceSummary();
      } catch {
        setLoginError("Impossible de charger la session admin.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAdmin();
  }, []);

  const selectedActivity = useMemo(
    () => activities.find((activity) => activity.id === selectedId) ?? null,
    [activities, selectedId],
  );

  const listedActivities = useMemo(() => {
    const todayIsoDate = new Date().toISOString().slice(0, 10);
    const recurringByTemplate = new Map<string, Activity[]>();
    const nonRecurringActivities: Activity[] = [];

    for (const activity of activities) {
      const recurringTemplateId = getRecurringTemplateId(activity.id);

      if (!recurringTemplateId) {
        nonRecurringActivities.push(activity);
        continue;
      }

      const existingTemplateActivities = recurringByTemplate.get(recurringTemplateId) ?? [];
      existingTemplateActivities.push(activity);
      recurringByTemplate.set(recurringTemplateId, existingTemplateActivities);
    }

    const recurringRepresentatives = Array.from(recurringByTemplate.values()).map((templateActivities) => {
      const sortedTemplateActivities = [...templateActivities].sort(compareActivitiesByDate);
      return sortedTemplateActivities.find((activity) => activity.date >= todayIsoDate) ?? sortedTemplateActivities[0];
    });

    const mergedActivities = [...nonRecurringActivities, ...recurringRepresentatives].filter(Boolean);
    return mergedActivities.sort(compareActivitiesByDate);
  }, [activities]);

  const recurringOccurrencesCountByTemplate = useMemo(() => {
    return activities.reduce<Record<string, number>>((accumulator, activity) => {
      const recurringTemplateId = getRecurringTemplateId(activity.id);

      if (!recurringTemplateId) {
        return accumulator;
      }

      accumulator[recurringTemplateId] = (accumulator[recurringTemplateId] ?? 0) + 1;
      return accumulator;
    }, {});
  }, [activities]);

  const filteredAttendanceActivities = useMemo(() => {
    const todayIsoDate = new Date().toISOString().slice(0, 10);

    return listedActivities.filter((activity) => {
      if (attendancePeriodFilter === "upcoming" && activity.date < todayIsoDate) {
        return false;
      }

      if (attendancePeriodFilter === "past" && activity.date >= todayIsoDate) {
        return false;
      }

      if (attendanceCategoryFilter !== "all" && activity.category !== attendanceCategoryFilter) {
        return false;
      }

      if (!attendanceOnlyWithVotes) {
        return true;
      }

      const summary = attendanceSummaryByActivity[activity.id];
      return Boolean(summary && summary.total > 0);
    });
  }, [listedActivities, attendancePeriodFilter, attendanceCategoryFilter, attendanceOnlyWithVotes, attendanceSummaryByActivity]);

  const attendanceTotals = useMemo(() => {
    return filteredAttendanceActivities.reduce(
      (accumulator, activity) => {
        const summary = attendanceSummaryByActivity[activity.id];

        if (!summary) {
          return accumulator;
        }

        accumulator.present += summary.present;
        accumulator.absent += summary.absent;
        accumulator.total += summary.total;
        return accumulator;
      },
      { present: 0, absent: 0, total: 0 },
    );
  }, [filteredAttendanceActivities, attendanceSummaryByActivity]);

  const refreshAttendanceSummary = async () => {
    try {
      const nextSummary = await loadAttendanceSummaryForAdmin();
      setAttendanceSummaryByActivity(nextSummary);
    } catch {
      setAttendanceSummaryByActivity({});
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoginError("");
    setFeedbackMessage("");

    try {
      const loggedIn = await loginAsAdmin(username, password);

      if (!loggedIn) {
        setLoginError("Identifiants invalides ou acces non autorise.");
        return;
      }

      const loadedActivities = await loadActivities();
      setIsAuthenticated(true);
      setActivities(loadedActivities);
      setSelectedId(loadedActivities[0]?.id ?? null);
      setDraft(loadedActivities[0] ?? createEmptyActivity());
      setUsername("");
      setPassword("");
      setLoginError("");
      await refreshAttendanceSummary();
    } catch (error) {
      if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError("Connexion impossible pour le moment.");
      }
    }
  };

  const handleLogout = async () => {
    await logoutAdmin().catch(() => null);
    setIsAuthenticated(false);
    setSelectedId(null);
    setDraft(createEmptyActivity());
  };

  const handleSelectActivity = (activity: Activity) => {
    setSelectedId(activity.id);
    setDraft(activity);
  };

  const persistActivities = async (nextActivities: Activity[], nextSelectedId?: string | null) => {
    try {
      const savedActivities = await saveActivities(nextActivities);
      setActivities(savedActivities);

      if (nextSelectedId === undefined) {
        return;
      }

      setSelectedId(nextSelectedId);

      const nextSelectedActivity = savedActivities.find((activity) => activity.id === nextSelectedId);
      setDraft(nextSelectedActivity ?? createEmptyActivity());
      setFeedbackMessage("Planning enregistre avec succes.");
      await refreshAttendanceSummary();
    } catch (error) {
      if (error instanceof Error && error.message) {
        setFeedbackMessage(error.message);
        return;
      }

      setFeedbackMessage("Impossible d'enregistrer les modifications.");
    }
  };

  const handleCreate = () => {
    const newActivity = createEmptyActivity();
    setSelectedId(newActivity.id);
    setDraft(newActivity);
  };

  const handleSave = async () => {
    if (!draft.title || !draft.date || !draft.startTime || !draft.endTime || !draft.location) {
      setFeedbackMessage("Renseignez les champs obligatoires avant d'enregistrer.");
      return;
    }

    const existingIndex = activities.findIndex((activity) => activity.id === draft.id);
    let nextActivities: Activity[];

    if (existingIndex >= 0) {
      nextActivities = activities.map((activity) => (activity.id === draft.id ? draft : activity));
    } else {
      nextActivities = [...activities, draft];
    }

    await persistActivities(nextActivities, draft.id);
  };

  const handleDelete = async (id: string) => {
    const nextActivities = activities.filter((activity) => activity.id !== id);
    const nextSelectedId = nextActivities[0]?.id ?? null;
    await persistActivities(nextActivities, nextSelectedId);
  };

  const handleReset = async () => {
    const resetActivities = [...defaultActivities];
    await persistActivities(resetActivities, resetActivities[0]?.id ?? null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">Chargement du panel admin...</CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#DDF4FF] to-background dark:from-[#1a3a4a] dark:to-background">
          <div className="max-w-xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-2 border-[#4C93C3]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-3xl">
                    <LockKeyhole className="h-7 w-7 text-[#4C93C3]" />
                    Admin prive
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-5" onSubmit={handleLogin}>
                    <p className="text-muted-foreground">
                      Connectez-vous pour gerer le planning, ajouter des activites et mettre a jour les tournois.
                    </p>
                    <div>
                      <label className="mb-2 block font-medium" htmlFor="admin-username">
                        Identifiant admin
                      </label>
                      <Input
                        id="admin-username"
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="Identifiant"
                        autoComplete="username"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block font-medium" htmlFor="admin-password">
                        Mot de passe admin
                      </label>
                      <Input
                        id="admin-password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Mot de passe"
                        autoComplete="current-password"
                      />
                    </div>
                    {loginError ? <p className="text-sm text-red-600">{loginError}</p> : null}
                    <Button type="submit" className="w-full bg-[#4C93C3] text-white hover:bg-[#3a7ba8]">
                      Entrer dans le panel admin
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-12 px-6 bg-gradient-to-b from-[#DDF4FF] via-[#F4FBFF] to-background dark:from-[#1a3a4a] dark:via-[#102733] dark:to-background border-b border-border/60">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-4">Panel admin</h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Ajoutez, modifiez ou supprimez les entrainements, tournois et autres activites affichees dans le planning.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Nouvelle activite
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              Reinitialiser
            </Button>
            <Button type="button" variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Deconnexion
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 px-6 bg-background">
        <div className="max-w-7xl mx-auto grid xl:grid-cols-[1.05fr_1.35fr] gap-8">
          <Card className="border-2 border-[#4C93C3]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Eye className="h-6 w-6 text-[#4C93C3]" />
                Activites enregistrees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {listedActivities.map((activity) => {
                const recurringTemplateId = getRecurringTemplateId(activity.id);
                const recurringOccurrencesCount = recurringTemplateId
                  ? recurringOccurrencesCountByTemplate[recurringTemplateId] ?? 1
                  : 1;

                return (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => handleSelectActivity(activity)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    selectedId === activity.id ? "border-[#4C93C3] bg-[#4C93C3]/5" : "border-border hover:border-[#4C93C3]/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {dateFormatter.format(new Date(`${activity.date}T00:00:00`))} • {activity.startTime} - {activity.endTime}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#4C93C3]/10 px-2.5 py-1 text-xs font-medium text-[#4C93C3]">
                      {getCategoryLabel(activity.category)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{activity.location}</p>
                  {recurringTemplateId ? (
                    <p className="text-xs text-muted-foreground mt-1">Type recurrent • {recurringOccurrencesCount} seances affichees</p>
                  ) : null}
                </button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-2 border-[#4C93C3]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Pencil className="h-6 w-6 text-[#4C93C3]" />
                {selectedActivity ? "Modifier l'activite" : "Nouvelle activite"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                {feedbackMessage ? (
                  <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">{feedbackMessage}</p>
                ) : null}

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="title" className="mb-2 block font-medium">Titre</label>
                  <Input
                    id="title"
                    value={draft.title}
                    onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Ex: Tournoi regional"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="mb-2 block font-medium">Type</label>
                  <select
                    id="category"
                    value={draft.category}
                    onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value as ActivityCategory }))}
                    className="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-md border bg-input-background px-3 outline-none focus-visible:ring-[3px]"
                  >
                    <option value="entrainement">Entrainement</option>
                    <option value="tournoi">Tournoi</option>
                    <option value="evenement">Evenement</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="date" className="mb-2 block font-medium">Date</label>
                  <Input
                    id="date"
                    type="date"
                    value={draft.date}
                    onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="audience" className="mb-2 block font-medium">Public</label>
                  <Input
                    id="audience"
                    value={draft.audience}
                    onChange={(event) => setDraft((current) => ({ ...current, audience: event.target.value }))}
                    placeholder="Ex: U12 / U15"
                  />
                </div>
                <div>
                  <label htmlFor="startTime" className="mb-2 block font-medium">Heure de debut</label>
                  <Input
                    id="startTime"
                    type="time"
                    value={draft.startTime}
                    onChange={(event) => setDraft((current) => ({ ...current, startTime: event.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="mb-2 block font-medium">Heure de fin</label>
                  <Input
                    id="endTime"
                    type="time"
                    value={draft.endTime}
                    onChange={(event) => setDraft((current) => ({ ...current, endTime: event.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="mb-2 block font-medium">Lieu</label>
                <Input
                  id="location"
                  value={draft.location}
                  onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))}
                  placeholder="Ex: Gymnase de Stella"
                />
              </div>

              <div>
                <label htmlFor="description" className="mb-2 block font-medium">Description</label>
                <Textarea
                  id="description"
                  value={draft.description}
                  onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Informations affichees dans la page planning"
                  className="min-h-28"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="button" className="bg-[#4C93C3] text-white hover:bg-[#3a7ba8]" onClick={handleSave}>
                  <Save className="h-4 w-4" />
                  Enregistrer
                </Button>
                {selectedActivity ? (
                  <Button type="button" variant="destructive" onClick={() => handleDelete(selectedActivity.id)}>
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                ) : null}
              </div>

              <div className="rounded-lg border border-border/70 bg-muted/20 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">Compte rendu des presences</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => void refreshAttendanceSummary()}>
                    Actualiser
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={attendancePeriodFilter === "upcoming" ? "default" : "outline"}
                    className={attendancePeriodFilter === "upcoming" ? "bg-[#4C93C3] text-white hover:bg-[#3a7ba8]" : ""}
                    onClick={() => setAttendancePeriodFilter("upcoming")}
                  >
                    Futures
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={attendancePeriodFilter === "past" ? "default" : "outline"}
                    className={attendancePeriodFilter === "past" ? "bg-[#4C93C3] text-white hover:bg-[#3a7ba8]" : ""}
                    onClick={() => setAttendancePeriodFilter("past")}
                  >
                    Passees
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={attendancePeriodFilter === "all" ? "default" : "outline"}
                    className={attendancePeriodFilter === "all" ? "bg-[#4C93C3] text-white hover:bg-[#3a7ba8]" : ""}
                    onClick={() => setAttendancePeriodFilter("all")}
                  >
                    Toutes
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <select
                    value={attendanceCategoryFilter}
                    onChange={(event) => setAttendanceCategoryFilter(event.target.value as ActivityCategory | "all")}
                    className="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-input-background px-3 outline-none focus-visible:ring-[3px]"
                  >
                    <option value="all">Tous les types</option>
                    <option value="entrainement">Entrainements</option>
                    <option value="tournoi">Tournois</option>
                    <option value="evenement">Evenements</option>
                  </select>

                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={attendanceOnlyWithVotes}
                      onChange={(event) => setAttendanceOnlyWithVotes(event.target.checked)}
                    />
                    Avec votes uniquement
                  </label>
                </div>

                <div className="rounded-md border border-border/60 bg-background px-3 py-2 text-xs text-muted-foreground">
                  Totaux filtres • Present: {attendanceTotals.present} • Absent: {attendanceTotals.absent} • Votes: {attendanceTotals.total}
                </div>

                {filteredAttendanceActivities.length > 0 ? (
                  <div className="space-y-2">
                    {filteredAttendanceActivities.map((activity) => {
                      const summary = attendanceSummaryByActivity[activity.id] ?? { present: 0, absent: 0, total: 0, voters: [] };

                      return (
                        <div key={`attendance-${activity.id}`} className="rounded-md border border-border/60 bg-background px-3 py-2">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Present: {summary.present} • Absent: {summary.absent} • Total: {summary.total}
                          </p>
                          {summary.voters && summary.voters.length > 0 ? (
                            <p className="text-xs text-muted-foreground mt-1">
                              {summary.voters
                                .map((voter) => `${voter.firstName} ${voter.lastName} (${voter.vote})`)
                                .join(" • ")}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune activite ne correspond aux filtres.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
