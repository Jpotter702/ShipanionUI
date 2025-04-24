import type { ShippingData } from "@/types/shipping"

export const mockShippingData: ShippingData = {
  currentStep: 0,
  details: {
    originZip: "90210",
    destinationZip: "10001",
    weight: 5.2,
  },
  quotes: {
    quotes: [
      {
        carrier: "UPS",
        service: "Ground",
        cost: 12.99,
        estimatedDelivery: "3-5 business days",
      },
      {
        carrier: "USPS",
        service: "Priority Mail",
        cost: 9.99,
        estimatedDelivery: "2-3 business days",
      },
      {
        carrier: "FedEx",
        service: "Express Saver",
        cost: 14.99,
        estimatedDelivery: "1-2 business days",
      },
    ],
    selectedIndex: 1,
  },
  confirmation: {
    fromAddress: {
      name: "John Doe",
      street: "123 Beverly Hills Dr",
      city: "Beverly Hills",
      state: "CA",
      zip: "90210",
    },
    toAddress: {
      name: "Jane Smith",
      street: "456 5th Avenue",
      city: "New York",
      state: "NY",
      zip: "10001",
    },
    packageDetails: {
      weight: 5.2,
      dimensions: "12 x 8 x 6 in",
      service: "Priority Mail",
      carrier: "USPS",
    },
  },
  payment: {
    cardNumber: "4111 1111 1111 1111",
    expiryDate: "12/25",
    cvv: "123",
    cardholderName: "John Doe",
  },
  label: {
    labelPdfUrl: "/placeholder.svg?height=400&width=300",
    trackingNumber: "1Z999AA1234567890",
    qrCodeUrl: "/placeholder.svg?height=200&width=200",
  },
}
