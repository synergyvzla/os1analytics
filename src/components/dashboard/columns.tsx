"use client"

import { ColumnDef } from "@tanstack/react-table"

export type Property = {
  combined_score: number
  address_street: string
  address_zip: number
  valuation_estimatedValue: number
  owner_lengthOfResidenceYears: string
  top_gust_1?: number
  top_gust_2?: number
  top_gust_3?: number
  top_gust_4?: number
  top_gust_5?: number
  'Google Maps'?: string
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatTopGusts = (property: Property) => {
  const gusts = [
    property.top_gust_1,
    property.top_gust_2,
    property.top_gust_3,
    property.top_gust_4,
    property.top_gust_5
  ].filter(gust => gust !== undefined)

  return `[${gusts.join(', ')}]`
}

export const columns: ColumnDef<Property>[] = [
  {
    accessorKey: "combined_score",
    header: "Score",
  },
  {
    accessorKey: "address_street",
    header: "Dirección",
  },
  {
    accessorKey: "address_zip",
    header: "Código Postal",
  },
  {
    accessorKey: "valuation_estimatedValue",
    header: "Valor Estimado",
    cell: ({ row }) => formatCurrency(row.getValue("valuation_estimatedValue")),
  },
  {
    accessorKey: "owner_lengthOfResidenceYears",
    header: "Años de residencia",
  },
  {
    id: "top_gusts",
    header: "Top 5 Ráfagas",
    cell: ({ row }) => formatTopGusts(row.original),
  },
  {
    accessorKey: "Google Maps",
    header: "Google Maps",
    cell: ({ row }) => {
      const maps = row.getValue("Google Maps")
      if (!maps) return null
      return (
        <a 
          href={maps as string} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Ver en Maps
        </a>
      )
    },
  },
]