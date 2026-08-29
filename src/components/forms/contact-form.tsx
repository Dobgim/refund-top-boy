"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Alert, Card } from "@/components/ui/primitives";
import { contactSchema } from "@/lib/validations/claim";
import { SITE } from "@/lib/site";
import type { z } from "zod";

type ContactValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [sent, setSent] = useState<ContactValues | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  if (sent) {
    const mailto = `mailto:${SITE.supportEmail}?subject=${encodeURIComponent(sent.subject)}&body=${encodeURIComponent(sent.message)}`;
    return (
      <Card className="p-6 sm:p-8">
        <span className="grid size-14 place-items-center rounded-2xl bg-mint-500/10 text-mint-600">
          <CheckCircle2 aria-hidden className="size-7" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-ink-950">
          Message ready to send
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-500">
          Email delivery is not connected on this deployment, so nothing was transmitted from the
          browser. Your message is ready to go &mdash; open it in your own mail client below, or write
          to{" "}
          <a
            href={`mailto:${SITE.supportEmail}`}
            className="font-semibold text-royal-600 hover:text-royal-800"
          >
            {SITE.supportEmail}
          </a>
          .
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={() => window.open(mailto, "_self")} leadingIcon={<Send aria-hidden className="size-4" />}>
            Open in mail client
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              setSent(null);
            }}
          >
            Write another
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <form onSubmit={handleSubmit((values) => setSent(values))} className="space-y-5" noValidate>
        <Alert tone="info">
          Please do not include passwords, PINs, full card numbers or recovery phrases in a message.
        </Alert>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Your name" htmlFor="name" error={errors.name?.message} required>
            <Input id="name" autoComplete="name" {...register("name")} />
          </Field>
          <Field label="Email address" htmlFor="email" error={errors.email?.message} required>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
          </Field>
        </div>

        <Field label="Subject" htmlFor="subject" error={errors.subject?.message} required>
          <Input id="subject" placeholder="Question about a case reference" {...register("subject")} />
        </Field>

        <Field label="Message" htmlFor="message" error={errors.message?.message} required>
          <Textarea id="message" rows={6} {...register("message")} />
        </Field>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isSubmitting}
          leadingIcon={<Send aria-hidden className="size-4.5" />}
        >
          Send message
        </Button>
      </form>
    </Card>
  );
}
