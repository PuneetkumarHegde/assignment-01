import { Button } from 'ui/basic/button'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { FormContextData, useFieldArray } from 'ui/form'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { emptyDocument } from '../model'
import type { ShippingBillFormData, ShippingBillFormValues } from '../types'
import { SearchableSelect } from './searchable-select'
import { Advanced, SectionHeading } from './shipment-basics'

interface AdditionalDetailsProps {
  formCtx: FormContextData<ShippingBillFormValues>
  formData: ShippingBillFormData
}

export function AdditionalDetails({ formCtx, formData }: AdditionalDetailsProps) {
  const { register, control } = formCtx.hooks

  const {
    fields: containers,
    append: addContainer,
    remove: removeContainer
  } = useFieldArray({ control, name: 'containers' })

  const {
    fields: packingRanges,
    append: addPackingRange,
    remove: removePackingRange
  } = useFieldArray({ control, name: 'packingRanges' })

  const {
    fields: documents,
    append: addDocument,
    remove: removeDocument
  } = useFieldArray({ control, name: 'documents' })

  const { fields: licenses, append: addLicense, remove: removeLicense } = useFieldArray({ control, name: 'licenses' })

  return (
    <div className="space-y-6">
      {/* Containers and Packing Ranges Card */}
      <Card>
        <CardHeader
          title="Containers & Packing Lists"
          description="Specify container numbers, seal details, and package ranges."
        />
        <CardContent className="space-y-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <SectionHeading title={`Containers (${containers.length})`} />
              <Button size="sm" variant="outline" type="button" onClick={() => addContainer({ containerNumber: '' })}>
                + Add container
              </Button>
            </div>

            {containers.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No containers added yet. Add if cargo is containerized.</p>
            ) : (
              <div className="space-y-4">
                {containers.map((field, index) => (
                  <div key={field.id} className="rounded-lg border border-gray-200 bg-gray-50/40 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">Container {index + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => removeContainer(index)}
                        className="text-red-600 hover:text-red-700">
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Input label="Container number" {...register(`containers.${index}.containerNumber`)} />
                      <Select<ShippingBillFormValues>
                        label="Size"
                        name={`containers.${index}.containerSize`}
                        options={[
                          { value: '20', label: '20 ft' },
                          { value: '40', label: '40 ft' },
                          { value: '45', label: '45 ft' }
                        ]}
                        placeholder="Select size"
                      />
                      <Input label="Seal number" {...register(`containers.${index}.exciseSealNumber`)} />
                      <Input label="Seal date" type={'date' as any} {...register(`containers.${index}.sealDate`)} />
                      <Select<ShippingBillFormValues>
                        label="Seal type"
                        name={`containers.${index}.sealType`}
                        options={formData.sealTypes}
                        placeholder="Select seal type"
                      />
                      <Input label="Seal device ID" {...register(`containers.${index}.sealDeviceId`)} />
                      <Input label="Movement document type" {...register(`containers.${index}.movementDocumentType`)} />
                      <Input
                        label="Movement document number"
                        {...register(`containers.${index}.movementDocumentNumber`)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <SectionHeading title={`Packing list ranges (${packingRanges.length})`} />
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => addPackingRange({ packingNumberFrom: '', packingNumberTo: '' })}>
                + Add packing range
              </Button>
            </div>

            {packingRanges.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No packing ranges added.</p>
            ) : (
              <div className="space-y-3">
                {packingRanges.map((field, index) => (
                  <div key={field.id} className="rounded-lg border border-gray-200 bg-gray-50/40 p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Range {index + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => removePackingRange(index)}
                        className="text-red-600 hover:text-red-700">
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Input
                        label="Package from"
                        type="number"
                        {...register(`packingRanges.${index}.packingNumberFrom`)}
                      />
                      <Input label="Package to" type="number" {...register(`packingRanges.${index}.packingNumberTo`)} />
                      <Input label="Packing code" {...register(`packingRanges.${index}.packingCode`)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Supporting Documents (e-Sanchit) Card */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Supporting Documents (e-Sanchit)</h3>
            <p className="text-xs text-gray-500">Provide document codes and image reference numbers (IRN).</p>
          </div>
          <Button variant="outline" size="sm" type="button" onClick={() => addDocument(emptyDocument())}>
            + Add document
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {documents.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No documents attached.</p>
          ) : (
            documents.map((field, index) => (
              <DocumentRow
                key={field.id}
                formCtx={formCtx}
                index={index}
                formData={formData}
                onRemove={() => removeDocument(index)}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Export Licences Card */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Export Licences</h3>
            <p className="text-xs text-gray-500">Only needed for schemes requiring a licence registration.</p>
          </div>
          <Button variant="outline" size="sm" type="button" onClick={() => addLicense({ registrationNumber: '' })}>
            + Add licence
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {licenses.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No licences entered.</p>
          ) : (
            licenses.map((field, index) => (
              <div key={field.id} className="rounded-lg border border-gray-200 bg-gray-50/40 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Licence {index + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => removeLicense(index)}
                    className="text-red-600 hover:text-red-700">
                    Remove
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Input label="Registration number" {...register(`licenses.${index}.registrationNumber`)} />
                  <Input
                    label="Registration date"
                    type={'date' as any}
                    {...register(`licenses.${index}.registrationDate`)}
                  />
                  <Input
                    label="Invoice serial number"
                    type="number"
                    {...register(`licenses.${index}.invoiceSerialNumber`)}
                  />
                  <Input label="Item serial number" type="number" {...register(`licenses.${index}.itemSerialNumber`)} />
                  <Input
                    label="Licence serial number"
                    type="number"
                    {...register(`licenses.${index}.licenseSerialNumber`)}
                  />
                  <Input label="Item serial, Part E" {...register(`licenses.${index}.itemSerialNumberPartE`)} />
                  <Input label="Item serial, Part C" {...register(`licenses.${index}.itemSerialNumberPartC`)} />
                  <Input label="Licence quantity" type="number" {...register(`licenses.${index}.licenseQuantity`)} />
                  <Input
                    label="Export quantity"
                    type="number"
                    {...register(`licenses.${index}.licenseExportQuantity`)}
                  />
                  <Select<ShippingBillFormValues>
                    label="Goods source"
                    name={`licenses.${index}.indigenousOrImported`}
                    options={[
                      { value: 'I', label: 'Imported' },
                      { value: 'D', label: 'Indigenous' }
                    ]}
                    placeholder="Select source"
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DocumentRow({
  formCtx,
  index,
  formData,
  onRemove
}: {
  formCtx: FormContextData<ShippingBillFormValues>
  index: number
  formData: ShippingBillFormData
  onRemove: () => void
}) {
  const { register } = formCtx.hooks

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50/40 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">Document {index + 1}</span>
        <Button size="sm" variant="ghost" type="button" onClick={onRemove} className="text-red-600 hover:text-red-700">
          Remove
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <span className="mb-1 block text-sm font-medium text-gray-800">Document type code</span>
          <SearchableSelect
            name={`documents.${index}.documentTypeCode`}
            placeholder="Search document type..."
            fetchOptions={(query) => {
              const q = query.toLowerCase().trim()
              const filtered = formData.documentCodes.filter(
                (doc) =>
                  doc.value.toLowerCase().includes(q) || doc.label.toLowerCase().includes(q)
              )
              return Promise.resolve(
                filtered.map((doc) => ({
                  value: doc.value,
                  label: doc.label
                }))
              )
            }}
            getInitialLabel={(val) => {
              const found = formData.documentCodes.find((doc) => doc.value === val)
              return Promise.resolve(found ? found.label : val)
            }}
          />
        </div>
        <Input label="Image reference number (IRN)" {...register(`documents.${index}.imageReferenceNumber`)} />
        <Input label="Issue date" type={'date' as any} {...register(`documents.${index}.documentIssueDate`)} />
      </div>

      <Advanced title="Issuing authority & Beneficiary party details">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Reference number" {...register(`documents.${index}.documentReferenceNumber`)} />
          <Input label="Expiry date" type={'date' as any} {...register(`documents.${index}.documentExpiryDate`)} />
          <Input label="Invoice serial number" type="number" {...register(`documents.${index}.invoiceSerialNumber`)} />
          <Input label="Item serial number" type="number" {...register(`documents.${index}.itemSerialNumber`)} />
          <Input label="Place of issue" {...register(`documents.${index}.placeOfIssue`)} />
          <Select<ShippingBillFormValues>
            label="File type"
            name={`documents.${index}.fileType`}
            options={[
              { value: '1', label: 'PDF Document' },
              { value: '2', label: 'XML File' }
            ]}
          />
        </div>

        <div className="mt-4 border-t border-gray-100 pt-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase">Issuing Party</h4>
              <div className="space-y-3">
                <Input label="Code" {...register(`documents.${index}.issuingPartyCode`)} />
                <Input label="Name" {...register(`documents.${index}.issuingPartyName`)} />
                <Input label="Address Line 1" {...register(`documents.${index}.issuingPartyAddress1`)} />
                <Input label="City" {...register(`documents.${index}.issuingPartyCity`)} />
                <Input label="Postal Code" {...register(`documents.${index}.issuingPartyPin`)} />
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase">Beneficiary Party</h4>
              <div className="space-y-3">
                <Input label="Code" {...register(`documents.${index}.beneficiaryPartyCode`)} />
                <Input label="Name" {...register(`documents.${index}.beneficiaryPartyName`)} />
                <Input label="Address Line 1" {...register(`documents.${index}.beneficiaryPartyAddress1`)} />
                <Input label="City" {...register(`documents.${index}.beneficiaryPartyCity`)} />
                <Input label="Postal Code" {...register(`documents.${index}.beneficiaryPartyPin`)} />
              </div>
            </div>
          </div>
        </div>
      </Advanced>
    </div>
  )
}
