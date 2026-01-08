"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";
import type { CourseFilters } from "@/lib/types";

interface CourseFiltersProps {
  filters: CourseFilters;
  onFiltersChange: (filters: CourseFilters) => void;
  departments?: string[];
}

export function CourseFiltersComponent({
  filters,
  onFiltersChange,
  departments = [],
}: CourseFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch });
    }
  }, [debouncedSearch, filters, onFiltersChange]);

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
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              id='search'
              placeholder='Search courses...'
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className='pl-9'
            />
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='department'>Department</Label>
          <Select
            value={filters.department || "all"}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                department: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger id='department'>
              <SelectValue placeholder='All Departments' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
