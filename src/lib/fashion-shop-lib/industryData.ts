import type { Product } from './store';
import type { IndustryType } from './IndustrySelection';

export interface IndustryData {
  products: Omit<Product, 'id'>[];
  categories: string[];
}

export const industryDataMap: Record<IndustryType, IndustryData> = {
  'food-beverage': {
    categories: ['Đồ uống', 'Đồ ăn', 'Bánh kẹo', 'Món ăn nhanh', 'Món Hàn', 'Món Nhật', 'Món Thái'],
    products: [
      // Đồ uống
      {
        name: 'Cà phê đen',
        price: 25000,
        category: 'Đồ uống',
        stock: 100,
        barcode: '8934567890001',
        description: 'Cà phê đen nguyên chất, hương vị đậm đà truyền thống',
      },
      {
        name: 'Cà phê sữa',
        price: 30000,
        category: 'Đồ uống',
        stock: 100,
        barcode: '8934567890002',
        description: 'Cà phê sữa đá thơm ngon, ngọt ngào',
      },
      {
        name: 'Trà sữa trân châu',
        price: 35000,
        category: 'Đồ uống',
        stock: 80,
        barcode: '8934567890003',
        description: 'Trà sữa trân châu đường đen, topping đa dạng',
      },
      {
        name: 'Nước cam',
        price: 20000,
        category: 'Đồ uống',
        stock: 60,
        barcode: '8934567890007',
      },
      {
        name: 'Sinh tố bơ',
        price: 35000,
        category: 'Đồ uống',
        stock: 45,
        barcode: '8934567890008',
      },
      // Đồ ăn
      {
        name: 'Bánh mì thịt',
        price: 20000,
        category: 'Đồ ăn',
        stock: 50,
        barcode: '8934567890004',
      },
      {
        name: 'Phở bò',
        price: 45000,
        category: 'Đồ ăn',
        stock: 30,
        barcode: '8934567890005',
      },
      {
        name: 'Cơm gà',
        price: 40000,
        category: 'Đồ ăn',
        stock: 40,
        barcode: '8934567890006',
      },
      {
        name: 'Bún bò Huế',
        price: 45000,
        category: 'Đồ ăn',
        stock: 25,
        barcode: '8934567890009',
      },
      // Bánh kẹo
      {
        name: 'Bánh ngọt',
        price: 15000,
        category: 'Bánh kẹo',
        stock: 60,
        barcode: '8934567890010',
      },
      {
        name: 'Kem vani',
        price: 25000,
        category: 'Bánh kẹo',
        stock: 40,
        barcode: '8934567890011',
      },
    ],
  },

  'spa-service': {
    categories: ['Massage', 'Chăm sóc da', 'Nail', 'Waxing', 'Sản phẩm', 'Liệu trình'],
    products: [
      // SERVICES - Massage
      {
        name: 'Massage body 60 phút',
        price: 300000,
        category: 'Massage',
        stock: 999,
        barcode: '8934567900001',
        description: 'Massage toàn thân thư giãn, giảm căng thẳng',
        productType: 'service',
        duration: 60,
        image: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBtYXNzYWdlJTIwc3RvbmVzfGVufDF8fHx8MTc2ODI4Njk1N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        name: 'Massage body 90 phút',
        price: 450000,
        category: 'Massage',
        stock: 999,
        barcode: '8934567900002',
        description: 'Massage toàn thân VIP, kèm đá nóng',
        productType: 'service',
        duration: 90,
        image: 'https://images.unsplash.com/photo-1610402601271-5b4bd5b3eba4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBob3QlMjBzdG9uZSUyMHRoZXJhcHl8ZW58MXx8fHwxNzY4MzU5OTM0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        name: 'Massage foot 45 phút',
        price: 200000,
        category: 'Massage',
        stock: 999,
        barcode: '8934567900003',
        description: 'Massage chân giảm mỏi, cải thiện tuần hoàn',
        productType: 'service',
        duration: 45,
        image: 'https://images.unsplash.com/photo-1559185590-d545a0c5a1dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBmb290JTIwbWFzc2FnZXxlbnwxfHx8fDE3NjgyODY5NTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      // SERVICES - Chăm sóc da
      {
        name: 'Facial trị mụn',
        price: 350000,
        category: 'Chăm sóc da',
        stock: 999,
        barcode: '8934567900004',
        description: 'Điều trị mụn chuyên sâu, làm sạch da',
        productType: 'service',
        duration: 75,
        image: 'https://images.unsplash.com/photo-1684014286330-ddbeb4a40c92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWNpYWwlMjBza2luY2FyZSUyMHRyZWF0bWVudHxlbnwxfHx8fDE3NjgyODY5NTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        name: 'Facial dưỡng ẩm',
        price: 400000,
        category: 'Chăm sóc da',
        stock: 999,
        barcode: '8934567900005',
        description: 'Cấp ẩm sâu, phục hồi da',
        productType: 'service',
        duration: 60,
        image: 'https://images.unsplash.com/photo-1611169035510-f9af52e6dbe2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBmYWNlJTIwbWFza3xlbnwxfHx8fDE3NjgzNTk5MzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        name: 'Facial căng bóng',
        price: 500000,
        category: 'Chăm sóc da',
        stock: 999,
        barcode: '8934567900006',
        description: 'Làm căng da, chống lão hóa',
        productType: 'service',
        duration: 90,
        image: 'https://images.unsplash.com/photo-1719858511928-94db73c8de67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcGElMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzY4MzQ1NjY5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      // SERVICES - Nail
      {
        name: 'Sơn gel móng tay',
        price: 150000,
        category: 'Nail',
        stock: 999,
        barcode: '8934567900007',
        description: 'Sơn gel cao cấp, bền màu lên đến 3 tuần',
        productType: 'service',
        duration: 60,
        image: 'https://images.unsplash.com/photo-1599458348985-236f9b110da1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYWlsJTIwcG9saXNoJTIwbWFuaWN1cmV8ZW58MXx8fHwxNzY4Mjg2OTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        name: 'Sơn gel móng chân',
        price: 180000,
        category: 'Nail',
        stock: 999,
        barcode: '8934567900008',
        description: 'Sơn gel móng chân, massage chân thư giãn',
        productType: 'service',
        duration: 70,
        image: 'https://images.unsplash.com/photo-1599458348985-236f9b110da1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYWlsJTIwcG9saXNoJTIwbWFuaWN1cmV8ZW58MXx8fHwxNzY4Mjg2OTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        name: 'Vẽ nail họa tiết',
        price: 50000,
        category: 'Nail',
        stock: 999,
        barcode: '8934567900009',
        description: 'Vẽ họa tiết tùy chỉnh theo yêu cầu',
        productType: 'service',
        duration: 30,
        image: 'https://images.unsplash.com/photo-1599458348985-236f9b110da1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYWlsJTIwcG9saXNoJTIwbWFuaWN1cmV8ZW58MXx8fHwxNzY4Mjg2OTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      // SERVICES - Waxing
      {
        name: 'Wax lông chân',
        price: 200000,
        category: 'Waxing',
        stock: 999,
        barcode: '8934567900010',
        description: 'Tẩy lông chân sạch sẽ, da mịn màng',
        productType: 'service',
        duration: 45,
        image: 'https://images.unsplash.com/photo-1707355336836-0bcd35139e6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBiZWF1dHklMjB3YXhpbmd8ZW58MXx8fHwxNzY4Mjg2OTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        name: 'Wax lông tay',
        price: 150000,
        category: 'Waxing',
        stock: 999,
        barcode: '8934567900011',
        description: 'Tẩy lông tay nhanh gọn, không đau',
        productType: 'service',
        duration: 30,
        image: 'https://images.unsplash.com/photo-1707355336836-0bcd35139e6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBiZWF1dHklMjB3YXhpbmd8ZW58MXx8fHwxNzY4Mjg2OTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      // TREATMENTS - Liệu trình
      {
        name: 'Liệu trình trị mụn 10 buổi',
        price: 3500000,
        category: 'Liệu trình',
        stock: 999,
        barcode: '8934567900012',
        description: 'Liệu trình điều trị mụn chuyên sâu 10 buổi, bao gồm facial + sản phẩm',
        productType: 'treatment',
        sessions: 10,
        image: 'https://images.unsplash.com/photo-1719858511928-94db73c8de67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcGElMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzY4MzQ1NjY5fDA&ixlib=rb-4.1.0&q=80&w=1080',
        sessionDetails: [
          {
            sessionNumber: 1,
            products: [{ id: 'spa-service-prod-17', quantity: 1 }, { id: 'spa-service-prod-19', quantity: 1 }],
            services: [{ id: 'spa-service-serv-04', quantity: 1 }]
          },
          {
            sessionNumber: 2,
            products: [{ id: 'spa-service-prod-17', quantity: 1 }],
            services: [{ id: 'spa-service-serv-04', quantity: 1 }]
          },
          {
            sessionNumber: 3,
            products: [{ id: 'spa-service-prod-19', quantity: 1 }],
            services: [{ id: 'spa-service-serv-04', quantity: 1 }]
          },
          {
            sessionNumber: 4,
            products: [{ id: 'spa-service-prod-17', quantity: 1 }],
            services: [{ id: 'spa-service-serv-04', quantity: 1 }]
          },
          {
            sessionNumber: 5,
            products: [{ id: 'spa-service-prod-19', quantity: 1 }],
            services: [{ id: 'spa-service-serv-04', quantity: 1 }]
          },
          {
            sessionNumber: 6,
            products: [{ id: 'spa-service-prod-17', quantity: 1 }],
            services: [{ id: 'spa-service-serv-04', quantity: 1 }]
          },
          {
            sessionNumber: 7,
            products: [{ id: 'spa-service-prod-19', quantity: 1 }],
            services: [{ id: 'spa-service-serv-04', quantity: 1 }]
          },
          {
            sessionNumber: 8,
            products: [{ id: 'spa-service-prod-17', quantity: 1 }],
            services: [{ id: 'spa-service-serv-04', quantity: 1 }]
          },
          {
            sessionNumber: 9,
            products: [{ id: 'spa-service-prod-19', quantity: 1 }],
            services: [{ id: 'spa-service-serv-04', quantity: 1 }]
          },
          {
            sessionNumber: 10,
            products: [{ id: 'spa-service-prod-17', quantity: 1 }, { id: 'spa-service-prod-19', quantity: 1 }],
            services: [{ id: 'spa-service-serv-04', quantity: 1 }]
          }
        ]
      },
      {
        name: 'Liệu trình chăm sóc da 6 buổi',
        price: 2800000,
        category: 'Liệu trình',
        stock: 999,
        barcode: '8934567900013',
        description: 'Liệu trình chăm sóc da toàn diện, làm đẹp da từ bên trong',
        productType: 'treatment',
        sessions: 6,
        image: 'https://images.unsplash.com/photo-1582498674105-ad104fcc5784?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcGElMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzY4MjE5MjU1fDA&ixlib=rb-4.1.0&q=80&w=1080',
        sessionDetails: [
          {
            sessionNumber: 1,
            products: [{ id: 'spa-service-prod-17', quantity: 1 }, { id: 'spa-service-prod-18', quantity: 1 }],
            services: [{ id: 'spa-service-serv-05', quantity: 1 }]
          },
          {
            sessionNumber: 2,
            products: [{ id: 'spa-service-prod-18', quantity: 1 }],
            services: [{ id: 'spa-service-serv-05', quantity: 1 }]
          },
          {
            sessionNumber: 3,
            products: [{ id: 'spa-service-prod-17', quantity: 1 }, { id: 'spa-service-prod-20', quantity: 1 }],
            services: [{ id: 'spa-service-serv-06', quantity: 1 }]
          },
          {
            sessionNumber: 4,
            products: [{ id: 'spa-service-prod-18', quantity: 1 }],
            services: [{ id: 'spa-service-serv-05', quantity: 1 }]
          },
          {
            sessionNumber: 5,
            products: [{ id: 'spa-service-prod-20', quantity: 1 }],
            services: [{ id: 'spa-service-serv-06', quantity: 1 }]
          },
          {
            sessionNumber: 6,
            products: [{ id: 'spa-service-prod-17', quantity: 1 }, { id: 'spa-service-prod-18', quantity: 1 }],
            services: [{ id: 'spa-service-serv-06', quantity: 1 }]
          }
        ]
      },
      {
        name: 'Liệu trình massage 8 buổi',
        price: 2200000,
        category: 'Liệu trình',
        stock: 999,
        barcode: '8934567900018',
        description: 'Liệu trình massage body thư giãn 8 buổi, giảm stress',
        productType: 'treatment',
        sessions: 8,
        image: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBtYXNzYWdlJTIwc3RvbmVzfGVufDF8fHx8MTc2ODI4Njk1N3ww&ixlib=rb-4.1.0&q=80&w=1080',
        sessionDetails: [
          {
            sessionNumber: 1,
            products: [],
            services: [{ id: 'spa-service-serv-01', quantity: 1 }]
          },
          {
            sessionNumber: 2,
            products: [],
            services: [{ id: 'spa-service-serv-01', quantity: 1 }]
          },
          {
            sessionNumber: 3,
            products: [],
            services: [{ id: 'spa-service-serv-01', quantity: 1 }]
          },
          {
            sessionNumber: 4,
            products: [],
            services: [{ id: 'spa-service-serv-02', quantity: 1 }]
          },
          {
            sessionNumber: 5,
            products: [],
            services: [{ id: 'spa-service-serv-01', quantity: 1 }]
          },
          {
            sessionNumber: 6,
            products: [],
            services: [{ id: 'spa-service-serv-01', quantity: 1 }]
          },
          {
            sessionNumber: 7,
            products: [],
            services: [{ id: 'spa-service-serv-01', quantity: 1 }]
          },
          {
            sessionNumber: 8,
            products: [],
            services: [{ id: 'spa-service-serv-02', quantity: 1 }]
          }
        ]
      },
      {
        name: 'Liệu trình nail & massage 5 buổi',
        price: 1500000,
        category: 'Liệu trình',
        stock: 999,
        barcode: '8934567900019',
        description: 'Combo chăm sóc nail và massage foot 5 buổi',
        productType: 'treatment',
        sessions: 5,
        image: 'https://images.unsplash.com/photo-1599458348985-236f9b110da1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYWlsJTIwcG9saXNoJTIwbWFuaWN1cmV8ZW58MXx8fHwxNzY4Mjg2OTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
        sessionDetails: [
          {
            sessionNumber: 1,
            products: [],
            services: [{ id: 'spa-service-serv-07', quantity: 1 }, { id: 'spa-service-serv-03', quantity: 1 }]
          },
          {
            sessionNumber: 2,
            products: [],
            services: [{ id: 'spa-service-serv-08', quantity: 1 }]
          },
          {
            sessionNumber: 3,
            products: [],
            services: [{ id: 'spa-service-serv-07', quantity: 1 }, { id: 'spa-service-serv-03', quantity: 1 }]
          },
          {
            sessionNumber: 4,
            products: [],
            services: [{ id: 'spa-service-serv-08', quantity: 1 }]
          },
          {
            sessionNumber: 5,
            products: [],
            services: [{ id: 'spa-service-serv-07', quantity: 1 }, { id: 'spa-service-serv-08', quantity: 1 }]
          }
        ]
      },
      {
        name: 'Liệu trình trẻ hóa da 12 buổi',
        price: 5800000,
        category: 'Liệu trình',
        stock: 999,
        barcode: '8934567900020',
        description: 'Liệu trình chống lão hóa, làm trẻ hóa làn da 12 buổi VIP',
        productType: 'treatment',
        sessions: 12,
        image: 'https://images.unsplash.com/photo-1611169035510-f9af52e6dbe2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBmYWNlJTIwbWFza3xlbnwxfHx8fDE3NjgzNTk5MzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
        sessionDetails: [
          {
            sessionNumber: 1,
            products: [{ id: 'spa-service-prod-17', quantity: 1 }, { id: 'spa-service-prod-18', quantity: 1 }],
            services: [{ id: 'spa-service-serv-06', quantity: 1 }]
          },
          {
            sessionNumber: 2,
            products: [{ id: 'spa-service-prod-17', quantity: 1 }],
            services: [{ id: 'spa-service-serv-06', quantity: 1 }]
          },
          {
            sessionNumber: 3,
            products: [{ id: 'spa-service-prod-18', quantity: 1 }, { id: 'spa-service-prod-20', quantity: 1 }],
            services: [{ id: 'spa-service-serv-06', quantity: 1 }]
          },
          {
            sessionNumber: 4,
            products: [{ id: 'spa-service-prod-17', quantity: 1 }],
            services: [{ id: 'spa-service-serv-06', quantity: 1 }]
          },
          {
            sessionNumber: 5,
            products: [{ id: 'spa-service-prod-18', quantity: 1 }],
            services: [{ id: 'spa-service-serv-06', quantity: 1 }]
          },
          {
            sessionNumber: 6,
            products: [{ id: 'spa-service-prod-17', quantity: 1 }, { id: 'spa-service-prod-20', quantity: 1 }],
            services: [{ id: 'spa-service-serv-06', quantity: 1 }]
          },
          {
            sessionNumber: 7,
            products: [{ id: 'spa-service-prod-17', quantity: 1 }],
            services: [{ id: 'spa-service-serv-06', quantity: 1 }]
          },
          {
            sessionNumber: 8,
            products: [{ id: 'spa-service-prod-18', quantity: 1 }],
            services: [{ id: 'spa-service-serv-06', quantity: 1 }]
          },
          {
            sessionNumber: 9,
            products: [{ id: 'spa-service-prod-17', quantity: 1 }, { id: 'spa-service-prod-20', quantity: 1 }],
            services: [{ id: 'spa-service-serv-06', quantity: 1 }]
          },
          {
            sessionNumber: 10,
            products: [{ id: 'spa-service-prod-18', quantity: 1 }],
            services: [{ id: 'spa-service-serv-06', quantity: 1 }]
          },
          {
            sessionNumber: 11,
            products: [{ id: 'spa-service-prod-17', quantity: 1 }],
            services: [{ id: 'spa-service-serv-06', quantity: 1 }]
          },
          {
            sessionNumber: 12,
            products: [{ id: 'spa-service-prod-17', quantity: 2 }, { id: 'spa-service-prod-18', quantity: 1 }, { id: 'spa-service-prod-20', quantity: 1 }],
            services: [{ id: 'spa-service-serv-06', quantity: 1 }]
          }
        ]
      },
      // PRODUCTS - Sản phẩm
      {
        name: 'Serum Vitamin C',
        price: 450000,
        category: 'Sản phẩm',
        stock: 50,
        barcode: '8934567900014',
        description: 'Serum dưỡng trắng da, mờ thâm nám',
        productType: 'product',
        image: 'https://images.unsplash.com/photo-1643379850623-7eb6442cd262?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMHNlcnVtJTIwYm90dGxlfGVufDF8fHx8MTc2ODI5NjYwNHww&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        name: 'Kem dưỡng ẩm ban đêm',
        price: 380000,
        category: 'Sản phẩm',
        stock: 40,
        barcode: '8934567900015',
        description: 'Kem dưỡng ẩm phục hồi da ban đêm',
        productType: 'product',
        image: 'https://images.unsplash.com/photo-1609097164673-7cfafb51b926?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMG1vaXN0dXJpemVyJTIwY3JlYW18ZW58MXx8fHwxNzY4MzU5OTMzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        name: 'Sữa rửa mặt tạo bọt',
        price: 280000,
        category: 'Sản phẩm',
        stock: 60,
        barcode: '8934567900016',
        description: 'Sữa rửa mặt làm sạch sâu, kiểm soát dầu',
        productType: 'product',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWNpYWwlMjBjbGVhbnNlcnxlbnwxfHx8fDE3NjgzNTk5MzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        name: 'Mặt nạ ngủ Hyaluronic Acid',
        price: 320000,
        category: 'Sản phẩm',
        stock: 35,
        barcode: '8934567900017',
        description: 'Mặt nạ ngủ cấp ẩm tức thì',
        productType: 'product',
        image: 'https://images.unsplash.com/photo-1611169035510-f9af52e6dbe2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBmYWNlJTIwbWFza3xlbnwxfHx8fDE3NjgzNTk5MzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        name: 'Toner cân bằng da',
        price: 250000,
        category: 'Sản phẩm',
        stock: 55,
        barcode: '8934567900031',
        description: 'Toner cân bằng pH da, se khít lỗ chân lông',
        productType: 'product',
        image: 'https://images.unsplash.com/photo-1643379850623-7eb6442cd262?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMHNlcnVtJTIwYm90dGxlfGVufDF8fHx8MTc2ODI5NjYwNHww&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        name: 'Kem chống nắng SPF 50+',
        price: 320000,
        category: 'Sản phẩm',
        stock: 45,
        barcode: '8934567900032',
        description: 'Kem chống nắng phổ rộng, không gây nhờn',
        productType: 'product',
        image: 'https://images.unsplash.com/photo-1609097164673-7cfafb51b926?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMG1vaXN0dXJpemVyJTIwY3JlYW18ZW58MXx8fHwxNzY4MzU5OTMzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        name: 'Tinh chất dưỡng da ban đêm',
        price: 520000,
        category: 'Sản phẩm',
        stock: 30,
        barcode: '8934567900033',
        description: 'Tinh chất phục hồi da, chống lão hóa',
        productType: 'product',
        image: 'https://images.unsplash.com/photo-1643379850623-7eb6442cd262?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMHNlcnVtJTIwYm90dGxlfGVufDF8fHx8MTc2ODI5NjYwNHww&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        name: 'Tẩy trang dạng nước',
        price: 220000,
        category: 'Sản phẩm',
        stock: 65,
        barcode: '8934567900034',
        description: 'Nước tẩy trang nhẹ nhàng, lành tính',
        productType: 'product',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWNpYWwlMjBjbGVhbnNlcnxlbnwxfHx8fDE3NjgzNTk5MzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        name: 'Xịt khoáng dưỡng da',
        price: 180000,
        category: 'Sản phẩm',
        stock: 70,
        barcode: '8934567900035',
        description: 'Xịt khoáng làm dịu da, cấp ẩm tức thì',
        productType: 'product',
        image: 'https://images.unsplash.com/photo-1643379850623-7eb6442cd262?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMHNlcnVtJTIwYm90dGxlfGVufDF8fHx8MTc2ODI5NjYwNHww&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        name: 'Tẩy tế bào chết body',
        price: 290000,
        category: 'Sản phẩm',
        stock: 40,
        barcode: '8934567900036',
        description: 'Tẩy tế bào chết toàn thân, làm mịn da',
        productType: 'product',
        image: 'https://images.unsplash.com/photo-1638859460750-181fcc7936a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2R5JTIwc2NydWIlMjBzcGF8ZW58MXx8fHwxNzY4MzU5OTM0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      // ADDITIONAL SERVICES - 5 dịch vụ mới
      {
        name: 'Massage cổ vai gáy 30 phút',
        price: 180000,
        category: 'Massage',
        stock: 999,
        barcode: '8934567900021',
        description: 'Massage giảm đau mỏi vai gáy, thư giãn cơ bắp',
        productType: 'service',
        duration: 30,
        image: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBtYXNzYWdlJTIwc3RvbmVzfGVufDF8fHx8MTc2ODI4Njk1N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        name: 'Tẩy tế bào chết toàn thân',
        price: 350000,
        category: 'Chăm sóc da',
        stock: 999,
        barcode: '8934567900022',
        description: 'Tẩy da chết, làm mịn da toàn thân',
        productType: 'service',
        duration: 60,
        image: 'https://images.unsplash.com/photo-1638859460750-181fcc7936a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2R5JTIwc2NydWIlMjBzcGF8ZW58MXx8fHwxNzY4MzU5OTM0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        name: 'Chăm sóc móng combo (tay + chân)',
        price: 280000,
        category: 'Nail',
        stock: 999,
        barcode: '8934567900023',
        description: 'Cắt móng, dũa móng, đánh bóng cả tay và chân',
        productType: 'service',
        duration: 90,
        image: 'https://images.unsplash.com/photo-1599458348985-236f9b110da1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYWlsJTIwcG9saXNoJTIwbWFuaWN1cmV8ZW58MXx8fHwxNzY4Mjg2OTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        name: 'Ủ trắng body 60 phút',
        price: 450000,
        category: 'Chăm sóc da',
        stock: 999,
        barcode: '8934567900024',
        description: 'Ủ trắng toàn thân, nuôi dưỡng da trắng sáng',
        productType: 'service',
        duration: 60,
        image: 'https://images.unsplash.com/photo-1719858511928-94db73c8de67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcGElMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzY4MzQ1NjY5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        name: 'Massage đá nóng 120 phút',
        price: 650000,
        category: 'Massage',
        stock: 999,
        barcode: '8934567900025',
        description: 'Massage đá nóng toàn thân VIP, giải độc cơ thể',
        productType: 'service',
        duration: 120,
        image: 'https://images.unsplash.com/photo-1610402601271-5b4bd5b3eba4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBob3QlMjBzdG9uZSUyMHRoZXJhcHl8ZW58MXx8fHwxNzY4MzU5OTM0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      // ADDITIONAL TREATMENTS - 5 liệu trình mới
      {
        name: 'Liệu trình giảm béo body 15 buổi',
        price: 8500000,
        category: 'Liệu trình',
        stock: 999,
        barcode: '8934567900026',
        description: 'Liệu trình giảm béo toàn thân, săn chắc vóc dáng 15 buổi',
        productType: 'treatment',
        sessions: 15,
        image: 'https://images.unsplash.com/photo-1638859460750-181fcc7936a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2R5JTIwc2NydWIlMjBzcGF8ZW58MXx8fHwxNzY4MzU5OTM0fDA&ixlib=rb-4.1.0&q=80&w=1080',
        sessionDetails: [
          { sessionNumber: 1, products: [{ id: 'spa-service-prod-18', quantity: 1 }], services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }] },
          { sessionNumber: 2, products: [], services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }] },
          { sessionNumber: 3, products: [], services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }] },
          { sessionNumber: 4, products: [{ id: 'spa-service-prod-18', quantity: 1 }], services: [{ id: 'spa-service-serv-24', quantity: 1 }] },
          { sessionNumber: 5, products: [], services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }] },
          { sessionNumber: 6, products: [], services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }] },
          { sessionNumber: 7, products: [{ id: 'spa-service-prod-18', quantity: 1 }], services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }] },
          { sessionNumber: 8, products: [], services: [{ id: 'spa-service-serv-24', quantity: 1 }] },
          { sessionNumber: 9, products: [], services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }] },
          { sessionNumber: 10, products: [{ id: 'spa-service-prod-18', quantity: 1 }], services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }] },
          { sessionNumber: 11, products: [], services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }] },
          { sessionNumber: 12, products: [], services: [{ id: 'spa-service-serv-24', quantity: 1 }] },
          { sessionNumber: 13, products: [{ id: 'spa-service-prod-18', quantity: 1 }], services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }] },
          { sessionNumber: 14, products: [], services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }] },
          { sessionNumber: 15, products: [{ id: 'spa-service-prod-18', quantity: 2 }], services: [{ id: 'spa-service-serv-24', quantity: 1 }, { id: 'spa-service-serv-25', quantity: 1 }] }
        ]
      },
      {
        name: 'Liệu trình trắng da cao cấp 20 buổi',
        price: 12000000,
        category: 'Liệu trình',
        stock: 999,
        barcode: '8934567900027',
        description: 'Liệu trình trắng da toàn diện cao cấp 20 buổi, hiệu quả rõ rệt',
        productType: 'treatment',
        sessions: 20,
        image: 'https://images.unsplash.com/photo-1719858511928-94db73c8de67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcGElMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzY4MzQ1NjY5fDA&ixlib=rb-4.1.0&q=80&w=1080',
        sessionDetails: [
          { sessionNumber: 1, products: [{ id: 'spa-service-prod-17', quantity: 1 }], services: [{ id: 'spa-service-serv-24', quantity: 1 }] },
          { sessionNumber: 2, products: [], services: [{ id: 'spa-service-serv-06', quantity: 1 }] },
          { sessionNumber: 3, products: [], services: [{ id: 'spa-service-serv-24', quantity: 1 }] },
          { sessionNumber: 4, products: [{ id: 'spa-service-prod-17', quantity: 1 }], services: [{ id: 'spa-service-serv-06', quantity: 1 }] },
          { sessionNumber: 5, products: [], services: [{ id: 'spa-service-serv-24', quantity: 1 }] },
          { sessionNumber: 6, products: [], services: [{ id: 'spa-service-serv-06', quantity: 1 }] },
          { sessionNumber: 7, products: [{ id: 'spa-service-prod-17', quantity: 1 }], services: [{ id: 'spa-service-serv-24', quantity: 1 }] },
          { sessionNumber: 8, products: [], services: [{ id: 'spa-service-serv-06', quantity: 1 }] },
          { sessionNumber: 9, products: [], services: [{ id: 'spa-service-serv-24', quantity: 1 }] },
          { sessionNumber: 10, products: [{ id: 'spa-service-prod-17', quantity: 1 }], services: [{ id: 'spa-service-serv-06', quantity: 1 }] },
          { sessionNumber: 11, products: [], services: [{ id: 'spa-service-serv-24', quantity: 1 }] },
          { sessionNumber: 12, products: [], services: [{ id: 'spa-service-serv-06', quantity: 1 }] },
          { sessionNumber: 13, products: [{ id: 'spa-service-prod-17', quantity: 1 }], services: [{ id: 'spa-service-serv-24', quantity: 1 }] },
          { sessionNumber: 14, products: [], services: [{ id: 'spa-service-serv-06', quantity: 1 }] },
          { sessionNumber: 15, products: [], services: [{ id: 'spa-service-serv-24', quantity: 1 }] },
          { sessionNumber: 16, products: [{ id: 'spa-service-prod-17', quantity: 1 }], services: [{ id: 'spa-service-serv-06', quantity: 1 }] },
          { sessionNumber: 17, products: [], services: [{ id: 'spa-service-serv-24', quantity: 1 }] },
          { sessionNumber: 18, products: [], services: [{ id: 'spa-service-serv-06', quantity: 1 }] },
          { sessionNumber: 19, products: [{ id: 'spa-service-prod-17', quantity: 1 }], services: [{ id: 'spa-service-serv-24', quantity: 1 }] },
          { sessionNumber: 20, products: [{ id: 'spa-service-prod-17', quantity: 2 }], services: [{ id: 'spa-service-serv-06', quantity: 1 }] },
        ]
      },
      {
        name: 'Liệu trình thư giãn toàn diện 7 buổi',
        price: 3500000,
        category: 'Liệu trình',
        stock: 999,
        barcode: '8934567900028',
        description: 'Liệu trình thư giãn body + foot massage 7 buổi',
        productType: 'treatment',
        sessions: 7,
        image: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBtYXNzYWdlJTIwc3RvbmVzfGVufDF8fHx8MTc2ODI4Njk1N3ww&ixlib=rb-4.1.0&q=80&w=1080',
        sessionDetails: [
          { sessionNumber: 1, products: [], services: [{ id: 'spa-service-serv-25', quantity: 1 }] },
          { sessionNumber: 2, products: [], services: [{ id: 'spa-service-serv-01', quantity: 1 }, { id: 'spa-service-serv-03', quantity: 1 }] },
          { sessionNumber: 3, products: [], services: [{ id: 'spa-service-serv-25', quantity: 1 }] },
          { sessionNumber: 4, products: [], services: [{ id: 'spa-service-serv-01', quantity: 1 }, { id: 'spa-service-serv-03', quantity: 1 }] },
          { sessionNumber: 5, products: [], services: [{ id: 'spa-service-serv-25', quantity: 1 }] },
          { sessionNumber: 6, products: [], services: [{ id: 'spa-service-serv-02', quantity: 1 }] },
          { sessionNumber: 7, products: [], services: [{ id: 'spa-service-serv-25', quantity: 1 }] },
        ]
      },
      {
        name: 'Liệu trình nail chuyên nghiệp 4 buổi',
        price: 1200000,
        category: 'Liệu trình',
        stock: 999,
        barcode: '8934567900029',
        description: 'Liệu trình chăm sóc nail toàn diện 4 buổi',
        productType: 'treatment',
        sessions: 4,
        image: 'https://images.unsplash.com/photo-1599458348985-236f9b110da1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYWlsJTIwcG9saXNoJTIwbWFuaWN1cmV8ZW58MXx8fHwxNzY4Mjg2OTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
        sessionDetails: [
          { sessionNumber: 1, products: [], services: [{ id: 'spa-service-serv-23', quantity: 1 }] },
          { sessionNumber: 2, products: [], services: [{ id: 'spa-service-serv-07', quantity: 1 }, { id: 'spa-service-serv-08', quantity: 1 }] },
          { sessionNumber: 3, products: [], services: [{ id: 'spa-service-serv-23', quantity: 1 }] },
          { sessionNumber: 4, products: [], services: [{ id: 'spa-service-serv-07', quantity: 1 }, { id: 'spa-service-serv-08', quantity: 1 }, { id: 'spa-service-serv-09', quantity: 1 }] },
        ]
      },
      {
        name: 'Liệu trình chăm sóc da mặt + body 9 buổi',
        price: 6200000,
        category: 'Liệu trình',
        stock: 999,
        barcode: '8934567900030',
        description: 'Liệu trình chăm sóc da toàn diện cả mặt và body 9 buổi',
        productType: 'treatment',
        sessions: 9,
        image: 'https://images.unsplash.com/photo-1611169035510-f9af52e6dbe2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBmYWNlJTIwbWFza3xlbnwxfHx8fDE3NjgzNTk5MzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
        sessionDetails: [
          { sessionNumber: 1, products: [{ id: 'spa-service-prod-17', quantity: 1 }, { id: 'spa-service-prod-18', quantity: 1 }], services: [{ id: 'spa-service-serv-05', quantity: 1 }] },
          { sessionNumber: 2, products: [{ id: 'spa-service-prod-18', quantity: 1 }], services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-24', quantity: 1 }] },
          { sessionNumber: 3, products: [], services: [{ id: 'spa-service-serv-06', quantity: 1 }] },
          { sessionNumber: 4, products: [{ id: 'spa-service-prod-17', quantity: 1 }], services: [{ id: 'spa-service-serv-22', quantity: 1 }] },
          { sessionNumber: 5, products: [{ id: 'spa-service-prod-18', quantity: 1 }], services: [{ id: 'spa-service-serv-05', quantity: 1 }] },
          { sessionNumber: 6, products: [], services: [{ id: 'spa-service-serv-24', quantity: 1 }] },
          { sessionNumber: 7, products: [{ id: 'spa-service-prod-17', quantity: 1 }], services: [{ id: 'spa-service-serv-06', quantity: 1 }] },
          { sessionNumber: 8, products: [{ id: 'spa-service-prod-18', quantity: 1 }], services: [{ id: 'spa-service-serv-22', quantity: 1 }] },
          { sessionNumber: 9, products: [{ id: 'spa-service-prod-17', quantity: 1 }, { id: 'spa-service-prod-18', quantity: 1 }, { id: 'spa-service-prod-20', quantity: 1 }], services: [{ id: 'spa-service-serv-06', quantity: 1 }, { id: 'spa-service-serv-24', quantity: 1 }] },
        ]
      },
    ],
  },

  'fashion': {
    categories: ['Áo thun', 'Áo sơ mi', 'Quần jean', 'Váy', 'Phụ kiện', 'Giày dép'],
    products: [
      // Áo thun
      {
        name: 'Áo thun trắng basic',
        price: 150000,
        category: 'Áo thun',
        stock: 50,
        barcode: '8934568000001',
        description: 'Áo thun cotton 100%, form regular',
      },
      {
        name: 'Áo thun đen oversize',
        price: 180000,
        category: 'Áo thun',
        stock: 45,
        barcode: '8934568000002',
        description: 'Áo thun form rộng, phong cách Hàn Quốc',
      },
      {
        name: 'Áo thun polo',
        price: 220000,
        category: 'Áo thun',
        stock: 40,
        barcode: '8934568000003',
        description: 'Áo polo cao cấp, lịch sự',
      },
      // Áo sơ mi
      {
        name: 'Áo sơ mi trắng công sở',
        price: 350000,
        category: 'Áo sơ mi',
        stock: 35,
        barcode: '8934568000004',
        description: 'Áo sơ mi công sở, chống nhăn',
      },
      {
        name: 'Áo sơ mi kẻ caro',
        price: 320000,
        category: 'Áo sơ mi',
        stock: 30,
        barcode: '8934568000005',
        description: 'Áo sơ mi kẻ caro, phong cách trẻ trung',
      },
      // Quần jean
      {
        name: 'Quần jean nam slimfit',
        price: 450000,
        category: 'Quần jean',
        stock: 40,
        barcode: '8934568000006',
        description: 'Quần jean ôm vừa, co giãn nhẹ',
      },
      {
        name: 'Quần jean nữ skinny',
        price: 420000,
        category: 'Quần jean',
        stock: 38,
        barcode: '8934568000007',
        description: 'Quần jean skinny, tôn dáng',
      },
      {
        name: 'Quần jean baggy',
        price: 480000,
        category: 'Quần jean',
        stock: 35,
        barcode: '8934568000008',
        description: 'Quần jean baggy, phong cách Vintage',
      },
      // Váy
      {
        name: 'Váy maxi hoa',
        price: 380000,
        category: 'Váy',
        stock: 25,
        barcode: '8934568000009',
        description: 'Váy dài họa tiết hoa, nữ tính',
      },
      {
        name: 'Váy công sở',
        price: 320000,
        category: 'Váy',
        stock: 30,
        barcode: '8934568000010',
        description: 'Váy công sở lịch sự, thanh lịch',
      },
      // Phụ kiện
      {
        name: 'Thắt lưng da',
        price: 200000,
        category: 'Phụ kiện',
        stock: 50,
        barcode: '8934568000011',
        description: 'Thắt lưng da thật cao cấp',
      },
      {
        name: 'Túi xách nữ',
        price: 550000,
        category: 'Phụ kiện',
        stock: 20,
        barcode: '8934568000012',
        description: 'Túi xách thời trang, nhiều ngăn',
      },
      // Giày dép
      {
        name: 'Giày sneaker trắng',
        price: 650000,
        category: 'Giày dép',
        stock: 30,
        barcode: '8934568000013',
        description: 'Giày sneaker basic, đi được cả nam nữ',
      },
      {
        name: 'Dép sandal nữ',
        price: 280000,
        category: 'Giày dép',
        stock: 25,
        barcode: '8934568000014',
        description: 'Dép sandal đi biển, đi chơi',
      },
    ],
  },

  'retail': {
    categories: ['Đồ ăn vặt', 'Nước giải khát', 'Gia vị', 'Hàng gia dụng', 'Vệ sinh cá nhân', 'Đồ dùng học tập'],
    products: [
      // Đồ ăn vặt
      {
        name: 'Snack khoai tây',
        price: 15000,
        category: 'Đồ ăn vặt',
        stock: 100,
        barcode: '8934569000001',
        description: 'Snack khoai tây chiên vị tự nhiên',
      },
      {
        name: 'Bánh quy socola',
        price: 25000,
        category: 'Đồ ăn vặt',
        stock: 80,
        barcode: '8934569000002',
        description: 'Bánh quy socola chip thơm ngon',
      },
      {
        name: 'Kẹo dẻo trái cây',
        price: 12000,
        category: 'Đồ ăn vặt',
        stock: 120,
        barcode: '8934569000003',
        description: 'Kẹo dẻo nhiều vị trái cây',
      },
      // Nước giải khát
      {
        name: 'Nước suối 500ml',
        price: 5000,
        category: 'Nước giải khát',
        stock: 200,
        barcode: '8934569000004',
        description: 'Nước khoáng thiên nhiên',
      },
      {
        name: 'Coca Cola 330ml',
        price: 10000,
        category: 'Nước giải khát',
        stock: 150,
        barcode: '8934569000005',
        description: 'Nước ngọt có ga Coca Cola',
      },
      {
        name: 'Trà xanh không độ',
        price: 9000,
        category: 'Nước giải khát',
        stock: 100,
        barcode: '8934569000006',
        description: 'Trà xanh không đường tốt cho sức khỏe',
      },
      // Gia vị
      {
        name: 'Muối I-ốt',
        price: 8000,
        category: 'Gia vị',
        stock: 60,
        barcode: '8934569000007',
        description: 'Muối I-ốt tinh khiết 500g',
      },
      {
        name: 'Đường trắng',
        price: 18000,
        category: 'Gia vị',
        stock: 50,
        barcode: '8934569000008',
        description: 'Đường tinh luyện 1kg',
      },
      {
        name: 'Nước mắm',
        price: 35000,
        category: 'Gia vị',
        stock: 40,
        barcode: '8934569000009',
        description: 'Nước mắm truyền thống 500ml',
      },
      // Hàng gia dụng
      {
        name: 'Khăn giấy ăn',
        price: 20000,
        category: 'Hàng gia dụng',
        stock: 80,
        barcode: '8934569000010',
        description: 'Khăn giấy ăn 3 lớp mềm mại',
      },
      {
        name: 'Bút bi xanh',
        price: 5000,
        category: 'Đồ dùng học tập',
        stock: 150,
        barcode: '8934569000011',
        description: 'Bút bi mực xanh viết trơn',
      },
      {
        name: 'Vở kẻ ngang 200 trang',
        price: 15000,
        category: 'Đồ dùng học tập',
        stock: 70,
        barcode: '8934569000012',
        description: 'Vở học sinh kẻ ngang chất lượng',
      },
    ],
  },

  'electronics': {
    categories: ['Điện thoại', 'Phụ kiện điện thoại', 'Laptop', 'Tai nghe', 'Sạc & Cáp', 'Thiết bị khác'],
    products: [
      // Điện thoại
      {
        name: 'iPhone 15 Pro 256GB',
        price: 28900000,
        category: 'Điện thoại',
        stock: 10,
        barcode: '8934570000001',
        description: 'iPhone 15 Pro màu Titan tự nhiên',
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        price: 31900000,
        category: 'Điện thoại',
        stock: 8,
        barcode: '8934570000002',
        description: 'Samsung flagship mới nhất 2024',
      },
      {
        name: 'Xiaomi 14 Pro',
        price: 18900000,
        category: 'Điện thoại',
        stock: 15,
        barcode: '8934570000003',
        description: 'Xiaomi 14 Pro camera Leica',
      },
      // Phụ kiện điện thoại
      {
        name: 'Ốp lưng iPhone 15 Pro',
        price: 450000,
        category: 'Phụ kiện điện thoại',
        stock: 50,
        barcode: '8934570000004',
        description: 'Ốp lưng silicon Apple chính hãng',
      },
      {
        name: 'Kính cường lực full màn',
        price: 150000,
        category: 'Phụ kiện điện thoại',
        stock: 80,
        barcode: '8934570000005',
        description: 'Kính cường lực 9H chống vỡ',
      },
      {
        name: 'Giá đỡ điện thoại trên xe hơi',
        price: 250000,
        category: 'Phụ kiện điện thoại',
        stock: 40,
        barcode: '8934570000006',
        description: 'Giá đỡ hít chân không xoay 360 độ',
      },
      // Laptop
      {
        name: 'MacBook Air M3 15 inch',
        price: 35900000,
        category: 'Laptop',
        stock: 5,
        barcode: '8934570000007',
        description: 'MacBook Air chip M3 mới nhất',
      },
      {
        name: 'Dell XPS 15',
        price: 42900000,
        category: 'Laptop',
        stock: 4,
        barcode: '8934570000008',
        description: 'Dell XPS 15 cho dân đồ họa',
      },
      // Tai nghe
      {
        name: 'AirPods Pro 2',
        price: 6490000,
        category: 'Tai nghe',
        stock: 20,
        barcode: '8934570000009',
        description: 'AirPods Pro thế hệ 2 chống ồn chủ động',
      },
      {
        name: 'Sony WH-1000XM5',
        price: 8990000,
        category: 'Tai nghe',
        stock: 12,
        barcode: '8934570000010',
        description: 'Tai nghe over-ear chống ồn hàng đầu',
      },
      // Sạc & Cáp
      {
        name: 'Sạc nhanh 65W GaN',
        price: 590000,
        category: 'Sạc & Cáp',
        stock: 45,
        barcode: '8934570000011',
        description: 'Củ sạc nhanh công nghệ GaN nhỏ gọn',
      },
      {
        name: 'Cáp USB-C to Lightning 1m',
        price: 450000,
        category: 'Sạc & Cáp',
        stock: 60,
        barcode: '8934570000012',
        description: 'Cáp sạc nhanh Apple chính hãng',
      },
    ],
  },

  'pharmacy': {
    categories: ['Thuốc cảm', 'Thuốc đau', 'Vitamin', 'Thực phẩm chức năng', 'Sản phẩm sức khỏe', 'Dược mỹ phẩm'],
    products: [
      // Thuốc cảm
      {
        name: 'Paracetamol 500mg',
        price: 25000,
        category: 'Thuốc đau',
        stock: 100,
        barcode: '8934571000001',
        description: 'Hạ sốt, giảm đau hiệu quả',
      },
      {
        name: 'Tiffy',
        price: 35000,
        category: 'Thuốc cảm',
        stock: 80,
        barcode: '8934571000002',
        description: 'Thuốc cảm cúm, giảm sổ mũi, đau họng',
      },
      {
        name: 'Decolgen',
        price: 30000,
        category: 'Thuốc cảm',
        stock: 75,
        barcode: '8934571000003',
        description: 'Giảm triệu chứng cảm cúm, sổ mũi',
      },
      // Vitamin
      {
        name: 'Vitamin C 1000mg',
        price: 150000,
        category: 'Vitamin',
        stock: 60,
        barcode: '8934571000004',
        description: 'Tăng cường sức đề kháng, làm đẹp da',
      },
      {
        name: 'Multivitamin cho bà bầu',
        price: 280000,
        category: 'Vitamin',
        stock: 40,
        barcode: '8934571000005',
        description: 'Vitamin tổng hợp cho mẹ bầu',
      },
      {
        name: 'Vitamin D3 2000IU',
        price: 180000,
        category: 'Vitamin',
        stock: 50,
        barcode: '8934571000006',
        description: 'Bổ sung Vitamin D cho xương khớp',
      },
      // Thực phẩm chức năng
      {
        name: 'Omega 3 1000mg',
        price: 320000,
        category: 'Thực phẩm chức năng',
        stock: 45,
        barcode: '8934571000007',
        description: 'Dầu cá Omega 3 tốt cho tim mạch',
      },
      {
        name: 'Collagen dạng uống',
        price: 450000,
        category: 'Thực phẩm chức năng',
        stock: 35,
        barcode: '8934571000008',
        description: 'Collagen làm đẹp da, chống lão hóa',
      },
      {
        name: 'Viên uống hỗ trợ tiêu hóa',
        price: 250000,
        category: 'Thực phẩm chức năng',
        stock: 40,
        barcode: '8934571000009',
        description: 'Men vi sinh hỗ trợ tiêu hóa',
      },
      // Sản phẩm sức khỏe
      {
        name: 'Nhiệt kế điện tử',
        price: 180000,
        category: 'Sản phẩm sức khỏe',
        stock: 30,
        barcode: '8934571000010',
        description: 'Nhiệt kế đo trán không tiếp xúc',
      },
      {
        name: 'Máy đo huyết áp điện tử',
        price: 650000,
        category: 'Sản phẩm sức khỏe',
        stock: 15,
        barcode: '8934571000011',
        description: 'Máy đo huyết áp cổ tay chính xác',
      },
      {
        name: 'Khẩu trang y tế 4 lớp',
        price: 45000,
        category: 'Sản phẩm sức khỏe',
        stock: 200,
        barcode: '8934571000012',
        description: 'Hộp 50 khẩu trang y tế kháng khuẩn',
      },
    ],
  },
};

export function getIndustryData(industry: IndustryType): IndustryData {
  return industryDataMap[industry];
}