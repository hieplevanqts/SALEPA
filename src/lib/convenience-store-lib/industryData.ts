import type { Product, Order } from "./store";
import type { IndustryType } from "../../modules/convenience-store/pages/system/IndustrySelection";
// import { demoSpaOrders } from "./demoData";

export interface IndustryData {
  products: Omit<Product, "id">[];
  categories: string[];
  orders?: Order[];
}

type RetailSeedProduct = {
  name: string;
  price: number;
  category: string;
  stock: number;
  code: string;
  barcode: string;
  description: string;
};

const buildRetailProduct = (
  seed: RetailSeedProduct,
  index: number,
): Omit<Product, "id"> => {
  const timestamp = new Date().toISOString();

  return {
    _id: `retail-prod-${String(index + 1).padStart(3, "0")}`,
    code: seed.code,
    title: seed.name,
    price: seed.price,
    quantity: seed.stock,
    status: 1,
    created_at: timestamp,
    updated_at: timestamp,
    category: seed.category,
    stock: seed.stock,
    barcode: seed.barcode,
    description: seed.description,
    name: seed.name,
    brief: seed.description,
    content: seed.description,
  };
};

const retailSeedProducts: RetailSeedProduct[] = [
  // Đồ ăn vặt
  {
    name: "Snack khoai tây",
    price: 15000,
    category: "Đồ ăn vặt",
    stock: 100,
    code: "8934569000001",
    barcode: "8934569000001",
    description: "Snack khoai tây chiên vị tự nhiên",
  },
  {
    name: "Bánh quy socola",
    price: 25000,
    category: "Đồ ăn vặt",
    stock: 80,
    code: "8934569000002",
    barcode: "8934569000002",
    description: "Bánh quy socola chip thơm ngon",
  },
  {
    name: "Kẹo dẻo trái cây",
    price: 12000,
    category: "Đồ ăn vặt",
    stock: 120,
    code: "8934569000003",
    barcode: "8934569000003",
    description: "Kẹo dẻo nhiều vị trái cây",
  },
  // Nước giải khát
  {
    name: "Nước suối 500ml",
    price: 5000,
    category: "Nước giải khát",
    stock: 200,
    code: "8934569000004",
    barcode: "8934569000004",
    description: "Nước khoáng thiên nhiên",
  },
  {
    name: "Coca Cola 330ml",
    price: 10000,
    category: "Nước giải khát",
    stock: 150,
    code: "8934569000005",
    barcode: "8934569000005",
    description: "Nước ngọt có ga Coca Cola",
  },
  {
    name: "Trà xanh không độ",
    price: 9000,
    category: "Nước giải khát",
    stock: 100,
    code: "8934569000006",
    barcode: "8934569000006",
    description: "Trà xanh không đường tốt cho sức khỏe",
  },
  // Gia vị
  {
    name: "Muối I-ốt",
    price: 8000,
    category: "Gia vị",
    stock: 60,
    code: "8934569000007",
    barcode: "8934569000007",
    description: "Muối I-ốt tinh khiết 500g",
  },
  {
    name: "Đường trắng",
    price: 18000,
    category: "Gia vị",
    stock: 50,
    code: "8934569000008",
    barcode: "8934569000008",
    description: "Đường tinh luyện 1kg",
  },
  {
    name: "Nước mắm",
    price: 35000,
    category: "Gia vị",
    stock: 40,
    code: "8934569000009",
    barcode: "8934569000009",
    description: "Nước mắm truyền thống 500ml",
  },
  // Hàng gia dụng
  {
    name: "Khăn giấy ăn",
    price: 20000,
    category: "Hàng gia dụng",
    stock: 80,
    code: "8934569000010",
    barcode: "8934569000010",
    description: "Khăn giấy ăn 3 lớp mềm mại",
  },
  {
    name: "Bút bi xanh",
    price: 5000,
    category: "Đồ dùng học tập",
    stock: 150,
    code: "8934569000011",
    barcode: "8934569000011",
    description: "Bút bi mực xanh viết trơn",
  },
  {
    name: "Vở kẻ ngang 200 trang",
    price: 15000,
    category: "Đồ dùng học tập",
    stock: 70,
    code: "8934569000012",
    barcode: "8934569000012",
    description: "Vở học sinh kẻ ngang chất lượng",
  },
];

export const industryDataMap: Record<
  IndustryType,
  IndustryData
> = {
  'retail': {
    categories: [
      "Đồ ăn vặt",
      "Nước giải khát",
      "Gia vị",
      "Hàng gia dụng",
      "Vệ sinh cá nhân",
      "Đồ dùng học tập",
    ],
    products: retailSeedProducts.map(buildRetailProduct),
  },
};

// Helper function to ensure all products have status field
function ensureProductsHaveStatus(
  data: IndustryData | undefined,
  isActiveIndustry: boolean,
): IndustryData {
  // If no data exists, return empty data
  if (!data || !data.products) {
    return {
      products: [],
      categories: [],
      orders: [],
    };
  }

  return {
    ...data,
    products: data.products.map((product) => {
      if (product.status !== undefined) {
        return product;
      }
      // Food & Beverage, Retail (grocery): status = 1 (active)
      // Others (Spa, Fashion, etc.): status = 0 (inactive)
      return {
        ...product,
        status: isActiveIndustry ? 1 : 0,
      } as any;
    }),
  };
}

export function getIndustryData(
  industry: IndustryType,
): IndustryData {
  const data = industryDataMap[industry];
  // Active industries: food-beverage and retail (grocery/convenience store)
  const isActiveIndustry =
    industry === "retail";
  return ensureProductsHaveStatus(data, isActiveIndustry);
}