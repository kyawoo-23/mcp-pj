"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FacilityType } from "@/lib/types";
import { Search, Filter } from "lucide-react";

interface FacilityFiltersProps {
  onSearchChange: (search: string) => void;
  onTypeChange: (type: FacilityType | "all") => void;
  onBuildingChange: (building: string | "all") => void;
  buildings: string[];
  facilityTypes: FacilityType[];
}

export function FacilityFilters({
  onSearchChange,
  onTypeChange,
  onBuildingChange,
  buildings,
  facilityTypes,
}: FacilityFiltersProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Filter className='h-5 w-5' />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='search'>Search</Label>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              id='search'
              placeholder='Search by name, building, or room...'
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className='pl-9'
            />
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='facility-type'>Facility Type</Label>
          <Select
            onValueChange={(value) =>
              onTypeChange(value as FacilityType | "all")
            }
          >
            <SelectTrigger id='facility-type'>
              <SelectValue placeholder='All types' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All types</SelectItem>
              {facilityTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='building'>Building</Label>
          <Select onValueChange={(value) => onBuildingChange(value)}>
            <SelectTrigger id='building'>
              <SelectValue placeholder='All buildings' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All buildings</SelectItem>
              {buildings.map((building) => (
                <SelectItem key={building} value={building}>
                  {building}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
