"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Alert, Card } from "@/components/ui/primitives";
import { Turnstile } from "@/components/forms/turnstile";
import { isTurnstileEnabled } from "@/lib/turnstile";
import { submitSupportEnquiry } from "@/app/actions/support";
import { contactSchema } from "@/lib/validations/claim";
import { SITE } from "@/lib/site";
import type { z } from "zod";

type ContactValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [sent, setSent] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  async function onSubmit(values: ContactValues) {
    setFormError(null);

    if (isTurnstileEnabled && !captchaToken) {
      setFormError("Please complete the security check below.");
      return;
    }

    const result = await submitSupportEnquiry(values, captchaToken);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [key, message] of Object.entries(result.fieldErrors)) {
          setError(key as keyof ContactValues, { message });
        }
      }
      setFormError(result.message ?? "Your message could not be sent.");
      return;
    }

    setSent(values.email);
    reset();
  }

  if (sent) {
    return (
      <Card className="p-6 sm:p-8">
        <span className="grid size-14 place-items-center rounded-2xl bg-mint-500/10 text-mint-600">
          <CheckCircle2 aria-hidden className="size-7" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-ink-950">
          Message sent
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-500">
          It has reached our support team, and a copy of your message is on its way to{" "}
          <strong className="font-semibold text-ink-800">{sent}</strong>. We reply to the address you
          wrote from, so keep an eye on that inbox.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-500">
          You can also reach us any time at{" "}
          <a
            href={`mailto:${SITE.supportEmail}`}
            className="font-semibold text-royal-600 hover:text-royal-800"
          >
            {SITE.supportEmail}
          </a>
          .
        </p>
        <Button type="button" variant="outline" className="mt-6" onClick={() => setSent(null)}>
          Send another message
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {formError && <Alert tone="error">{formError}</Alert>}

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

        <Turnstile onToken={setCaptchaToken} />

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
