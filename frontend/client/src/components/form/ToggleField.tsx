// client/src/components/form/ToggleField.tsx
import { Label } from "@/components/ui/label";

type Props = {
  label: string;
  id: string;
  checked?: boolean;
  onChange?: (v: boolean) => void;
};

export default function ToggleField({ label, id, checked, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <Label htmlFor={id}>{label}</Label>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange?.(e.target.checked)} className="w-5 h-5" />
    </div>
  );
}
