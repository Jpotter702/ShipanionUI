"use client"

import dynamic from "next/dynamic"

// Use dynamic import in a Client Component
const ShippingFeedPage = dynamic(() => import("@/shipping-feed"), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mb-4"></div>
        <p>Loading shipping feed...</p>
      </div>
    </div>
  ),
})

export default function Home() {
  return <ShippingFeedPage />
}
