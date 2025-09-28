// client/src/components/form/TextField.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Props = {
  label: string;
  id: string;
  register?: any;
  error?: string;
  placeholder?: string;
  type?: string; // 👈 new, default to "text"
};

export default function TextField({
  label,
  id,
  register,
  error,
  placeholder,
  type = "text",
}: Props) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        {...(register ? register(id) : {})}
      />
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}
