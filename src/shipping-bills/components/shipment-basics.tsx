import React from 'react'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import type { FormContextData } from 'ui/form'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { partyMockService } from '../party-mock-service'
import type { DropdownOption, PortOption, ShippingBillFormData, ShippingBillFormValues } from '../types'
import { PartyBranchPath, PartyFields } from './party-fields'
import { SearchableSelect } from './searchable-select'

export function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">{title}</h3>
    </div>
  )
}

export function Advanced({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50/60 p-4">
      <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">{title}</summary>
      <div className="mt-4">{children}</div>
    </details>
  )
}

interface ShipmentBasicsProps {
  formCtx: FormContextData<ShippingBillFormValues>
  formData: ShippingBillFormData
  onQuickAddExporter: () => void
  onQuickAddConsignee: () => void
  onAddBranch: (kind: 'exporter' | 'business', ownerId: number, branchName: PartyBranchPath) => void
  marksAndNumbersOptions: DropdownOption[]
  marksAndNumbersLoading?: boolean
}

export function ShipmentBasics({
  formCtx,
  formData,
  onQuickAddExporter,
  onQuickAddConsignee,
  onAddBranch,
  marksAndNumbersOptions,
  marksAndNumbersLoading = false
}: ShipmentBasicsProps) {
  const { register, watch } = formCtx.hooks
  const values = watch()
  const isMnDisabled = !values.exporterId || marksAndNumbersLoading || marksAndNumbersOptions.length === 0

  const destinationPortOptions = formData.destinationPorts.map((p) => ({
    value: p.code,
    label: `${p.name} · ${p.code} (${p.countryCode})`
  }))

  const stateSelectOptions = formData.states as { value: string | number; label: string }[]

  function getCountry(code?: string, ports?: PortOption[]) {
    if (!code) return ''
    const match = ports?.find((p) => p.code === code)
    return match ? match.countryCode : ''
  }

  const originCountry = getCountry(values.loadingPort, formData.loadingPorts)
  const destinationCountry = getCountry(values.finalDestinationPort, formData.destinationPorts)

  return (
    <Card>
      <CardHeader
        title="Shipment basics"
        description="Core details including parties, routing, and packaging specifications."
      />
      <CardContent className="space-y-6">
        <PartyFields
          formCtx={formCtx}
          ownerName="exporterId"
          branchName="exporterBranchId"
          label="Exporter"
          kind="exporter"
          parties={formData.exporters}
          onQuickAdd={onQuickAddExporter}
          onAddBranch={(ownerId) => onAddBranch('exporter', ownerId, 'exporterBranchId')}
        />

        <PartyFields
          formCtx={formCtx}
          ownerName="consigneeId"
          branchName="consigneeBranchId"
          label="Consignee"
          kind="business"
          parties={formData.businesses}
          onQuickAdd={onQuickAddConsignee}
          onAddBranch={(ownerId) => onAddBranch('business', ownerId, 'consigneeBranchId')}
        />

        <div className="border-t border-gray-200 pt-5">
          <SectionHeading title="Route" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-sm font-medium text-gray-800">Port of loading</span>
              <SearchableSelect
                name="loadingPort"
                placeholder="Select Indian loading port..."
                rules={{ required: true }}
                fetchOptions={async (query) => {
                  const res = await partyMockService.searchLoadingPorts(query)
                  return res.map((port) => ({
                    value: port.code,
                    label: `${port.name} · ${port.code}`,
                    sublabel: `Country: ${port.countryCode}`
                  }))
                }}
                getInitialLabel={async (code) => {
                  const port = await partyMockService.getPortByCode(code)
                  return port ? `${port.name} · ${port.code}` : code
                }}
              />
            </div>
            <div>
              <span className="mb-1 block text-sm font-medium text-gray-800">Final destination port</span>
              <SearchableSelect
                name="finalDestinationPort"
                placeholder="Select destination port..."
                rules={{ required: true }}
                fetchOptions={async (query) => {
                  const res = await partyMockService.searchDestinationPorts(query)
                  return res.map((port) => ({
                    value: port.code,
                    label: `${port.name} · ${port.code}`,
                    sublabel: `Country: ${port.countryCode}`
                  }))
                }}
                getInitialLabel={async (code) => {
                  const port = await partyMockService.getPortByCode(code)
                  return port ? `${port.name} · ${port.code}` : code
                }}
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Routing corridor: {originCountry || 'Origin'} → {destinationCountry || 'Destination'}.
          </p>
        </div>

        <Advanced title="Regulatory and route exceptions">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Select<ShippingBillFormValues>
              label="Discharge port"
              name="dischargePort"
              options={destinationPortOptions}
              placeholder="Defaults to destination"
            />
            <Select<ShippingBillFormValues>
              label="Origin state"
              name="originStateCode"
              options={stateSelectOptions}
              placeholder="Select branch state"
            />
            <div />
            <Select<ShippingBillFormValues>
              label="NFEI category"
              name="nfeiCategory"
              options={[
                { value: '01', label: 'Free trade sample' },
                { value: '02', label: 'Diplomatic goods' },
                { value: '03', label: 'Warranty replacement' },
                { value: '07', label: 'Gift parcel' },
                { value: '08', label: 'Other' }
              ]}
              placeholder="Not applicable"
            />
            <Input label="RBI waiver number" {...register('rbiWaiverNumber')} />
            <Input label="RBI waiver date" type={'date' as any} {...register('rbiWaiverDate')} />
          </div>
        </Advanced>

        <div className="border-t border-gray-200 pt-5">
          <SectionHeading title="Package Details" />
          <div className="grid gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select<ShippingBillFormValues>
              label="Nature of cargo"
              name="natureOfCargo"
              options={formData.cargoOptions}
            />
            <Input label="Gross weight" type="number" {...register('grossWeight')} />
            <Input label="Net weight" type="number" {...register('netWeight')} />
            <Select<ShippingBillFormValues> label="Weight unit" name="measurementUnit" options={formData.weightUnits} />
            <Input label="Total packages" type="number" {...register('totalPackages')} />
            <Select<ShippingBillFormValues>
              label="Marks and numbers"
              name="marksAndNumbers"
              options={marksAndNumbersOptions}
              placeholder={
                !values.exporterId
                  ? 'Select exporter first'
                  : marksAndNumbersLoading
                    ? 'Loading marks & numbers...'
                    : 'Select marks & numbers'
              }
              disabled={isMnDisabled}
              wrapClass="sm:col-span-3"
            />
          </div>

          <Advanced title="Additional Packaging & Dispatch Details">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Select<ShippingBillFormValues>
                label="Seal type"
                name="sealType"
                options={formData.sealTypes}
                placeholder="Select seal type"
              />
              {values.containers.length === 0 && (
                <Input label="Number of containers" type="number" {...register('numberOfContainers')} />
              )}
              <Input label="Loose packets" type="number" {...register('loosePackets')} />
              <Input label="MAWB number" {...register('mawbNumber')} />
              <Input label="HAWB number" {...register('hawbNumber')} />
            </div>
          </Advanced>
        </div>
      </CardContent>
    </Card>
  )
}
