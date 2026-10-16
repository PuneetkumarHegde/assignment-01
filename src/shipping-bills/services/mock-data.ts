import { documentCodes } from '@/data/e-sanchit-codes'
import { quantityCodes } from '@/data/quantity-code'
import schemeCodes from '@/data/scheme-codes'
import { stateOptions } from '@/data/states'
import { Trades } from '@/data/trade-agrements'
import { cargoOptions, contractTypes, paymentTypes, priceInclusionTypes, sealTypes, weightUnits } from '@/data/types'
import { getDemoData } from '../demo-store'
import { countries, loadingPorts, ports } from '../model'
import type { ShippingBillFormData } from '../types'

export function getMockFormData(): ShippingBillFormData {
  const demoData = getDemoData()
  return {
    exporters: demoData.exporters,
    businesses: demoData.businesses,
    loadingPorts: loadingPorts,
    destinationPorts: ports,
    countries: countries,
    states: stateOptions,
    schemeCodes: schemeCodes,
    quantityCodes: quantityCodes,
    tradeAgreements: Trades,
    documentCodes: documentCodes,
    cargoOptions: cargoOptions,
    contractTypes: contractTypes,
    paymentTypes: paymentTypes,
    sealTypes: sealTypes,
    weightUnits: weightUnits,
    priceInclusionTypes: priceInclusionTypes
  }
}
