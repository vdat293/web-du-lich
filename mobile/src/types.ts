export type Amenity = {
  id: number;
  name: string;
  icon?: string;
};

export type Room = {
  id: number;
  name: string;
  price: number;
  total_allotment: number;
  max_adults: number;
  max_children: number;
  room_size?: number;
  bed_type?: string;
  bed_count?: number;
  bathroom_count?: number;
  bed_configuration?: Record<string, number>;
  is_active?: boolean;
};

export type Property = {
  id: number;
  name: string;
  type: string;
  location: string;
  price: string;
  rating: number;
  reviews: number;
  host: {
    name: string;
    avatar?: string;
    superhost: boolean;
  };
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  isHot: boolean | number;
  description?: string;
  searchTags?: string[];
  images: {
    main: string;
    gallery: string[];
  };
  amenities: Amenity[];
  rooms: Room[];
  mapImage?: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  phone?: string;
};

export type Booking = {
  id: number;
  check_in: string;
  check_out: string;
  number_of_rooms: number;
  total_price: number;
  status: string;
  displayStatus?: string;
  property_id: number;
  property_name: string;
  property_location: string;
  property_image?: string;
  room_type_name: string;
  payment_status?: string;
};

export type BookingDraft = {
  property: Property;
  room: Room;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  subtotal: number;
  serviceFee: number;
  total: number;
};
