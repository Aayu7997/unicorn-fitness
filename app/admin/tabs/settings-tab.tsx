"use client";

import { AnimatedSaveButton } from "@/components/ui/animated-save-button";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Lock,
  User,
  Save,
  Loader2,
  AlertCircle,
  Camera,
  Crop,
  Trash2,
} from "lucide-react";
import { ProfileCropperModal } from "@/components/profile-cropper-modal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface SettingsTabProps {
  user: AdminUser;
  onUpdateUser?: (updated: Partial<AdminUser>) => void;
}

export function SettingsTab({ user, onUpdateUser }: SettingsTabProps) {
  const router = useRouter();
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const [avatar, setAvatar] = useState({
    url: user.avatar || "",
    publicId: "",
  });
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropSourceImage, setCropSourceImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with prop if it changes
  useEffect(() => {
    if (user.avatar && user.avatar !== avatar.url) {
      setAvatar(prev => ({ ...prev, url: user.avatar || "" }));
    }
  }, [user.avatar]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File exceeds maximum allowed size of 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const localData = uploadEvent.target?.result as string;
      if (localData) {
        setCropSourceImage(localData);
        setCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropComplete = async (croppedDataUrl: string) => {
    setAvatarSaving(true);
    setAvatarSuccess(false);

    try {
      // 1. Upload to Cloudinary authenticated server endpoint
      let finalUrl = croppedDataUrl;
      let finalPublicId = "";

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: croppedDataUrl,
          folder: "users/avatars",
        }),
      });

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          finalUrl = uploadData.url;
          finalPublicId = uploadData.publicId || "";
        }
      }

      // 2. Persist to Admin Profile in database
      const saveRes = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarUrl: finalUrl,
          avatarPublicId: finalPublicId,
        }),
      });

      if (!saveRes.ok) {
        throw new Error("Failed to save profile to database");
      }

      const saveData = await saveRes.json();
      const confirmedUrl = saveData.avatarUrl || finalUrl;

      // 3. Update local state and parent state (instant sidebar update!)
      setAvatar({ url: confirmedUrl, publicId: finalPublicId });
      onUpdateUser?.({ avatar: confirmedUrl });
      setAvatarSuccess(true);
      setTimeout(() => setAvatarSuccess(false), 4000);
    } catch (err: any) {
      console.error("Error updating profile avatar:", err);
      alert("Failed to update profile photo. Please try again.");
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm("Are you sure you want to remove your profile photo?")) return;

    setAvatarSaving(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarUrl: null,
          avatarPublicId: null,
        }),
      });

      if (res.ok) {
        setAvatar({ url: "", publicId: "" });
        onUpdateUser?.({ avatar: "" });
        setAvatarSuccess(true);
        setTimeout(() => setAvatarSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error removing avatar:", err);
    } finally {
      setAvatarSaving(false);
    }
  };

  const changePassword = async () => {
    setPwError("");
    setPwSuccess("");
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("New passwords do not match");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError("New password must be at least 8 characters");
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error ?? "Failed");
        return;
      }
      setPwSuccess(data.message);
      setTimeout(() => router.push("/admin/signin"), 2000);
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="w-full space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your account settings, profile photo, and security.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Photo */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="relative overflow-hidden border-border/80 shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <CardContent className="p-6 relative z-10 space-y-6">
              
              {/* User Identity Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-border/50">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 shadow-xs overflow-hidden shrink-0">
                  {avatar.url ? (
                    <img
                      src={avatar.url}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold uppercase text-orange-400">
                      {user.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base truncate text-foreground">{user.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="premium-badge capitalize text-[10px]">{user.role}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  </div>
                </div>
              </div>

              {/* Profile Photo Management */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Profile Avatar
                  </Label>
                  {avatarSuccess && (
                    <span className="text-xs font-medium text-emerald-500 animate-in fade-in">
                      ✓ Saved & updated!
                    </span>
                  )}
                </div>

                {/* Avatar Preview Box */}
                <div className="relative w-full p-4 rounded-xl border border-border/60 bg-muted/20 flex flex-col items-center justify-center gap-4 group">
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-border/80 shadow-md bg-muted/40">
                    {avatar.url ? (
                      <img
                        src={avatar.url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-orange-500/15 text-orange-400">
                        <span className="text-3xl font-extrabold uppercase">
                          {user.name.charAt(0)}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-1 font-medium">No photo set</span>
                      </div>
                    )}

                    {avatarSaving && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center gap-1.5 z-20">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        <span className="text-[10px] font-medium text-foreground">Saving...</span>
                      </div>
                    )}
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    className="hidden"
                    onChange={handlePhotoSelect}
                    disabled={avatarSaving}
                  />

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                    <Button
                      type="button"
                      size="sm"
                      variant="default"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarSaving}
                      className="text-xs h-8.5 px-3 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5 mr-1.5" />
                      {avatar.url ? "Change Photo" : "Upload Photo"}
                    </Button>

                    {avatar.url && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCropSourceImage(avatar.url);
                          setCropperOpen(true);
                        }}
                        disabled={avatarSaving}
                        className="text-xs h-8.5 px-3 border-border hover:bg-muted"
                      >
                        <Crop className="w-3.5 h-3.5 mr-1.5" />
                        Crop & Adjust
                      </Button>
                    )}

                    {avatar.url && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleRemovePhoto}
                        disabled={avatarSaving}
                        className="text-xs h-8.5 px-2.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Remove profile photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground text-center leading-normal">
                    Interactive crop & zoom before saving. Photo automatically syncs to the sidebar and header.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Cropper Modal */}
          <ProfileCropperModal
            isOpen={cropperOpen}
            onClose={() => setCropperOpen(false)}
            imageSrc={cropSourceImage}
            onCropComplete={handleCropComplete}
          />
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Change Password */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 shrink-0">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure. This will
                    sign you out of all active sessions.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {pwError && (
                <div className="flex items-center gap-2 px-4 py-3 mb-6 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="flex items-center gap-2 px-4 py-3 mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm rounded-xl">
                  <Shield className="w-4 h-4 shrink-0" /> {pwSuccess}
                </div>
              )}

              <div className="space-y-4">
                {[
                  { label: "Current Password", key: "currentPassword" },
                  { label: "New Password", key: "newPassword" },
                  { label: "Confirm New Password", key: "confirmPassword" },
                ].map((f) => (
                  <div key={f.key} className="space-y-2">
                    <Label>{f.label}</Label>
                    <Input
                      type="password"
                      value={(pwForm as Record<string, string>)[f.key]}
                      onChange={(e) =>
                        setPwForm((p) => ({ ...p, [f.key]: e.target.value }))
                      }
                      placeholder="••••••••"
                    />
                  </div>
                ))}

                <div className="pt-4 flex justify-end">
                  <AnimatedSaveButton
                    onClick={changePassword}
                    loading={pwSaving}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shrink-0">
                  <Shield className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Security Overview</CardTitle>
                  <CardDescription>
                    System-level security features protecting this deployment.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    label: "Session Storage",
                    value: "HTTP-only cookies",
                    icon: <Lock className="w-4 h-4 text-muted-foreground" />,
                  },
                  {
                    label: "Password Hashing",
                    value: "bcrypt 12 rounds",
                    icon: <Shield className="w-4 h-4 text-muted-foreground" />,
                  },
                  {
                    label: "Route Protection",
                    value: "Server middleware",
                    icon: (
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    ),
                  },
                  {
                    label: "Upload Security",
                    value: "Signed Cloudinary",
                    icon: <Save className="w-4 h-4 text-muted-foreground" />,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl"
                  >
                    <div className="mt-0.5">{item.icon}</div>
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
