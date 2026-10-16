import { routes } from '@/shared/route-paths'
import { useForm } from 'core/form'
import { Form, SubmitButton } from 'core/form/components'
import { navigate, useParams } from 'core/routing'
import { toast } from 'core/toast-manager'
import { useEffect, useState } from 'react'
import { Button } from 'ui/basic/button'
import { Tabs, TabsList, TabsTrigger } from 'ui/interactive/tabs'
import { AdditionalDetails } from './components/additional-details'
import { FormLoadErrorView, FormLoadingSkeleton } from './components/form-state-views'
import { InvoicesSection } from './components/invoices-section'
import { PartyBranchPath } from './components/party-fields'
import { ShipmentBasics } from './components/shipment-basics'
import { WorkflowHeader } from './components/workflow-header'
import { getMarksAndNumbersOptions, MarksAndNumbersOption } from './marks-and-numbers-source'
import { emptyBill, SavedBill, ShippingBillFormValues } from './model'
import { BranchDialog, PartyDialog } from './party-dialogs'
import { getShippingBillById, getShippingBillFormData, submitShippingBill } from './shipping-bill-service'
import type { Branch, Business, Exporter, ShippingBillFormData } from './types'
import { billSchema } from './validation/shipping-bill-schema'

interface QuickAddState {
  kind: 'exporter' | 'business'
  role?: 'consignee' | 'buyer' | 'thirdParty' | 'itemThirdParty'
  invoiceIndex?: number
  itemIndex?: number
}

interface QuickBranchState {
  kind: 'exporter' | 'business'
  ownerId: number
  branchName: PartyBranchPath
}

function PersistentTab({
  value,
  activeTab,
  children,
  className
}: {
  value: string
  activeTab: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div role="tabpanel" hidden={activeTab !== value} className={className}>
      {children}
    </div>
  )
}

function BillEditor({ bill, initialFormData }: { bill?: SavedBill; initialFormData: ShippingBillFormData }) {
  const [formData, setFormData] = useState<ShippingBillFormData>(initialFormData)
  const [activeTab, setActiveTab] = useState<'details' | 'invoices' | 'documents'>('details')
  const [quickAdd, setQuickAdd] = useState<QuickAddState | null>(null)
  const [quickBranch, setQuickBranch] = useState<QuickBranchState | null>(null)
  const [marksOptions, setMarksOptions] = useState<MarksAndNumbersOption[]>([])
  const [marksLoading, setMarksLoading] = useState(false)

  const formCtx = useForm<ShippingBillFormValues>(billSchema, {
    defaultValues: bill?.values ?? emptyBill()
  })

  const { setValue, watch, formState } = formCtx.hooks
  const selectedExporterId = watch('exporterId')

  // Load marks & numbers asynchronously when exporter selection changes
  useEffect(() => {
    if (!selectedExporterId) {
      setMarksOptions([])
      return
    }
    let active = true
    setMarksLoading(true)
    getMarksAndNumbersOptions(selectedExporterId)
      .then((opts) => {
        if (active) setMarksOptions(opts)
      })
      .catch(() => {
        if (active) setMarksOptions([])
      })
      .finally(() => {
        if (active) setMarksLoading(false)
      })

    return () => {
      active = false
    }
  }, [selectedExporterId])

  // Automatically navigate to the tab that contains validation errors on submit
  useEffect(() => {
    if (formState.submitCount === 0) return
    const errorKeys = Object.keys(formState.errors)
    if (errorKeys.length === 0) return

    const detailsFields = [
      'jobDate',
      'exporterId',
      'exporterBranchId',
      'consigneeId',
      'consigneeBranchId',
      'loadingPort',
      'finalDestinationPort'
    ]

    if (detailsFields.some((f) => f in formState.errors)) {
      setActiveTab('details')
    } else if (formState.errors.invoices) {
      setActiveTab('invoices')
    } else if (
      formState.errors.containers ||
      formState.errors.packingRanges ||
      formState.errors.documents ||
      formState.errors.licenses
    ) {
      setActiveTab('documents')
    }
  }, [formState.submitCount, formState.errors])

  async function handleSave(data: ShippingBillFormValues) {
    const result = await submitShippingBill(data, bill?.id)
    toast.success(result.message)
    navigate(routes.toShippingBillEdit(result.id))
  }

  function handleQuickPartySaved(party: Exporter | Business) {
    const branchId = party.branches[0]?.id
    if (!quickAdd || !branchId) return

    // Refresh formData in state so dropdowns immediately recognize the new entity
    setFormData((prev) => {
      if (quickAdd.kind === 'exporter') {
        return {
          ...prev,
          exporters: [...prev.exporters.filter((e) => e.id !== party.id), party as Exporter]
        }
      } else {
        return {
          ...prev,
          businesses: [...prev.businesses.filter((b) => b.id !== party.id), party as Business]
        }
      }
    })

    if (quickAdd.kind === 'exporter') {
      setValue('exporterId', String(party.id), { shouldValidate: true })
      setValue('exporterBranchId', String(branchId), { shouldValidate: true })
    } else if (quickAdd.role === 'consignee') {
      setValue('consigneeId', String(party.id), { shouldValidate: true })
      setValue('consigneeBranchId', String(branchId), { shouldValidate: true })
    } else if (quickAdd.role === 'itemThirdParty' && quickAdd.invoiceIndex != null && quickAdd.itemIndex != null) {
      setValue(`invoices.${quickAdd.invoiceIndex}.items.${quickAdd.itemIndex}.itemThirdPartyId`, String(party.id), {
        shouldValidate: true
      })
      setValue(
        `invoices.${quickAdd.invoiceIndex}.items.${quickAdd.itemIndex}.itemThirdPartyBranchId`,
        String(branchId),
        { shouldValidate: true }
      )
    } else if (quickAdd.invoiceIndex != null) {
      const field = quickAdd.role === 'buyer' ? 'buyer' : 'thirdParty'
      setValue(`invoices.${quickAdd.invoiceIndex}.${field}Id`, String(party.id), {
        shouldValidate: true
      })
      setValue(`invoices.${quickAdd.invoiceIndex}.${field}BranchId`, String(branchId), {
        shouldValidate: true
      })
    }
    setQuickAdd(null)
  }

  function handleQuickBranchSaved(branch: Branch) {
    if (!quickBranch) return
    setValue(quickBranch.branchName as any, String(branch.id), { shouldValidate: true })
    setQuickBranch(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            className="mb-2 text-sm text-gray-500 hover:text-gray-900 hover:underline"
            onClick={() => navigate(routes.dashboard)}>
            ← Back to shipping bills
          </button>
          <h1 className="text-2xl font-bold text-gray-950">
            {bill ? `Edit Shipping Bill #${bill.id}` : 'New Shipping Bill'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Complete the shipment details, line items, and statutory documents.
          </p>
        </div>
      </div>

      <WorkflowHeader />

      <Form ctx={formCtx} handleSubmit={handleSave} className="space-y-6">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
          <TabsList className="flex w-full justify-start overflow-x-auto border-b border-gray-200">
            <TabsTrigger value="details">1. Shipment Details</TabsTrigger>
            <TabsTrigger value="invoices">2. Invoices & Goods</TabsTrigger>
            <TabsTrigger value="documents">3. Containers & Documents</TabsTrigger>
          </TabsList>

          <PersistentTab value="details" activeTab={activeTab} className="mt-4 space-y-4">
            <ShipmentBasics
              formCtx={formCtx}
              formData={formData}
              onQuickAddExporter={() => setQuickAdd({ kind: 'exporter' })}
              onQuickAddConsignee={() => setQuickAdd({ kind: 'business', role: 'consignee' })}
              onAddBranch={(kind, ownerId, branchName) => setQuickBranch({ kind, ownerId, branchName })}
              marksAndNumbersOptions={marksOptions}
              marksAndNumbersLoading={marksLoading}
            />
          </PersistentTab>

          <PersistentTab value="invoices" activeTab={activeTab} className="mt-4 space-y-4">
            <InvoicesSection
              formCtx={formCtx}
              formData={formData}
              onQuickAdd={(role, invoiceIndex, itemIndex) =>
                setQuickAdd({ kind: 'business', role, invoiceIndex, itemIndex })
              }
              onAddBranch={(kind, ownerId, branchName) => setQuickBranch({ kind, ownerId, branchName })}
            />
          </PersistentTab>

          <PersistentTab value="documents" activeTab={activeTab} className="mt-4 space-y-4">
            <AdditionalDetails formCtx={formCtx} formData={formData} />
          </PersistentTab>
        </Tabs>

        {/* Footer actions with duplicate submission prevention */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-5">
          <Button variant="outline" type="button" onClick={() => navigate(routes.dashboard)}>
            Cancel
          </Button>

          <div className="flex items-center gap-3">
            {activeTab !== 'details' && (
              <Button
                variant="outline"
                type="button"
                onClick={() => setActiveTab(activeTab === 'documents' ? 'invoices' : 'details')}>
                Previous
              </Button>
            )}

            {activeTab !== 'documents' ? (
              <Button type="button" onClick={() => setActiveTab(activeTab === 'details' ? 'invoices' : 'documents')}>
                Next step →
              </Button>
            ) : (
              <SubmitButton>{bill ? 'Save Changes' : 'Create Shipping Bill'}</SubmitButton>
            )}
          </div>
        </div>
      </Form>

      {quickAdd && (
        <PartyDialog
          key={`${quickAdd.kind}-${quickAdd.role ?? 'exporter'}-${quickAdd.invoiceIndex ?? 0}`}
          kind={quickAdd.kind}
          initialRole={quickAdd.role === 'itemThirdParty' ? 'thirdParty' : quickAdd.role}
          onClose={() => setQuickAdd(null)}
          onSaved={handleQuickPartySaved}
        />
      )}

      {quickBranch && (
        <BranchDialog
          key={`${quickBranch.kind}-${quickBranch.ownerId}`}
          kind={quickBranch.kind}
          ownerId={quickBranch.ownerId}
          onClose={() => setQuickBranch(null)}
          onSaved={handleQuickBranchSaved}
        />
      )}
    </div>
  )
}

export default function ShippingBillPage() {
  const { id } = useParams<{ id?: string }>()
  const [formData, setFormData] = useState<ShippingBillFormData | null>(null)
  const [bill, setBill] = useState<SavedBill | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function loadAll() {
    setLoading(true)
    setError(null)

    const promises: [Promise<ShippingBillFormData>, Promise<SavedBill | undefined>] = [
      getShippingBillFormData(),
      id ? getShippingBillById(id) : Promise.resolve(undefined)
    ]

    Promise.all(promises)
      .then(([data, existingBill]) => {
        setFormData(data)
        if (existingBill) {
          setBill(existingBill)
        } else if (id) {
          setError(`Shipping bill #${id} could not be found.`)
        }
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to load shipping bill form data.'
        setError(message)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadAll()
  }, [id])

  if (loading) {
    return <FormLoadingSkeleton message="Initializing shipping bill workspace..." />
  }

  if (error || !formData) {
    return (
      <FormLoadErrorView
        title="Unable to load shipping bill"
        error={error ?? 'An unexpected error occurred while loading data.'}
        onRetry={loadAll}
      />
    )
  }

  return <BillEditor key={id ?? 'new'} bill={bill ?? undefined} initialFormData={formData} />
}
