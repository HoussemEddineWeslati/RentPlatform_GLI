import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Landlord } from "@/types/schema";
import {
  MoreHorizontal,
  UserPlus,
  Trash2,
  Edit,
  Search,
  Home,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { LandlordForm } from "@/components/landlord-form";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";

export default function LandlordsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedLandlord, setSelectedLandlord] = useState<Landlord | null>(
    null
  );
  const [search, setSearch] = useState("");

  const { data: landlords, isLoading } = useQuery<Landlord[]>({
    queryKey: ["/api/landlords"],
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      apiRequest("DELETE", `/api/landlords/${selectedLandlord?.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/landlords"] });
      toast({
        title: "Landlord Deleted",
        description: "The landlord has been successfully deleted.",
      });
      setIsAlertOpen(false);
      setSelectedLandlord(null);
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error?.message || "Could not delete the landlord.",
        variant: "destructive",
      });
    },
  });

  const filtered = (landlords ?? []).filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (landlord: Landlord) => {
    setSelectedLandlord(landlord);
    setIsFormOpen(true);
  };

  const handleDelete = (landlord: Landlord) => {
    setSelectedLandlord(landlord);
    setIsAlertOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-24 text-center text-muted-foreground">
        Loading landlords...
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-24 pb-10">
      {/* Header + Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        {/* Title slightly right */}
        <div className="ml-8">
          <h1 className="text-3xl font-bold tracking-tight">Landlords</h1>
          <p className="text-muted-foreground">
            Manage and track all landlords from one place.
          </p>
        </div>

        {/* Toolbar aligned left with spacing between search and button */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-start">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search landlords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button
            onClick={() => {
              setSelectedLandlord(null);
              setIsFormOpen(true);
            }}
            className="whitespace-nowrap"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Landlord
          </Button>
        </div>
      </div>

      {/* Advanced Table */}
      <Card className="rounded-2xl shadow-lg border">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-muted/50 backdrop-blur-sm z-10">
              <tr className="text-left text-muted-foreground">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium text-center">
                  Properties
                </th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-muted-foreground"
                  >
                    No landlords found.
                  </td>
                </tr>
              )}
              {filtered.map((landlord, idx) => (
                <tr
                  key={landlord.id}
                  className={`transition-colors ${
                    idx % 2 === 0 ? "bg-background" : "bg-muted/20"
                  } hover:bg-accent/40`}
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/landlords/${landlord.id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {landlord.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {landlord.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-2 text-foreground">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {landlord.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      <Home className="mr-1 h-3 w-3" />
                      {landlord.propertyCount || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full hover:bg-accent"
                        >
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                          Actions
                        </DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(landlord)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(landlord)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Placeholder */}
        <div className="flex justify-between items-center px-6 py-3 border-t bg-muted/30">
          <span className="text-xs text-muted-foreground">
            Showing {filtered.length} landlords
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Prev
            </Button>
            <Button size="sm" variant="outline">
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedLandlord ? "Edit Landlord" : "Add New Landlord"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <LandlordForm
            landlord={selectedLandlord}
            onSuccess={() => setIsFormOpen(false)}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              landlord and all associated properties and tenants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
