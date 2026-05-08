/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BudgetItem {
  id: string;
  category: string;
  name: string;
  estimated: number;
  actual: number;
}

export interface TaskCategory {
  id: string;
  name: string;
}

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  dueDate?: string;
  image?: string;
}

export const INITIAL_CATEGORIES: TaskCategory[] = [
  { id: '1', name: 'Planning' },
  { id: '2', name: 'Guest List' },
  { id: '3', name: 'Venue' },
  { id: '4', name: 'Attire' },
  { id: '5', name: 'Decor' },
  { id: '6', name: 'Other' },
];

export interface Vendor {
  id: string;
  name: string;
  type: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  rating: number;
  image: string;
  featured: boolean;
  notes?: string;
  pros?: string[];
  cons?: string[];
  isFavorite?: boolean;
}

export interface Guest {
  id: string;
  name: string;
  email?: string;
  status: 'invited' | 'confirmed' | 'declined';
  mealPreference: 'Standard' | 'Vegetarian' | 'Vegan' | 'Gluten-Free';
  tableNumber?: number;
  image?: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  category: 'Ceremony' | 'Reception' | 'Photos' | 'Transitions';
}

export const INITIAL_GUESTS: Guest[] = [
  { id: '1', name: 'James Wilson', status: 'confirmed', mealPreference: 'Standard', tableNumber: 1 },
  { id: '2', name: 'Sarah Miller', status: 'confirmed', mealPreference: 'Vegetarian', tableNumber: 1 },
  { id: '3', name: 'Robert Chen', status: 'invited', mealPreference: 'Standard' },
];

export const INITIAL_TIMELINE: TimelineEvent[] = [
  { id: '1', time: '14:00', title: 'Ceremony Start', description: 'Exchange of vows at the chapel', category: 'Ceremony' },
  { id: '2', time: '15:30', title: 'Cocktail Hour', description: 'Drinks and hors d\'oeuvres on the terrace', category: 'Transitions' },
  { id: '3', time: '17:00', title: 'Grand Entrance', description: 'Couple enters the reception hall', category: 'Reception' },
];

export const INITIAL_TASKS: TaskItem[] = [
  { id: '1', title: 'Set the date', category: 'Planning', completed: true },
  { id: '2', title: 'Determine the budget', category: 'Planning', completed: true },
  { id: '3', title: 'Draft guest list', category: 'Guest List', completed: false, dueDate: '2024-06-01' },
  { id: '4', title: 'Book the venue', category: 'Venue', completed: false, dueDate: '2024-07-15' },
  { id: '5', title: 'Order wedding dress', category: 'Attire', completed: false, dueDate: '2024-08-30' },
];

export const INITIAL_BUDGET: BudgetItem[] = [
  { id: '1', category: 'Venue', name: 'Ceremony Site', estimated: 2000, actual: 0 },
  { id: '2', category: 'Venue', name: 'Reception Hall', estimated: 5000, actual: 0 },
  { id: '3', category: 'Food', name: 'Catering (per head)', estimated: 3000, actual: 0 },
  { id: '4', category: 'Attire', name: 'Wedding Dress', estimated: 1500, actual: 0 },
  { id: '5', category: 'Decor', name: 'Flowers', estimated: 1000, actual: 0 },
];

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'Eternal Blossoms',
    type: 'Florist',
    priceRange: '$$$',
    rating: 4.9,
    image: 'https://picsum.photos/seed/flowers/600/400',
    featured: true,
    notes: 'Highly recommended by our planner for their custom floral arches.',
    pros: ['Stunning custom designs', 'Great communication', 'Eco-friendly sourcing'],
    cons: ['Higher price point', 'Often booked out 12 months in advance']
  },
  {
    id: 'v2',
    name: 'Grand Manor Estate',
    type: 'Venue',
    priceRange: '$$$$',
    rating: 4.8,
    image: 'https://picsum.photos/seed/venue/600/400',
    featured: true,
    notes: 'Perfect for the large guest list. All-inclusive catering options.',
    pros: ['Huge capacity', 'Beautiful gardens', 'Great food'],
    cons: ['Restrictive outside vendor policy', 'High minimum spend']
  },
  {
    id: 'v3',
    name: 'The Golden Lens',
    type: 'Photography',
    priceRange: '$$',
    rating: 4.7,
    image: 'https://picsum.photos/seed/photo/600/400',
    featured: false,
    notes: 'Artistic, candid style. Includes a pre-wedding shoot.',
    pros: ['Unique style', 'Fast delivery of photos', 'Good engagement shoot package'],
    cons: ['Limited night photography experience']
  },
];
