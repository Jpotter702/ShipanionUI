export interface ShippingDetails {
  originZip: string
  destinationZip: string
  weight: number
}

export interface Quote {
  carrier: string
  service: string
  cost: number
  estimatedDelivery: string
}

export interface ShippingQuotes {
  quotes: Quote[]
  selectedIndex: number
}

export interface Address {
  name: string
  street: string
  city: string
  state: string
  zip: string
}

export interface PackageDetails {
  weight: number
  dimensions: string
  service: string
  carrier: string
}

export interface ShippingConfirmation {
  fromAddress: Address
  toAddress: Address
  packageDetails: PackageDetails
}

export interface PaymentData {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
}

export interface LabelData {
  labelPdfUrl: string
  trackingNumber: string
  qrCodeUrl: string
}

export interface ShippingData {
  currentStep: number
  details: ShippingDetails | null
  quotes: ShippingQuotes | null
  confirmation: ShippingConfirmation | null
  payment: PaymentData | null
  label: LabelData | null
  loadingQuotes: boolean
  loadingLabel: boolean
}
