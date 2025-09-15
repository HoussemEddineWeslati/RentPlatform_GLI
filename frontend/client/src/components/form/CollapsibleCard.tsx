// // client/src/components/form/CollapsibleCard.tsx
// import * as React from "react";

// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { ChevronDown } from "lucide-react";

// type Props = {
//   title: React.ReactNode;
//   subtitle?: React.ReactNode;
//   defaultOpen?: boolean;
//   children?: React.ReactNode;
// };

// export default function CollapsibleCard({ title, subtitle, defaultOpen = true, children }: Props) {
//   const [open, setOpen] = React.useState(defaultOpen);
//   return (
//     <Card className="w-full">
//       <CardHeader className="flex items-center justify-between">
//         <div>
//           <CardTitle className="flex items-center gap-2">
//             {title}
//           </CardTitle>
//           {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
//         </div>

//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={() => setOpen((v) => !v)}
//           className="flex items-center"
//         >
//           <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
//         </Button>
//       </CardHeader>
//       {open && <CardContent>{children}</CardContent>}
//     </Card>
//   );
// }
// client/src/components/form/CollapsibleCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

type Props = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  defaultOpen?: boolean;
  children?: React.ReactNode;
};

export default function CollapsibleCard({ title, subtitle, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">{title}</CardTitle>
          {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </Button>
      </CardHeader>
      {open && <CardContent>{children}</CardContent>}
    </Card>
  );
}
