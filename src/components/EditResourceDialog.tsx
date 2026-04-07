import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Resource } from "@/lib/types";

type EditResourceDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  editResource: Resource | null;
  setEditResource: (
    resource: ((prev: Resource | null) => Resource | null) | Resource | null,
  ) => void;
  updateResource: () => void;
};

export function EditResourceDialog({
  isOpen,
  onOpenChange,
  editResource,
  setEditResource,
  updateResource,
}: EditResourceDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white/10 border border-white/20 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Resource</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <label htmlFor="edit-url" className="text-sm font-bold text-white/90">
            Resource URL
          </label>
          <Input
            id="edit-url"
            placeholder="Resource URL"
            value={editResource?.url || ""}
            onChange={(e) =>
              setEditResource((prev) =>
                prev ? { ...prev, url: e.target.value } : null,
              )
            }
            aria-label="Edit resource URL"
            className="bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus-visible:ring-purple-500/50"
          />
          <label htmlFor="edit-title" className="text-sm font-bold text-white/90">
            Resource Title
          </label>
          <Input
            id="edit-title"
            placeholder="Resource Title"
            value={editResource?.title || ""}
            onChange={(e) =>
              setEditResource((prev: any) =>
                prev ? { ...prev, title: e.target.value } : null,
              )
            }
            aria-label="Edit resource title"
            className="bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus-visible:ring-purple-500/50"
          />
          <label htmlFor="edit-description" className="text-sm font-bold text-white/90">
            Resource Description
          </label>
          <Textarea
            id="edit-description"
            placeholder="Resource Description"
            value={editResource?.description || ""}
            onChange={(e) =>
              setEditResource((prev) =>
                prev ? { ...prev, description: e.target.value } : null,
              )
            }
            aria-label="Edit resource description"
            className="bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus-visible:ring-purple-500/50"
          />
        </div>
        <Button
          onClick={updateResource}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white"
          disabled={
            !editResource?.url ||
            !editResource?.title ||
            !editResource?.description
          }
        >
          Save Changes
        </Button>
      </DialogContent>
    </Dialog>
  );
}
