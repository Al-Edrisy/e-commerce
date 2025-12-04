// Mock data types for the e-commerce template

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: string;
  role: 'customer' | 'admin';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  image_url: string;
  is_featured: boolean;
  tags: string[];
  rating: number;
  slug: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  title: string;
  comment: string;
  helpful_count: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_uid: string;
  items: CartItem[];
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}
