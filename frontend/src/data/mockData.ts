import { Category, Product, Review } from '@/types';
import categoryElectronics from '@/assets/category-electronics.jpg';
import categoryFashion from '@/assets/category-fashion.jpg';
import categoryHome from '@/assets/category-home.jpg';
import categorySports from '@/assets/category-sports.jpg';
import productHeadphones from '@/assets/product-headphones.jpg';
import productSmartwatch from '@/assets/product-smartwatch.jpg';
import productJacket from '@/assets/product-jacket.jpg';
import productLamp from '@/assets/product-lamp.jpg';
import productYogaMat from '@/assets/product-yoga-mat.jpg';
import productShoes from '@/assets/product-shoes.jpg';

export const categories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest tech and gadgets',
    image_url: categoryElectronics
  },
  {
    id: '2',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Trending styles and apparel',
    image_url: categoryFashion
  },
  {
    id: '3',
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Make your space beautiful',
    image_url: categoryHome
  },
  {
    id: '4',
    name: 'Sports',
    slug: 'sports',
    description: 'Gear up for fitness',
    image_url: categorySports
  }
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    description: 'Experience crystal-clear audio with active noise cancellation and 30-hour battery life.',
    price: 299.99,
    stock: 45,
    category_id: '1',
    image_url: productHeadphones,
    is_featured: true,
    tags: ['audio', 'wireless', 'premium'],
    rating: 4.8,
    slug: 'premium-wireless-headphones'
  },
  {
    id: '2',
    name: 'Smart Watch Pro',
    description: 'Track your fitness goals with advanced health monitoring and GPS functionality.',
    price: 399.99,
    stock: 30,
    category_id: '1',
    image_url: productSmartwatch,
    is_featured: true,
    tags: ['wearable', 'fitness', 'smart'],
    rating: 4.6,
    slug: 'smart-watch-pro'
  },
  {
    id: '3',
    name: 'Designer Denim Jacket',
    description: 'Classic style meets modern comfort in this premium denim jacket.',
    price: 149.99,
    stock: 60,
    category_id: '2',
    image_url: productJacket,
    is_featured: true,
    tags: ['clothing', 'denim', 'casual'],
    rating: 4.5,
    slug: 'designer-denim-jacket'
  },
  {
    id: '4',
    name: 'Minimalist Desk Lamp',
    description: 'Illuminate your workspace with adjustable brightness and modern design.',
    price: 79.99,
    stock: 100,
    category_id: '3',
    image_url: productLamp,
    is_featured: false,
    tags: ['lighting', 'decor', 'workspace'],
    rating: 4.7,
    slug: 'minimalist-desk-lamp'
  },
  {
    id: '5',
    name: 'Yoga Mat Premium',
    description: 'Non-slip, eco-friendly yoga mat for all your fitness needs.',
    price: 49.99,
    stock: 120,
    category_id: '4',
    image_url: productYogaMat,
    is_featured: false,
    tags: ['fitness', 'yoga', 'eco-friendly'],
    rating: 4.9,
    slug: 'yoga-mat-premium'
  },
  {
    id: '6',
    name: 'Running Shoes Elite',
    description: 'Lightweight running shoes with advanced cushioning technology.',
    price: 129.99,
    stock: 75,
    category_id: '4',
    image_url: productShoes,
    is_featured: true,
    tags: ['footwear', 'running', 'sports'],
    rating: 4.7,
    slug: 'running-shoes-elite'
  }
];

export const reviews: Review[] = [
  {
    id: 'r1',
    product_id: '1',
    user_name: 'Sarah Johnson',
    rating: 5,
    title: 'Best headphones I\'ve owned!',
    comment: 'The sound quality is incredible and the noise cancellation works perfectly. Battery life is exactly as advertised.',
    helpful_count: 24,
    created_at: '2024-03-15'
  },
  {
    id: 'r2',
    product_id: '1',
    user_name: 'Mike Chen',
    rating: 4,
    title: 'Great quality, minor comfort issue',
    comment: 'Sound is amazing but after 3 hours they start to feel a bit tight. Still highly recommend for the audio quality.',
    helpful_count: 12,
    created_at: '2024-03-10'
  },
  {
    id: 'r3',
    product_id: '1',
    user_name: 'Emma Davis',
    rating: 5,
    title: 'Worth every penny',
    comment: 'Used them on a 10-hour flight and they were perfect. Comfortable, great sound, and the case is really nice.',
    helpful_count: 18,
    created_at: '2024-03-05'
  },
  {
    id: 'r4',
    product_id: '2',
    user_name: 'James Wilson',
    rating: 5,
    title: 'Perfect fitness companion',
    comment: 'Tracks everything I need and the battery lasts for days. The GPS is very accurate.',
    helpful_count: 15,
    created_at: '2024-03-12'
  },
  {
    id: 'r5',
    product_id: '2',
    user_name: 'Lisa Anderson',
    rating: 4,
    title: 'Good but expensive',
    comment: 'It does everything well but I wish it was a bit cheaper. Great for serious athletes.',
    helpful_count: 8,
    created_at: '2024-03-08'
  }
];
