/**
 * Address Types
 */

export interface Address {
  id: number;
  title: string;                 // "Home", "Work", etc.
  fullAddress: string;

  // Location
  latitude: number;
  longitude: number;

  // Details
  cityId?: number;
  cityName?: string;
  areaId?: number;
  areaName?: string;

  // Building details
  buildingNumber?: string;
  floorNumber?: string;
  apartmentNumber?: string;
  landmark?: string;

  // Contact for this address
  phoneNumber?: string;

  // Flags
  isDefault: boolean;
  isConfirmed: boolean;

  // Delivery info for this address
  deliveryFee?: number;
  estimatedDeliveryMinutes?: number;
  isDeliverable: boolean;
}

export interface City {
  id: number;
  name: string;
  nameAr: string;
  isActive: boolean;
}

export interface Area {
  id: number;
  name: string;
  nameAr: string;
  cityId: number;
  deliveryFee: number;
  isActive: boolean;
}

// Create address request
export interface CreateAddressRequest {
  title: string;
  latitude: number;
  longitude: number;
  areaId?: number;
  buildingNumber?: string;
  floorNumber?: string;
  apartmentNumber?: string;
  landmark?: string;
  phoneNumber?: string;
}
