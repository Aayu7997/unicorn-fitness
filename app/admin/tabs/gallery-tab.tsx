"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Upload,
  Trash2,
  X,
  Grid,
  Filter,
  Loader2,
  ImagePlus,
} from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { AnimatedSaveButton } from "@/components/ui/animated-save-button";
import { AnimatedSwitch } from "@/components/ui/animated-switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GalleryImage {
  id: string;
  title?: string;
  category: string;
  imageUrl: string;
  imagePublicId: string;
  active: boolean;
  createdAt: string;
}

const CATEGORIES = [
  "General",
  "Training",
  "Group Classes",
  "Yoga Studio",
  "Events",
  "Video Highlight",
  "Transformations",
  "Equipment",
];

export function GalleryTab() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [editModal, setEditModal] = useState<{
    open: boolean;
    image: GalleryImage | null;
  }>({ open: false, image: null });
  const [editForm, setEditForm] = useState({
    title: "",
    category: "General",
    active: true,
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const url =
      catFilter !== "all"
        ? `/api/admin/gallery?category=${encodeURIComponent(catFilter)}`
        : "/api/admin/gallery";
    const res = await fetch(url);
    if (res.ok) setImages(await res.json());
    setLoading(false);
  }, [catFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const onUploadSuccess = async (result: any) => {
    try {
      await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: result.info.secure_url,
          imagePublicId: result.info.public_id,
          category: "General",
        }),
      });
      load();
    } catch (e) {
      console.error("Failed to save gallery image", e);
    }
  };

  const del = async (img: GalleryImage) => {
    if (!confirm("Delete this image? This cannot be undone.")) return;
    await fetch(`/api/admin/gallery/${img.id}`, { method: "DELETE" });
    load();
  };

  const openEdit = (img: GalleryImage) => {
    setEditForm({
      title: img.title ?? "",
      category: img.category,
      active: img.active,
    });
    setEditModal({ open: true, image: img });
  };

  const saveEdit = async () => {
    if (!editModal.image) return;
    setSaving(true);
    await fetch(`/api/admin/gallery/${editModal.image.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setSaving(false);
    setEditModal({ open: false, image: null });
    load();
  };

  const filtered = images.filter(
    (img) => catFilter === "all" || img.category === catFilter,
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gallery</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {images.length} images
          </p>
        </div>
        <CldUploadWidget
          onSuccess={onUploadSuccess}
          uploadPreset={
            process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
            "unicorn_fitness"
          }
          options={{
            maxFiles: 10,
            resourceType: "auto",
            clientAllowedFormats: [
              "jpeg",
              "png",
              "jpg",
              "webp",
              "mp4",
              "webm",
              "mov",
            ],
          }}
        >
          {({ open }) => (
            <Button
              onClick={(e) => {
                e.preventDefault();
                open();
              }}
            >
              <ImagePlus className="w-4 h-4 mr-2" />
              Upload Images
            </Button>
          )}
        </CldUploadWidget>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={catFilter === "all" ? "default" : "secondary"}
          size="sm"
          onClick={() => setCatFilter("all")}
          className="rounded-full"
        >
          <Grid className="w-3.5 h-3.5 mr-1.5" /> All
        </Button>
        {CATEGORIES.map((c) => (
          <Button
            key={c}
            variant={catFilter === c ? "default" : "secondary"}
            size="sm"
            onClick={() => setCatFilter(c)}
            className="rounded-full"
          >
            <Filter className="w-3.5 h-3.5 mr-1.5" /> {c}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-muted rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
            No images found. Upload some!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((img, i) => (
            <div
              key={img.id}
              className={`group relative aspect-square rounded-xl overflow-hidden bg-muted border ${!img.active ? "opacity-40 grayscale" : ""}`}
            >
              {img.imageUrl.match(/\.(mp4|webm|mov)$/i) ? (
                <video
                  src={img.imageUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={img.imageUrl}
                  alt={img.title ?? ""}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-muted opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openEdit(img)}
                  className="w-24 bg-muted/50 hover:bg-accent hover:text-accent-foreground text-foreground border-0 backdrop-blur-sm"
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => del(img)}
                  className="w-24 bg-destructive/80 hover:bg-destructive text-foreground border-0 backdrop-blur-sm"
                >
                  Delete
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <p className="text-foreground text-xs truncate font-medium">
                  {img.category}
                </p>
                {img.title && (
                  <p className="text-muted-foreground text-[10px] truncate">
                    {img.title}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={editModal.open}
        onOpenChange={(open) =>
          !open && setEditModal({ open: false, image: null })
        }
      >
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription>
              Update image details and visibility.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editModal.image && (
              <div className="mb-2">
                {editModal.image.imageUrl.match(/\.(mp4|webm|mov)$/i) ? (
                  <video
                    src={editModal.image.imageUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                ) : (
                  <img
                    src={editModal.image.imageUrl}
                    alt=""
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label>Title (optional)</Label>
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Add a caption or title"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={editForm.category}
                onValueChange={(val) =>
                  setEditForm((f) => ({ ...f, category: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between pt-2">
              <Label className="text-muted-foreground">Visible to Users</Label>
              <AnimatedSwitch
                checked={editForm.active}
                onChange={(checked) =>
                  setEditForm((f) => ({ ...f, active: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditModal({ open: false, image: null })}
            >
              Cancel
            </Button>
            <AnimatedSaveButton onClick={saveEdit} loading={saving} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
