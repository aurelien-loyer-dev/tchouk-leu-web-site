import { motion } from "motion/react";
import { Mail, MapPin, Instagram, Phone, Send, MessageCircle } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export function ContactPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    website: "",
  });
  const [formStartedAt] = useState(() => Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setSubmitStatus("idle");
      setSubmitMessage("");

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          website: formData.website,
          formStartedAt,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Impossible d'envoyer le message.";
        try {
          const payload = (await response.json()) as { error?: string };
          if (payload.error) errorMessage = payload.error;
        } catch {
          // ignore
        }
        throw new Error(errorMessage);
      }

      setSubmitStatus("success");
      setSubmitMessage(t("contact.successMessage"));
      setFormData({ name: "", email: "", phone: "", message: "", website: "" });
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        error instanceof Error && error.message ? error.message : t("contact.errorMessage"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactGroups = [
    {
      icon: Mail,
      title: "Email",
      items: [
        { label: "bgaillard.pro@gmail.com", href: "mailto:bgaillard.pro@gmail.com" },
        { label: "nicolasg97424@gmail.com", href: "mailto:nicolasg97424@gmail.com" },
      ],
    },
    {
      icon: Phone,
      title: t("contact.phone_label"),
      items: [
        { label: "+33 656 71 40 37", href: "tel:+33656714037" },
        { label: "+262 692 812102", href: "tel:+262692812102" },
      ],
    },
    {
      icon: Instagram,
      title: "Instagram",
      items: [{ label: "@tchoukleu", href: "https://instagram.com/tchoukleu" }],
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      items: [{ label: "Rejoindre la communauté", href: "https://chat.whatsapp.com/Dn7DkSqHQwF9udNhYwQ076" }],
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-24 pb-14 px-6 bg-gradient-to-b from-[#EAF2F6] to-background dark:from-[#1E2D36] dark:to-background">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{t("contact.title")}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {t("contact.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form + Info */}
      <section className="py-16 px-6 bg-background border-t border-border/40">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold mb-6 tracking-tight">{t("contact.sendMessage")}</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                  <label htmlFor="website">Site web</label>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                    {t("contact.fullName")}
                  </label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t("contact.yourName")}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                    {t("contact.email")}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t("contact.yourEmail")}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                    {t("contact.phone")}
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t("contact.yourPhone")}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1.5">
                    {t("contact.message")}
                  </label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={t("contact.yourMessage")}
                    rows={6}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-[#5B7D95] hover:bg-[#4E6C83] text-white"
                  disabled={isSubmitting}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? t("contact.sending") : t("contact.send")}
                </Button>

                {submitMessage ? (
                  <p
                    className={`text-sm ${
                      submitStatus === "success" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {submitMessage}
                  </p>
                ) : null}
              </form>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2 tracking-tight">{t("contact.ourCoords")}</h2>
                <p className="text-muted-foreground">{t("contact.reachUs")}</p>
              </div>

              <div className="space-y-6">
                {contactGroups.map((group) => (
                  <div key={group.title} className="flex gap-4">
                    <group.icon className="h-5 w-5 text-[#5B7D95] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                        {group.title}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map((item) => (
                          <a
                            key={item.href}
                            href={item.href}
                            target={item.href.startsWith("http") ? "_blank" : undefined}
                            rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                            className="block text-sm font-medium hover:text-[#5B7D95] transition-colors"
                          >
                            {item.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/50 pt-6">
                <p className="text-sm font-semibold mb-2">{t("contact.contactHours")}</p>
                <p className="text-sm text-muted-foreground mb-2">{t("contact.availability")}</p>
                <ul className="space-y-1">
                  {(t("contact.hours", { returnObjects: true }) as string[]).map((hour) => (
                    <li key={hour} className="text-sm text-muted-foreground">
                      {hour}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Visit */}
      <section className="py-16 px-6 bg-muted/20 dark:bg-muted/5 border-t border-border/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-2 tracking-tight">{t("contact.visitUs")}</h2>
            <p className="text-muted-foreground mb-8">{t("contact.visitDesc")}</p>
            <Card className="border max-w-xl">
              <CardContent className="p-6 flex items-start gap-4">
                <MapPin className="h-5 w-5 text-[#5B7D95] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">{t("contact.venueTitle")}</p>
                  <p className="text-sm text-muted-foreground mb-4">{t("contact.venueDesc")}</p>
                  <Button asChild size="sm" className="bg-[#5B7D95] text-white hover:bg-[#4E6C83]">
                    <Link to="/planning">{t("contact.seePlanning")}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
