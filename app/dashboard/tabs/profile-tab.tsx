'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { HeartPulse, Info, Loader2, Save, Camera, Trash2, Crop, ShieldCheck, ShieldAlert } from 'lucide-react'
import { GoogleFitIcon, SamsungHealthIcon } from '@/components/icons/brand-icons'
import { Button } from '@/components/ui/button'
import { ProfileCropperModal } from '@/components/profile-cropper-modal'
import { UpdatePasswordModal, TwoFactorModal, ConnectAppModal } from '@/components/profile-security-modals'
import { cn } from '@/lib/utils'

export function ProfileTab({ user, onUpdateUser }: { user: any; onUpdateUser?: (updated: any) => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [cropperOpen, setCropperOpen] = useState(false)
  const [cropSourceImage, setCropSourceImage] = useState<string>('')

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    age: user?.age || '',
    height: user?.height || '',
    weight: user?.progressLogs?.[0]?.weight || '',
    avatarBase64: user?.avatarUrl || '',
  })

  // Connected apps & security state with real DB persistence
  const [syncStatus, setSyncStatus] = useState<{ google: boolean; samsung: boolean }>({
    google: Boolean(user?.googleFitConnected),
    samsung: Boolean(user?.samsungHealthConnected),
  })
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(Boolean(user?.twoFactorEnabled))
  const [passwordLastChangedAt, setPasswordLastChangedAt] = useState<string | null>(user?.passwordLastChangedAt || null)

  // Dialog states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false)
  const [connectModalProvider, setConnectModalProvider] = useState<'google' | 'samsung' | null>(null)
  const [isDisconnecting, setIsDisconnecting] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setSyncStatus({
        google: Boolean(user.googleFitConnected),
        samsung: Boolean(user.samsungHealthConnected),
      })
      setTwoFactorEnabled(Boolean(user.twoFactorEnabled))
      setPasswordLastChangedAt(user.passwordLastChangedAt || null)
    }
  }, [user])

  const { toast } = useToast()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, WebP).",
        variant: "destructive"
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please choose an image smaller than 10MB.",
        variant: "destructive"
      })
      return
    }

    // Read local file as data URL and open cropper modal
    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const localData = uploadEvent.target?.result as string
      if (localData) {
        setCropSourceImage(localData)
        setCropperOpen(true)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCropComplete = async (croppedDataUrl: string) => {
    try {
      setIsUploadingPhoto(true)
      setFormData((prev) => ({ ...prev, avatarBase64: croppedDataUrl }))

      // Upload directly to server-side authenticated Cloudinary endpoint
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: croppedDataUrl,
          folder: 'users/avatars'
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.url) {
          setFormData((prev) => ({ ...prev, avatarBase64: data.url }))
          toast({ title: 'Photo Cropped & Uploaded', description: 'Photo uploaded to Cloudinary. Click "Save Changes" to apply.' })
        }
      } else {
        toast({ title: 'Photo Ready', description: 'Cropped preview loaded. Click "Save Changes" to save to your profile.' })
      }
    } catch (err) {
      console.error('Error uploading cropped photo:', err)
      toast({ title: 'Notice', description: 'Cropped preview loaded. Click "Save Changes" to save.' })
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error('Failed to update')
      const data = await res.json()
      if (data?.user?.avatarUrl) {
        onUpdateUser?.({ avatarUrl: data.user.avatarUrl })
      }
      
      toast({ title: 'Success', description: 'Profile updated successfully.' })
      setIsEditing(false)
      window.location.reload()
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleSync = (provider: 'google' | 'samsung') => {
    if (!syncStatus[provider]) {
      setConnectModalProvider(provider)
    } else {
      handleDisconnect(provider)
    }
  }

  const handleDisconnect = async (provider: 'google' | 'samsung') => {
    const providerName = provider === 'google' ? 'Google Fit' : 'Samsung Health'
    setIsDisconnecting(provider)
    try {
      const res = await fetch('/api/user/connected-apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, connected: false })
      })

      if (res.ok) {
        setSyncStatus(prev => ({ ...prev, [provider]: false }))
        onUpdateUser?.({ [`${provider === 'google' ? 'googleFit' : 'samsungHealth'}Connected`]: false })
        toast({
          title: `${providerName} Disconnected`,
          description: 'Telemetry synchronization has been paused.'
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: `Failed to disconnect ${providerName}.`,
        variant: 'destructive'
      })
    } finally {
      setIsDisconnecting(null)
    }
  }

  const formatLastChanged = (dateStr?: string | null) => {
    if (!dateStr) return 'Last changed never'
    try {
      const d = new Date(dateStr)
      return `Last changed ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    } catch {
      return 'Last changed recently'
    }
  }

  const InputField = ({ label, value, type = "text", onChange, placeholder = "", disabled = false, note = "" }: any) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {isEditing && !disabled ? (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-muted-foreground/50"
        />
      ) : (
        <div className="px-3 py-2.5 bg-muted/30 border border-transparent rounded-lg text-sm text-foreground font-medium h-10.5 flex items-center">
          {value || <span className="text-muted-foreground font-normal">Not provided</span>}
        </div>
      )}
      {note && <p className="text-[11px] text-muted-foreground mt-1">{note}</p>}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Profile & Settings</h2>
          <p className="text-sm text-muted-foreground">Manage your personal information, metrics, and integrations.</p>
        </div>
        <Button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          variant={isEditing ? "default" : "outline"}
          className={cn("shrink-0 transition-all", isEditing ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "")}
          disabled={isSaving || isUploadingPhoto}
        >
          {isEditing ? (
            <>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </>
          ) : (
            'Edit Profile'
          )}
        </Button>
      </div>

      <div className="space-y-10">
        
        {/* Personal Information */}
        <section className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
            <p className="text-sm text-muted-foreground mt-1">Your basic contact and identity details.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <div className="sm:col-span-2 space-y-3">
              <label className="text-sm font-medium text-foreground block">Profile Photo</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="relative w-24 h-24 rounded-full bg-muted border-2 border-border overflow-hidden shrink-0 group shadow-inner">
                  {formData.avatarBase64 ? (
                    <img
                      src={formData.avatarBase64}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-lg uppercase">
                      {formData.name?.substring(0, 2) || 'NA'}
                    </div>
                  )}
                  {isEditing && (
                    <label
                      htmlFor="profile-photo-input"
                      className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      {isUploadingPhoto ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Camera className="w-5 h-5 mb-0.5" />
                          <span className="text-[10px] font-medium">Change</span>
                        </>
                      )}
                    </label>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      id="profile-photo-input"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      className="hidden"
                      onChange={handlePhotoFileChange}
                      disabled={isUploadingPhoto}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => document.getElementById('profile-photo-input')?.click()}
                        disabled={isUploadingPhoto}
                        className="text-xs h-8"
                      >
                        {isUploadingPhoto ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Camera className="w-3.5 h-3.5 mr-1.5" />
                            {formData.avatarBase64 ? 'Change Photo' : 'Upload Photo'}
                          </>
                        )}
                      </Button>
                      {formData.avatarBase64 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCropSourceImage(formData.avatarBase64)
                            setCropperOpen(true)
                          }}
                          disabled={isUploadingPhoto}
                          className="text-xs h-8 gap-1.5"
                        >
                          <Crop className="w-3.5 h-3.5" />
                          Crop & Adjust
                        </Button>
                      )}
                      {formData.avatarBase64 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setFormData((prev) => ({ ...prev, avatarBase64: '' }))}
                          disabled={isUploadingPhoto}
                          className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      PNG, JPG or WebP up to 10MB. Adjust, crop & save anytime.
                    </p>
                  </div>
                ) : (
                  formData.avatarBase64 && (
                    <p className="text-xs text-muted-foreground">
                      Click &quot;Edit Profile&quot; to change or crop your photo.
                    </p>
                  )
                )}
              </div>

              {/* Profile Cropper Modal */}
              <ProfileCropperModal
                isOpen={cropperOpen}
                onClose={() => setCropperOpen(false)}
                imageSrc={cropSourceImage}
                onCropComplete={handleCropComplete}
              />
            </div>
            <InputField
              label="Full Name"
              value={formData.name}
              onChange={(e: any) => setFormData({...formData, name: e.target.value})}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <div className="px-3 py-2.5 bg-muted/30 border border-transparent rounded-lg text-sm text-foreground/80 font-medium h-10.5 flex items-center justify-between">
                <span className="truncate">{user?.email}</span>
                {user?.authProvider === 'google' && (
                  <span className="text-[10px] bg-background border border-border px-1.5 py-0.5 rounded font-medium uppercase tracking-wider text-muted-foreground ml-2 shrink-0">Google</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Email cannot be changed.</p>
            </div>
            <InputField
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e: any) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
        </section>

        <hr className="border-border/50" />

        {/* Physical Metrics */}
        <section className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Physical Metrics</h3>
            <p className="text-sm text-muted-foreground mt-1">Used to tailor your programs and track progress.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-6">
            <InputField
              label="Age (Years)"
              type="number"
              value={formData.age}
              onChange={(e: any) => setFormData({...formData, age: e.target.value})}
            />
            <InputField
              label="Height (cm)"
              type="number"
              value={formData.height}
              onChange={(e: any) => setFormData({...formData, height: e.target.value})}
            />
            <InputField
              label="Weight (kg)"
              type="number"
              value={formData.weight}
              onChange={(e: any) => setFormData({...formData, weight: e.target.value})}
            />
          </div>
        </section>

        <hr className="border-border/50" />

        {/* Connected Apps */}
        <section className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Connected Apps</h3>
            <p className="text-sm text-muted-foreground mt-1">Sync your fitness data with third-party applications.</p>
          </div>
          <div className="space-y-4">
            
            {/* Google Fit */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/30 transition-colors hover:bg-card/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-muted/40 border border-border/50">
                  <GoogleFitIcon className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">Google Fit</p>
                    {syncStatus.google && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {syncStatus.google ? 'Syncing active • Steps, calories, heart rate' : 'Not connected'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleSync('google')}
                disabled={isDisconnecting === 'google'}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50",
                  syncStatus.google ? "bg-primary" : "bg-muted"
                )}
                aria-label="Toggle Google Fit"
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                    syncStatus.google ? "translate-x-2" : "-translate-x-2"
                  )}
                />
              </button>
            </div>

            {/* Samsung Health */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/30 transition-colors hover:bg-card/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-muted/40 border border-border/50">
                  <SamsungHealthIcon className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">Samsung Health</p>
                    {syncStatus.samsung && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {syncStatus.samsung ? 'Syncing active • Galaxy Watch & daily activity' : 'Not connected'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleSync('samsung')}
                disabled={isDisconnecting === 'samsung'}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50",
                  syncStatus.samsung ? "bg-primary" : "bg-muted"
                )}
                aria-label="Toggle Samsung Health"
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                    syncStatus.samsung ? "translate-x-2" : "-translate-x-2"
                  )}
                />
              </button>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg">
              <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                We request permission to securely access your fitness data to power our AI Health Insights. You can revoke access at any time.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-border/50" />

        {/* Security */}
        <section className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Security</h3>
            <p className="text-sm text-muted-foreground mt-1">Manage your account security and authentication.</p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/30">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">Password</p>
                <p className="text-xs text-muted-foreground">{formatLastChanged(passwordLastChangedAt)}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPasswordModalOpen(true)}
                className="shrink-0 h-8 text-xs font-semibold rounded-lg hover:border-primary/50 transition-colors"
              >
                Update
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                  {twoFactorEnabled ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">
                      Disabled
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {twoFactorEnabled
                    ? 'Secured with Authenticator App (TOTP)'
                    : 'Not enabled for your account'}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsTwoFactorModalOpen(true)}
                className={cn(
                  "shrink-0 h-8 text-xs font-semibold rounded-lg transition-colors",
                  twoFactorEnabled
                    ? "text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                    : "hover:border-primary/50"
                )}
              >
                {twoFactorEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>
        </section>

      </div>

      {/* Security & Connected Apps Modals */}
      <UpdatePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={(newTimestamp) => {
          setPasswordLastChangedAt(newTimestamp)
          onUpdateUser?.({ passwordLastChangedAt: newTimestamp })
        }}
      />

      <TwoFactorModal
        isOpen={isTwoFactorModalOpen}
        onClose={() => setIsTwoFactorModalOpen(false)}
        isEnabled={twoFactorEnabled}
        userEmail={user?.email || ''}
        onSuccess={(enabled) => {
          setTwoFactorEnabled(enabled)
          onUpdateUser?.({ twoFactorEnabled: enabled })
        }}
      />

      <ConnectAppModal
        isOpen={connectModalProvider !== null}
        provider={connectModalProvider}
        onClose={() => setConnectModalProvider(null)}
        onSuccess={(provider) => {
          setSyncStatus(prev => ({ ...prev, [provider]: true }))
          onUpdateUser?.({ [`${provider === 'google' ? 'googleFit' : 'samsungHealth'}Connected`]: true })
        }}
      />
    </div>
  )
}