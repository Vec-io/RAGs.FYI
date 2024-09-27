'use client'

import { useState, useEffect, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, ChevronsUpDown, Filter, ArrowUpDown } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"

function MultiSelect({ options, selected, onChange, className }) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-[200px] justify-between ${className}`}
        >
          {`${selected.length} selected`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search columns..." />
          <CommandEmpty>No column found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  onChange(
                    selected.includes(option.value)
                      ? selected.filter((item) => item !== option.value)
                      : [...selected, option.value]
                  )
                  setOpen(true)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected.includes(option.value) ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

type VendorData = {
  name: string
  usp: string
  oss: string
  pricing: string
  [key: string]: string
}

type FilterOption = 'equals' | 'not-equals' | 'contains' | 'not-contains'

type Filter = {
  column: string
  option: FilterOption
  value: string
}

const initialVendors: VendorData[] = [
  { name: "Vectara", usp: "Enterprise-grade AI search", oss: "No", pricing: "Usage-based" },
  { name: "LlamaCloud", usp: "Open-source RAG platform", oss: "Yes", pricing: "Free tier available" }
]

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'usp', label: 'USP' },
  { key: 'oss', label: 'Open Source' },
  { key: 'pricing', label: 'Pricing' }
]

export function RaGsFyiTable() {
  const [vendors, setVendors] = useState<VendorData[]>(initialVendors)
  const [filters, setFilters] = useState<Filter[]>([])
  const [sortColumn, setSortColumn] = useState('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columns.map(col => col.key))

  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => 
      filters.every(filter => {
        const value = vendor[filter.column]
        if (value === undefined) return true
        switch (filter.option) {
          case 'equals':
            return value.toLowerCase() === filter.value.toLowerCase()
          case 'not-equals':
            return value.toLowerCase() !== filter.value.toLowerCase()
          case 'contains':
            return value.toLowerCase().includes(filter.value.toLowerCase())
          case 'not-contains':
            return !value.toLowerCase().includes(filter.value.toLowerCase())
          default:
            return true
        }
      })
    )
  }, [vendors, filters])

  const sortedVendors = useMemo(() => {
    return [...filteredVendors].sort((a, b) => {
      const aValue = a[sortColumn] || ''
      const bValue = b[sortColumn] || ''
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredVendors, sortColumn, sortDirection])

  const handleSort = (column: string) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleFilterChange = (column: string, option: FilterOption, value: string) => {
    setFilters(prev => {
      const existingFilterIndex = prev.findIndex(filter => filter.column === column)
      if (existingFilterIndex !== -1) {
        const newFilters = [...prev]
        newFilters[existingFilterIndex] = { column, option, value }
        return newFilters
      } else {
        return [...prev, { column, option, value }]
      }
    })
  }

  const getFilterOptions = (): FilterOption[] => {
    return ['equals', 'not-equals', 'contains', 'not-contains']
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex justify-end">
        <MultiSelect
          options={columns.map(col => ({ value: col.key, label: col.label }))}
          selected={selectedColumns}
          onChange={setSelectedColumns}
          className="w-[200px]"
        />
      </div>
      <div className="overflow-x-auto border rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] font-bold sticky left-0 z-20 bg-gray-100">S.No</TableHead>
              {columns.filter(column => selectedColumns.includes(column.key)).map(column => (
                <TableHead 
                  key={column.key} 
                  className="cursor-pointer bg-gray-100 font-bold"
                >
                  <div className="flex items-center justify-between">
                    <span onClick={() => handleSort(column.key)} className="flex items-center">
                      {column.label}
                      {sortColumn === column.key && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <Filter className="h-4 w-4" />
                          <span className="sr-only">Filter {column.label}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <h4 className="font-medium leading-none">Filter {column.label}</h4>
                          <Select
                            onValueChange={(value) => 
                              handleFilterChange(column.key, value as FilterOption, 
                                filters.find(f => f.column === column.key)?.value || ''
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select filter option" />
                            </SelectTrigger>
                            <SelectContent>
                              {getFilterOptions().map(option => (
                                <SelectItem key={option} value={option}>
                                  {option.replace('-', ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder={`Enter filter value...`}
                            value={filters.find(f => f.column === column.key)?.value || ''}
                            onChange={(e) => handleFilterChange(
                              column.key, 
                              filters.find(f => f.column === column.key)?.option || 'equals', 
                              e.target.value
                            )}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedVendors.map((vendor, index) => (
              <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <TableCell className="sticky left-0 z-10 bg-inherit">{index + 1}</TableCell>
                {columns.filter(column => selectedColumns.includes(column.key)).map(column => (
                  <TableCell key={column.key}>
                    {vendor[column.key] || ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {sortedVendors.length === 0 && (
        <div className="text-center mt-8">
          <p className="text-xl font-semibold">No vendors found matching your search criteria.</p>
        </div>
      )}
    </div>
  )
}