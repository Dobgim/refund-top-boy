"use client";

import { useState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { MoneyForm } from "@/components/dashboard/money-form";
import {
  applyForLoan,
  openFixedDeposit,
  openSavingsScheme,
  payBill,
  requestWithdrawal,
  transferFunds,
} from "@/app/actions/banking";
import { formatCurrency } from "@/lib/utils";

const WITHDRAW_METHODS = ["Bank transfer", "Mobile money", "Crypto wallet (USDT)", "Card refund"];
const BILLERS = [
  "Electricity",
  "Water",
  "Internet",
  "Mobile airtime",
  "Cable TV",
  "Insurance premium",
  "Other",
];

function Unavailable({ balance }: { balance: number }) {
  return balance <= 0
    ? "Your balance is zero, so there is nothing to send yet. A recovered claim credits this account automatically."
    : undefined;
}

/* -------------------------------------------------------------- transfer */

export function TransferForm({ balance, currency }: { balance: number; currency: string }) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  return (
    <MoneyForm
      action={transferFunds}
      values={() => ({ destination, amount: Number(amount), note })}
      submitLabel="Send money"
      disabled={balance <= 0}
      disabledReason={Unavailable({ balance })}
      successMessage="Sent. Both accounts have been updated."
      onDone={() => {
        setDestination("");
        setAmount("");
        setNote("");
      }}
    >
      <Field
        label="Destination account number"
        htmlFor="destination"
        hint="A RoyalRefund account number, e.g. RR4000100001."
        required
      >
        <Input
          id="destination"
          value={destination}
          onChange={(event) => setDestination(event.target.value.toUpperCase())}
          className="font-mono tracking-wide"
        />
      </Field>

      <Field
        label="Amount"
        htmlFor="amount"
        hint={`Available: ${formatCurrency(balance, currency)}`}
        required
      >
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </Field>

      <Field label="Reference" htmlFor="note" hint="Optional. Shown on both statements.">
        <Input
          id="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </Field>
    </MoneyForm>
  );
}

/* -------------------------------------------------------------- withdraw */

export function WithdrawForm({ balance, currency }: { balance: number; currency: string }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(WITHDRAW_METHODS[0]);
  const [destination, setDestination] = useState("");

  return (
    <MoneyForm
      action={requestWithdrawal}
      values={() => ({ amount: Number(amount), method, destination })}
      submitLabel="Request withdrawal"
      disabled={balance <= 0}
      disabledReason={Unavailable({ balance })}
      successMessage="Requested. The amount is held while a reviewer checks it."
      onDone={() => {
        setAmount("");
        setDestination("");
      }}
    >
      <Field
        label="Amount"
        htmlFor="wd-amount"
        hint={`Available: ${formatCurrency(balance, currency)}`}
        required
      >
        <Input
          id="wd-amount"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </Field>

      <Field label="Receive by" htmlFor="wd-method" required>
        <Select id="wd-method" value={method} onChange={(event) => setMethod(event.target.value)}>
          {WITHDRAW_METHODS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Destination"
        htmlFor="wd-destination"
        hint="Account number, mobile money number or wallet address."
        required
      >
        <Input
          id="wd-destination"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
        />
      </Field>
    </MoneyForm>
  );
}

/* -------------------------------------------------------------- pay bill */

export function PayBillForm({ balance, currency }: { balance: number; currency: string }) {
  const [biller, setBiller] = useState(BILLERS[0]);
  const [billNumber, setBillNumber] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <MoneyForm
      action={payBill}
      values={() => ({ biller, billNumber, amount: Number(amount) })}
      submitLabel="Pay bill"
      disabled={balance <= 0}
      disabledReason={Unavailable({ balance })}
      successMessage="Paid. It is on your statement now."
      onDone={() => {
        setBillNumber("");
        setAmount("");
      }}
    >
      <Field label="Biller" htmlFor="biller" required>
        <Select id="biller" value={biller} onChange={(event) => setBiller(event.target.value)}>
          {BILLERS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Bill or meter number" htmlFor="bill-number" required>
        <Input
          id="bill-number"
          value={billNumber}
          onChange={(event) => setBillNumber(event.target.value)}
          className="font-mono"
        />
      </Field>

      <Field
        label="Amount"
        htmlFor="bill-amount"
        hint={`Available: ${formatCurrency(balance, currency)}`}
        required
      >
        <Input
          id="bill-amount"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </Field>
    </MoneyForm>
  );
}

/* ------------------------------------------------------------------- DPS */

export function SavingsForm({ balance, currency }: { balance: number; currency: string }) {
  const [monthly, setMonthly] = useState("");
  const [months, setMonths] = useState("12");

  const projected = Number(monthly) * Number(months);

  return (
    <MoneyForm
      action={openSavingsScheme}
      values={() => ({ monthly: Number(monthly), months: Number(months) })}
      submitLabel="Open savings scheme"
      disabled={balance <= 0}
      disabledReason={Unavailable({ balance })}
      successMessage="Scheme opened. The first deposit has been taken."
      onDone={() => setMonthly("")}
    >
      <Field
        label="Monthly deposit"
        htmlFor="dps-monthly"
        hint={`The first is taken now. Available: ${formatCurrency(balance, currency)}`}
        required
      >
        <Input
          id="dps-monthly"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={monthly}
          onChange={(event) => setMonthly(event.target.value)}
        />
      </Field>

      <Field label="Term" htmlFor="dps-months" required>
        <Select id="dps-months" value={months} onChange={(event) => setMonths(event.target.value)}>
          {[6, 12, 24, 36, 60].map((option) => (
            <option key={option} value={option}>
              {option} months
            </option>
          ))}
        </Select>
      </Field>

      {projected > 0 && (
        <p className="rounded-xl bg-royal-50 px-3.5 py-3 text-sm font-semibold text-royal-800">
          Total deposited over the term: {formatCurrency(projected, currency)}, before interest.
        </p>
      )}
    </MoneyForm>
  );
}

/* ------------------------------------------------------------------- FDR */

export function FixedDepositForm({ balance, currency }: { balance: number; currency: string }) {
  const [amount, setAmount] = useState("");
  const [months, setMonths] = useState("12");
  const RATE = 8;

  const value = Number(amount);
  const maturity = value > 0 ? value + (value * RATE * Number(months)) / (100 * 12) : 0;

  return (
    <MoneyForm
      action={openFixedDeposit}
      values={() => ({ amount: value, months: Number(months) })}
      submitLabel="Open fixed deposit"
      disabled={balance <= 0}
      disabledReason={Unavailable({ balance })}
      successMessage="Opened. The principal has been moved out of your balance."
      onDone={() => setAmount("")}
    >
      <Field
        label="Principal"
        htmlFor="fdr-amount"
        hint={`Locked for the full term. Available: ${formatCurrency(balance, currency)}`}
        required
      >
        <Input
          id="fdr-amount"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </Field>

      <Field label="Term" htmlFor="fdr-months" required>
        <Select id="fdr-months" value={months} onChange={(event) => setMonths(event.target.value)}>
          {[3, 6, 12, 24, 36, 60].map((option) => (
            <option key={option} value={option}>
              {option} months
            </option>
          ))}
        </Select>
      </Field>

      {maturity > 0 && (
        <p className="rounded-xl bg-royal-50 px-3.5 py-3 text-sm font-semibold text-royal-800">
          At {RATE}% simple interest, maturity value is {formatCurrency(maturity, currency)}.
        </p>
      )}
    </MoneyForm>
  );
}

/* ------------------------------------------------------------------ loan */

export function LoanForm({ currency }: { currency: string }) {
  const [amount, setAmount] = useState("");
  const [months, setMonths] = useState("12");
  const [purpose, setPurpose] = useState("");
  const RATE = 12;

  const value = Number(amount);
  const monthly =
    value > 0 ? (value + (value * RATE * Number(months)) / (100 * 12)) / Number(months) : 0;

  return (
    <MoneyForm
      action={applyForLoan}
      values={() => ({ amount: value, purpose, months: Number(months) })}
      submitLabel="Submit application"
      successMessage="Submitted. A reviewer will decide and you will be notified."
      onDone={() => {
        setAmount("");
        setPurpose("");
      }}
    >
      <Field label="Amount requested" htmlFor="loan-amount" required>
        <Input
          id="loan-amount"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </Field>

      <Field label="Repayment term" htmlFor="loan-months" required>
        <Select id="loan-months" value={months} onChange={(event) => setMonths(event.target.value)}>
          {[3, 6, 12, 24, 36, 60].map((option) => (
            <option key={option} value={option}>
              {option} months
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="What is it for?"
        htmlFor="loan-purpose"
        hint="A reviewer reads this, so be specific."
        required
      >
        <Textarea
          id="loan-purpose"
          rows={3}
          value={purpose}
          onChange={(event) => setPurpose(event.target.value)}
        />
      </Field>

      {monthly > 0 && (
        <p className="rounded-xl bg-royal-50 px-3.5 py-3 text-sm font-semibold text-royal-800">
          At {RATE}% simple interest, roughly {formatCurrency(monthly, currency)} per month.
        </p>
      )}

      <p className="text-xs leading-relaxed text-ink-400">
        Submitting an application is not an offer of credit. Nothing is disbursed until a reviewer
        approves it, and the rate shown is indicative.
      </p>
    </MoneyForm>
  );
}
