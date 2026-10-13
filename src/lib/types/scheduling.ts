/**
 * Composite Resource Scheduling Types
 * Models multi-resource dependency graphs to prevent room and equipment collisions:
 * Availability = Provider_free ∩ Room_free ∩ Equipment_free ∩ Staff_free
 */

export type ResourceType = 'PHYSICIAN' | 'EXAM_ROOM' | 'EQUIPMENT' | 'AUX_STAFF';

export interface ClinicalResource {
  id: string;
  name: string;
  type: ResourceType;
  category?: string; // e.g. "Pediatric Suite", "Diagnostic Equipment"
  location?: string;
  capabilities: string[];
}

export interface ClinicalService {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  requiredRoomCategory: 'STANDARD_EXAM' | 'PROCEDURE_ROOM' | 'PEDIATRIC_SUITE';
  requiredEquipment: string[]; // e.g. ['ECG_UNIT'], ['ULTRASOUND']
  requiredStaffRole?: 'MEDICAL_ASSISTANT' | 'PHLEBOTOMIST';
  copayAmount: number;
}

export interface TimeBlock {
  startTime: string; // "09:00 AM"
  endTime: string;   // "09:30 AM"
  date: string;      // "2026-11-09"
}

export interface ResourceAllocation {
  physician: ClinicalResource;
  room: ClinicalResource;
  equipment: ClinicalResource[];
  staff?: ClinicalResource;
}

export type BottleneckType = 'NONE' | 'PHYSICIAN_BUSY' | 'ROOM_COLLISION' | 'EQUIPMENT_IN_USE' | 'STAFF_UNAVAILABLE';

export interface CompositeSlot {
  time: string;
  timePeriod: 'MORNING' | 'AFTERNOON';
  isAvailable: boolean;
  bottleneck: BottleneckType;
  bottleneckMessage?: string;
  allocatedResources?: ResourceAllocation;
}

export interface CompositeHoldLease {
  leaseId: string;
  slotTime: string;
  date: string;
  serviceId: string;
  resources: ResourceAllocation;
  createdAt: number;
  expiresAt: number; // Unix timestamp
  ttlSecondsRemaining: number;
}
