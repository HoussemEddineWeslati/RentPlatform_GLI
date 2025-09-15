// client/src/components/form/SelectField.tsx
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

type Option = { label: string; value: string };

type Props = {
  label: string;
  options: Option[];
  value?: string;
  onChange?: (v: string) => void;
};

export default function SelectField({ label, options, value, onChange }: Props) {
  return (
    <div>
      <Label>{label}</Label>
      <Select onValueChange={(v) => onChange?.(v)} defaultValue={value}>
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
