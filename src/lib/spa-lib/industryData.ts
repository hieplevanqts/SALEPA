import type { Product } from './store';
import type { IndustryType } from '../../modules/spa/pages/settings/IndustrySelection';

export interface IndustryData {
  products: Omit<Product, 'id'>[];
  categories: string[];
}

export const industryDataMap: Record<IndustryType, IndustryData> = {
  

  'spa-service': {
    categories: ['Massage', 'Chăm sóc da', 'Nail', 'Waxing', 'Sản phẩm', 'Liệu trình'],
    products: [
      // SERVICES - Massage
      {
        name: 'Massage body 60 phút',
        price: 300000,
        costPrice: 80000,
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
        costPrice: 120000,
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
        costPrice: 60000,
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
        costPrice: 120000,
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
        costPrice: 150000,
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
        costPrice: 180000,
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
        costPrice: 40000,
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
        costPrice: 50000,
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
        costPrice: 10000,
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
        costPrice: 60000,
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
        costPrice: 45000,
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
        costPrice: 1400000,
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
        costPrice: 1200000,
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
        costPrice: 800000,
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
        costPrice: 500000,
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
        costPrice: 2400000,
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
        costPrice: 200000,
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
        costPrice: 180000,
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
        costPrice: 120000,
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
        costPrice: 150000,
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
        costPrice: 110000,
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
        costPrice: 150000,
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
        costPrice: 250000,
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
        costPrice: 100000,
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
        costPrice: 80000,
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
        costPrice: 130000,
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
        costPrice: 50000,
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
        costPrice: 120000,
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
        costPrice: 80000,
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
        costPrice: 160000,
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
        costPrice: 180000,
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
        costPrice: 3500000,
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
        costPrice: 5000000,
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
        costPrice: 1200000,
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
        costPrice: 400000,
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
};
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
export function getIndustryData(industry: IndustryType): IndustryData {
const data = industryDataMap[industry];
  // Active industries: food-beverage and retail (grocery/convenience store)
  const isActiveIndustry =
    industry === "spa-service";
  return ensureProductsHaveStatus(data, isActiveIndustry);
}