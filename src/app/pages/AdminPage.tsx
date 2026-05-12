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
import {
  createWallOfFameMember,
  deleteWallOfFameMember,
  loadWallOfFameMembers,
  updateWallOfFameMember,
  type WallOfFameFunction,
  type WallOfFameMember,
  type WallOfFamePalmaresByFunction,
} from "../data/wallOfFame";
import {
  createWhiteSharksPalmares,
  createWhiteSharksPlayer,
  deleteWhiteSharksPalmares,
  deleteWhiteSharksPlayer,
  loadWhiteSharksData,
  updateWhiteSharksPalmares,
  updateWhiteSharksPlayer,
  type WhiteSharksMemberType,
  type WhiteSharksPalmaresEntry,
  type WhiteSharksPlayer,
} from "../data/whiteSharks";

const whiteSharksMemberTypeOptions: Array<{ value: WhiteSharksMemberType; label: string }> = [
  { value: "joueur", label: "Joueur" },
  { value: "capitaine", label: "Capitaine" },
  { value: "coach", label: "Coach" },
  { value: "benevole", label: "Staff" },
];

const whiteSharksMemberTypeLabelByValue: Record<WhiteSharksMemberType, string> = {
  joueur: "Joueur",
  capitaine: "Capitaine",
  coach: "Coach",
  benevole: "Staff",
};

const wallFunctionOptions: Array<{ value: WallOfFameFunction; label: string }> = [
  { value: "coach", label: "Coach" },
  { value: "joueur", label: "Joueur" },
  { value: "benevole", label: "Staff" },
  { value: "president", label: "Président" },
];

const wallFunctionLabelByValue: Record<WallOfFameFunction, string> = {
  coach: "Coach",
  joueur: "Joueur",
  benevole: "Staff",
  president: "Président",
};

function sanitizeWallPalmaresByFunction(
  functions: WallOfFameFunction[],
  palmaresByFunction: Partial<Record<WallOfFameFunction, string>>,
): WallOfFamePalmaresByFunction {
  return functions.reduce<WallOfFamePalmaresByFunction>((acc, fn) => {
    const value = palmaresByFunction[fn]?.trim() ?? "";
    if (value) acc[fn] = value;
    return acc;
  }, {});
}

function getWallPalmaresByFunctionFromMember(member: WallOfFameMember): WallOfFamePalmaresByFunction {
  const normalized = sanitizeWallPalmaresByFunction(member.functions, member.palmaresByFunction ?? {});
  if (Object.keys(normalized).length > 0) return normalized;
  if (member.palmares?.trim()) {
    return member.functions.reduce<WallOfFamePalmaresByFunction>((acc, fn) => {
      acc[fn] = member.palmares?.trim() ?? "";
      return acc;
    }, {});
  }
  return {};
}

function getWallPalmaresSummary(member: WallOfFameMember) {
  const palmaresByFunction = getWallPalmaresByFunctionFromMember(member);
  return member.functions
    .map((fn) => {
      const p = palmaresByFunction[fn]?.trim() ?? "";
      return p ? `${wallFunctionLabelByValue[fn]}: ${p}` : null;
    })
    .filter((v): v is string => Boolean(v));
}

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
  const [wallOfFameMembers, setWallOfFameMembers] = useState<WallOfFameMember[]>([]);
  const [wallFirstName, setWallFirstName] = useState("");
  const [wallLastName, setWallLastName] = useState("");
  const [wallPalmaresByFunction, setWallPalmaresByFunction] = useState<Partial<Record<WallOfFameFunction, string>>>({});
  const [wallMemberSince, setWallMemberSince] = useState("");
  const [wallFunctions, setWallFunctions] = useState<WallOfFameFunction[]>([]);
  const [wallPhotoFile, setWallPhotoFile] = useState<File | null>(null);
  const [editingWallMemberId, setEditingWallMemberId] = useState<string | null>(null);
  const [wallFeedbackMessage, setWallFeedbackMessage] = useState("");
  const [isWallSaving, setIsWallSaving] = useState(false);
  const [whiteSharksPalmares, setWhiteSharksPalmares] = useState<WhiteSharksPalmaresEntry[]>([]);
  const [whiteSharksPlayers, setWhiteSharksPlayers] = useState<WhiteSharksPlayer[]>([]);
  const [whiteSharksPalmaresTitle, setWhiteSharksPalmaresTitle] = useState("");
  const [whiteSharksPalmaresTitleEn, setWhiteSharksPalmaresTitleEn] = useState("");
  const [whiteSharksPalmaresTitleZh, setWhiteSharksPalmaresTitleZh] = useState("");
  const [whiteSharksPalmaresYear, setWhiteSharksPalmaresYear] = useState("");
  const [whiteSharksPalmaresDescription, setWhiteSharksPalmaresDescription] = useState("");
  const [whiteSharksPalmaresDescriptionEn, setWhiteSharksPalmaresDescriptionEn] = useState("");
  const [whiteSharksPalmaresDescriptionZh, setWhiteSharksPalmaresDescriptionZh] = useState("");
  const [editingWhiteSharksPalmaresId, setEditingWhiteSharksPalmaresId] = useState<string | null>(null);
  const [whiteSharksPlayerFirstName, setWhiteSharksPlayerFirstName] = useState("");
  const [whiteSharksPlayerLastName, setWhiteSharksPlayerLastName] = useState("");
  const [whiteSharksPlayerClub, setWhiteSharksPlayerClub] = useState("");
  const [whiteSharksPlayerPositions, setWhiteSharksPlayerPositions] = useState<string[]>([]);
  const [whiteSharksPlayerBirthYear, setWhiteSharksPlayerBirthYear] = useState("");
  const [whiteSharksPlayerMemberType, setWhiteSharksPlayerMemberType] = useState<WhiteSharksMemberType>("joueur");
  const [editingWhiteSharksPlayerId, setEditingWhiteSharksPlayerId] = useState<string | null>(null);
  const [whiteSharksFeedbackMessage, setWhiteSharksFeedbackMessage] = useState("");
  const [isWhiteSharksSaving, setIsWhiteSharksSaving] = useState(false);
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  const [showPastActivities, setShowPastActivities] = useState(false);
  const [activeSection, setActiveSection] = useState<"tchouk-leu" | "white-sharks">("tchouk-leu");

  useEffect(() => {
    const init = async () => {
      try {
        const authenticated = await checkAdminSession();
        setIsAuthenticated(authenticated);
        if (!authenticated) return;
        // Check Cloudinary config in background — non-blocking
        void fetch("/api/check-config", { credentials: "include" })
          .then((r) => r.json())
          .then((d: { cloudinary?: { cloudName: boolean; apiKey: boolean; apiSecret: boolean } }) => {
            const c = d.cloudinary;
            setCloudinaryOk(Boolean(c?.cloudName && c?.apiKey && c?.apiSecret));
          })
          .catch(() => setCloudinaryOk(false));
        const [loadedActivities, loadedPhotos, loadedWoF, loadedWS] = await Promise.all([
          loadActivities(),
          loadGalleryPhotos(),
          loadWallOfFameMembers(),
          loadWhiteSharksData(),
        ]);
        setActivities(loadedActivities);
        setGalleryPhotos(loadedPhotos);
        setWallOfFameMembers(loadedWoF);
        setWhiteSharksPalmares(loadedWS.palmares);
        setWhiteSharksPlayers(loadedWS.players);
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
      const [loadedActivities, loadedPhotos, loadedWoF] = await Promise.all([
        loadActivities(),
        loadGalleryPhotos(),
        loadWallOfFameMembers(),
      ]);
      setIsAuthenticated(true);
      setActivities(loadedActivities);
      setGalleryPhotos(loadedPhotos);
      setWallOfFameMembers(loadedWoF);
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

  const resetWallForm = () => {
    setWallFirstName(""); setWallLastName(""); setWallPalmaresByFunction({});
    setWallMemberSince(""); setWallFunctions([]); setWallPhotoFile(null);
    setEditingWallMemberId(null);
  };

  const handleEditWallOfFameMember = (member: WallOfFameMember) => {
    setEditingWallMemberId(member.id);
    setWallFirstName(member.firstName);
    setWallLastName(member.lastName);
    setWallPalmaresByFunction(getWallPalmaresByFunctionFromMember(member));
    setWallMemberSince(member.memberSince);
    setWallFunctions([...member.functions]);
    setWallPhotoFile(null);
    setWallFeedbackMessage("Mode modification. Ajoutez une photo uniquement si nécessaire.");
  };

  const toggleWallFunction = (fn: WallOfFameFunction) => {
    const removing = wallFunctions.includes(fn);
    setWallFunctions((prev) => removing ? prev.filter((f) => f !== fn) : [...prev, fn]);
    if (removing) {
      setWallPalmaresByFunction((p) => { const n = { ...p }; delete n[fn]; return n; });
    }
  };

  const handleSubmitWallOfFameMember = async () => {
    if (!wallFirstName.trim() || !wallLastName.trim()) { setWallFeedbackMessage("Prénom et nom obligatoires."); return; }
    if (!wallMemberSince.trim()) { setWallFeedbackMessage("Champ « adhérent depuis » obligatoire."); return; }
    if (!wallFunctions.length) { setWallFeedbackMessage("Sélectionnez au moins une fonction."); return; }
    if (!editingWallMemberId && !wallPhotoFile) { setWallFeedbackMessage("Ajoutez une photo."); return; }
    try {
      setIsWallSaving(true);
      setWallFeedbackMessage("");
      const photoSrc = wallPhotoFile ? await fileToDataUrl(wallPhotoFile) : "";
      const palmares = sanitizeWallPalmaresByFunction(wallFunctions, wallPalmaresByFunction);
      const next = editingWallMemberId
        ? await updateWallOfFameMember({
            id: editingWallMemberId,
            firstName: wallFirstName.trim(),
            lastName: wallLastName.trim(),
            palmaresByFunction: palmares,
            memberSince: wallMemberSince.trim(),
            functions: wallFunctions,
            ...(photoSrc ? { photoSrc } : {}),
          })
        : await createWallOfFameMember({
            firstName: wallFirstName.trim(),
            lastName: wallLastName.trim(),
            palmaresByFunction: palmares,
            memberSince: wallMemberSince.trim(),
            functions: wallFunctions,
            photoSrc,
          });
      setWallOfFameMembers(next);
      resetWallForm();
      setWallFeedbackMessage(editingWallMemberId ? "Profil modifié." : "Profil ajouté au Wall of Fame.");
    } catch (error) {
      setWallFeedbackMessage(error instanceof Error ? error.message : "Impossible d'enregistrer.");
    } finally {
      setIsWallSaving(false);
    }
  };

  const handleDeleteWallOfFameMember = async (memberId: string) => {
    try {
      setIsWallSaving(true);
      setWallOfFameMembers(await deleteWallOfFameMember(memberId));
      setWallFeedbackMessage("Profil supprimé.");
    } catch (error) {
      setWallFeedbackMessage(error instanceof Error ? error.message : "Impossible de supprimer.");
    } finally {
      setIsWallSaving(false);
    }
  };

  const resetWhiteSharksPalmaresForm = () => {
    setWhiteSharksPalmaresTitle(""); setWhiteSharksPalmaresTitleEn(""); setWhiteSharksPalmaresTitleZh("");
    setWhiteSharksPalmaresYear(""); setWhiteSharksPalmaresDescription("");
    setWhiteSharksPalmaresDescriptionEn(""); setWhiteSharksPalmaresDescriptionZh("");
    setEditingWhiteSharksPalmaresId(null);
  };

  const resetWhiteSharksPlayerForm = () => {
    setWhiteSharksPlayerFirstName(""); setWhiteSharksPlayerLastName(""); setWhiteSharksPlayerClub("");
    setWhiteSharksPlayerPositions([]); setWhiteSharksPlayerBirthYear("");
    setWhiteSharksPlayerMemberType("joueur"); setEditingWhiteSharksPlayerId(null);
  };

  const handleEditWhiteSharksPalmares = (entry: WhiteSharksPalmaresEntry) => {
    setEditingWhiteSharksPalmaresId(entry.id);
    setWhiteSharksPalmaresTitle(entry.title);
    setWhiteSharksPalmaresTitleEn(entry.titleTranslations?.en ?? "");
    setWhiteSharksPalmaresTitleZh(entry.titleTranslations?.zh ?? "");
    setWhiteSharksPalmaresYear(entry.year);
    setWhiteSharksPalmaresDescription(entry.description);
    setWhiteSharksPalmaresDescriptionEn(entry.descriptionTranslations?.en ?? "");
    setWhiteSharksPalmaresDescriptionZh(entry.descriptionTranslations?.zh ?? "");
    setWhiteSharksFeedbackMessage("Mode modification palmarès.");
  };

  const handleEditWhiteSharksPlayer = (player: WhiteSharksPlayer) => {
    setEditingWhiteSharksPlayerId(player.id);
    setWhiteSharksPlayerFirstName(player.firstName);
    setWhiteSharksPlayerLastName(player.lastName);
    setWhiteSharksPlayerClub(player.club);
    setWhiteSharksPlayerPositions(player.positions?.length ? player.positions : player.position ? [player.position] : []);
    setWhiteSharksPlayerBirthYear(player.birthYear !== undefined ? String(player.birthYear) : "");
    setWhiteSharksPlayerMemberType(player.memberType);
    setWhiteSharksFeedbackMessage("Mode modification joueur.");
  };

  const handleSubmitWhiteSharksPalmares = async () => {
    if (!whiteSharksPalmaresTitle.trim()) { setWhiteSharksFeedbackMessage("Titre obligatoire."); return; }
    if (!whiteSharksPalmaresYear.trim()) { setWhiteSharksFeedbackMessage("Année obligatoire."); return; }
    try {
      setIsWhiteSharksSaving(true);
      setWhiteSharksFeedbackMessage("");
      const titleTr = {
        ...(whiteSharksPalmaresTitleEn.trim() ? { en: whiteSharksPalmaresTitleEn.trim() } : {}),
        ...(whiteSharksPalmaresTitleZh.trim() ? { zh: whiteSharksPalmaresTitleZh.trim() } : {}),
      };
      const descTr = {
        ...(whiteSharksPalmaresDescriptionEn.trim() ? { en: whiteSharksPalmaresDescriptionEn.trim() } : {}),
        ...(whiteSharksPalmaresDescriptionZh.trim() ? { zh: whiteSharksPalmaresDescriptionZh.trim() } : {}),
      };
      const next = editingWhiteSharksPalmaresId
        ? await updateWhiteSharksPalmares({
            id: editingWhiteSharksPalmaresId,
            title: whiteSharksPalmaresTitle.trim(),
            ...(Object.keys(titleTr).length ? { titleTranslations: titleTr } : {}),
            year: whiteSharksPalmaresYear.trim(),
            description: whiteSharksPalmaresDescription.trim(),
            ...(Object.keys(descTr).length ? { descriptionTranslations: descTr } : {}),
          })
        : await createWhiteSharksPalmares({
            title: whiteSharksPalmaresTitle.trim(),
            ...(Object.keys(titleTr).length ? { titleTranslations: titleTr } : {}),
            year: whiteSharksPalmaresYear.trim(),
            description: whiteSharksPalmaresDescription.trim(),
            ...(Object.keys(descTr).length ? { descriptionTranslations: descTr } : {}),
          });
      setWhiteSharksPalmares(next.palmares ?? []);
      setWhiteSharksPlayers(next.players ?? []);
      resetWhiteSharksPalmaresForm();
      setWhiteSharksFeedbackMessage(editingWhiteSharksPalmaresId ? "Palmarès modifié." : "Palmarès ajouté.");
    } catch (error) {
      setWhiteSharksFeedbackMessage(error instanceof Error ? error.message : "Impossible d'enregistrer.");
    } finally {
      setIsWhiteSharksSaving(false);
    }
  };

  const handleDeleteWhiteSharksPalmares = async (entryId: string) => {
    try {
      setIsWhiteSharksSaving(true);
      const next = await deleteWhiteSharksPalmares(entryId);
      setWhiteSharksPalmares(next.palmares ?? []);
      setWhiteSharksPlayers(next.players ?? []);
      setWhiteSharksFeedbackMessage("Palmarès supprimé.");
    } catch (error) {
      setWhiteSharksFeedbackMessage(error instanceof Error ? error.message : "Impossible de supprimer.");
    } finally {
      setIsWhiteSharksSaving(false);
    }
  };

  const handleSubmitWhiteSharksPlayer = async () => {
    if (!whiteSharksPlayerFirstName.trim() || !whiteSharksPlayerLastName.trim()) {
      setWhiteSharksFeedbackMessage("Prénom et nom obligatoires.");
      return;
    }
    if (!whiteSharksPlayerClub.trim()) { setWhiteSharksFeedbackMessage("Club obligatoire."); return; }
    try {
      setIsWhiteSharksSaving(true);
      setWhiteSharksFeedbackMessage("");
      const birthYear = whiteSharksPlayerBirthYear.trim() ? Number(whiteSharksPlayerBirthYear.trim()) : undefined;
      const birthYearPayload = birthYear && Number.isInteger(birthYear) ? { birthYear } : {};
      const next = editingWhiteSharksPlayerId
        ? await updateWhiteSharksPlayer({
            id: editingWhiteSharksPlayerId,
            firstName: whiteSharksPlayerFirstName.trim(),
            lastName: whiteSharksPlayerLastName.trim(),
            club: whiteSharksPlayerClub.trim(),
            positions: whiteSharksPlayerPositions,
            memberType: whiteSharksPlayerMemberType,
            ...birthYearPayload,
          })
        : await createWhiteSharksPlayer({
            firstName: whiteSharksPlayerFirstName.trim(),
            lastName: whiteSharksPlayerLastName.trim(),
            club: whiteSharksPlayerClub.trim(),
            positions: whiteSharksPlayerPositions,
            memberType: whiteSharksPlayerMemberType,
            ...birthYearPayload,
          });
      setWhiteSharksPalmares(next.palmares ?? []);
      setWhiteSharksPlayers(next.players ?? []);
      resetWhiteSharksPlayerForm();
      setWhiteSharksFeedbackMessage(editingWhiteSharksPlayerId ? "Joueur modifié." : "Joueur ajouté.");
    } catch (error) {
      setWhiteSharksFeedbackMessage(error instanceof Error ? error.message : "Impossible d'enregistrer.");
    } finally {
      setIsWhiteSharksSaving(false);
    }
  };

  const handleDeleteWhiteSharksPlayer = async (playerId: string) => {
    try {
      setIsWhiteSharksSaving(true);
      const next = await deleteWhiteSharksPlayer(playerId);
      setWhiteSharksPalmares(next.palmares ?? []);
      setWhiteSharksPlayers(next.players ?? []);
      setWhiteSharksFeedbackMessage("Joueur supprimé.");
    } catch (error) {
      setWhiteSharksFeedbackMessage(error instanceof Error ? error.message : "Impossible de supprimer.");
    } finally {
      setIsWhiteSharksSaving(false);
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
              <Input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Identifiant"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="admin-password">Mot de passe</label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                autoComplete="current-password"
              />
            </div>
            {loginError ? <p className="text-sm text-red-600">{loginError}</p> : null}
            <Button type="submit" className="w-full bg-[#5B7D95] text-white hover:bg-[#4E6C83]">
              Connexion
            </Button>
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
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between py-3">
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
          <div className="flex -mb-px">
            <button
              type="button"
              onClick={() => setActiveSection("tchouk-leu")}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeSection === "tchouk-leu"
                  ? "border-[#5B7D95] text-[#5B7D95]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Tchouk&apos;Leu
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("white-sharks")}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeSection === "white-sharks"
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              White Sharks
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {activeSection === "tchouk-leu" && <>
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
                    <Input
                      id="title"
                      value={draft.title}
                      onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                      placeholder="Ex: Tournoi régional"
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-1.5">Type</label>
                    <select
                      id="category"
                      value={draft.category}
                      onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as ActivityCategory }))}
                      className={selectClass}
                    >
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
                    <Input
                      id="audience"
                      value={draft.audience}
                      onChange={(e) => setDraft((d) => ({ ...d, audience: e.target.value }))}
                      placeholder="Ex: M12 / Tout public"
                    />
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
                  <Input
                    id="location"
                    value={draft.location}
                    onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                    placeholder="Ex: Gymnase de Stella"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1.5">Description</label>
                  <Textarea
                    id="description"
                    value={draft.description}
                    onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                    placeholder="Informations affichées dans le planning"
                    className="min-h-24"
                  />
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

        {/* ── Wall of Fame ── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Wall of Fame</h2>
          <Card className="border">
            <CardContent className="pt-6">
              <div className="grid lg:grid-cols-[280px_1fr] gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="wall-first-name" className="block text-sm font-medium mb-1.5">Prénom</label>
                      <Input id="wall-first-name" value={wallFirstName} onChange={(e) => setWallFirstName(e.target.value)} placeholder="Lucas" />
                    </div>
                    <div>
                      <label htmlFor="wall-last-name" className="block text-sm font-medium mb-1.5">Nom</label>
                      <Input id="wall-last-name" value={wallLastName} onChange={(e) => setWallLastName(e.target.value)} placeholder="Hoareau" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="wall-since" className="block text-sm font-medium mb-1.5">Adhérent depuis</label>
                    <Input id="wall-since" value={wallMemberSince} onChange={(e) => setWallMemberSince(e.target.value)} placeholder="2019" />
                  </div>
                  <div>
                    <label htmlFor="wall-photo" className="block text-sm font-medium mb-1.5">Photo</label>
                    <Input id="wall-photo" type="file" accept="image/*" onChange={(e) => setWallPhotoFile(e.target.files?.[0] ?? null)} />
                    {editingWallMemberId ? <p className="mt-1 text-xs text-muted-foreground">Laissez vide pour conserver la photo actuelle.</p> : null}
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1.5">Fonctions</p>
                    <div className="grid grid-cols-2 gap-2 rounded-md border border-border/50 p-3">
                      {wallFunctionOptions.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <input type="checkbox" checked={wallFunctions.includes(opt.value)} onChange={() => toggleWallFunction(opt.value)} />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  {wallFunctions.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Palmarès par fonction (optionnel)</p>
                      {wallFunctions.map((fn) => (
                        <div key={fn}>
                          <label htmlFor={`wall-p-${fn}`} className="block text-xs text-muted-foreground mb-1">{wallFunctionLabelByValue[fn]}</label>
                          <Textarea
                            id={`wall-p-${fn}`}
                            value={wallPalmaresByFunction[fn] ?? ""}
                            onChange={(e) => setWallPalmaresByFunction((p) => ({ ...p, [fn]: e.target.value }))}
                            placeholder="Laissez vide pour masquer"
                            className="min-h-16"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex gap-2">
                    <Button type="button" className="flex-1 bg-[#5B7D95] text-white hover:bg-[#4E6C83]" onClick={() => void handleSubmitWallOfFameMember()} disabled={isWallSaving}>
                      {isWallSaving ? "Enregistrement..." : editingWallMemberId ? "Modifier" : "Ajouter"}
                    </Button>
                    {editingWallMemberId ? <Button type="button" variant="outline" onClick={resetWallForm} disabled={isWallSaving}>Annuler</Button> : null}
                  </div>
                  {wallFeedbackMessage ? <p className="text-sm text-muted-foreground">{wallFeedbackMessage}</p> : null}
                </div>

                <div>
                  {wallOfFameMembers.length > 0 ? (
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {wallOfFameMembers.map((member) => (
                        <div key={member.id} className="rounded-lg border border-border/50 overflow-hidden bg-background">
                          <ImageWithFallback src={member.photoSrc} alt={`${member.firstName} ${member.lastName}`} className="h-32 w-full object-cover" />
                          <div className="p-2.5 space-y-1.5">
                            <p className="text-xs font-semibold">{member.firstName} {member.lastName}</p>
                            <p className="text-xs text-muted-foreground">Depuis {member.memberSince}</p>
                            <p className="text-xs text-muted-foreground">{member.functions.join(" · ")}</p>
                            {getWallPalmaresSummary(member).length > 0 ? (
                              <p className="text-xs text-muted-foreground line-clamp-2">{getWallPalmaresSummary(member).join(" | ")}</p>
                            ) : null}
                            <div className="grid grid-cols-2 gap-1.5">
                              <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleEditWallOfFameMember(member)} disabled={isWallSaving}>Modifier</Button>
                              <Button type="button" size="sm" variant="destructive" className="h-7 text-xs" onClick={() => void handleDeleteWallOfFameMember(member.id)} disabled={isWallSaving}>Supprimer</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun profil pour le moment.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        </>}

        {activeSection === "white-sharks" && <>
        {/* ── White Sharks ── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">White Sharks</h2>
          <Card className="border border-violet-200/60 dark:border-violet-800/40">
            <CardContent className="pt-6">
              <div className="grid xl:grid-cols-2 gap-8">
                {/* Palmarès */}
                <div className="space-y-4 rounded-xl border border-border/50 p-4">
                  <h3 className="text-sm font-semibold">Palmarès</h3>
                  <div>
                    <label htmlFor="ws-title" className="block text-sm font-medium mb-1.5">Titre (FR)</label>
                    <Input id="ws-title" value={whiteSharksPalmaresTitle} onChange={(e) => setWhiteSharksPalmaresTitle(e.target.value)} placeholder="Ex: Championnat régional" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="ws-title-en" className="block text-sm font-medium mb-1.5">Titre EN</label>
                      <Input id="ws-title-en" value={whiteSharksPalmaresTitleEn} onChange={(e) => setWhiteSharksPalmaresTitleEn(e.target.value)} placeholder="Regional championship" />
                    </div>
                    <div>
                      <label htmlFor="ws-title-zh" className="block text-sm font-medium mb-1.5">Titre 中文</label>
                      <Input id="ws-title-zh" value={whiteSharksPalmaresTitleZh} onChange={(e) => setWhiteSharksPalmaresTitleZh(e.target.value)} placeholder="地区锦标赛" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="ws-year" className="block text-sm font-medium mb-1.5">Année</label>
                    <Input id="ws-year" value={whiteSharksPalmaresYear} onChange={(e) => setWhiteSharksPalmaresYear(e.target.value)} placeholder="2026" />
                  </div>
                  <div>
                    <label htmlFor="ws-desc" className="block text-sm font-medium mb-1.5">Description (FR)</label>
                    <Textarea id="ws-desc" value={whiteSharksPalmaresDescription} onChange={(e) => setWhiteSharksPalmaresDescription(e.target.value)} className="min-h-16" placeholder="Finale remportée face à..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="ws-desc-en" className="block text-sm font-medium mb-1.5">Description EN</label>
                      <Textarea id="ws-desc-en" value={whiteSharksPalmaresDescriptionEn} onChange={(e) => setWhiteSharksPalmaresDescriptionEn(e.target.value)} className="min-h-16" />
                    </div>
                    <div>
                      <label htmlFor="ws-desc-zh" className="block text-sm font-medium mb-1.5">Description 中文</label>
                      <Textarea id="ws-desc-zh" value={whiteSharksPalmaresDescriptionZh} onChange={(e) => setWhiteSharksPalmaresDescriptionZh(e.target.value)} className="min-h-16" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" className="flex-1 bg-violet-600 text-white hover:bg-violet-700" onClick={() => void handleSubmitWhiteSharksPalmares()} disabled={isWhiteSharksSaving}>
                      {isWhiteSharksSaving ? "Enregistrement..." : editingWhiteSharksPalmaresId ? "Modifier" : "Ajouter"}
                    </Button>
                    {editingWhiteSharksPalmaresId ? <Button type="button" variant="outline" onClick={resetWhiteSharksPalmaresForm} disabled={isWhiteSharksSaving}>Annuler</Button> : null}
                  </div>
                  {whiteSharksPalmares.length > 0 ? (
                    <div className="space-y-2 pt-1">
                      {whiteSharksPalmares.map((entry) => (
                        <div key={entry.id} className="rounded-md border border-border/50 bg-muted/20 px-3 py-2">
                          <p className="text-sm font-medium">{entry.title} ({entry.year})</p>
                          {entry.description ? <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{entry.description}</p> : null}
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleEditWhiteSharksPalmares(entry)} disabled={isWhiteSharksSaving}>Modifier</Button>
                            <Button type="button" size="sm" variant="destructive" className="h-7 text-xs" onClick={() => void handleDeleteWhiteSharksPalmares(entry.id)} disabled={isWhiteSharksSaving}>Supprimer</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun palmarès pour le moment.</p>
                  )}
                </div>

                {/* Adhérents */}
                <div className="space-y-4 rounded-xl border border-border/50 p-4">
                  <h3 className="text-sm font-semibold">Adhérent</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="ws-p-fn" className="block text-sm font-medium mb-1.5">Prénom</label>
                      <Input id="ws-p-fn" value={whiteSharksPlayerFirstName} onChange={(e) => setWhiteSharksPlayerFirstName(e.target.value)} placeholder="Noah" />
                    </div>
                    <div>
                      <label htmlFor="ws-p-ln" className="block text-sm font-medium mb-1.5">Nom</label>
                      <Input id="ws-p-ln" value={whiteSharksPlayerLastName} onChange={(e) => setWhiteSharksPlayerLastName(e.target.value)} placeholder="Payet" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="ws-p-club" className="block text-sm font-medium mb-1.5">Club d'origine</label>
                    <Input id="ws-p-club" value={whiteSharksPlayerClub} onChange={(e) => setWhiteSharksPlayerClub(e.target.value)} placeholder="Tchouk'Leu" />
                  </div>
                  <div>
                    <label htmlFor="ws-p-type" className="block text-sm font-medium mb-1.5">Type de membre</label>
                    <select id="ws-p-type" value={whiteSharksPlayerMemberType} onChange={(e) => setWhiteSharksPlayerMemberType(e.target.value as WhiteSharksMemberType)} className={selectClass}>
                      {whiteSharksMemberTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1.5">Postes (optionnel)</p>
                    <div className="grid grid-cols-2 gap-2 rounded-md border border-input bg-background p-3 text-sm">
                      {[
                        { value: "ailierDroit", label: "Ailier droit" },
                        { value: "ailierGauche", label: "Ailier gauche" },
                        { value: "centreCadre", label: "Centre cadre" },
                        { value: "milieu", label: "Milieu" },
                      ].map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={whiteSharksPlayerPositions.includes(opt.value)}
                            onChange={(e) => setWhiteSharksPlayerPositions((prev) =>
                              e.target.checked ? [...prev, opt.value] : prev.filter((v) => v !== opt.value),
                            )}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="ws-p-birth" className="block text-sm font-medium mb-1.5">Année de naissance (optionnel)</label>
                    <Input id="ws-p-birth" type="number" min={1900} max={2100} value={whiteSharksPlayerBirthYear} onChange={(e) => setWhiteSharksPlayerBirthYear(e.target.value)} placeholder="1998" />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" className="flex-1 bg-violet-600 text-white hover:bg-violet-700" onClick={() => void handleSubmitWhiteSharksPlayer()} disabled={isWhiteSharksSaving}>
                      {isWhiteSharksSaving ? "Enregistrement..." : editingWhiteSharksPlayerId ? "Modifier" : "Ajouter"}
                    </Button>
                    {editingWhiteSharksPlayerId ? <Button type="button" variant="outline" onClick={resetWhiteSharksPlayerForm} disabled={isWhiteSharksSaving}>Annuler</Button> : null}
                  </div>
                  {whiteSharksPlayers.length > 0 ? (
                    <div className="space-y-2 pt-1">
                      {whiteSharksPlayers.map((player) => (
                        <div key={player.id} className="rounded-md border border-border/50 bg-muted/20 px-3 py-2">
                          <p className="text-sm font-medium">{player.firstName} {player.lastName}</p>
                          <p className="text-xs text-muted-foreground">{whiteSharksMemberTypeLabelByValue[player.memberType]} · {player.club}</p>
                          {player.birthYear ? <p className="text-xs text-muted-foreground">{player.birthYear}</p> : null}
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleEditWhiteSharksPlayer(player)} disabled={isWhiteSharksSaving}>Modifier</Button>
                            <Button type="button" size="sm" variant="destructive" className="h-7 text-xs" onClick={() => void handleDeleteWhiteSharksPlayer(player.id)} disabled={isWhiteSharksSaving}>Supprimer</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun joueur pour le moment.</p>
                  )}
                </div>
              </div>

              {whiteSharksFeedbackMessage ? (
                <p className="mt-4 text-sm text-muted-foreground">{whiteSharksFeedbackMessage}</p>
              ) : null}
            </CardContent>
          </Card>
        </section>
        </>}
      </div>
    </div>
  );
}
