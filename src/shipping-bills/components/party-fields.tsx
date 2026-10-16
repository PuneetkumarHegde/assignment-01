import { useEffect } from 'react'
import type { FormContextData } from 'ui/form'
import { partyMockService } from '../party-mock-service'
import type { Business, Exporter, ShippingBillFormValues } from '../types'
import { SearchableSelect } from './searchable-select'

export type PartyOwnerPath =
  | 'exporterId'
  | 'consigneeId'
  | `invoices.${number}.buyerId`
  | `invoices.${number}.thirdPartyId`
  | `invoices.${number}.items.${number}.itemThirdPartyId`

export type PartyBranchPath =
  | 'exporterBranchId'
  | 'consigneeBranchId'
  | `invoices.${number}.buyerBranchId`
  | `invoices.${number}.thirdPartyBranchId`
  | `invoices.${number}.items.${number}.itemThirdPartyBranchId`

interface PartyFieldsProps {
  formCtx: FormContextData<ShippingBillFormValues>
  ownerName: PartyOwnerPath
  branchName: PartyBranchPath
  label: string
  kind: 'exporter' | 'business'
  onQuickAdd: () => void
  onAddBranch: (ownerId: number) => void
  parties: Exporter[] | Business[]
  required?: boolean
}

export function PartyFields({
  formCtx,
  ownerName,
  branchName,
  label,
  kind,
  onQuickAdd,
  onAddBranch,
  parties,
  required = false
}: PartyFieldsProps) {
  const { watch, setValue } = formCtx.hooks
  const ownerId = watch(ownerName as any) as string | undefined
  const owner = parties.find((e) => String(e.id) === ownerId)

  // Auto-select single branch if applicable
  useEffect(() => {
    if (owner && owner.branches.length === 1) {
      setValue(branchName as any, String(owner.branches[0].id), {
        shouldDirty: true,
        shouldValidate: true
      })
    }
  }, [ownerId, owner, branchName, setValue])

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-800">{label}</span>
          <button
            type="button"
            className="text-primary-700 text-xs font-medium hover:underline focus:outline-none"
            onClick={onQuickAdd}>
            + Add new
          </button>
        </div>
        <SearchableSelect
          name={ownerName}
          placeholder={`Search & select ${kind}...`}
          rules={{ required }}
          fetchOptions={async (query: string) => {
            if (kind === 'exporter') {
              const res = await partyMockService.searchExporters(query)
              return res.map((item) => ({
                value: String(item.id),
                label: item.name,
                sublabel: item.iec ? `IEC: ${item.iec}` : undefined
              }))
            } else {
              const res = await partyMockService.searchConsignees(query)
              return res.map((item) => ({
                value: String(item.id),
                label: item.name
              }))
            }
          }}
          getInitialLabel={async (id: string) => {
            if (kind === 'exporter') {
              const item = await partyMockService.getExporterById(id)
              return item ? item.name : ''
            } else {
              const item = await partyMockService.getConsigneeById(id)
              return item ? item.name : ''
            }
          }}
        />
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-800">Branch / address</span>
          {owner && (
            <button
              type="button"
              className="text-primary-700 text-xs font-medium hover:underline focus:outline-none"
              onClick={() => onAddBranch(owner.id)}>
              + Add branch
            </button>
          )}
        </div>
        <SearchableSelect
          name={branchName}
          placeholder={owner ? 'Search & select branch...' : `Choose ${kind} first`}
          disabled={!owner}
          rules={{ required: required || !!ownerId }}
          deps={[ownerId]}
          fetchOptions={async (query: string) => {
            if (!ownerId) return []
            if (kind === 'exporter') {
              const res = await partyMockService.searchExporterBranches(ownerId, query)
              return res.map((branch) => ({
                value: String(branch.id),
                label: `${branch.branchName} · ${branch.city}`,
                sublabel: branch.address1
              }))
            } else {
              const res = await partyMockService.searchConsigneeBranches(ownerId, query)
              return res.map((branch) => ({
                value: String(branch.id),
                label: `${branch.branchName} · ${branch.city}`,
                sublabel: branch.address1
              }))
            }
          }}
          getInitialLabel={(id: string) => {
            const branch = owner?.branches.find((b) => String(b.id) === id)
            return Promise.resolve(branch ? `${branch.branchName} · ${branch.city}` : '')
          }}
        />
      </div>
    </div>
  )
}
