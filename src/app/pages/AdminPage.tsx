import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ChevronDown, Eye, LockKeyhole, LogOut, Pencil, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
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
import { deleteGalleryPhoto, loadGalleryPhotos, uploadGalleryAlbum, type GalleryCategory, type GalleryPhoto } from "../data/gallery";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

function getRecurringTemplateId(activityId: string) {
  if (!activityId.startsWith("recurring:")) return null;
  const segments = activityId.split(":");
  return segments.length >= 3 ? segments[1] : null;
}

function compareActivitiesByDate(left: Activity, right: Activity) {
  return `${left.date}T${left.startTime}`.localeCompare(`${right.date}T${right.startTime}`);
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Impossible de lire le fichier image."));
    reader.readAsDataURL(file);
  });
}

const selectClass =
  "dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-md border bg-input-background px-3 outline-none focus-visible:ring-[3px]";

export function AdminPage() {
  const [cloudinaryOk, setCloudinaryOk] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Activity>(createEmptyActivity());
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [galleryCategory, setGalleryCategory] = useState<GalleryCategory>("events");
  const [galleryAlbumTitle, setGalleryAlbumTitle] = useState("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryFeedbackMessage, setGalleryFeedbackMessage] = useState("");
  const [isGallerySaving, setIsGallerySaving] = useState(false);
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  const [showPastActivities, setShowPastActivities] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const authenticated = await checkAdminSession();
        setIsAuthenticated(authenticated);
        if (!authenticated) return;
        void fetch("/api/check-config", { credentials: "include" })
          .then((r) => r.json())
          .then((d: { cloudinary?: { cloudName: boolean; apiKey: boolean; apiSecret: boolean } }) => {
            const c = d.cloudinary;
            setCloudinaryOk(Boolean(c?.cloudName && c?.apiKey && c?.apiSecret));
          })
          .catch(() => setCloudinaryOk(false));
        const [loadedActivities, loadedPhotos] = await Promise.all([
          loadActivities(),
          loadGalleryPhotos(),
        ]);
        setActivities(loadedActivities);
        setGalleryPhotos(loadedPhotos);
        setSelectedId(loadedActivities[0]?.id ?? null);
        setDraft(loadedActivities[0] ?? createEmptyActivity());
      } catch {
        setLoginError("Impossible de charger la session admin.");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const selectedActivity = useMemo(
    () => activities.find((a) => a.id === selectedId) ?? null,
    [activities, selectedId],
  );

  const { upcomingActivities, pastActivities } = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const recurringByTemplate = new Map<string, Activity[]>();
    const nonRecurringUpcoming: Activity[] = [];
    const nonRecurringPast: Activity[] = [];

    for (const a of activities) {
      const tid = getRecurringTemplateId(a.id);
      if (!tid) {
        if (a.date >= todayIso) nonRecurringUpcoming.push(a);
        else nonRecurringPast.push(a);
        continue;
      }
      const arr = recurringByTemplate.get(tid) ?? [];
      arr.push(a);
      recurringByTemplate.set(tid, arr);
    }

    const recurringUpcoming: Activity[] = [];
    const recurringPast: Activity[] = [];
    for (const arr of recurringByTemplate.values()) {
      const sorted = [...arr].sort(compareActivitiesByDate);
      const next = sorted.find((a) => a.date >= todayIso);
      if (next) recurringUpcoming.push(next);
      else recurringPast.push(sorted[sorted.length - 1]);
    }

    return {
      upcomingActivities: [...nonRecurringUpcoming, ...recurringUpcoming].sort(compareActivitiesByDate),
      pastActivities: [...nonRecurringPast, ...recurringPast].sort(compareActivitiesByDate).reverse(),
    };
  }, [activities]);

  const recurringOccurrencesCountByTemplate = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    return activities.reduce<Record<string, number>>((acc, a) => {
      const tid = getRecurringTemplateId(a.id);
      if (!tid || a.date < todayIso) return acc;
      acc[tid] = (acc[tid] ?? 0) + 1;
      return acc;
    }, {});
  }, [activities]);

  const recurringOccurrencesByTemplate = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const a of activities) {
      const tid = getRecurringTemplateId(a.id);
      if (!tid) continue;
      const arr = map.get(tid) ?? [];
      arr.push(a);
      map.set(tid, arr);
    }
    for (const [k, v] of map) map.set(k, [...v].sort(compareActivitiesByDate));
    return map;
  }, [activities]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");
    try {
      const loggedIn = await loginAsAdmin(username, password);
      if (!loggedIn) { setLoginError("Identifiants invalides."); return; }
      const [loadedActivities, loadedPhotos] = await Promise.all([
        loadActivities(),
        loadGalleryPhotos(),
      ]);
      setIsAuthenticated(true);
      setActivities(loadedActivities);
      setGalleryPhotos(loadedPhotos);
      setSelectedId(loadedActivities[0]?.id ?? null);
      setDraft(loadedActivities[0] ?? createEmptyActivity());
      setUsername("");
      setPassword("");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Connexion impossible.");
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
      const saved = await saveActivities(nextActivities);
      setActivities(saved);
      if (nextSelectedId === undefined) return;
      setSelectedId(nextSelectedId);
      setDraft(saved.find((a) => a.id === nextSelectedId) ?? createEmptyActivity());
      setFeedbackMessage("Planning enregistré.");
    } catch (error) {
      setFeedbackMessage(error instanceof Error && error.message ? error.message : "Impossible d'enregistrer.");
    }
  };

  const handleCreate = () => {
    const n = createEmptyActivity();
    setSelectedId(n.id);
    setDraft(n);
    setFeedbackMessage("");
  };

  const toggleExpandedTemplate = (tid: string) => {
    setExpandedTemplates((prev) => {
      const next = new Set(prev);
      next.has(tid) ? next.delete(tid) : next.add(tid);
      return next;
    });
  };

  const handleSave = async () => {
    if (!draft.title || !draft.date || !draft.startTime || !draft.endTime || !draft.location) {
      setFeedbackMessage("Renseignez tous les champs obligatoires.");
      return;
    }
    const idx = activities.findIndex((a) => a.id === draft.id);
    const next = idx >= 0
      ? activities.map((a) => (a.id === draft.id ? draft : a))
      : [...activities, draft];
    await persistActivities(next, draft.id);
  };

  const handleDelete = async (id: string) => {
    const next = activities.filter((a) => a.id !== id);
    await persistActivities(next, next[0]?.id ?? null);
  };

  const handleReset = async () => {
    await persistActivities([...defaultActivities], defaultActivities[0]?.id ?? null);
  };

  const handleUploadGalleryAlbum = async () => {
    if (!galleryFiles.length) { setGalleryFeedbackMessage("Sélectionnez au moins une photo."); return; }
    if (!galleryAlbumTitle.trim()) { setGalleryFeedbackMessage("Ajoutez un titre d'album."); return; }
    try {
      setIsGallerySaving(true);
      setGalleryFeedbackMessage("");
      const photos = await Promise.all(galleryFiles.map(async (f) => ({ src: await fileToDataUrl(f), alt: f.name })));
      const next = await uploadGalleryAlbum({ title: galleryAlbumTitle.trim(), category: galleryCategory, photos });
      setGalleryPhotos(next);
      setGalleryAlbumTitle("");
      setGalleryFiles([]);
      setGalleryFeedbackMessage("Album ajouté.");
    } catch (error) {
      setGalleryFeedbackMessage(error instanceof Error ? error.message : "Impossible d'ajouter l'album.");
    } finally {
      setIsGallerySaving(false);
    }
  };

  const handleDeleteGalleryPhoto = async (photoId: string) => {
    try {
      setIsGallerySaving(true);
      setGalleryPhotos(await deleteGalleryPhoto(photoId));
      setGalleryFeedbackMessage("Photo supprimée.");
    } catch (error) {
      setGalleryFeedbackMessage(error instanceof Error ? error.message : "Impossible de supprimer.");
    } finally {
      setIsGallerySaving(false);
    }
  };

  // ─── Loading ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 px-6 flex items-start justify-center">
        <p className="text-muted-foreground mt-12">Chargement du panel admin...</p>
      </div>
    );
  }

  // ─── Login ─────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <LockKeyhole className="h-5 w-5 text-[#5B7D95]" />
              <h1 className="text-2xl font-bold tracking-tight">Administration</h1>
            </div>
            <p className="text-sm text-muted-foreground">Espace réservé aux administrateurs du club.</p>
          </div>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="admin-username">Identifiant</label>
              <Input id="admin-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Identifiant" autoComplete="username" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="admin-password">Mot de passe</label>
              <Input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" autoComplete="current-password" />
            </div>
            {loginError ? <p className="text-sm text-red-600">{loginError}</p> : null}
            <Button type="submit" className="w-full bg-[#5B7D95] text-white hover:bg-[#4E6C83]">Connexion</Button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ─── Dashboard ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/10">
      {/* Header */}
      <div className="sticky top-16 z-20 bg-background border-b border-border/40 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight">Panel admin</h1>
            {cloudinaryOk === false && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                Cloudinary non configuré
              </span>
            )}
            {cloudinaryOk === true && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                Cloudinary ✓
              </span>
            )}
          </div>
          <Button type="button" size="sm" variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Planning ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Planning</h2>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={handleCreate}>
                <Plus className="h-4 w-4" />
                Nouvelle activité
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
          </div>
          <div className="grid xl:grid-cols-[1fr_1.4fr] gap-6">
            {/* Liste activités */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="h-4 w-4 text-[#5B7D95]" />
                  Activités enregistrées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcomingActivities.map((activity) => {
                  const tid = getRecurringTemplateId(activity.id);
                  const count = tid ? recurringOccurrencesCountByTemplate[tid] ?? 1 : 1;

                  if (!tid) {
                    return (
                      <button
                        key={activity.id}
                        type="button"
                        onClick={() => handleSelectActivity(activity)}
                        className={`w-full rounded-lg border p-3 text-left transition-colors text-sm ${
                          selectedId === activity.id
                            ? "border-[#5B7D95] bg-[#5B7D95]/5"
                            : "border-border/50 hover:border-[#5B7D95]/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {dateFormatter.format(new Date(`${activity.date}T00:00:00`))} · {activity.startTime}–{activity.endTime}
                            </p>
                          </div>
                          <span className="text-xs bg-[#5B7D95]/10 text-[#5B7D95] px-2 py-0.5 rounded-full shrink-0">
                            {getCategoryLabel(activity.category)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{activity.location}</p>
                      </button>
                    );
                  }

                  const isExpanded = expandedTemplates.has(tid);
                  const occurrences = recurringOccurrencesByTemplate.get(tid) ?? [];
                  const hasSelected = occurrences.some((o) => o.id === selectedId);

                  return (
                    <div
                      key={activity.id}
                      className={`rounded-lg border overflow-hidden transition-colors ${hasSelected ? "border-[#5B7D95]" : "border-border/50"}`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleExpandedTemplate(tid)}
                        className="w-full p-3 text-left hover:bg-muted/30 transition-colors text-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <p className="font-medium truncate">{activity.title}</p>
                            <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </div>
                          <span className="text-xs bg-[#5B7D95]/10 text-[#5B7D95] px-2 py-0.5 rounded-full shrink-0">
                            {getCategoryLabel(activity.category)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Récurrent · {count} séances · {activity.location}</p>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-border/40 divide-y divide-border/30 bg-muted/10">
                          {occurrences.map((o) => (
                            <button
                              key={o.id}
                              type="button"
                              onClick={() => handleSelectActivity(o)}
                              className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                                selectedId === o.id ? "bg-[#5B7D95]/10 text-[#5B7D95]" : "hover:bg-muted/30"
                              }`}
                            >
                              <p className="font-medium text-xs">{dateFormatter.format(new Date(`${o.date}T00:00:00`))}</p>
                              <p className="text-xs text-muted-foreground">{o.startTime}–{o.endTime}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {pastActivities.length > 0 && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowPastActivities((v) => !v)}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full py-1.5"
                    >
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showPastActivities ? "rotate-180" : ""}`} />
                      Événements passés ({pastActivities.length})
                    </button>
                    {showPastActivities && (
                      <div className="space-y-2 mt-2">
                        {pastActivities.map((activity) => (
                          <button
                            key={activity.id}
                            type="button"
                            onClick={() => handleSelectActivity(activity)}
                            className={`w-full rounded-lg border p-3 text-left transition-colors text-sm opacity-60 ${
                              selectedId === activity.id
                                ? "border-[#5B7D95] bg-[#5B7D95]/5"
                                : "border-border/40 hover:border-border"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium">{activity.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {dateFormatter.format(new Date(`${activity.date}T00:00:00`))} · {activity.startTime}–{activity.endTime}
                                </p>
                              </div>
                              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full shrink-0">
                                {getCategoryLabel(activity.category)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{activity.location}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Éditeur */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Pencil className="h-4 w-4 text-[#5B7D95]" />
                  {selectedActivity ? "Modifier l'activité" : "Nouvelle activité"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {feedbackMessage ? (
                  <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">{feedbackMessage}</p>
                ) : null}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1.5">Titre</label>
                    <Input id="title" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Ex: Tournoi régional" />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-1.5">Type</label>
                    <select id="category" value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as ActivityCategory }))} className={selectClass}>
                      <option value="entrainement">Entraînement</option>
                      <option value="tournoi">Tournoi</option>
                      <option value="evenement">Événement</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium mb-1.5">Date</label>
                    <Input id="date" type="date" value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} />
                  </div>
                  <div>
                    <label htmlFor="audience" className="block text-sm font-medium mb-1.5">Public</label>
                    <Input id="audience" value={draft.audience} onChange={(e) => setDraft((d) => ({ ...d, audience: e.target.value }))} placeholder="Ex: M12 / Tout public" />
                  </div>
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium mb-1.5">Début</label>
                    <Input id="startTime" type="time" value={draft.startTime} onChange={(e) => setDraft((d) => ({ ...d, startTime: e.target.value }))} />
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium mb-1.5">Fin</label>
                    <Input id="endTime" type="time" value={draft.endTime} onChange={(e) => setDraft((d) => ({ ...d, endTime: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-1.5">Lieu</label>
                  <Input id="location" value={draft.location} onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))} placeholder="Ex: Gymnase de Stella" />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1.5">Description</label>
                  <Textarea id="description" value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} placeholder="Informations affichées dans le planning" className="min-h-24" />
                </div>

                <div className="flex gap-2">
                  <Button type="button" className="bg-[#5B7D95] text-white hover:bg-[#4E6C83]" onClick={handleSave}>
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
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Galerie ── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Galerie photos</h2>
          <Card className="border">
            <CardContent className="pt-6">
              <div className="grid lg:grid-cols-[280px_1fr] gap-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="gallery-file" className="block text-sm font-medium mb-1.5">Photos</label>
                    <Input id="gallery-file" type="file" accept="image/*" multiple onChange={(e) => setGalleryFiles(Array.from(e.target.files ?? []))} />
                  </div>
                  <div>
                    <label htmlFor="gallery-title" className="block text-sm font-medium mb-1.5">Titre de l'album</label>
                    <Input id="gallery-title" value={galleryAlbumTitle} onChange={(e) => setGalleryAlbumTitle(e.target.value)} placeholder="Ex: Tournoi 2026" />
                  </div>
                  <div>
                    <label htmlFor="gallery-category" className="block text-sm font-medium mb-1.5">Catégorie</label>
                    <select id="gallery-category" value={galleryCategory} onChange={(e) => setGalleryCategory(e.target.value as GalleryCategory)} className={selectClass}>
                      <option value="matches">Matchs</option>
                      <option value="training">Entraînements</option>
                      <option value="events">Événements</option>
                    </select>
                  </div>
                  <Button type="button" className="w-full bg-[#5B7D95] text-white hover:bg-[#4E6C83]" onClick={() => void handleUploadGalleryAlbum()} disabled={isGallerySaving}>
                    {isGallerySaving ? "Enregistrement..." : "Ajouter l'album"}
                  </Button>
                  {galleryFeedbackMessage ? <p className="text-sm text-muted-foreground">{galleryFeedbackMessage}</p> : null}
                </div>

                <div>
                  {galleryPhotos.length > 0 ? (
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {galleryPhotos.map((photo) => (
                        <div key={photo.id} className="rounded-lg border border-border/50 overflow-hidden bg-background">
                          <ImageWithFallback src={photo.src} alt={photo.alt} className="h-32 w-full object-cover" />
                          <div className="p-2.5 space-y-1.5">
                            <p className="text-xs font-medium line-clamp-1">{photo.alt}</p>
                            {photo.albumTitle ? <p className="text-xs text-muted-foreground line-clamp-1">{photo.albumTitle}</p> : null}
                            <Button type="button" variant="destructive" size="sm" className="w-full h-7 text-xs" onClick={() => void handleDeleteGalleryPhoto(photo.id)} disabled={isGallerySaving}>
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucune photo pour le moment.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
}
