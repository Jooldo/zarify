
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, AlertTriangle, CheckCircle, AlertCircle, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import type { RawMaterial } from '@/hooks/useRawMaterials';
import { formatIndianNumber } from '@/lib/utils';

interface RawMaterialsTableProps {
  rawMaterials: RawMaterial[];
  onViewMaterial: (material: RawMaterial) => void;
  onEditMaterial: (material: RawMaterial) => void;
}

const RawMaterialsTable = ({ rawMaterials, onViewMaterial, onEditMaterial }: RawMaterialsTableProps) => {
  const getStockStatusIcon = (currentStock: number, minimumStock: number, shortfall: number) => {
    if (shortfall > 0) {
      return { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50', label: 'Critical' };
    } else if (currentStock <= minimumStock) {
      return { icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50', label: 'Low' };
    } else {
      return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Good' };
    }
  };

  const calculateActualShortfall = (required: number, minimumStock: number, currentStock: number, inProcurement: number) => {
    const totalNeeded = required + minimumStock;
    const totalAvailable = currentStock + inProcurement;
    return totalNeeded - totalAvailable;
  };

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="h-10">
            <TableHead className="py-2 px-3 text-xs font-medium">Material Name</TableHead>
            <TableHead className="py-2 px-3 text-xs font-medium">Type</TableHead>
            <TableHead className="py-2 px-3 text-xs font-medium text-center">Required</TableHead>
            <TableHead className="py-2 px-3 text-xs font-medium text-center">Current Stock</TableHead>
            <TableHead className="py-2 px-3 text-xs font-medium text-center">Min Stock</TableHead>
            <TableHead className="py-2 px-3 text-xs font-medium text-center">In Procurement</TableHead>
            <TableHead className="py-2 px-3 text-xs font-medium text-center">Shortfall/Surplus</TableHead>
            <TableHead className="py-2 px-3 text-xs font-medium">Status</TableHead>
            <TableHead className="py-2 px-3 text-xs font-medium">Supplier</TableHead>
            <TableHead className="py-2 px-3 text-xs font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rawMaterials.map((material) => {
            const actualShortfall = calculateActualShortfall(
              material.required,
              material.minimum_stock,
              material.current_stock,
              material.in_procurement
            );
            
            const statusInfo = getStockStatusIcon(
              material.current_stock,
              material.minimum_stock,
              actualShortfall
            );

            const StatusIcon = statusInfo.icon;

            return (
              <TableRow key={material.id} className="h-12">
                <TableCell className="px-3 py-2 font-medium text-sm">
                  {material.name}
                </TableCell>
                <TableCell className="px-3 py-2 text-sm">
                  {material.type}
                </TableCell>
                <TableCell className="px-3 py-2 text-center font-bold text-purple-600 text-sm">
                  {formatIndianNumber(material.required)}
                </TableCell>
                <TableCell className="px-3 py-2 text-center font-bold text-sm">
                  {formatIndianNumber(material.current_stock)} {material.unit}
                </TableCell>
                <TableCell className="px-3 py-2 text-center text-sm">
                  {formatIndianNumber(material.minimum_stock)} {material.unit}
                </TableCell>
                <TableCell className="px-3 py-2 text-center text-sm">
                  {formatIndianNumber(material.in_procurement)} {material.unit}
                </TableCell>
                <TableCell className="px-3 py-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className={`text-sm font-medium ${actualShortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatIndianNumber(Math.abs(actualShortfall))} {material.unit}
                    </span>
                    {actualShortfall > 0 ? (
                      <ArrowDown className="h-4 w-4 text-red-600" />
                    ) : (
                      <ArrowUp className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-3 py-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusInfo.bgColor}`}>
                    <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
                    <span className={`text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-3 py-2 text-sm">
                  {material.supplier_name || 'Not assigned'}
                </TableCell>
                <TableCell className="px-3 py-2">
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => onViewMaterial(material)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => onEditMaterial(material)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default RawMaterialsTable;
