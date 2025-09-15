// client/src/components/form/NumberField.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Props = {
  label: string;
  id: string;
  step?: number | string;
  min?: number;
  max?: number;
  register?: any;
  error?: string | undefined;
  placeholder?: string;
};

export default function NumberField({ label, id, register, error, step = "1", min, max, placeholder }: Props) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="number" step={step} min={min} max={max} placeholder={placeholder} {...(register ? register(id, { valueAsNumber: true }) : {})} />
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}
