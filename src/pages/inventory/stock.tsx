import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Search, AlertTriangle } from 'lucide-react';

interface StockItem {
  id: string;
  itemCode: string;
  itemName: string;
  warehouseName: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  uomName: string;
  reorderLevel: number;
  minStockLevel: number;
  maxStockLevel: number;
}

export default function StockPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    fetchStock();
    fetchWarehouses();
  }, [selectedWarehouse]);

  const fetchStock = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = selectedWarehouse
        ? `/api/inventory/stock?warehouseId=${selectedWarehouse}`
        : '/api/inventory/stock';
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setStockItems(data.stock || []);
    } catch (error) {
      console.error('Error fetching stock:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/warehouses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setWarehouses(data.warehouses || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const getStockStatus = (item: StockItem) => {
    const availableQty = item.availableQuantity || 0;
    if (availableQty <= 0) return { label: 'Out of Stock', color: 'destructive' };
    if (item.minStockLevel && availableQty <= item.minStockLevel) return { label: 'Low Stock', color: 'warning' };
    if (item.maxStockLevel && availableQty >= item.maxStockLevel) return { label: 'Overstock', color: 'secondary' };
    return { label: 'In Stock', color: 'success' };
  };

  const filteredStock = stockItems.filter((item) => {
    const matchesSearch =
      item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      '';

    const availableQty = item.availableQuantity || 0;
    const minLevel = item.minStockLevel || 0;

    if (filterType === 'LOW_STOCK') {
      return matchesSearch && availableQty <= minLevel && availableQty > 0;
    }
    if (filterType === 'OUT_OF_STOCK') {
      return matchesSearch && availableQty <= 0;
    }
    return matchesSearch;
  });

  const lowStockCount = stockItems.filter((item) => {
    const availableQty = item.availableQuantity || 0;
    const minLevel = item.minStockLevel || 0;
    return availableQty <= minLevel && availableQty > 0;
  }).length;
  const outOfStockCount = stockItems.filter((item) => (item.availableQuantity || 0) <= 0).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Stock Levels</h1>
          <p className="text-muted-foreground">Monitor inventory stock across warehouses</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockItems.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{lowStockCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{outOfStockCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>Stock Inventory</CardTitle>
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full md:w-48"
                >
                  <option value="ALL">All Items</option>
                  <option value="LOW_STOCK">Low Stock</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </Select>
                <Select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="w-full md:w-48"
                >
                  <option value="">All Warehouses</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name}
                    </option>
                  ))}
                </Select>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead className="text-right">Reserved</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStock.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No stock records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStock.map((item) => {
                      const status = getStockStatus(item);
                      return (
                        <TableRow key={`${item.itemId}-${item.warehouseId}`}>
                          <TableCell className="font-medium">{item.itemCode}</TableCell>
                          <TableCell>{item.itemName}</TableCell>
                          <TableCell>{item.warehouseName}</TableCell>
                          <TableCell className="text-right">
                            {Math.floor(Number(item.reservedQuantity))}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {Math.floor(Number(item.availableQuantity))}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.color as any}>{status.label}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
