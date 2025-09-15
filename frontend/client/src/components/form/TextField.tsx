// client/src/components/form/TextField.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Props = {
  label: string;
  id: string;
  register?: any;
  error?: string | undefined;
  placeholder?: string;
};

export default function TextField({ label, id, register, error, placeholder }: Props) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="text" placeholder={placeholder} {...(register ? register(id) : {})} />
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}
