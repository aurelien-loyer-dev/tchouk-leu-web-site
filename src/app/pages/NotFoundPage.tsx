import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";

const REDIRECT_SECONDS = 10;

export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) {
      navigate("/", { replace: true });
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSecondsLeft((previousSeconds) => previousSeconds - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [secondsLeft, navigate]);

  return (
    <section className="min-h-[60vh] px-6 py-20 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-background/90 p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t("notFound.title")}
        </h1>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          {t("notFound.description")}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/">{t("notFound.backToMenu")}</Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            {t("notFound.redirectIn", { seconds: secondsLeft })}
          </p>
        </div>
      </div>
    </section>
  );
}
