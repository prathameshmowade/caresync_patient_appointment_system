import {
  ClinicalResource,
  ClinicalService,
  CompositeSlot,
  ResourceAllocation,
  CompositeHoldLease,
} from '../types/scheduling';

// Clinical Services with multi-resource requirements
export const CLINICAL_SERVICES: ClinicalService[] = [
  {
    id: 'routine-consult',
    name: 'General Pediatric Consultation',
    description: 'Comprehensive physical examination and pediatric care.',
    durationMinutes: 30,
    requiredRoomCategory: 'STANDARD_EXAM',
    requiredEquipment: ['VITALS_STATION'],
    requiredStaffRole: 'MEDICAL_ASSISTANT',
    copayAmount: 500,
  },
  {
    id: 'cardiac-ecg',
    name: 'Pediatric Cardiac Eval + ECG',
    description: 'Physical exam with 12-lead pediatric ECG recording.',
    durationMinutes: 45,
    requiredRoomCategory: 'STANDARD_EXAM',
    requiredEquipment: ['VITALS_STATION', 'PEDIATRIC_ECG_CART'],
    requiredStaffRole: 'MEDICAL_ASSISTANT',
    copayAmount: 1200,
  },
  {
    id: 'ultrasound-procedure',
    name: 'Diagnostic Pediatric Ultrasound',
    description: 'Abdominal or soft-tissue diagnostic sonogram.',
    durationMinutes: 45,
    requiredRoomCategory: 'PROCEDURE_ROOM',
    requiredEquipment: ['ULTRASOUND_CONSOLE'],
    requiredStaffRole: 'MEDICAL_ASSISTANT',
    copayAmount: 2500,
  },
];

// Clinic physical resources at Eastside Pediatrics
export const CLINIC_RESOURCES: ClinicalResource[] = [
  // Physician
  {
    id: 'dr-evans',
    name: 'Dr. Elizabeth Evans, MD',
    type: 'PHYSICIAN',
    capabilities: ['PEDIATRICS', 'FAMILY_MEDICINE'],
  },
  // Rooms
  {
    id: 'room-101',
    name: 'Exam Room 1',
    type: 'EXAM_ROOM',
    category: 'STANDARD_EXAM',
    capabilities: ['STANDARD_EXAM'],
  },
  {
    id: 'room-102',
    name: 'Exam Room 2',
    type: 'EXAM_ROOM',
    category: 'STANDARD_EXAM',
    capabilities: ['STANDARD_EXAM'],
  },
  {
    id: 'suite-3a',
    name: 'Pediatric Suite 3A',
    type: 'EXAM_ROOM',
    category: 'STANDARD_EXAM',
    capabilities: ['STANDARD_EXAM', 'ISOLATION_EQUIPPED'],
  },
  {
    id: 'proc-room-1',
    name: 'Clinical Procedure Room 1',
    type: 'EXAM_ROOM',
    category: 'PROCEDURE_ROOM',
    capabilities: ['PROCEDURE_ROOM', 'ULTRASOUND_READY'],
  },
  // Equipment
  {
    id: 'vitals-hub-1',
    name: 'Pediatric Vitals Hub A',
    type: 'EQUIPMENT',
    capabilities: ['VITALS_STATION'],
  },
  {
    id: 'vitals-hub-2',
    name: 'Pediatric Vitals Hub B',
    type: 'EQUIPMENT',
    capabilities: ['VITALS_STATION'],
  },
  {
    id: 'ecg-cart-1',
    name: '12-Lead Pediatric ECG Cart',
    type: 'EQUIPMENT',
    capabilities: ['PEDIATRIC_ECG_CART'],
  },
  {
    id: 'ultrasound-1',
    name: 'Philips EPIQ Diagnostic Ultrasound',
    type: 'EQUIPMENT',
    capabilities: ['ULTRASOUND_CONSOLE'],
  },
  // Auxiliary Staff
  {
    id: 'ma-jenkins',
    name: 'MA Sarah Jenkins',
    type: 'AUX_STAFF',
    capabilities: ['MEDICAL_ASSISTANT', 'TRIAGE'],
  },
];

/**
 * Known clinic-wide resource locks by other physicians / procedures at Eastside Pediatrics
 * Demonstrates real clinical collisions where Dr. Evans is free, but rooms or equipment are locked!
 */
interface LockedTimeSlots {
  [time: string]: {
    occupiedRooms: string[];
    inUseEquipment: string[];
    isPhysicianBusy: boolean;
  };
}

const CLINIC_SCHEDULE_COLLISIONS: Record<string, LockedTimeSlots> = {
  // Monday Nov 9
  'Nov 9': {
    '09:00 AM': { occupiedRooms: ['room-101'], inUseEquipment: [], isPhysicianBusy: false },
    '09:30 AM': { occupiedRooms: ['room-101', 'room-102'], inUseEquipment: [], isPhysicianBusy: false },
    '10:00 AM': { occupiedRooms: ['room-101'], inUseEquipment: [], isPhysicianBusy: false }, // All clear for Suite 3A + Vitals!
    // 10:30 AM: Collision scenario! Both Dr. Vance and Dr. Patel occupy all standard exam rooms!
    '10:30 AM': {
      occupiedRooms: ['room-101', 'room-102', 'suite-3a'],
      inUseEquipment: [],
      isPhysicianBusy: false,
    },
    '11:00 AM': { occupiedRooms: ['room-101'], inUseEquipment: [], isPhysicianBusy: false },
    // 11:30 AM: ECG Cart in use by Cardiology consult in Room 1!
    '11:30 AM': {
      occupiedRooms: ['room-101'],
      inUseEquipment: ['ecg-cart-1'],
      isPhysicianBusy: false,
    },
    '01:30 PM': { occupiedRooms: [], inUseEquipment: [], isPhysicianBusy: false },
    '02:00 PM': { occupiedRooms: ['room-102'], inUseEquipment: [], isPhysicianBusy: false },
    // 02:30 PM: Ultrasound machine in use in Procedure Room 1!
    '02:30 PM': {
      occupiedRooms: ['proc-room-1'],
      inUseEquipment: ['ultrasound-1'],
      isPhysicianBusy: false,
    },
    '03:00 PM': { occupiedRooms: ['room-101', 'room-102'], inUseEquipment: [], isPhysicianBusy: false },
    // 03:30 PM: Room bottleneck - all rooms occupied
    '03:30 PM': {
      occupiedRooms: ['room-101', 'room-102', 'suite-3a'],
      inUseEquipment: [],
      isPhysicianBusy: false,
    },
    '04:00 PM': { occupiedRooms: [], inUseEquipment: [], isPhysicianBusy: false },
  },
};

/**
 * Composite Resource Availability Engine
 * Availability = Provider_free ∩ Room_free ∩ Equipment_free ∩ Staff_free
 */
export function calculateCompositeAvailability(
  dateLabel: string,
  serviceId: string
): CompositeSlot[] {
  const service = CLINICAL_SERVICES.find((s) => s.id === serviceId) || CLINICAL_SERVICES[0];
  const dateKey = Object.keys(CLINIC_SCHEDULE_COLLISIONS).find((k) => dateLabel.includes(k)) || 'Nov 9';
  const collisionMap = CLINIC_SCHEDULE_COLLISIONS[dateKey] || {};

  const allTimes = [
    { time: '09:00 AM', period: 'MORNING' as const },
    { time: '09:30 AM', period: 'MORNING' as const },
    { time: '10:00 AM', period: 'MORNING' as const },
    { time: '10:30 AM', period: 'MORNING' as const },
    { time: '11:00 AM', period: 'MORNING' as const },
    { time: '11:30 AM', period: 'MORNING' as const },
    { time: '01:30 PM', period: 'AFTERNOON' as const },
    { time: '02:00 PM', period: 'AFTERNOON' as const },
    { time: '02:30 PM', period: 'AFTERNOON' as const },
    { time: '03:00 PM', period: 'AFTERNOON' as const },
    { time: '03:30 PM', period: 'AFTERNOON' as const },
    { time: '04:00 PM', period: 'AFTERNOON' as const },
  ];

  const physician = CLINIC_RESOURCES.find((r) => r.id === 'dr-evans')!;
  const staff = CLINIC_RESOURCES.find((r) => r.id === 'ma-jenkins')!;

  return allTimes.map(({ time, period }) => {
    const collisions = collisionMap[time] || {
      occupiedRooms: [],
      inUseEquipment: [],
      isPhysicianBusy: false,
    };

    // 1. Check Physician
    if (collisions.isPhysicianBusy) {
      return {
        time,
        timePeriod: period,
        isAvailable: false,
        bottleneck: 'PHYSICIAN_BUSY',
        bottleneckMessage: 'Dr. Evans is currently booked or in rounds.',
      };
    }

    // 2. Check Matching Free Room (Category matching)
    const eligibleRooms = CLINIC_RESOURCES.filter(
      (r) => r.type === 'EXAM_ROOM' && r.category === service.requiredRoomCategory
    );
    const freeRoom = eligibleRooms.find((r) => !collisions.occupiedRooms.includes(r.id));

    if (!freeRoom) {
      return {
        time,
        timePeriod: period,
        isAvailable: false,
        bottleneck: 'ROOM_COLLISION',
        bottleneckMessage: `Room Bottleneck: All ${service.requiredRoomCategory.toLowerCase().replace('_', ' ')}s are currently occupied by clinic providers.`,
      };
    }

    // 3. Check Required Equipment Availability
    const requiredEquipmentIds = service.requiredEquipment.map((cap) => {
      const equip = CLINIC_RESOURCES.find((r) => r.type === 'EQUIPMENT' && r.capabilities.includes(cap));
      return equip ? equip.id : '';
    });

    const conflictingEquipment = requiredEquipmentIds.find((id) =>
      collisions.inUseEquipment.includes(id)
    );

    if (conflictingEquipment) {
      const equipName = CLINIC_RESOURCES.find((r) => r.id === conflictingEquipment)?.name || 'Clinical Equipment';
      return {
        time,
        timePeriod: period,
        isAvailable: false,
        bottleneck: 'EQUIPMENT_IN_USE',
        bottleneckMessage: `Equipment Conflict: ${equipName} is occupied by another procedure.`,
      };
    }

    // All resources available! Intersect Provider ∩ Room ∩ Equipment ∩ Staff
    const allocatedEquipment = CLINIC_RESOURCES.filter((r) =>
      requiredEquipmentIds.includes(r.id)
    );

    const allocation: ResourceAllocation = {
      physician,
      room: freeRoom,
      equipment: allocatedEquipment,
      staff,
    };

    return {
      time,
      timePeriod: period,
      isAvailable: true,
      bottleneck: 'NONE',
      allocatedResources: allocation,
    };
  });
}
