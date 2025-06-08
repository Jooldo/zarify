
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { FilterIcon, X, ChevronRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SwiggyStyleFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  suppliers?: string[];
  categories?: string[];
  customers?: string[];
  filterType: 'rawMaterials' | 'finishedGoods' | 'orders' | 'procurement';
}

const SwiggyStyleFilters = ({ 
  filters, 
  onFiltersChange, 
  suppliers = [], 
  categories = [], 
  customers = [],
  filterType 
}: SwiggyStyleFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getFilterOptions = () => {
    switch (filterType) {
      case 'rawMaterials':
        return {
          quickFilters: [
            { key: 'type', value: 'Chain', label: 'Chain' },
            { key: 'type', value: 'Kunda', label: 'Kunda' },
            { key: 'type', value: 'Ghungroo', label: 'Ghungroo' },
            { key: 'type', value: 'Thread', label: 'Thread' },
          ],
          toggleFilters: [
            { key: 'inStock', label: 'In Stock Only', description: 'Show only materials above minimum stock' },
            { key: 'lowStock', label: 'Low Stock Alert', description: 'Materials below threshold' },
            { key: 'procurementNeeded', label: 'Procurement Needed', description: 'Materials with shortfall' },
          ],
          multiSelectFilters: [
            { 
              key: 'suppliers', 
              label: 'Suppliers', 
              options: suppliers.map(s => ({ value: s, label: s })) 
            },
            { 
              key: 'shortfallRange', 
              label: 'Shortfall Range', 
              options: [
                { value: 'none', label: 'No Shortfall' },
                { value: 'low', label: 'Low (1-10)' },
                { value: 'medium', label: 'Medium (11-50)' },
                { value: 'high', label: 'High (>50)' }
              ]
            }
          ]
        };
      case 'finishedGoods':
        return {
          quickFilters: [
            { key: 'category', value: 'Bracelet', label: 'Bracelet' },
            { key: 'category', value: 'Necklace', label: 'Necklace' },
            { key: 'category', value: 'Anklet', label: 'Anklet' },
          ],
          toggleFilters: [
            { key: 'inStock', label: 'In Stock Only', description: 'Above threshold levels' },
            { key: 'critical', label: 'Critical Stock', description: 'Urgent attention needed' },
            { key: 'manufacturing', label: 'In Manufacturing', description: 'Currently being produced' },
          ],
          multiSelectFilters: [
            { 
              key: 'categories', 
              label: 'Categories', 
              options: categories.map(c => ({ value: c, label: c })) 
            },
            { 
              key: 'sizeRange', 
              label: 'Size Range', 
              options: [
                { value: 'small', label: 'Small (≤ 12")' },
                { value: 'medium', label: 'Medium (13-18")' },
                { value: 'large', label: 'Large (> 18")' }
              ]
            }
          ]
        };
      default:
        return { quickFilters: [], toggleFilters: [], multiSelectFilters: [] };
    }
  };

  const { quickFilters, toggleFilters, multiSelectFilters } = getFilterOptions();

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value && value !== 'all' && value !== '' && value !== false
    ).length;
  };

  const getActiveFilterChips = () => {
    const chips = [];
    
    // Quick filters
    quickFilters.forEach(filter => {
      if (filters[filter.key] === filter.value) {
        chips.push({
          label: filter.label,
          onRemove: () => updateFilter(filter.key, 'all')
        });
      }
    });

    // Toggle filters
    toggleFilters.forEach(filter => {
      if (filters[filter.key]) {
        chips.push({
          label: filter.label,
          onRemove: () => updateFilter(filter.key, false)
        });
      }
    });

    return chips;
  };

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = key.includes('Range') || key.includes('Level') ? 'all' : 
                 typeof filters[key] === 'boolean' ? false : 'all';
      return acc;
    }, {} as any);
    onFiltersChange(clearedFilters);
  };

  const applyFilters = () => {
    setIsOpen(false);
  };

  const FilterContent = () => (
    <div className="space-y-6 p-4">
      {/* Quick Filter Chips */}
      {quickFilters.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Quick Filters</Label>
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter) => (
              <Button
                key={`${filter.key}-${filter.value}`}
                variant={filters[filter.key] === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter(filter.key, 
                  filters[filter.key] === filter.value ? 'all' : filter.value
                )}
                className="h-8 rounded-full text-xs transition-all duration-200 hover:scale-105"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Toggle Filters */}
      {toggleFilters.length > 0 && (
        <div className="space-y-4">
          <Label className="text-sm font-semibold">Smart Filters</Label>
          {toggleFilters.map((filter) => (
            <div key={filter.key} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <div className="space-y-1">
                <Label className="text-sm font-medium">{filter.label}</Label>
                <p className="text-xs text-muted-foreground">{filter.description}</p>
              </div>
              <Switch
                checked={filters[filter.key] || false}
                onCheckedChange={(checked) => updateFilter(filter.key, checked)}
              />
            </div>
          ))}
        </div>
      )}

      {multiSelectFilters.length > 0 && <Separator />}

      {/* Multi-Select Filters */}
      {multiSelectFilters.map((filterGroup) => (
        filterGroup.options.length > 0 && (
          <div key={filterGroup.key} className="space-y-3">
            <Label className="text-sm font-semibold">{filterGroup.label}</Label>
            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
              {filterGroup.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 p-2 rounded hover:bg-accent/50 transition-colors">
                  <Checkbox
                    id={`${filterGroup.key}-${option.value}`}
                    checked={filters[filterGroup.key] === option.value}
                    onCheckedChange={(checked) => 
                      updateFilter(filterGroup.key, checked ? option.value : 'all')
                    }
                  />
                  <Label 
                    htmlFor={`${filterGroup.key}-${option.value}`} 
                    className="text-xs font-normal cursor-pointer flex-1"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-background pt-4 border-t space-y-2">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={clearAllFilters}
            className="flex-1 h-10"
            disabled={getActiveFiltersCount() === 0}
          >
            Clear All
          </Button>
          <Button 
            onClick={applyFilters}
            className="flex-1 h-10 bg-primary hover:bg-primary/90"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );

  const FilterTrigger = () => (
    <Button variant="outline" size="sm" className="h-8 gap-2">
      <FilterIcon className="h-4 w-4" />
      <span className="hidden sm:inline">Filters</span>
      {getActiveFiltersCount() > 0 && (
        <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs px-1">
          {getActiveFiltersCount()}
        </Badge>
      )}
    </Button>
  );

  const activeChips = getActiveFilterChips();

  return (
    <div className="space-y-3">
      {/* Filter Trigger and Active Chips */}
      <div className="flex items-center gap-3">
        {isMobile ? (
          <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
              <FilterTrigger />
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh]">
              <DrawerHeader className="pb-2">
                <DrawerTitle className="text-left">Filter Options</DrawerTitle>
              </DrawerHeader>
              <ScrollArea className="flex-1">
                <FilterContent />
              </ScrollArea>
            </DrawerContent>
          </Drawer>
        ) : (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <FilterTrigger />
            </SheetTrigger>
            <SheetContent className="w-96 sm:max-w-96">
              <SheetHeader className="pb-4">
                <SheetTitle>Filter Options</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-120px)]">
                <FilterContent />
              </ScrollArea>
            </SheetContent>
          </Sheet>
        )}

        {/* Active Filter Chips - Horizontal Scroll */}
        {activeChips.length > 0 && (
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-2 pb-1">
              {activeChips.map((chip, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="flex items-center gap-1 whitespace-nowrap h-8 px-3 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <span className="text-xs">{chip.label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={chip.onRemove}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwiggyStyleFilters;
