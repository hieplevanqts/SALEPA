// 5 ADDITIONAL SERVICES
const additionalServices = [
  {
    name: 'Massage cổ vai gáy 30 phút',
    price: 180000,
    category: 'Massage',
    stock: 999,
    barcode: '8934567900021',
    description: 'Massage giảm đau mỏi vai gáy, thư giãn cơ bắp',
    productType: 'service' as const,
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
    productType: 'service' as const,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1582498674105-ad104fcc5784?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcGElMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzY4MjE5MjU1fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Chăm sóc móng combo (tay + chân)',
    price: 280000,
    category: 'Nail',
    stock: 999,
    barcode: '8934567900023',
    description: 'Cắt móng, dũa móng, đánh bóng cả tay và chân',
    productType: 'service' as const,
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
    productType: 'service' as const,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1684014286330-ddbeb4a40c92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWNpYWwlMjBza2luY2FyZSUyMHRyZWF0bWVudHxlbnwxfHx8fDE3NjgyODY5NTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Massage đá nóng 120 phút',
    price: 650000,
    category: 'Massage',
    stock: 999,
    barcode: '8934567900025',
    description: 'Massage đá nóng toàn thân VIP, giải độc cơ thể',
    productType: 'service' as const,
    duration: 120,
    image: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBtYXNzYWdlJTIwc3RvbmVzfGVufDF8fHx8MTc2ODI4Njk1N3ww&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

// 5 ADDITIONAL TREATMENTS with sessionDetails
const additionalTreatments = [
  // Indices 21-25 will be services (serv-21 to serv-25)
  // Indices 26-30 will be treatments (treat-26 to treat-30)
  {
    name: 'Liệu trình giảm béo body 15 buổi',
    price: 8500000,
    category: 'Liệu trình',
    stock: 999,
    barcode: '8934567900026',
    description: 'Liệu trình giảm béo toàn thân, săn chắc vóc dáng 15 buổi',
    productType: 'treatment' as const,
    sessions: 15,
    image: 'https://images.unsplash.com/photo-1582498674105-ad104fcc5784?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcGElMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzY4MjE5MjU1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    sessionDetails: [
      {
        sessionNumber: 1,
        products: [{ id: 'spa-service-prod-18', quantity: 1 }],
        services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }]
      },
      {
        sessionNumber: 2,
        products: [],
        services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }]
      },
      {
        sessionNumber: 3,
        products: [],
        services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }]
      },
      {
        sessionNumber: 4,
        products: [{ id: 'spa-service-prod-18', quantity: 1 }],
        services: [{ id: 'spa-service-serv-24', quantity: 1 }]
      },
      {
        sessionNumber: 5,
        products: [],
        services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }]
      },
      {
        sessionNumber: 6,
        products: [],
        services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }]
      },
      {
        sessionNumber: 7,
        products: [{ id: 'spa-service-prod-18', quantity: 1 }],
        services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }]
      },
      {
        sessionNumber: 8,
        products: [],
        services: [{ id: 'spa-service-serv-24', quantity: 1 }]
      },
      {
        sessionNumber: 9,
        products: [],
        services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }]
      },
      {
        sessionNumber: 10,
        products: [{ id: 'spa-service-prod-18', quantity: 1 }],
        services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }]
      },
      {
        sessionNumber: 11,
        products: [],
        services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }]
      },
      {
        sessionNumber: 12,
        products: [],
        services: [{ id: 'spa-service-serv-24', quantity: 1 }]
      },
      {
        sessionNumber: 13,
        products: [{ id: 'spa-service-prod-18', quantity: 1 }],
        services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }]
      },
      {
        sessionNumber: 14,
        products: [],
        services: [{ id: 'spa-service-serv-22', quantity: 1 }, { id: 'spa-service-serv-01', quantity: 1 }]
      },
      {
        sessionNumber: 15,
        products: [{ id: 'spa-service-prod-18', quantity: 2 }],
        services: [{ id: 'spa-service-serv-24', quantity: 1 }, { id: 'spa-service-serv-25', quantity: 1 }]
      }
    ]
  },
  {
    name: 'Liệu trình trắng da cao cấp 20 buổi',
    price: 12000000,
    category: 'Liệu trình',
    stock: 999,
    barcode: '8934567900027',
    description: 'Liệu trình trắng da toàn diện cao cấp 20 buổi, hiệu quả rõ rệt',
    productType: 'treatment' as const,
    sessions: 20,
    image: 'https://images.unsplash.com/photo-1684014286330-ddbeb4a40c92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWNpYWwlMjBza2luY2FyZSUyMHRyZWF0bWVudHxlbnwxfHx8fDE3NjgyODY5NTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
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
    productType: 'treatment' as const,
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
    productType: 'treatment' as const,
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
    productType: 'treatment' as const,
    sessions: 9,
    image: 'https://images.unsplash.com/photo-1684014286330-ddbeb4a40c92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWNpYWwlMjBza2luY2FyZSUyMHRyZWF0bWVudHxlbnwxfHx8fDE3NjgyODY5NTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
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
];

// Paste this into industryData.ts after the 4 products
