'use client'

import { CreditCard, Download, FileText, CheckCircle2, Loader2, Info } from 'lucide-react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function BillingTab({ user }: { user: any }) {
  const { data, error, isLoading } = useSWR('/api/user/invoices', fetcher)

  if (isLoading) {
    return <BillingSkeleton />
  }

  const membership = data?.membership
  const invoices = data?.invoices || []

  const handleDownloadInvoice = (invoice: any) => {
    import('jspdf').then((jsPDF) => {
      import('jspdf-autotable').then((autoTableModule) => {
        const autoTable = autoTableModule.default
        const doc = new jsPDF.default()

        // Apple-like Elegant Design
        
        // 1. Header (Logo Text + INVOICE)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(24)
        doc.setTextColor(30, 30, 30) // Dark Grey/Black
        doc.text('UNICORN FITNESS', 14, 25)
        
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.setFont("helvetica", "normal")
        doc.text('PREMIUM GYM & WELLNESS', 14, 31)

        doc.setFontSize(28)
        doc.setTextColor(240, 240, 240) // Very light grey for INVOICE watermark-style
        doc.setFont("helvetica", "bold")
        doc.text('INVOICE', 196, 30, { align: 'right' })

        // 2. Line Separator
        doc.setDrawColor(240, 240, 240)
        doc.setLineWidth(0.5)
        doc.line(14, 42, 196, 42)

        // 3. Bill To & Meta
        doc.setFontSize(9)
        doc.setTextColor(150, 150, 150)
        doc.setFont("helvetica", "bold")
        doc.text('BILLED TO', 14, 55)
        
        doc.setFontSize(11)
        doc.setTextColor(50, 50, 50)
        doc.setFont("helvetica", "normal")
        doc.text(user?.name || 'Valued Member', 14, 62)
        doc.setTextColor(100, 100, 100)
        doc.text(user?.email || '', 14, 68)
        if (user?.phone) doc.text(user.phone, 14, 74)

        // Meta (Right aligned)
        doc.setFontSize(9)
        doc.setTextColor(150, 150, 150)
        doc.setFont("helvetica", "bold")
        doc.text('INVOICE NUMBER', 196, 55, { align: 'right' })
        
        doc.setFontSize(11)
        doc.setTextColor(50, 50, 50)
        doc.setFont("helvetica", "normal")
        doc.text(`INV-${invoice.id.substring(0, 8).toUpperCase()}`, 196, 62, { align: 'right' })

        doc.setFontSize(9)
        doc.setTextColor(150, 150, 150)
        doc.setFont("helvetica", "bold")
        doc.text('DATE OF ISSUE', 196, 72, { align: 'right' })
        
        doc.setFontSize(11)
        doc.setTextColor(50, 50, 50)
        doc.setFont("helvetica", "normal")
        doc.text(new Date(invoice.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }), 196, 79, { align: 'right' })

        // 4. Clean Table
        const baseAmount = Math.round(invoice.amount / 1.18);
        const taxAmount = invoice.amount - baseAmount;

        autoTable(doc, {
          startY: 100,
          head: [['DESCRIPTION', 'PERIOD', 'BASE PRICE', 'TAX (18%)', 'AMOUNT']],
          body: [
            [
              `Membership Plan: ${invoice.planName}`,
              '1 Term',
              `INR ${baseAmount.toLocaleString('en-IN')}`,
              `INR ${taxAmount.toLocaleString('en-IN')}`,
              `INR ${invoice.amount.toLocaleString('en-IN')}`
            ]
          ],
          theme: 'plain',
          headStyles: { 
            textColor: [120, 120, 120], 
            fontStyle: 'bold', 
            fontSize: 8,
          },
          bodyStyles: { 
            textColor: [50, 50, 50], 
            fontSize: 10,
          },
          columnStyles: {
            0: { cellWidth: 70 },
            1: { halign: 'center' },
            2: { halign: 'right' },
            3: { halign: 'right' },
            4: { halign: 'right' }
          },
          didDrawCell: (data) => {
            if (data.row.section === 'head' || data.row.section === 'body') {
              doc.setDrawColor(240, 240, 240)
              doc.setLineWidth(0.5)
              doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height)
            }
          }
        })

        const finalY = (doc as any).lastAutoTable.finalY || 135

        // 5. Total Block
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.setFont("helvetica", "normal")
        doc.text('Total Due', 140, finalY + 15)

        doc.setFontSize(20)
        doc.setTextColor(30, 30, 30)
        doc.setFont("helvetica", "bold")
        doc.text(`INR ${invoice.amount.toLocaleString('en-IN')}`, 196, finalY + 16, { align: 'right' })

        // 6. Minimal Footer
        const pageHeight = doc.internal.pageSize.height || 297;
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.setFont("helvetica", "normal")
        doc.text('1. This is a computer-generated tax invoice.', 14, pageHeight - 25)
        doc.text('2. Memberships are non-refundable.', 14, pageHeight - 20)
        doc.text('3. All disputes subject to Jaipur jurisdiction.', 14, pageHeight - 15)
        
        doc.setTextColor(180, 180, 180)
        doc.text('Unicorn Fitness Club • Jaipur, IN', 196, pageHeight - 15, { align: 'right' })

        doc.save(`Unicorn_Fitness_Invoice_INV-${invoice.id.substring(0, 8).toUpperCase()}.pdf`)
      })
    }).catch(console.error)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Billing & Invoices</h2>
          <p className="text-sm text-muted-foreground">Manage your subscription and billing history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Current Plan</h3>
          <p className="text-sm text-muted-foreground mt-1">Your active membership details.</p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <CreditCard className="w-32 h-32" />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-2xl font-bold text-foreground">{membership?.planName || 'Free Tier'}</h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${membership?.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                  {membership?.status || 'Inactive'}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-foreground">
                  ₹{membership?.price || 0}
                </span>
                <span className="text-sm text-muted-foreground font-medium">/ {membership?.period || 'month'}</span>
              </div>
            </div>
            
            <div className="text-left sm:text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Next Billing Date</p>
              <p className="text-foreground font-medium text-sm">
                {membership?.nextBilling ? new Date(membership.nextBilling).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
              </p>
            </div>
          </div>

          <div className="pt-5 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div className="flex items-start gap-2">
               <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
               <p className="text-xs text-muted-foreground leading-relaxed">
                 For payment method updates, cancellations, or plan changes, please visit the front desk or call support.
               </p>
             </div>
          </div>
        </div>
      </div>

      <hr className="border-border/50" />

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Invoice History</h3>
          <p className="text-sm text-muted-foreground mt-1">Download past receipts.</p>
        </div>
        
        <div>
          {invoices.length > 0 ? (
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left min-w-120">
                  <thead className="bg-muted/50 text-muted-foreground font-medium">
                    <tr>
                      <th className="px-4 sm:px-6 py-3.5 sm:py-4">Date</th>
                      <th className="px-4 sm:px-6 py-3.5 sm:py-4">Plan</th>
                      <th className="px-4 sm:px-6 py-3.5 sm:py-4">Amount</th>
                      <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {invoices.map((invoice: any) => (
                      <tr key={invoice.id} className="bg-card hover:bg-muted/30 transition-colors">
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-foreground font-medium whitespace-nowrap">
                          {new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-muted-foreground">
                          {invoice.planName}
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-foreground font-medium">₹{invoice.amount}</span>
                            <span className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                              <CheckCircle2 className="w-3 h-3" /> {invoice.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-right">
                          <Button 
                            onClick={() => handleDownloadInvoice(invoice)}
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Download className="w-4 h-4" />
                            <span className="sr-only">Download invoice</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-muted/30 border border-border/50 border-dashed rounded-xl text-center">
              <FileText className="w-10 h-10 text-muted-foreground/50 mb-4" />
              <p className="text-foreground font-medium mb-1">No invoices found</p>
              <p className="text-sm text-muted-foreground">Your payment history will appear here once you subscribe to a plan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BillingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      {/* Current Plan Section */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-44" />
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-36" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-8 w-28" />
            </div>
            <div className="space-y-2 text-left sm:text-right">
              <Skeleton className="h-3 w-24 sm:ml-auto" />
              <Skeleton className="h-5 w-32 sm:ml-auto" />
            </div>
          </div>
          <div className="pt-5 border-t border-border/50">
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>

      <hr className="border-border/50" />

      {/* Invoice History Section */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
          <div className="p-4 bg-muted/40 border-b border-border/50 flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="divide-y divide-border/50 p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between pt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-7 w-7 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}