
export const dummyWorkers = [
  // Cutting Department Workers
  {
    id: 'worker-001',
    name: 'Rajesh Kumar',
    role: 'Cutting Specialist',
    contact_number: '+91-9876543210',
    status: 'Active' as const,
    joined_date: '2023-01-15',
    notes: 'Expert in precision cutting, 5+ years experience'
  },
  {
    id: 'worker-002', 
    name: 'Amit Singh',
    role: 'Cutting Assistant',
    contact_number: '+91-9876543211',
    status: 'Active' as const,
    joined_date: '2023-03-20',
    notes: 'Trainee under Rajesh, good with basic cutting operations'
  },

  // Welding Department Workers
  {
    id: 'worker-003',
    name: 'Suresh Patel',
    role: 'Senior Welder',
    contact_number: '+91-9876543212',
    status: 'Active' as const,
    joined_date: '2022-08-10',
    notes: 'Certified in TIG and MIG welding, 8+ years experience'
  },
  {
    id: 'worker-004',
    name: 'Deepak Sharma',
    role: 'Welding Technician',
    contact_number: '+91-9876543213',
    status: 'Active' as const,
    joined_date: '2023-06-01',
    notes: 'Specializes in structural welding and fabrication'
  },

  // Assembly Workers
  {
    id: 'worker-005',
    name: 'Vikram Joshi',
    role: 'Assembly Lead',
    contact_number: '+91-9876543214',
    status: 'Active' as const,
    joined_date: '2022-11-15',
    notes: 'Team lead for assembly operations, quality focused'
  },
  {
    id: 'worker-006',
    name: 'Ravi Gupta',
    role: 'Assembly Technician',
    contact_number: '+91-9876543215',
    status: 'Active' as const,
    joined_date: '2023-02-28',
    notes: 'Fast and accurate assembly work, attention to detail'
  },

  // Finishing Department Workers
  {
    id: 'worker-007',
    name: 'Manoj Yadav',
    role: 'Finishing Specialist',
    contact_number: '+91-9876543216',
    status: 'Active' as const,
    joined_date: '2022-12-05',
    notes: 'Expert in polishing, grinding, and surface finishing'
  },
  {
    id: 'worker-008',
    name: 'Santosh Kumar',
    role: 'Polish Technician',
    contact_number: '+91-9876543217',
    status: 'Active' as const,
    joined_date: '2023-04-12',
    notes: 'Specialized in final polishing and quality finishing'
  },

  // Quality Control Workers
  {
    id: 'worker-009',
    name: 'Pradeep Verma',
    role: 'QC Inspector',
    contact_number: '+91-9876543218',
    status: 'Active' as const,
    joined_date: '2022-09-20',
    notes: 'Quality control expert, certified inspector with 6+ years experience'
  },
  {
    id: 'worker-010',
    name: 'Ashok Pandey',
    role: 'QC Technician',
    contact_number: '+91-9876543219',
    status: 'Active' as const,
    joined_date: '2023-05-08',
    notes: 'Assists in quality inspections and documentation'
  },

  // Packaging Workers
  {
    id: 'worker-011',
    name: 'Ramesh Mishra',
    role: 'Packaging Supervisor',
    contact_number: '+91-9876543220',
    status: 'Active' as const,
    joined_date: '2022-10-30',
    notes: 'Oversees packaging operations and shipping preparation'
  },
  {
    id: 'worker-012',
    name: 'Sanjay Tiwari',
    role: 'Packaging Assistant',
    contact_number: '+91-9876543221',
    status: 'Active' as const,
    joined_date: '2023-07-15',
    notes: 'Handles packaging, labeling, and inventory preparation'
  },

  // Multi-skilled Workers
  {
    id: 'worker-013',
    name: 'Ganesh Rao',
    role: 'Production Operator',
    contact_number: '+91-9876543222',
    status: 'Active' as const,
    joined_date: '2022-07-18',
    notes: 'Multi-skilled worker, can handle cutting, welding, and assembly'
  },
  {
    id: 'worker-014',
    name: 'Kiran Sawant',
    role: 'Floor Supervisor',
    contact_number: '+91-9876543223',
    status: 'Active' as const,
    joined_date: '2022-05-12',
    notes: 'Supervises production floor, coordinates between departments'
  },
  
  // Additional Workers for backup/peak times
  {
    id: 'worker-015',
    name: 'Mohit Agarwal',
    role: 'Trainee Operator',
    contact_number: '+91-9876543224',
    status: 'Active' as const,
    joined_date: '2023-09-01',
    notes: 'New trainee, learning cutting and basic assembly operations'
  }
];
