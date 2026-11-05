import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GlitchText } from "../GlitchText";

export interface ContactTranslations {
  title: string;
  description: string;
  form: {
    name: {
      label: string;
      placeholder: string;
    };
    email: {
      label: string;
      placeholder: string;
    };
    message: {
      label: string;
      placeholder: string;
    };
    submit: string;
  };
  toast: {
    title: string;
    description: string;
  };
}

interface ContactSectionProps {
  translations: ContactTranslations;
  lang?: "en" | "es";
  endpoint?: string;
}

export const ContactSection = ({
  translations,
  lang = "en",
  endpoint = "/api/contact",
}: ContactSectionProps) => {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const formSchema = z.object({
    name: z.string().min(2, {
      message: lang === "es" ? "El nombre debe tener al menos 2 caracteres." : "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: lang === "es" ? "Por favor ingresa un correo electrónico válido." : "Please enter a valid email address.",
    }),
    message: z.string().min(10, {
      message: lang === "es" ? "El mensaje debe tener al menos 10 caracteres." : "Message must be at least 10 characters.",
    }).max(500, {
      message: lang === "es" ? "El mensaje no debe superar los 500 caracteres." : "Message must not exceed 500 characters.",
    }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setStatus("submitting");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...values,
          subject: `New Message from ${values.name} (Saturnalia999)`,
          from_name: values.name,
        }),
      });

      if (response.ok) {
        setStatus("success");
        setFeedbackMessage(translations.toast.description);
        form.reset();
      } else {
        const errorData = await response.json().catch(() => null);
        setStatus("error");
        setFeedbackMessage(
          errorData?.error ||
          (lang === "es"
            ? "Hubo un error al enviar el mensaje. Por favor intenta de nuevo."
            : "There was an error sending your message. Please try again.")
        );
      }
    } catch {
      setStatus("error");
      setFeedbackMessage(
        lang === "es"
          ? "No se pudo conectar con el servidor. Revisa tu conexión."
          : "Could not connect to the server. Please check your connection."
      );
    }
  }

  return (
    <section id="contact" className="py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <GlitchText
          text={translations.title}
          as="h2"
          className="text-4xl md:text-5xl font-bold text-center mb-12 text-glow text-primary"
        />
        <Card className="max-w-2xl mx-auto bg-[#060606]/96 border border-primary/40 backdrop-blur-md shadow-2xl shadow-black/90 rounded-none">
          <CardHeader>
            <p className="text-muted-foreground text-center text-lg uppercase tracking-wider">
              {translations.description}
            </p>
          </CardHeader>
          <CardContent>
            {status === "success" && (
              <div className="mb-6 p-4 border border-primary/50 bg-primary/10 flex items-center space-x-3 text-accent animate-in fade-in">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-headline uppercase text-primary font-bold">
                    {translations.toast.title}
                  </h4>
                  <p className="text-sm text-foreground/80">{feedbackMessage}</p>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="mb-6 p-4 border border-destructive/50 bg-destructive/10 flex items-center space-x-3 text-destructive animate-in fade-in">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <p className="text-sm">
                  {feedbackMessage ||
                    (lang === "es"
                      ? "Hubo un error al enviar el mensaje. Por favor intenta de nuevo."
                      : "There was an error sending your message. Please try again.")}
                </p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary font-headline uppercase">
                        {translations.form.name.label}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={translations.form.name.placeholder}
                          {...field}
                          className="bg-[#020202]/80 border-primary/40 focus:border-primary focus:ring-primary rounded-none text-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary font-headline uppercase">
                        {translations.form.email.label}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={translations.form.email.placeholder}
                          type="email"
                          {...field}
                          className="bg-[#020202]/80 border-primary/40 focus:border-primary focus:ring-primary rounded-none text-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary font-headline uppercase">
                        {translations.form.message.label}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={translations.form.message.placeholder}
                          {...field}
                          className="bg-[#020202]/80 border-primary/40 focus:border-primary focus:ring-primary min-h-[150px] resize-none rounded-none text-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-center pt-4">
                  <Button
                    type="submit"
                    disabled={status === "submitting"}
                    variant="outline"
                    size="lg"
                    className="border border-primary text-primary hover:bg-primary hover:text-black transition-all duration-300 icon-glow w-full sm:w-auto text-lg font-headline uppercase tracking-wider rounded-none"
                  >
                    {status === "submitting" ? (
                      <Loader2 className="mr-3 animate-spin" />
                    ) : (
                      <Send className="mr-3" />
                    )}
                    {translations.form.submit}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ContactSection;
