'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  Eye,
  EyeOff,
  Lock,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Loader2,
  Smartphone,
  Flame,
  Activity,
  Heart,
  AlertCircle
} from 'lucide-react'
import { GoogleFitIcon, SamsungHealthIcon } from '@/components/icons/brand-icons'
import { copyToClipboard } from '@/lib/utils'

// ==========================================
// 1. UPDATE PASSWORD MODAL
// ==========================================

interface UpdatePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newTimestamp: string) => void
}

export function UpdatePasswordModal({ isOpen, onClose, onSuccess }: UpdatePasswordModalProps) {
  const { toast } = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setError('')
      setShowCurrent(false)
      setShowNew(false)
      setShowConfirm(false)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!currentPassword) {
      setError('Please enter your current password.')
      return
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from your current password.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/user/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to update password. Please check your current password.')
        return
      }

      toast({
        title: 'Password Updated',
        description: 'Your account password has been changed successfully.'
      })

      onSuccess(data.passwordLastChangedAt || new Date().toISOString())
      onClose()
    } catch (err) {
      console.error(err)
      setError('A network error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border/60 p-6 rounded-2xl shadow-xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1">
            <KeyRound className="w-5 h-5" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Update Password
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Enter your current password and choose a secure new password for your account.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground pr-10 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                New Password
              </label>
              <span className="text-[11px] text-muted-foreground">Min. 8 characters</span>
            </div>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground pr-10 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground pr-10 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-10"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save New Password'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==========================================
// 2. TWO-FACTOR AUTHENTICATION MODAL
// ==========================================

interface TwoFactorModalProps {
  isOpen: boolean
  onClose: () => void
  isEnabled: boolean
  onSuccess: (enabled: boolean) => void
  userEmail: string
}

export function TwoFactorModal({
  isOpen,
  onClose,
  isEnabled,
  onSuccess,
  userEmail
}: TwoFactorModalProps) {
  const { toast } = useToast()
  const [setupData, setSetupData] = useState<{
    secret: string
    otpauthUrl: string
    qrCodeUrl: string
  } | null>(null)

  const [code, setCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [showDisablePassword, setShowDisablePassword] = useState(false)
  const [copied, setCopied] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingSetup, setIsFetchingSetup] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setCode('')
      setDisablePassword('')
      setError('')
      setCopied(false)

      if (!isEnabled) {
        setIsFetchingSetup(true)
        fetch('/api/user/security/2fa')
          .then(res => res.json())
          .then(data => {
            if (data.secret) {
              setSetupData({
                secret: data.secret,
                otpauthUrl: data.otpauthUrl,
                qrCodeUrl: data.qrCodeUrl
              })
            }
          })
          .catch(err => {
            console.error('Failed to load 2FA setup:', err)
            setError('Could not initialize 2FA setup. Please try again.')
          })
          .finally(() => setIsFetchingSetup(false))
      }
    }
  }, [isOpen, isEnabled])

  const handleCopySecret = async () => {
    if (!setupData?.secret) return
    const ok = await copyToClipboard(setupData.secret)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanCode = code.trim().replace(/\s+/g, '')
    if (cleanCode.length !== 6) {
      setError('Please enter the 6-digit code from your authenticator app.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/user/security/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enable',
          code: cleanCode,
          secret: setupData?.secret
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid code. Please check your authenticator and try again.')
        return
      }

      toast({
        title: 'Two-Factor Authentication Active',
        description: 'Your account is now protected with 2FA.'
      })

      onSuccess(true)
      onClose()
    } catch (err) {
      console.error(err)
      setError('Failed to verify code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/user/security/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'disable',
          password: disablePassword
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to disable 2FA. Please check your password.')
        return
      }

      toast({
        title: 'Two-Factor Authentication Disabled',
        description: 'Two-factor protection has been removed from your account.'
      })

      onSuccess(false)
      onClose()
    } catch (err) {
      console.error(err)
      setError('Network error while disabling 2FA.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card border-border/60 p-6 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 text-left">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1">
            <Smartphone className="w-5 h-5" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {isEnabled ? 'Disable Two-Factor Authentication' : 'Set Up Two-Factor Authentication'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEnabled
              ? 'Disabling 2FA will lower your account security. You will only need your password to log in.'
              : 'Protect your UFC Gym account by requiring an authentication code whenever you sign in.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!isEnabled ? (
          /* SETUP FLOW */
          <div className="space-y-6 pt-2">
            {isFetchingSetup ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground">Generating secure authenticator key...</p>
              </div>
            ) : setupData ? (
              <>
                <div className="p-4 bg-muted/40 rounded-xl border border-border/50 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary">
                      1
                    </span>
                    Scan QR code with your authenticator
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-2">
                    <div className="p-2 bg-white rounded-xl shadow-xs border border-border shrink-0">
                      <img
                        src={setupData.qrCodeUrl}
                        alt="2FA QR Code"
                        className="w-36 h-36 object-contain"
                      />
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p className="leading-relaxed">
                        Open your preferred authenticator app (such as Google Authenticator, Microsoft Authenticator, Apple Passwords, or 1Password) and scan this code.
                      </p>
                      <p className="font-medium text-foreground">
                        Account: <span className="text-primary">{userEmail}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Manual Setup Key */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px]">
                      2
                    </span>
                    Or enter setup key manually
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-muted/60 border border-border rounded-xl">
                    <code className="text-xs font-mono font-bold tracking-widest text-foreground flex-1 break-all px-2 select-all">
                      {setupData.secret}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCopySecret}
                      className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground shrink-0 gap-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </Button>
                  </div>
                </div>

                {/* Verification Code Form */}
                <form onSubmit={handleEnable} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                      3. Enter 6-digit verification code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      placeholder="e.g. 123456"
                      required
                      autoFocus
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-center text-xl font-mono tracking-[0.5em] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
                    />
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-border/50">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={isLoading}
                      className="rounded-xl h-10"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || code.trim().length !== 6}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-10"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify & Enable 2FA'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </>
            ) : null}
          </div>
        ) : (
          /* DISABLE FLOW */
          <form onSubmit={handleDisable} className="space-y-4 pt-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-xs leading-relaxed flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Please confirm your current password to disable two-factor authentication.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showDisablePassword ? 'text' : 'password'}
                  value={disablePassword}
                  onChange={e => setDisablePassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoFocus
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground pr-10 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowDisablePassword(!showDisablePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showDisablePassword ? 'Hide password' : 'Show password'}
                >
                  {showDisablePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="rounded-xl h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !disablePassword}
                variant="destructive"
                className="font-semibold rounded-xl h-10"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  'Confirm & Disable 2FA'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ==========================================
// 3. CONNECT APP MODAL (Google Fit / Samsung)
// ==========================================

interface ConnectAppModalProps {
  isOpen: boolean
  onClose: () => void
  provider: 'google' | 'samsung' | null
  onSuccess: (provider: 'google' | 'samsung', metrics: any) => void
}

export function ConnectAppModal({
  isOpen,
  onClose,
  provider,
  onSuccess
}: ConnectAppModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setError('')
      setIsLoading(false)
    }
  }, [isOpen])

  if (!provider) return null

  const isGoogle = provider === 'google'
  const appName = isGoogle ? 'Google Fit' : 'Samsung Health'

  const handleConnect = async () => {
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/user/connected-apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, connected: true })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || `Failed to connect ${appName}. Please try again.`)
        return
      }

      toast({
        title: `${appName} Connected`,
        description: data.message || `Biometric telemetry active. Synced daily metrics.`
      })

      onSuccess(provider, data.metrics)
      onClose()
    } catch (err) {
      console.error(err)
      setError(`Network error connecting ${appName}. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border/60 p-6 rounded-2xl shadow-xl">
        <DialogHeader className="space-y-3 text-left">
          <div className="w-12 h-12 rounded-2xl bg-muted/60 border border-border/60 flex items-center justify-center mb-1">
            {isGoogle ? <GoogleFitIcon className="w-8 h-8" /> : <SamsungHealthIcon className="w-8 h-8" />}
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Connect {appName}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Authorize UFC Gym to securely synchronize your activity and biometric telemetry to deliver personalized AI Health Insights.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Permissions summary */}
        <div className="space-y-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Requested Data Permissions:
          </p>

          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl border border-border/40">
              <Activity className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground">Daily Steps & Walking Distance</p>
                <p className="text-[11px] text-muted-foreground">Syncs daily steps to track fitness consistency.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl border border-border/40">
              <Flame className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground">Active Calorie Expenditure</p>
                <p className="text-[11px] text-muted-foreground">Calculates macro requirements and energy burn.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl border border-border/40">
              <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground">Heart Rate Telemetry</p>
                <p className="text-[11px] text-muted-foreground">Monitors cardiovascular load during intense workouts.</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-muted/40 rounded-lg text-[11px] text-muted-foreground leading-relaxed flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Data is encrypted end-to-end. You can revoke access at any time.</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl h-10"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConnect}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-10"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting & Syncing...
              </>
            ) : (
              'Connect & Authorize'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
