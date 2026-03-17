import { motion } from "motion/react";
import { Mail, MapPin, Instagram, Phone, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
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
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());
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
        headers: {
          "Content-Type": "application/json",
        },
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
          if (payload.error) {
            errorMessage = payload.error;
          }
        } catch {
          // Ignore JSON parse fallback.
        }

        throw new Error(errorMessage);
      }

      setSubmitStatus("success");
      setSubmitMessage(t("contact.successMessage"));
      setFormData({ name: "", email: "", phone: "", message: "", website: "" });
      setFormStartedAt(Date.now());
    } catch (error) {
      setSubmitStatus("error");
      if (error instanceof Error && error.message) {
        setSubmitMessage(error.message);
      } else {
        setSubmitMessage(t("contact.errorMessage"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "bgaillard.pro@gmail.com",
      link: "mailto:bgaillard.pro@gmail.com",
    },
    {
      icon: Phone,
      title: t("contact.phone_label"),
      content: "+33 6 56 71 40 37",
      link: "tel:+33656714037",
    },
    {
      icon: Instagram,
      title: "Instagram",
      content: "@tchoukleu",
      link: "https://instagram.com/tchoukleu",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#DDF4FF] to-background dark:from-[#1a3a4a] dark:to-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl font-bold mb-6">{t("contact.title")}</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("contact.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="border-2 border-[#4C93C3]">
                <CardHeader>
                  <CardTitle className="text-3xl">{t("contact.sendMessage")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
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
                      <label htmlFor="name" className="block mb-2">
                        {t("contact.fullName")}
                      </label>
                      <Input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t("contact.yourName")}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block mb-2">
                        {t("contact.email")}
                      </label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t("contact.yourEmail")}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block mb-2">
                        {t("contact.phone")}
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={t("contact.yourPhone")}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block mb-2">
                        {t("contact.message")}
                      </label>
                      <Textarea
                        id="message"
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={t("contact.yourMessage")}
                        rows={6}
                        className="w-full"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-[#4C93C3] hover:bg-[#3a7ba8] text-white"
                      disabled={isSubmitting}
                    >
                      <Send className="mr-2 h-5 w-5" />
                      {isSubmitting ? t("contact.sending") : t("contact.send")}
                    </Button>

                    {submitMessage ? (
                      <p className={`text-sm ${submitStatus === "success" ? "text-emerald-600" : "text-red-600"}`}>
                        {submitMessage}
                      </p>
                    ) : null}
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold mb-6">{t("contact.ourCoords")}</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  {t("contact.reachUs")}
                </p>
              </div>

              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={info.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-[#BFE6FF] dark:bg-[#4C93C3]/20 rounded-lg flex-shrink-0">
                            <info.icon className="h-6 w-6 text-[#4C93C3]" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">{info.title}</h3>
                            {info.link ? (
                              <a
                                href={info.link}
                                className="text-muted-foreground hover:text-[#4C93C3] transition-colors"
                              >
                                {info.content}
                              </a>
                            ) : (
                              <p className="text-muted-foreground">{info.content}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card className="bg-[#DDF4FF] dark:bg-[#4C93C3]/10 border-[#4C93C3]">
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-3">{t("contact.contactHours")}</h3>
                  <p className="text-muted-foreground mb-2">
                    {t("contact.availability")}
                  </p>
                  <ul className="space-y-1 text-muted-foreground">
                    {(t("contact.hours", { returnObjects: true }) as string[]).map((hour) => (
                      <li key={hour}>• {hour}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Visit Section */}
      <section className="py-20 px-6 bg-muted/30 dark:bg-muted/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-4">{t("contact.visitUs")}</h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t("contact.visitDesc")}
            </p>
            <div className="mx-auto max-w-2xl rounded-3xl border border-[#4C93C3]/20 bg-background/90 p-8 shadow-lg shadow-[#4C93C3]/10">
              <div className="flex flex-col items-center text-center">
                <div className="mb-5 rounded-full bg-[#BFE6FF] p-4 dark:bg-[#4C93C3]/20">
                  <MapPin className="h-8 w-8 text-[#4C93C3]" />
                </div>
                <p className="text-lg font-semibold">{t("contact.venueTitle")}</p>
                <p className="mt-2 mb-6 max-w-xl text-muted-foreground">
                  {t("contact.venueDesc")}
                </p>
                <Button asChild size="lg" className="bg-[#4C93C3] text-white hover:bg-[#3a7ba8]">
                  <Link to="/planning">{t("contact.seePlanning")}</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
