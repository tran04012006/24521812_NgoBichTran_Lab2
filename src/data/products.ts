
import type { Product } from "../types/product";

export const products: Product[] = [
  {
    id: "P001",
    name: "Wireless Headphones",
    description: "Premium wireless headphones",
    originalPrice: 599000,
    salePrice: 299000,
    stock: 10,
    sold: 90,
    icon: "🎧",
  },
  {
    id: "P002",
    name: "Wireless Earbuds",
    description: "Compact Bluetooth earbuds",
    originalPrice: 399000,
    salePrice: 199000,
    stock: 5,
    sold: 95,
    icon: "🎵",
  },
  {
    id: "P003",
    name: "Smart Watch",
    description: "Smart fitness watch",
    originalPrice: 1299000,
    salePrice: 799000,
    stock: 15,
    sold: 85,
    icon: "⌚",
  },
  {
    id: "P004",
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard",
    originalPrice: 899000,
    salePrice: 499000,
    stock: 8,
    sold: 92,
    icon: "⌨️",
  },
];
