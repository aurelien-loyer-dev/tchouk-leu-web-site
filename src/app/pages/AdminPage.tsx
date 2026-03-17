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
import { loadAttendanceSummaryForAdmin, type AttendanceSummary } from "../data/attendanceVotes";
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
  { value: "benevole", label: "Bénévole" },
];

const whiteSharksMemberTypeLabelByValue: Record<WhiteSharksMemberType, string> = {
  joueur: "Joueur",
  capitaine: "Capitaine",
  coach: "Coach",
  benevole: "Bénévole",
};

const wallFunctionOptions: Array<{ value: WallOfFameFunction; label: string }> = [
  { value: "coach", label: "Coach" },
  { value: "joueur", label: "Joueur" },
  { value: "benevole", label: "Bénévole" },
  { value: "president", label: "Président" },
];

const wallFunctionLabelByValue = wallFunctionOptions.reduce<Record<WallOfFameFunction, string>>((accumulator, option) => {
  accumulator[option.value] = option.label;
  return accumulator;
}, {
  coach: "Coach",
  joueur: "Joueur",
  benevole: "Bénévole",
  president: "Président",
});

function sanitizeWallPalmaresByFunction(
  functions: WallOfFameFunction[],
  palmaresByFunction: Partial<Record<WallOfFameFunction, string>>,
): WallOfFamePalmaresByFunction {
  return functions.reduce<WallOfFamePalmaresByFunction>((accumulator, functionValue) => {
    const value = palmaresByFunction[functionValue]?.trim() ?? "";

    if (value) {
      accumulator[functionValue] = value;
    }

    return accumulator;
  }, {});
}

function getWallPalmaresByFunctionFromMember(member: WallOfFameMember): WallOfFamePalmaresByFunction {
  const normalizedPalmares = sanitizeWallPalmaresByFunction(member.functions, member.palmaresByFunction ?? {});

  if (Object.keys(normalizedPalmares).length > 0) {
    return normalizedPalmares;
  }

  if (member.palmares?.trim()) {
    return member.functions.reduce<WallOfFamePalmaresByFunction>((accumulator, functionValue) => {
      accumulator[functionValue] = member.palmares?.trim() ?? "";
      return accumulator;
    }, {});
  }

  return {};
}

function getWallPalmaresSummary(member: WallOfFameMember) {
  const palmaresByFunction = getWallPalmaresByFunctionFromMember(member);

  return member.functions
    .map((functionValue) => {
      const palmares = palmaresByFunction[functionValue]?.trim() ?? "";

      if (!palmares) {
        return null;
      }

      return `${wallFunctionLabelByValue[functionValue]}: ${palmares}`;
    })
    .filter((value): value is string => Boolean(value));
}

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

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => resolve(typeof fileReader.result === "string" ? fileReader.result : "");
    fileReader.onerror = () => reject(new Error("Impossible de lire le fichier image."));
    fileReader.readAsDataURL(file);
  });
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
  const [whiteSharksPalmaresYear, setWhiteSharksPalmaresYear] = useState("");
  const [whiteSharksPalmaresDescription, setWhiteSharksPalmaresDescription] = useState("");
  const [editingWhiteSharksPalmaresId, setEditingWhiteSharksPalmaresId] = useState<string | null>(null);
  const [whiteSharksPlayerFirstName, setWhiteSharksPlayerFirstName] = useState("");
  const [whiteSharksPlayerLastName, setWhiteSharksPlayerLastName] = useState("");
  const [whiteSharksPlayerClub, setWhiteSharksPlayerClub] = useState("");
  const [whiteSharksPlayerPosition, setWhiteSharksPlayerPosition] = useState("");
  const [whiteSharksPlayerBirthYear, setWhiteSharksPlayerBirthYear] = useState("");
  const [whiteSharksPlayerMemberType, setWhiteSharksPlayerMemberType] = useState<WhiteSharksMemberType>("joueur");
  const [editingWhiteSharksPlayerId, setEditingWhiteSharksPlayerId] = useState<string | null>(null);
  const [whiteSharksFeedbackMessage, setWhiteSharksFeedbackMessage] = useState("");
  const [isWhiteSharksSaving, setIsWhiteSharksSaving] = useState(false);
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        const authenticated = await checkAdminSession();
        setIsAuthenticated(authenticated);

        if (!authenticated) {
          return;
        }

        const loadedActivities = await loadActivities();
        const loadedGalleryPhotos = await loadGalleryPhotos();
        const loadedWallOfFameMembers = await loadWallOfFameMembers();
        const loadedWhiteSharksData = await loadWhiteSharksData();
        setActivities(loadedActivities);
        setGalleryPhotos(loadedGalleryPhotos);
        setWallOfFameMembers(loadedWallOfFameMembers);
        setWhiteSharksPalmares(loadedWhiteSharksData.palmares);
        setWhiteSharksPlayers(loadedWhiteSharksData.players);
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

  const recurringOccurrencesByTemplate = useMemo(() => {
    const map = new Map<string, Activity[]>();

    for (const activity of activities) {
      const templateId = getRecurringTemplateId(activity.id);
      if (!templateId) continue;
      const existing = map.get(templateId) ?? [];
      existing.push(activity);
      map.set(templateId, existing);
    }

    for (const [key, occs] of map.entries()) {
      map.set(key, [...occs].sort(compareActivitiesByDate));
    }

    return map;
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
      const loadedGalleryPhotos = await loadGalleryPhotos();
      const loadedWallOfFameMembers = await loadWallOfFameMembers();
      setIsAuthenticated(true);
      setActivities(loadedActivities);
      setGalleryPhotos(loadedGalleryPhotos);
      setWallOfFameMembers(loadedWallOfFameMembers);
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

  const toggleExpandedTemplate = (templateId: string) => {
    setExpandedTemplates((current) => {
      const next = new Set(current);
      if (next.has(templateId)) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }
      return next;
    });
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

  const handleUploadGalleryAlbum = async () => {
    if (galleryFiles.length === 0) {
      setGalleryFeedbackMessage("Selectionnez au moins une photo pour l'album.");
      return;
    }

    if (!galleryAlbumTitle.trim()) {
      setGalleryFeedbackMessage("Ajoutez un titre d'album.");
      return;
    }

    try {
      setIsGallerySaving(true);
      setGalleryFeedbackMessage("");
      const albumPhotoPayload = await Promise.all(
        galleryFiles.map(async (file) => {
          const src = await fileToDataUrl(file);

          if (!src) {
            throw new Error("Impossible de convertir une des photos.");
          }

          return {
            src,
            alt: file.name,
          };
        }),
      );

      const nextPhotos = await uploadGalleryAlbum({
        title: galleryAlbumTitle.trim(),
        category: galleryCategory,
        photos: albumPhotoPayload,
      });

      setGalleryPhotos(nextPhotos);
      setGalleryAlbumTitle("");
      setGalleryFiles([]);
      setGalleryFeedbackMessage("Album ajoute dans la galerie.");
    } catch (error) {
      if (error instanceof Error && error.message) {
        setGalleryFeedbackMessage(error.message);
      } else {
        setGalleryFeedbackMessage("Impossible d'ajouter l'album.");
      }
    } finally {
      setIsGallerySaving(false);
    }
  };

  const handleDeleteGalleryPhoto = async (photoId: string) => {
    try {
      setIsGallerySaving(true);
      setGalleryFeedbackMessage("");
      const nextPhotos = await deleteGalleryPhoto(photoId);
      setGalleryPhotos(nextPhotos);
      setGalleryFeedbackMessage("Photo supprimee de la galerie.");
    } catch (error) {
      if (error instanceof Error && error.message) {
        setGalleryFeedbackMessage(error.message);
      } else {
        setGalleryFeedbackMessage("Impossible de supprimer la photo.");
      }
    } finally {
      setIsGallerySaving(false);
    }
  };

  const resetWallForm = () => {
    setWallFirstName("");
    setWallLastName("");
    setWallPalmaresByFunction({});
    setWallMemberSince("");
    setWallFunctions([]);
    setWallPhotoFile(null);
    setEditingWallMemberId(null);
  };

  const handleEditWallOfFameMember = (member: WallOfFameMember) => {
    setEditingWallMemberId(member.id);
    setWallFirstName(member.firstName);
    setWallLastName(member.lastName);
    setWallPalmaresByFunction(getWallPalmaresByFunctionFromMember(member));
    setWallMemberSince(member.memberSince);
    setWallFunctions(member.functions);
    setWallPhotoFile(null);
    setWallFeedbackMessage("Mode modification activé. Ajoutez une nouvelle photo uniquement si nécessaire.");
  };

  const toggleWallFunction = (functionValue: WallOfFameFunction) => {
    setWallFunctions((current) => {
      if (current.includes(functionValue)) {
        setWallPalmaresByFunction((palmaresByFunction) => {
          const nextPalmaresByFunction = { ...palmaresByFunction };
          delete nextPalmaresByFunction[functionValue];
          return nextPalmaresByFunction;
        });
        return current.filter((entry) => entry !== functionValue);
      }

      return [...current, functionValue];
    });
  };

  const updateWallPalmares = (functionValue: WallOfFameFunction, value: string) => {
    setWallPalmaresByFunction((current) => ({
      ...current,
      [functionValue]: value,
    }));
  };

  const handleSubmitWallOfFameMember = async () => {
    if (!wallFirstName.trim() || !wallLastName.trim()) {
      setWallFeedbackMessage("Le prénom et le nom sont obligatoires.");
      return;
    }

    if (!wallMemberSince.trim()) {
      setWallFeedbackMessage("Le champ 'adhérent depuis' est obligatoire.");
      return;
    }

    if (wallFunctions.length === 0) {
      setWallFeedbackMessage("Sélectionnez au moins une fonction.");
      return;
    }

    if (!editingWallMemberId && !wallPhotoFile) {
      setWallFeedbackMessage("Ajoutez une photo.");
      return;
    }

    try {
      setIsWallSaving(true);
      setWallFeedbackMessage("");
      const photoSrc = wallPhotoFile ? await fileToDataUrl(wallPhotoFile) : "";

      if (wallPhotoFile && !photoSrc) {
        throw new Error("Impossible de convertir la photo.");
      }

      const normalizedPalmaresByFunction = sanitizeWallPalmaresByFunction(wallFunctions, wallPalmaresByFunction);

      const nextMembers = editingWallMemberId
        ? await updateWallOfFameMember({
            id: editingWallMemberId,
            firstName: wallFirstName.trim(),
            lastName: wallLastName.trim(),
            palmaresByFunction: normalizedPalmaresByFunction,
            memberSince: wallMemberSince.trim(),
            functions: wallFunctions,
            ...(photoSrc ? { photoSrc } : {}),
          })
        : await createWallOfFameMember({
            firstName: wallFirstName.trim(),
            lastName: wallLastName.trim(),
            palmaresByFunction: normalizedPalmaresByFunction,
            memberSince: wallMemberSince.trim(),
            functions: wallFunctions,
            photoSrc,
          });

      setWallOfFameMembers(nextMembers);
      resetWallForm();
      setWallFeedbackMessage(editingWallMemberId ? "Profil modifié dans le Wall of Fame." : "Profil ajouté au Wall of Fame.");
    } catch (error) {
      if (error instanceof Error && error.message) {
        setWallFeedbackMessage(error.message);
      } else {
        setWallFeedbackMessage("Impossible d'ajouter le profil.");
      }
    } finally {
      setIsWallSaving(false);
    }
  };

  const handleDeleteWallOfFameMember = async (memberId: string) => {
    try {
      setIsWallSaving(true);
      setWallFeedbackMessage("");
      const nextMembers = await deleteWallOfFameMember(memberId);
      setWallOfFameMembers(nextMembers);
      setWallFeedbackMessage("Profil supprimé du Wall of Fame.");
    } catch (error) {
      if (error instanceof Error && error.message) {
        setWallFeedbackMessage(error.message);
      } else {
        setWallFeedbackMessage("Impossible de supprimer le profil.");
      }
    } finally {
      setIsWallSaving(false);
    }
  };

  const resetWhiteSharksPalmaresForm = () => {
    setWhiteSharksPalmaresTitle("");
    setWhiteSharksPalmaresYear("");
    setWhiteSharksPalmaresDescription("");
    setEditingWhiteSharksPalmaresId(null);
  };

  const resetWhiteSharksPlayerForm = () => {
    setWhiteSharksPlayerFirstName("");
    setWhiteSharksPlayerLastName("");
    setWhiteSharksPlayerClub("");
    setWhiteSharksPlayerPosition("");
    setWhiteSharksPlayerBirthYear("");
    setWhiteSharksPlayerMemberType("joueur");
    setEditingWhiteSharksPlayerId(null);
  };

  const handleEditWhiteSharksPalmares = (entry: WhiteSharksPalmaresEntry) => {
    setEditingWhiteSharksPalmaresId(entry.id);
    setWhiteSharksPalmaresTitle(entry.title);
    setWhiteSharksPalmaresYear(entry.year);
    setWhiteSharksPalmaresDescription(entry.description);
    setWhiteSharksFeedbackMessage("Mode modification du palmarès activé.");
  };

  const handleEditWhiteSharksPlayer = (player: WhiteSharksPlayer) => {
    setEditingWhiteSharksPlayerId(player.id);
    setWhiteSharksPlayerFirstName(player.firstName);
    setWhiteSharksPlayerLastName(player.lastName);
    setWhiteSharksPlayerClub(player.club);
    setWhiteSharksPlayerPosition(player.position);
    setWhiteSharksPlayerBirthYear(player.birthYear !== undefined ? String(player.birthYear) : "");
    setWhiteSharksPlayerMemberType(player.memberType);
    setWhiteSharksFeedbackMessage("Mode modification joueur activé.");
  };

  const handleSubmitWhiteSharksPalmares = async () => {
    if (!whiteSharksPalmaresTitle.trim()) {
      setWhiteSharksFeedbackMessage("Le titre du palmarès est obligatoire.");
      return;
    }

    if (!whiteSharksPalmaresYear.trim()) {
      setWhiteSharksFeedbackMessage("L'année du palmarès est obligatoire.");
      return;
    }

    try {
      setIsWhiteSharksSaving(true);
      setWhiteSharksFeedbackMessage("");

      const nextData = editingWhiteSharksPalmaresId
        ? await updateWhiteSharksPalmares({
            id: editingWhiteSharksPalmaresId,
            title: whiteSharksPalmaresTitle.trim(),
            year: whiteSharksPalmaresYear.trim(),
            description: whiteSharksPalmaresDescription.trim(),
          })
        : await createWhiteSharksPalmares({
            title: whiteSharksPalmaresTitle.trim(),
            year: whiteSharksPalmaresYear.trim(),
            description: whiteSharksPalmaresDescription.trim(),
          });

      setWhiteSharksPalmares(nextData.palmares ?? []);
      setWhiteSharksPlayers(nextData.players ?? []);
      resetWhiteSharksPalmaresForm();
      setWhiteSharksFeedbackMessage(editingWhiteSharksPalmaresId ? "Palmarès White Sharks modifié." : "Palmarès White Sharks ajouté.");
    } catch (error) {
      if (error instanceof Error && error.message) {
        setWhiteSharksFeedbackMessage(error.message);
      } else {
        setWhiteSharksFeedbackMessage("Impossible d'enregistrer le palmarès White Sharks.");
      }
    } finally {
      setIsWhiteSharksSaving(false);
    }
  };

  const handleDeleteWhiteSharksPalmares = async (entryId: string) => {
    try {
      setIsWhiteSharksSaving(true);
      setWhiteSharksFeedbackMessage("");
      const nextData = await deleteWhiteSharksPalmares(entryId);
      setWhiteSharksPalmares(nextData.palmares ?? []);
      setWhiteSharksPlayers(nextData.players ?? []);
      setWhiteSharksFeedbackMessage("Palmarès White Sharks supprimé.");
    } catch (error) {
      if (error instanceof Error && error.message) {
        setWhiteSharksFeedbackMessage(error.message);
      } else {
        setWhiteSharksFeedbackMessage("Impossible de supprimer le palmarès White Sharks.");
      }
    } finally {
      setIsWhiteSharksSaving(false);
    }
  };

  const handleSubmitWhiteSharksPlayer = async () => {
    if (!whiteSharksPlayerFirstName.trim() || !whiteSharksPlayerLastName.trim()) {
      setWhiteSharksFeedbackMessage("Le prénom et le nom du joueur sont obligatoires.");
      return;
    }

    if (!whiteSharksPlayerClub.trim()) {
      setWhiteSharksFeedbackMessage("Le club d'origine du joueur est obligatoire.");
      return;
    }

    try {
      setIsWhiteSharksSaving(true);
      setWhiteSharksFeedbackMessage("");

      const parsedBirthYear = whiteSharksPlayerBirthYear.trim() ? Number(whiteSharksPlayerBirthYear.trim()) : undefined;
      const birthYearPayload = parsedBirthYear && Number.isInteger(parsedBirthYear) ? { birthYear: parsedBirthYear } : {};

      const nextData = editingWhiteSharksPlayerId
        ? await updateWhiteSharksPlayer({
            id: editingWhiteSharksPlayerId,
            firstName: whiteSharksPlayerFirstName.trim(),
            lastName: whiteSharksPlayerLastName.trim(),
            club: whiteSharksPlayerClub.trim(),
            position: whiteSharksPlayerPosition.trim(),
            memberType: whiteSharksPlayerMemberType,
            ...birthYearPayload,
          })
        : await createWhiteSharksPlayer({
            firstName: whiteSharksPlayerFirstName.trim(),
            lastName: whiteSharksPlayerLastName.trim(),
            club: whiteSharksPlayerClub.trim(),
            position: whiteSharksPlayerPosition.trim(),
            memberType: whiteSharksPlayerMemberType,
            ...birthYearPayload,
          });

      setWhiteSharksPalmares(nextData.palmares ?? []);
      setWhiteSharksPlayers(nextData.players ?? []);
      resetWhiteSharksPlayerForm();
      setWhiteSharksFeedbackMessage(editingWhiteSharksPlayerId ? "Joueur White Sharks modifié." : "Joueur White Sharks ajouté.");
    } catch (error) {
      if (error instanceof Error && error.message) {
        setWhiteSharksFeedbackMessage(error.message);
      } else {
        setWhiteSharksFeedbackMessage("Impossible d'enregistrer le joueur White Sharks.");
      }
    } finally {
      setIsWhiteSharksSaving(false);
    }
  };

  const handleDeleteWhiteSharksPlayer = async (playerId: string) => {
    try {
      setIsWhiteSharksSaving(true);
      setWhiteSharksFeedbackMessage("");
      const nextData = await deleteWhiteSharksPlayer(playerId);
      setWhiteSharksPalmares(nextData.palmares ?? []);
      setWhiteSharksPlayers(nextData.players ?? []);
      setWhiteSharksFeedbackMessage("Joueur White Sharks supprimé.");
    } catch (error) {
      if (error instanceof Error && error.message) {
        setWhiteSharksFeedbackMessage(error.message);
      } else {
        setWhiteSharksFeedbackMessage("Impossible de supprimer le joueur White Sharks.");
      }
    } finally {
      setIsWhiteSharksSaving(false);
    }
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

                if (!recurringTemplateId) {
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
                    </button>
                  );
                }

                const isExpanded = expandedTemplates.has(recurringTemplateId);
                const occurrences = recurringOccurrencesByTemplate.get(recurringTemplateId) ?? [];
                const hasSelectedOccurrence = occurrences.some((o) => o.id === selectedId);

                return (
                  <div
                    key={activity.id}
                    className={`rounded-xl border overflow-hidden transition-colors ${
                      hasSelectedOccurrence ? "border-[#4C93C3]" : "border-border"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpandedTemplate(recurringTemplateId)}
                      className="w-full p-4 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{activity.title}</p>
                            <ChevronDown
                              className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Recurrent • {recurringOccurrencesCount} seances enregistrees
                          </p>
                        </div>
                        <span className="rounded-full bg-[#4C93C3]/10 px-2.5 py-1 text-xs font-medium text-[#4C93C3] shrink-0">
                          {getCategoryLabel(activity.category)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{activity.location}</p>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border/60 divide-y divide-border/40 bg-muted/10">
                        {occurrences.map((occurrence) => (
                          <button
                            key={occurrence.id}
                            type="button"
                            onClick={() => handleSelectActivity(occurrence)}
                            className={`w-full px-4 py-3 text-left transition-colors ${
                              selectedId === occurrence.id
                                ? "bg-[#4C93C3]/10 text-[#4C93C3]"
                                : "hover:bg-muted/30"
                            }`}
                          >
                            <p className={`text-sm font-medium ${selectedId === occurrence.id ? "text-[#4C93C3]" : ""}`}>
                              {dateFormatter.format(new Date(`${occurrence.date}T00:00:00`))}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {occurrence.startTime} - {occurrence.endTime}
                              {occurrence.audience ? ` • ${occurrence.audience}` : ""}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
                    placeholder="Ex: M12 / M15"
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

      <section className="pb-20 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <Card className="border-2 border-[#4C93C3]/20">
            <CardHeader>
              <CardTitle className="text-2xl">Galerie photos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid lg:grid-cols-[1.1fr_1.9fr] gap-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="gallery-file" className="mb-2 block font-medium">Photo</label>
                    <Input
                      id="gallery-file"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) => setGalleryFiles(Array.from(event.target.files ?? []))}
                    />
                  </div>
                  <div>
                    <label htmlFor="gallery-alt" className="mb-2 block font-medium">Titre de l'album</label>
                    <Input
                      id="gallery-alt"
                      value={galleryAlbumTitle}
                      onChange={(event) => setGalleryAlbumTitle(event.target.value)}
                      placeholder="Ex: Tournoi regional 2026"
                    />
                  </div>
                  <div>
                    <label htmlFor="gallery-category" className="mb-2 block font-medium">Categorie</label>
                    <select
                      id="gallery-category"
                      value={galleryCategory}
                      onChange={(event) => setGalleryCategory(event.target.value as GalleryCategory)}
                      className="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-md border bg-input-background px-3 outline-none focus-visible:ring-[3px]"
                    >
                      <option value="matches">Matchs</option>
                      <option value="training">Entrainements</option>
                      <option value="events">Evenements</option>
                    </select>
                  </div>

                  <Button
                    type="button"
                    className="w-full bg-[#4C93C3] text-white hover:bg-[#3a7ba8]"
                    onClick={() => void handleUploadGalleryAlbum()}
                    disabled={isGallerySaving}
                  >
                    {isGallerySaving ? "Enregistrement..." : "Ajouter l'album"}
                  </Button>

                  {galleryFeedbackMessage ? (
                    <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">{galleryFeedbackMessage}</p>
                  ) : null}
                </div>

                <div>
                  {galleryPhotos.length > 0 ? (
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {galleryPhotos.map((photo) => (
                        <div key={photo.id} className="rounded-xl border border-border overflow-hidden bg-background">
                          <ImageWithFallback src={photo.src} alt={photo.alt} className="h-36 w-full object-cover" />
                          <div className="p-3 space-y-2">
                            <p className="text-sm font-medium line-clamp-2">{photo.alt}</p>
                            {photo.albumTitle ? <p className="text-xs text-muted-foreground">Album: {photo.albumTitle}</p> : null}
                            <p className="text-xs text-muted-foreground">{photo.category}</p>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="w-full"
                              onClick={() => void handleDeleteGalleryPhoto(photo.id)}
                              disabled={isGallerySaving}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucune photo dans la galerie pour le moment.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="pb-20 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <Card className="border-2 border-[#4C93C3]/20">
            <CardHeader>
              <CardTitle className="text-2xl">Wall of Fame</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid lg:grid-cols-[1.1fr_1.9fr] gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="wall-first-name" className="mb-2 block font-medium">Prénom</label>
                      <Input
                        id="wall-first-name"
                        value={wallFirstName}
                        onChange={(event) => setWallFirstName(event.target.value)}
                        placeholder="Ex: Lucas"
                      />
                    </div>
                    <div>
                      <label htmlFor="wall-last-name" className="mb-2 block font-medium">Nom</label>
                      <Input
                        id="wall-last-name"
                        value={wallLastName}
                        onChange={(event) => setWallLastName(event.target.value)}
                        placeholder="Ex: Hoareau"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="wall-member-since" className="mb-2 block font-medium">Adhérent depuis</label>
                    <Input
                      id="wall-member-since"
                      value={wallMemberSince}
                      onChange={(event) => setWallMemberSince(event.target.value)}
                      placeholder="Ex: 2019"
                    />
                  </div>

                  <div>
                    <label htmlFor="wall-photo" className="mb-2 block font-medium">Photo</label>
                    <Input
                      id="wall-photo"
                      type="file"
                      accept="image/*"
                      onChange={(event) => setWallPhotoFile(event.target.files?.[0] ?? null)}
                    />
                    {editingWallMemberId ? (
                      <p className="mt-1 text-xs text-muted-foreground">Laissez vide pour conserver la photo actuelle.</p>
                    ) : null}
                  </div>

                  <div>
                    <p className="mb-2 block font-medium">Fonctions</p>
                    <div className="grid grid-cols-2 gap-2 rounded-md border border-border/60 p-3">
                      {wallFunctionOptions.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={wallFunctions.includes(option.value)}
                            onChange={() => toggleWallFunction(option.value)}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium">Palmarès par fonction (optionnel)</p>
                    {wallFunctions.length > 0 ? (
                      <div className="space-y-3">
                        {wallFunctions.map((functionValue) => (
                          <div key={functionValue}>
                            <label htmlFor={`wall-palmares-${functionValue}`} className="mb-2 block text-sm text-muted-foreground">
                              {wallFunctionLabelByValue[functionValue]}
                            </label>
                            <Textarea
                              id={`wall-palmares-${functionValue}`}
                              value={wallPalmaresByFunction[functionValue] ?? ""}
                              onChange={(event) => updateWallPalmares(functionValue, event.target.value)}
                              placeholder="Laissez vide pour masquer ce palmarès"
                              className="min-h-20"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sélectionnez au moins une fonction pour saisir un palmarès.</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      className="flex-1 bg-[#4C93C3] text-white hover:bg-[#3a7ba8]"
                      onClick={() => void handleSubmitWallOfFameMember()}
                      disabled={isWallSaving}
                    >
                      {isWallSaving ? "Enregistrement..." : editingWallMemberId ? "Modifier" : "Ajouter"}
                    </Button>
                    {editingWallMemberId ? (
                      <Button type="button" variant="outline" onClick={resetWallForm} disabled={isWallSaving}>
                        Annuler
                      </Button>
                    ) : null}
                  </div>

                  {wallFeedbackMessage ? (
                    <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">{wallFeedbackMessage}</p>
                  ) : null}
                </div>

                <div>
                  {wallOfFameMembers.length > 0 ? (
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {wallOfFameMembers.map((member) => (
                        <div key={member.id} className="rounded-xl border border-border overflow-hidden bg-background">
                          <ImageWithFallback
                            src={member.photoSrc}
                            alt={`${member.firstName} ${member.lastName}`}
                            className="h-36 w-full object-cover"
                          />
                          <div className="p-3 space-y-2">
                            <p className="text-sm font-semibold">{member.firstName} {member.lastName}</p>
                            <p className="text-xs text-muted-foreground">Adhérent depuis: {member.memberSince}</p>
                            <p className="text-xs text-muted-foreground">Fonctions: {member.functions.join(" • ")}</p>
                            {getWallPalmaresSummary(member).length > 0 ? (
                              <p className="text-xs text-muted-foreground line-clamp-3">{getWallPalmaresSummary(member).join(" | ")}</p>
                            ) : null}
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => handleEditWallOfFameMember(member)}
                                disabled={isWallSaving}
                              >
                                Modifier
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="w-full"
                                onClick={() => void handleDeleteWallOfFameMember(member.id)}
                                disabled={isWallSaving}
                              >
                                Supprimer
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun profil Wall of Fame pour le moment.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="pb-20 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <Card className="border-2 border-violet-300/30 dark:border-violet-500/30">
            <CardHeader>
              <CardTitle className="text-2xl">White Sharks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid xl:grid-cols-2 gap-8">
                <div className="space-y-4 rounded-xl border border-border/60 p-4">
                  <h3 className="text-lg font-semibold">Palmarès</h3>
                  <div>
                    <label htmlFor="ws-palmares-title" className="mb-2 block font-medium">Titre</label>
                    <Input
                      id="ws-palmares-title"
                      value={whiteSharksPalmaresTitle}
                      onChange={(event) => setWhiteSharksPalmaresTitle(event.target.value)}
                      placeholder="Ex: Championnat régional"
                    />
                  </div>
                  <div>
                    <label htmlFor="ws-palmares-year" className="mb-2 block font-medium">Année</label>
                    <Input
                      id="ws-palmares-year"
                      value={whiteSharksPalmaresYear}
                      onChange={(event) => setWhiteSharksPalmaresYear(event.target.value)}
                      placeholder="Ex: 2026"
                    />
                  </div>
                  <div>
                    <label htmlFor="ws-palmares-description" className="mb-2 block font-medium">Description (optionnel)</label>
                    <Textarea
                      id="ws-palmares-description"
                      value={whiteSharksPalmaresDescription}
                      onChange={(event) => setWhiteSharksPalmaresDescription(event.target.value)}
                      className="min-h-20"
                      placeholder="Ex: Finale remportée face à ..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      className="flex-1 bg-violet-600 text-white hover:bg-violet-700"
                      onClick={() => void handleSubmitWhiteSharksPalmares()}
                      disabled={isWhiteSharksSaving}
                    >
                      {isWhiteSharksSaving ? "Enregistrement..." : editingWhiteSharksPalmaresId ? "Modifier" : "Ajouter"}
                    </Button>
                    {editingWhiteSharksPalmaresId ? (
                      <Button type="button" variant="outline" onClick={resetWhiteSharksPalmaresForm} disabled={isWhiteSharksSaving}>
                        Annuler
                      </Button>
                    ) : null}
                  </div>

                  {whiteSharksPalmares.length > 0 ? (
                    <div className="space-y-2 pt-2">
                      {whiteSharksPalmares.map((entry) => (
                        <div key={entry.id} className="rounded-md border border-border/60 bg-muted/20 px-3 py-2">
                          <p className="text-sm font-medium">{entry.title} ({entry.year})</p>
                          {entry.description ? <p className="text-xs text-muted-foreground mt-1">{entry.description}</p> : null}
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditWhiteSharksPalmares(entry)}
                              disabled={isWhiteSharksSaving}
                            >
                              Modifier
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => void handleDeleteWhiteSharksPalmares(entry.id)}
                              disabled={isWhiteSharksSaving}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun palmarès White Sharks pour le moment.</p>
                  )}
                </div>

                <div className="space-y-4 rounded-xl border border-border/60 p-4">
                  <h3 className="text-lg font-semibold">Joueurs</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="ws-player-first-name" className="mb-2 block font-medium">Prénom</label>
                      <Input
                        id="ws-player-first-name"
                        value={whiteSharksPlayerFirstName}
                        onChange={(event) => setWhiteSharksPlayerFirstName(event.target.value)}
                        placeholder="Ex: Noah"
                      />
                    </div>
                    <div>
                      <label htmlFor="ws-player-last-name" className="mb-2 block font-medium">Nom</label>
                      <Input
                        id="ws-player-last-name"
                        value={whiteSharksPlayerLastName}
                        onChange={(event) => setWhiteSharksPlayerLastName(event.target.value)}
                        placeholder="Ex: Payet"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="ws-player-club" className="mb-2 block font-medium">Club d'origine</label>
                    <Input
                      id="ws-player-club"
                      value={whiteSharksPlayerClub}
                      onChange={(event) => setWhiteSharksPlayerClub(event.target.value)}
                      placeholder="Ex: Tchouk'Leu"
                    />
                  </div>
                  <div>
                    <label htmlFor="ws-player-member-type" className="mb-2 block font-medium">Type de membre</label>
                    <select
                      id="ws-player-member-type"
                      value={whiteSharksPlayerMemberType}
                      onChange={(event) => setWhiteSharksPlayerMemberType(event.target.value as WhiteSharksMemberType)}
                      className="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-md border bg-input-background px-3 outline-none focus-visible:ring-[3px]"
                    >
                      {whiteSharksMemberTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ws-player-position" className="mb-2 block font-medium">Poste / rôle (optionnel)</label>
                    <select
                      id="ws-player-position"
                      value={whiteSharksPlayerPosition}
                      onChange={(event) => setWhiteSharksPlayerPosition(event.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">— Aucun poste —</option>
                      <option value="attaquant">Attaquant</option>
                      <option value="defenseur">Défenseur</option>
                      <option value="pivot">Pivot</option>
                      <option value="ailier">Ailier</option>
                      <option value="arriere">Arrière</option>
                      <option value="libero">Libéro</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ws-player-birth-year" className="mb-2 block font-medium">Année de naissance (optionnel)</label>
                    <Input
                      id="ws-player-birth-year"
                      type="number"
                      min={1900}
                      max={2100}
                      value={whiteSharksPlayerBirthYear}
                      onChange={(event) => setWhiteSharksPlayerBirthYear(event.target.value)}
                      placeholder="Ex: 1998"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      className="flex-1 bg-violet-600 text-white hover:bg-violet-700"
                      onClick={() => void handleSubmitWhiteSharksPlayer()}
                      disabled={isWhiteSharksSaving}
                    >
                      {isWhiteSharksSaving ? "Enregistrement..." : editingWhiteSharksPlayerId ? "Modifier" : "Ajouter"}
                    </Button>
                    {editingWhiteSharksPlayerId ? (
                      <Button type="button" variant="outline" onClick={resetWhiteSharksPlayerForm} disabled={isWhiteSharksSaving}>
                        Annuler
                      </Button>
                    ) : null}
                  </div>

                  {whiteSharksPlayers.length > 0 ? (
                    <div className="space-y-2 pt-2">
                      {whiteSharksPlayers.map((player) => (
                        <div key={player.id} className="rounded-md border border-border/60 bg-muted/20 px-3 py-2">
                          <p className="text-sm font-medium">{player.firstName} {player.lastName}</p>
                          <p className="text-xs text-muted-foreground">Type: {whiteSharksMemberTypeLabelByValue[player.memberType]}</p>
                          <p className="text-xs text-muted-foreground">Club: {player.club}</p>
                          {player.position ? <p className="text-xs text-muted-foreground">Rôle: {player.position}</p> : null}
                          {player.birthYear ? <p className="text-xs text-muted-foreground">Né en {player.birthYear}</p> : null}
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditWhiteSharksPlayer(player)}
                              disabled={isWhiteSharksSaving}
                            >
                              Modifier
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => void handleDeleteWhiteSharksPlayer(player.id)}
                              disabled={isWhiteSharksSaving}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun joueur White Sharks pour le moment.</p>
                  )}
                </div>
              </div>

              {whiteSharksFeedbackMessage ? (
                <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">{whiteSharksFeedbackMessage}</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
