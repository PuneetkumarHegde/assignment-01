import { Button } from 'ui/basic/button'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { FormContextData, useFieldArray } from 'ui/form'
import { Checkbox } from 'ui/inputs/checkbox'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { emptyInvoice, emptyItem, invoiceTotal, lineTotal } from '../model'
import type { ShippingBillFormData, ShippingBillFormValues } from '../types'
import { PartyBranchPath, PartyFields } from './party-fields'
import { Advanced, SectionHeading } from './shipment-basics'

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' }
]

interface InvoicesSectionProps {
  formCtx: FormContextData<ShippingBillFormValues>
  formData: ShippingBillFormData
  onQuickAdd: (role: 'buyer' | 'thirdParty' | 'itemThirdParty', invoiceIndex: number, itemIndex?: number) => void
  onAddBranch: (kind: 'exporter' | 'business', ownerId: number, branchName: PartyBranchPath) => void
}

export function InvoicesSection({ formCtx, formData, onQuickAdd, onAddBranch }: InvoicesSectionProps) {
  const { control } = formCtx.hooks
  const { fields: invoices, append: addInvoice, remove: removeInvoice } = useFieldArray({ control, name: 'invoices' })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Invoices & Goods</h2>
          <p className="text-sm text-gray-500">Define commercial invoices, financial terms, and line items.</p>
        </div>
        <Button variant="outline" type="button" onClick={() => addInvoice(emptyInvoice())}>
          + Add invoice
        </Button>
      </div>

      {invoices.map((invoiceField, invoiceIdx) => (
        <InvoiceCard
          key={invoiceField.id}
          formCtx={formCtx}
          index={invoiceIdx}
          formData={formData}
          canRemove={invoices.length > 1}
          onRemove={() => removeInvoice(invoiceIdx)}
          onQuickAdd={onQuickAdd}
          onAddBranch={onAddBranch}
        />
      ))}
    </div>
  )
}

interface InvoiceCardProps {
  formCtx: FormContextData<ShippingBillFormValues>
  index: number
  formData: ShippingBillFormData
  canRemove: boolean
  onRemove: () => void
  onQuickAdd: (role: 'buyer' | 'thirdParty' | 'itemThirdParty', invoiceIndex: number, itemIndex?: number) => void
  onAddBranch: (kind: 'exporter' | 'business', ownerId: number, branchName: PartyBranchPath) => void
}

function InvoiceCard({ formCtx, index, formData, canRemove, onRemove, onQuickAdd, onAddBranch }: InvoiceCardProps) {
  const { register, control, watch } = formCtx.hooks
  const invoice = watch(`invoices.${index}`)
  const {
    fields: items,
    append: addItem,
    remove: removeItem
  } = useFieldArray({ control, name: `invoices.${index}.items` })

  const buyerSame = invoice.buyerSameAsConsignee
  const buyerOptions = formData.businesses.filter((b) => b.isBuyer || String(b.id) === invoice.buyerId)
  const thirdPartyOptions = formData.businesses.filter(
    (b) => b.isThirdParty || String(b.id) === invoice.thirdPartyId
  )

  const schemeOptions = formData.schemeCodes
  const unitOptions = formData.quantityCodes
  const tradeOptions = formData.tradeAgreements

  const currentInvoiceTotal = invoiceTotal(invoice)

  return (
    <Card className="border border-gray-200">
      <CardHeader className="flex-row items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h3 className="font-semibold text-gray-900">Invoice {index + 1}</h3>
          <p className="text-xs text-gray-500">
            {invoice.invoiceNumber ? `No: ${invoice.invoiceNumber}` : 'Draft invoice'} · {invoice.currency || 'USD'}
          </p>
        </div>
        {canRemove && (
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={onRemove}
            className="text-red-600 hover:text-red-700">
            Remove invoice
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-6 pt-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Invoice number" {...register(`invoices.${index}.invoiceNumber`)} />
          <Input label="Invoice date" type={'date' as any} {...register(`invoices.${index}.invoiceDate`)} />
          <div className="flex gap-2">
            <div className="w-[110px] shrink-0">
              <Select<ShippingBillFormValues>
                label="Currency"
                name={`invoices.${index}.currency`}
                options={CURRENCY_OPTIONS}
                rules={{ required: true }}
              />
            </div>
            <div className="flex-1">
              <Input
                label="Total"
                type="number"
                min={0}
                {...register(`invoices.${index}.invoiceTotal`)}
                placeholder={currentInvoiceTotal > 0 ? currentInvoiceTotal.toFixed(2) : '0.00'}
              />
            </div>
          </div>
          <Select<ShippingBillFormValues>
            label="Contract type"
            name={`invoices.${index}.contractType`}
            options={formData.contractTypes}
            rules={{ required: true }}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-800">
          <Checkbox {...register(`invoices.${index}.buyerSameAsConsignee`)} />
          Buyer and Consignee are the same party
        </label>

        {!buyerSame && (
          <PartyFields
            formCtx={formCtx}
            ownerName={`invoices.${index}.buyerId`}
            branchName={`invoices.${index}.buyerBranchId`}
            label="Buyer"
            kind="business"
            parties={buyerOptions}
            onQuickAdd={() => onQuickAdd('buyer', index)}
            onAddBranch={(ownerId) => onAddBranch('business', ownerId, `invoices.${index}.buyerBranchId`)}
          />
        )}

        <div className="space-y-4">
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
            <div className="grid grid-cols-1 divide-y divide-gray-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              <div className="p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-28 shrink-0 text-sm font-medium text-gray-800">Freight</span>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      {...register(`invoices.${index}.freightRate`)}
                      className="w-20 text-right"
                      placeholder="Rate %"
                    />
                  </div>
                  <Input
                    type="number"
                    {...register(`invoices.${index}.freightAmount`)}
                    className="flex-1 text-right"
                    placeholder="Amount"
                  />
                  <div className="w-28">
                    <Select<ShippingBillFormValues>
                      name={`invoices.${index}.freightCurrency`}
                      options={CURRENCY_OPTIONS}
                      placeholder={invoice.currency || 'USD'}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-28 shrink-0 text-sm font-medium text-gray-800">Insurance</span>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      {...register(`invoices.${index}.insuranceRate`)}
                      className="w-20 text-right"
                      placeholder="Rate %"
                    />
                  </div>
                  <Input
                    type="number"
                    {...register(`invoices.${index}.insuranceAmount`)}
                    className="flex-1 text-right"
                    placeholder="Amount"
                  />
                  <div className="w-28">
                    <Select<ShippingBillFormValues>
                      name={`invoices.${index}.insuranceCurrency`}
                      options={CURRENCY_OPTIONS}
                      placeholder={invoice.currency || 'USD'}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 divide-y divide-gray-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              <div className="p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-28 shrink-0 text-sm font-medium text-gray-800">Commission</span>
                  <Input
                    type="number"
                    {...register(`invoices.${index}.commissionRate`)}
                    className="w-20 text-right"
                    placeholder="Rate %"
                  />
                  <Input
                    type="number"
                    {...register(`invoices.${index}.commissionAmount`)}
                    className="flex-1 text-right"
                    placeholder="Amount"
                  />
                  <div className="w-28">
                    <Select<ShippingBillFormValues>
                      name={`invoices.${index}.commissionCurrency`}
                      options={CURRENCY_OPTIONS}
                      placeholder={invoice.currency || 'USD'}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-28 shrink-0 text-sm font-medium text-gray-800">Discount</span>
                  <Input
                    type="number"
                    {...register(`invoices.${index}.discountRate`)}
                    className="w-20 text-right"
                    placeholder="Rate %"
                  />
                  <Input
                    type="number"
                    {...register(`invoices.${index}.discountAmount`)}
                    className="flex-1 text-right"
                    placeholder="Amount"
                  />
                  <div className="w-28">
                    <Select<ShippingBillFormValues>
                      name={`invoices.${index}.discountCurrency`}
                      options={CURRENCY_OPTIONS}
                      placeholder={invoice.currency || 'USD'}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 divide-y divide-gray-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              <div className="p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-28 shrink-0 text-sm font-medium text-gray-800">Other Deductions</span>
                  <Input
                    type="number"
                    {...register(`invoices.${index}.otherDeductionsAmount`)}
                    className="flex-1 text-right"
                    placeholder="Amount"
                  />
                  <div className="w-28">
                    <Select<ShippingBillFormValues>
                      name={`invoices.${index}.otherDeductionsCurrency`}
                      options={CURRENCY_OPTIONS}
                      placeholder={invoice.currency || 'USD'}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-28 shrink-0 text-sm font-medium text-gray-800">Packing Charges</span>
                  <Input
                    type="number"
                    {...register(`invoices.${index}.packingCharges`)}
                    className="flex-1 text-right"
                    placeholder="Amount"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select<ShippingBillFormValues>
              label="Price includes"
              name={`invoices.${index}.freightInsuranceIncluded`}
              options={formData.priceInclusionTypes}
              placeholder="Select if applicable"
            />
            <Input label="Contract / order number" {...register(`invoices.${index}.contractNumber`)} />
            <Select<ShippingBillFormValues>
              label="Payment type"
              name={`invoices.${index}.natureOfPayment`}
              options={formData.paymentTypes}
              placeholder="Select payment type"
            />
            <Input label="Payment period (days)" type="number" {...register(`invoices.${index}.periodOfPayment`)} />
          </div>

          <PartyFields
            formCtx={formCtx}
            ownerName={`invoices.${index}.thirdPartyId`}
            branchName={`invoices.${index}.thirdPartyBranchId`}
            label="Third party (optional)"
            kind="business"
            parties={thirdPartyOptions}
            required={false}
            onQuickAdd={() => onQuickAdd('thirdParty', index)}
            onAddBranch={(ownerId) => onAddBranch('business', ownerId, `invoices.${index}.thirdPartyBranchId`)}
          />
        </div>

        {/* Goods Line Items */}
        <div className="border-t border-gray-200 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <SectionHeading title="Goods line items" />
            <Button size="sm" variant="outline" type="button" onClick={() => addItem(emptyItem())}>
              + Add item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((itemField, itemIdx) => {
              const currentItem = invoice.items[itemIdx] ?? emptyItem()
              const computedLineTotal = lineTotal(currentItem)

              const selectedScheme = schemeOptions.find((s) => s.value === currentItem.schemeCode)
              const showDrawback = Boolean(
                selectedScheme && (selectedScheme.drawback ?? selectedScheme.RODTEP ?? selectedScheme.ROSCTL)
              )

              return (
                <div key={itemField.id} className="rounded-lg border border-gray-200 bg-gray-50/40 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      Item {itemIdx + 1}
                      {currentItem.goodsDescription1 ? ` · ${currentItem.goodsDescription1}` : ''}
                    </span>
                    {items.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => removeItem(itemIdx)}
                        className="text-red-600 hover:text-red-700">
                        Remove item
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                    <Input
                      label="RITC / HS code"
                      {...register(`invoices.${index}.items.${itemIdx}.ritcCode`)}
                      placeholder="e.g. 61091000"
                    />
                    <Select<ShippingBillFormValues>
                      label="Scheme code"
                      name={`invoices.${index}.items.${itemIdx}.schemeCode`}
                      options={schemeOptions}
                      placeholder="Select scheme"
                    />
                    <Input
                      label="Goods description"
                      {...register(`invoices.${index}.items.${itemIdx}.goodsDescription1`)}
                      wrapClass="lg:col-span-4"
                      placeholder="e.g. 100% Cotton Knitted T-Shirts"
                    />
                    <Input
                      label="Quantity"
                      type="number"
                      {...register(`invoices.${index}.items.${itemIdx}.quantity`)}
                    />
                    <Select<ShippingBillFormValues>
                      label="Unit (UOM)"
                      name={`invoices.${index}.items.${itemIdx}.unitOfMeasurement`}
                      options={unitOptions}
                      rules={{ required: true }}
                    />
                    <Input
                      label={`Unit price (${invoice.currency || 'USD'})`}
                      type="number"
                      {...register(`invoices.${index}.items.${itemIdx}.unitPrice`)}
                    />
                    <Input
                      label="Item Total"
                      type="number"
                      placeholder={
                        computedLineTotal > 0 ? `${invoice.currency || 'USD'} ${computedLineTotal.toFixed(2)}` : '0.00'
                      }
                      {...register(`invoices.${index}.items.${itemIdx}.lineTotal`)}
                    />
                    <Select<ShippingBillFormValues>
                      label="IGST payment"
                      name={`invoices.${index}.items.${itemIdx}.igstPaymentStatus`}
                      options={[
                        { value: 'NA', label: 'Not applicable' },
                        { value: 'LUT', label: 'Under LUT / bond' },
                        { value: 'P', label: 'Against payment' }
                      ]}
                      placeholder="Select status"
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-end gap-4 border-t border-gray-100 pt-3">
                    {showDrawback && (
                      <>
                        <div className="w-36">
                          <Input
                            label="Drawback SN"
                            {...register(`invoices.${index}.items.${itemIdx}.drawbackSerialNumber`)}
                          />
                        </div>
                        <div className="w-32">
                          <Input
                            label="Drawback Unit"
                            {...register(`invoices.${index}.items.${itemIdx}.drawbackUnit`)}
                          />
                        </div>
                        <div className="w-36">
                          <Input
                            label="Drawback Qty"
                            type="number"
                            {...register(`invoices.${index}.items.${itemIdx}.drawbackQuantity`)}
                          />
                        </div>
                      </>
                    )}
                    <label className="flex items-center gap-2 pb-1 text-sm text-gray-700">
                      <Checkbox {...register(`invoices.${index}.items.${itemIdx}.rewardItem`)} />
                      Claim export incentive / reward
                    </label>
                    <label className="flex items-center gap-2 pb-1 text-sm text-gray-700">
                      <Checkbox {...register(`invoices.${index}.items.${itemIdx}.thirdPartyItem`)} />
                      Third-party manufactured item
                    </label>
                  </div>

                  {currentItem.thirdPartyItem && (
                    <div className="my-3 border-t border-gray-100 pt-3">
                      <PartyFields
                        formCtx={formCtx}
                        ownerName={`invoices.${index}.items.${itemIdx}.itemThirdPartyId`}
                        branchName={`invoices.${index}.items.${itemIdx}.itemThirdPartyBranchId`}
                        label="Item Third Party"
                        kind="business"
                        parties={formData.businesses.filter(
                          (b) => b.isThirdParty || String(b.id) === String(currentItem.itemThirdPartyId)
                        )}
                        onQuickAdd={() => onQuickAdd('itemThirdParty', index, itemIdx)}
                        onAddBranch={(ownerId) =>
                          onAddBranch('business', ownerId, `invoices.${index}.items.${itemIdx}.itemThirdPartyBranchId`)
                        }
                      />
                    </div>
                  )}

                  <Advanced title="Customs, trade agreements, and taxes">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <Select<ShippingBillFormValues>
                        label="Unit of rate"
                        name={`invoices.${index}.items.${itemIdx}.unitOfRate`}
                        options={unitOptions}
                        placeholder={currentItem.unitOfMeasurement || 'UOM'}
                      />
                      <Input
                        label="Per Unit (Rate)"
                        type="number"
                        placeholder="1"
                        {...register(`invoices.${index}.items.${itemIdx}.numberOfUnits`)}
                      />
                      <Input
                        label="Present market value"
                        type="number"
                        {...register(`invoices.${index}.items.${itemIdx}.presentMarketValue`)}
                      />
                      <Input label="GCess" type="number" {...register(`invoices.${index}.items.${itemIdx}.cess`)} />
                      <Input
                        label="Accessories description"
                        wrapClass="lg:col-span-3"
                        {...register(`invoices.${index}.items.${itemIdx}.accessoriesDescription`)}
                      />
                      <Select<ShippingBillFormValues>
                        label="Accessory status"
                        name={`invoices.${index}.items.${itemIdx}.accessoryStatus`}
                        options={[
                          { value: '0', label: 'No accessory' },
                          { value: '1', label: 'Included free of cost' },
                          { value: '2', label: 'Entered separately' }
                        ]}
                      />
                      {currentItem.igstPaymentStatus === 'P' && (
                        <>
                          <Input
                            label="Taxable value"
                            type="number"
                            {...register(`invoices.${index}.items.${itemIdx}.taxableValue`)}
                          />
                          <Input
                            label="IGST amount"
                            type="number"
                            {...register(`invoices.${index}.items.${itemIdx}.igstAmount`)}
                          />
                        </>
                      )}
                      <Input
                        label="Origin district code"
                        {...register(`invoices.${index}.items.${itemIdx}.originDistrictCode`)}
                      />
                      <Select<ShippingBillFormValues>
                        label="Trade agreement code"
                        name={`invoices.${index}.items.${itemIdx}.tradeAgreementsCode`}
                        options={tradeOptions}
                        placeholder="Select agreement"
                      />
                      <Input label="End use code" {...register(`invoices.${index}.items.${itemIdx}.endUseOfItem`)} />
                      <Input
                        label="Packages for item"
                        type="number"
                        {...register(`invoices.${index}.items.${itemIdx}.totalPackage`)}
                      />
                    </div>
                  </Advanced>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-xs text-gray-500">Calculated invoice sum based on items</span>
          <div className="text-right text-base font-semibold text-gray-900">
            Invoice total: {invoice.currency || 'USD'}{' '}
            {currentInvoiceTotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
