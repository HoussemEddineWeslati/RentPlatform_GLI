// client/src/components/otp/PinInput.tsx
import React, { useRef, useState, useEffect } from "react";

type Props = {
  length?: number; // default 6
  value?: string;
  onChange?: (value: string) => void;
  autoFocus?: boolean;
  className?: string;
};

export default function PinInput({
  length = 6,
  value = "",
  onChange,
  autoFocus = true,
  className = "",
}: Props) {
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length }, (_, i) => value[i] ?? "")
  );
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setDigits(Array.from({ length }, (_, i) => value[i] ?? ""));
  }, [value, length]);

  useEffect(() => {
    onChange?.(digits.join(""));
  }, [digits, onChange]);

  useEffect(() => {
    if (autoFocus) {
      const first = inputsRef.current[0];
      first?.focus();
      first?.select();
    }
  }, [autoFocus]);

  const handleChange = (idx: number, val: string) => {
    if (!val) {
      // clear
      const newDigits = [...digits];
      newDigits[idx] = "";
      setDigits(newDigits);
      return;
    }
    // take only digits
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned) return;

    // If user pasted more than one char (e.g. pasted full code) distribute digits
    const chars = cleaned.split("");
    const newDigits = [...digits];
    for (let i = 0; i < chars.length && idx + i < length; i++) {
      newDigits[idx + i] = chars[i];
    }
    setDigits(newDigits);

    // focus next empty input
    const nextIdx = Math.min(length - 1, idx + chars.length);
    const next = inputsRef.current[nextIdx];
    if (next) {
      next.focus();
      next.select();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        // clear current
        const newDigits = [...digits];
        newDigits[idx] = "";
        setDigits(newDigits);
      } else {
        // move to previous
        const prev = inputsRef.current[Math.max(0, idx - 1)];
        prev?.focus();
      }
    } else if (e.key === "ArrowLeft") {
      inputsRef.current[Math.max(0, idx - 1)]?.focus();
    } else if (e.key === "ArrowRight") {
      inputsRef.current[Math.min(length - 1, idx + 1)]?.focus();
    }
  };

  return (
    <div className={`flex gap-3 ${className}`}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={length}
          ref={(el) => (inputsRef.current[i] = el)}
          value={digits[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onFocus={(e) => e.currentTarget.select()}
          className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg md:text-xl rounded-lg border border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
