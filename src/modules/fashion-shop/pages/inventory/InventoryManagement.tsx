// =====================================================
// INVENTORY MANAGEMENT - Quản lý tồn kho
// Hiển thị tồn kho hiện tại
// =====================================================

import { useState, useEffect, useMemo } from 'react';
import { 
  Package, TrendingDown, TrendingUp, AlertTriangle, 
  Search, Download, RefreshCw,
  BarChart3
} from 'lucide-react';
import { useTranslation } from '../../../../lib/fashion-shop-lib/useTranslation';
import { api } from '../../../../lib/fashion-shop-lib/api';
import type { Inventory } from '../../../../lib/fashion-shop-lib/inventoryTypes';
import type { Product, ProductVariant } from '../../../../lib/fashion-shop-lib/mockProductData_fashion_only';
import { Pagination } from '../../components/common/Pagination';
import { toast } from 'sonner';

export function InventoryManagement() {
  const { t } = useTranslation();
  
  // Data states
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [invRes, prodRes, varRes] = await Promise.all([
        api.getInventories(),
        api.getProducts(),
        api.getProductVariants(),
      ]);

      if (invRes.success && invRes.data) setInventories(invRes.data);
      if (prodRes.success && prodRes.data) setProducts(prodRes.data);
      if (varRes.success && varRes.data) setVariants(varRes.data);
    } catch (error) {
      console.error('Failed to load inventory data:', error);
      toast.error('Không thể tải dữ liệu tồn kho');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Get variant info
  const getVariantInfo = (variantId: string) => {
    const variant = variants.find(v => v._id === variantId);
    const product = variant ? products.find(p => p._id === variant.product_id) : null;
    return { variant, product };
  };

  // Filter inventories
  const filteredInventories = useMemo(() => {
    let filtered = inventories;

    // Filter by status
    if (filterStatus === 'low') {
      filtered = filtered.filter(inv => inv.on_hand > 0 && inv.on_hand <= 10);
    } else if (filterStatus === 'out') {
      filtered = filtered.filter(inv => inv.on_hand === 0);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(inv => {
        const { variant, product } = getVariantInfo(inv.variant_id);
        const searchLower = searchQuery.toLowerCase();
        return (
          variant?.sku?.toLowerCase().includes(searchLower) ||
          variant?.barcode?.toLowerCase().includes(searchLower) ||
          variant?.title?.toLowerCase().includes(searchLower) ||
          product?.title?.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [inventories, filterStatus, searchQuery, variants, products]);

  // Pagination
  const totalPages = Math.ceil(filteredInventories.length / itemsPerPage);
  
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInventories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInventories, currentPage, itemsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    const totalValue = inventories.reduce((sum, inv) => {
      const { variant } = getVariantInfo(inv.variant_id);
      const cost = variant?.cost_price || 0;
      return sum + (inv.on_hand * cost);
    }, 0);

    const lowStock = inventories.filter(inv => inv.on_hand > 0 && inv.on_hand <= 10).length;
    const outOfStock = inventories.filter(inv => inv.on_hand === 0).length;
    const totalSKU = inventories.length;

    return { totalValue, lowStock, outOfStock, totalSKU };
  }, [inventories, variants]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[#FE7410] animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản Lý Tồn Kho
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Theo dõi tồn kho hiện tại
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Tổng biến thể</span>
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalSKU}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Giá trị tồn</span>
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalValue.toLocaleString('vi-VN')}₫
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Tồn thấp</span>
              <TrendingDown className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.lowStock}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Hết hàng</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">
              {stats.outOfStock}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex gap-4 items-center flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo SKU, barcode, tên sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'all'
                  ? 'bg-[#FE7410] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterStatus('low')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                filterStatus === 'low'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              Tồn thấp
            </button>
            <button
              onClick={() => setFilterStatus('out')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                filterStatus === 'out'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Hết hàng
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#F5F1E8' }}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Sản phẩm</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Biến thể</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">Tồn thực tế</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">Đã giữ</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">Đang về</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">Có sẵn</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">Giá vốn</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">Giá trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                paginatedItems.map((inv) => {
                  const { variant, product } = getVariantInfo(inv.variant_id);
                  const costPrice = variant?.cost_price || 0;
                  const inventoryValue = inv.on_hand * costPrice;
                  
                  // Status indicator
                  let statusColor = 'text-green-600';
                  if (inv.on_hand === 0) statusColor = 'text-red-600';
                  else if (inv.on_hand <= 10) statusColor = 'text-yellow-600';

                  return (
                    <tr key={inv._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {variant?.sku || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {product?.title || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {variant?.title || '-'}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-semibold ${statusColor}`}>
                        {inv.on_hand}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">
                        {inv.reserved}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-blue-600">
                        {inv.incoming}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                        {inv.available}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">
                        {costPrice.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                        {inventoryValue.toLocaleString('vi-VN')}₫
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredInventories.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}
    </div>
  );
}