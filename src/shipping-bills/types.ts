import type {
  BillInvoiceForm,
  BillItemForm,
  Branch,
  Business,
  ContainerForm,
  Exporter,
  LicenseForm,
  PackingRangeForm,
  PortOption,
  SavedBill,
  ShippingBillFormValues,
  SupportingDocForm
} from './model'

export type {
  BillInvoiceForm,
  BillItemForm,
  Branch,
  Business,
  ContainerForm,
  Exporter,
  LicenseForm,
  PackingRangeForm,
  PortOption,
  SavedBill,
  ShippingBillFormValues,
  SupportingDocForm
}

export interface DropdownOption<T = string> {
  value: T
  label: string
}

export interface SchemeOption extends DropdownOption {
  drawback?: boolean
  RODTEP?: boolean
  ROSCTL?: boolean
}

export interface ShippingBillFormData {
  exporters: Exporter[]
  businesses: Business[]
  loadingPorts: PortOption[]
  destinationPorts: PortOption[]
  countries: DropdownOption[]
  states: DropdownOption<number | string>[]
  schemeCodes: SchemeOption[]
  quantityCodes: DropdownOption[]
  tradeAgreements: DropdownOption[]
  documentCodes: DropdownOption[]
  cargoOptions: DropdownOption[]
  contractTypes: DropdownOption[]
  paymentTypes: DropdownOption[]
  sealTypes: DropdownOption[]
  weightUnits: DropdownOption[]
  priceInclusionTypes: DropdownOption[]
}

export interface SubmitShippingBillResponse {
  success: boolean
  id: number
  message: string
  bill: SavedBill
}
