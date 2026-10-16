import { s } from 'core/form'

function requiredText(fieldLabel: string) {
  return s.string().refine((value) => {
    if (!value || value.trim() === '') return `${fieldLabel} is required`
    return undefined
  })
}

const positiveNumber = s.string().refine((value) => {
  if (!value || value.trim() === '') return 'This field is required'
  const num = Number(value)
  if (isNaN(num)) return 'Enter a valid number'
  if (num <= 0) return 'Must be greater than zero'
  return undefined
})

const nonNegativeNumberOptional = s
  .string()
  .optional()
  .refine((value) => {
    if (!value || value.trim() === '') return undefined
    const num = Number(value)
    if (isNaN(num)) return 'Enter a valid number'
    if (num < 0) return 'Cannot be negative'
    return undefined
  })

// Leaf names are deliberate: fe-zen-arch resolves nested RHF field rules by their final path segment.
export const billSchema = s.object({
  jobNumber: s.string().optional(),
  jobDate: requiredText('Job date'),
  exporterId: requiredText('Exporter'),
  exporterBranchId: requiredText('Exporter branch'),
  consigneeId: requiredText('Consignee'),
  consigneeBranchId: requiredText('Consignee address'),
  loadingPort: requiredText('Loading port'),
  finalDestinationPort: requiredText('Final destination port'),
  dischargePort: s.string().optional(),
  originStateCode: s.string().optional(),
  nfeiCategory: s.string().optional(),
  rbiWaiverNumber: s.string().optional(),
  rbiWaiverDate: s.string().optional(),
  sealType: s.string().optional(),
  numberOfContainers: nonNegativeNumberOptional,
  natureOfCargo: s.string().optional(),
  grossWeight: nonNegativeNumberOptional,
  netWeight: nonNegativeNumberOptional,
  measurementUnit: s.string().optional(),
  totalPackages: nonNegativeNumberOptional,
  marksAndNumbers: s.string().optional(),
  loosePackets: nonNegativeNumberOptional,
  mawbNumber: s.string().optional(),
  hawbNumber: s.string().optional(),

  // Invoice level fields
  invoiceNumber: requiredText('Invoice number'),
  invoiceDate: requiredText('Invoice date'),
  currency: requiredText('Currency'),
  contractType: s.string().optional(),
  buyerId: s.string().optional(),
  buyerBranchId: s.string().optional(),
  thirdPartyId: s.string().optional(),
  thirdPartyBranchId: s.string().optional(),
  freightAmount: nonNegativeNumberOptional,
  insuranceAmount: nonNegativeNumberOptional,
  commissionAmount: nonNegativeNumberOptional,
  discountAmount: nonNegativeNumberOptional,
  otherDeductionsAmount: nonNegativeNumberOptional,
  packingCharges: nonNegativeNumberOptional,
  invoiceTotal: nonNegativeNumberOptional,

  // Item level fields
  ritcCode: requiredText('RITC code'),
  goodsDescription1: requiredText('Goods description'),
  quantity: positiveNumber,
  unitOfMeasurement: requiredText('UOM'),
  unitPrice: positiveNumber,
  numberOfUnits: nonNegativeNumberOptional,
  presentMarketValue: nonNegativeNumberOptional,
  totalPackage: nonNegativeNumberOptional,

  // Additional detail fields
  containerNumber: s.string().optional(),
  packingNumberFrom: nonNegativeNumberOptional,
  packingNumberTo: nonNegativeNumberOptional,
  documentTypeCode: s.string().optional(),
  documentReferenceNumber: s.string().optional(),
  registrationNumber: s.string().optional()
})

export type BillSchemaType = typeof billSchema
