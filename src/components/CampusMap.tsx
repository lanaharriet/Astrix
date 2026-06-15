'use strict';

'use client';

import React, { useState, useMemo } from 'react';
import { useTheme } from '@/components/theme-provider';
import { AstrixIcon } from '@/components/branding';
import { 
  Search, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  MapPin, 
  Compass, 
  Navigation,
  Info,
  Grid,
  Building2,
  School,
  Settings,
  Home,
  Activity,
  Utensils,
  HeartPulse,
  CircleParking,
  Award,
  BookOpen,
  LogOut,
  GraduationCap,
  ArrowLeft
} from 'lucide-react';

interface Building {
  id: string;
  name: string;
  block_name: string;
  subtitle?: string;
  floor: number;
  room_number: string;
  x: number;
  y: number;
  description: string;
  rooms: string[];
  image_url: string;
  category: 'Block' | 'Admin' | 'Hostel' | 'Amenities' | 'Sports' | 'Food' | 'Medical' | 'Parking' | 'Entrance' | 'Library';
}

const BUILDINGS: Building[] = [
  { id: 'gate', name: 'MAIN GATE', block_name: 'Entrance', subtitle: 'Main Gate Security', floor: 0, room_number: 'Gate-1', x: 500, y: 40, description: 'Campus Main Entry and security checkpoint.', rooms: ['Security Office', 'Visitor Pass Counter'], image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=300', category: 'Entrance' },
  { id: 'parking', name: 'PARKING AREA', block_name: 'North Lot', subtitle: 'Staff & Visitor Parking', floor: 0, room_number: 'Parking-1', x: 325, y: 100, description: 'Multi-level staff and student parking.', rooms: ['EV Charging Zone', 'Two-wheeler Bay'], image_url: 'https://images.unsplash.com/photo-1506521788723-7811124689fa?auto=format&fit=crop&q=80&w=300', category: 'Parking' },
  { id: 'admin', name: 'ADMINISTRATION BLOCK', block_name: 'Admin Block', subtitle: 'Administrative HQ', floor: 3, room_number: 'Admin-101', x: 500, y: 100, description: 'Main administrative offices, VC Cabin, and Registry.', rooms: ['Vice Chancellor Cabin', 'Registrar Office', 'Finance Desk', 'Helpdesk'], image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=300', category: 'Admin' },
  { id: 'medical', name: 'MEDICAL CENTER', block_name: 'Health Block', subtitle: '24/7 Clinic & Emergency', floor: 1, room_number: 'Health-1', x: 675, y: 100, description: '24/7 emergency care center and ambulance dock.', rooms: ['Doctor Cabin', 'Observation Ward', 'Pharmacy Counter'], image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=300', category: 'Medical' },
  
  // Row 1
  { id: 'cse', name: 'CSE BLOCK', block_name: 'Block A', subtitle: 'Computer Science Department', floor: 4, room_number: 'A-301', x: 325, y: 180, description: 'Computer Science and Engineering department laboratories and computing center.', rooms: ['Turing Computing Lab', 'HOD Cabin A-301', 'IoT Lab', 'Classroom 301-305'], image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=300', category: 'Block' },
  { id: 'aiml', name: 'AIML BLOCK', block_name: 'Block B', subtitle: 'Artificial Intelligence & Machine Learning Department', floor: 4, room_number: 'B-205', x: 500, y: 180, description: 'State-of-the-art labs, classrooms and research facilities for the next generation of AI innovators.', rooms: ['Hopper AI Center', 'GPU Computing Server', 'HOD Cabin B-205', 'Classroom 201-205'], image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=300', category: 'Block' },
  { id: 'csbs', name: 'CSBS BLOCK', block_name: 'Block C', subtitle: 'CS & Business Systems', floor: 3, room_number: 'C-201', x: 675, y: 180, description: 'Computer Science and Business Systems department business simulation halls.', rooms: ['Business Simulation Lab', 'HOD Cabin C-201', 'Classroom 101-105'], image_url: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&q=80&w=300', category: 'Block' },
  
  // Row 2
  { id: 'aids', name: 'AIDS BLOCK', block_name: 'Block D', subtitle: 'AI & Data Science Department', floor: 3, room_number: 'D-102', x: 325, y: 260, description: 'Artificial Intelligence and Data Science department data analytics labs.', rooms: ['Data Analytics Lab', 'HOD Cabin D-102', 'Statistics Hub', 'Classroom 106-110'], image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=300', category: 'Block' },
  { id: 'ece', name: 'ECE BLOCK', block_name: 'Block E', subtitle: 'Electronics Department', floor: 3, room_number: 'E-112', x: 500, y: 260, description: 'Electronics and Communication Engineering department circuit and wireless labs.', rooms: ['Tesla Wireless Lab', 'DSP Lab', 'HOD Cabin E-112', 'Classroom 111-115'], image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=300', category: 'Block' },
  { id: 'eee', name: 'EEE BLOCK', block_name: 'Block F', subtitle: 'Electrical Department', floor: 3, room_number: 'F-101', x: 675, y: 260, description: 'Electrical and Electronics Engineering power grids and machinery labs.', rooms: ['Power Electronics Lab', 'Circuits Hub', 'HOD Cabin F-101', 'Classroom 116-120'], image_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=300', category: 'Block' },
  
  // Row 3
  { id: 'hostel_boys', name: 'BOYS HOSTEL', block_name: 'Block C Hostel', subtitle: 'Gents Residency', floor: 5, room_number: 'BH-304', x: 210, y: 340, description: 'Gents residency quarters and accommodation blocks.', rooms: ['Warden Office', 'Recreation Room', 'Gym Annex'], image_url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=300', category: 'Hostel' },
  { id: 'mech', name: 'MECH BLOCK', block_name: 'Block G', subtitle: 'Mechanical Department', floor: 2, room_number: 'G-104', x: 325, y: 340, description: 'Mechanical Engineering department and heavy workshops.', rooms: ['CAD Simulation Lab', 'Fluid Mechanics Lab', 'HOD Cabin G-104', 'Machine Shop'], image_url: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0bc?auto=format&fit=crop&q=80&w=300', category: 'Block' },
  { id: 'civil', name: 'CIVIL BLOCK', block_name: 'Block H', subtitle: 'Civil Department', floor: 2, room_number: 'H-101', x: 500, y: 340, description: 'Civil Engineering department concrete and survey labs.', rooms: ['Structural Design Lab', 'Survey Hub', 'HOD Cabin H-101', 'Soil Testing Lab'], image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=300', category: 'Block' },
  { id: 'bme', name: 'BME BLOCK', block_name: 'Block I', subtitle: 'Biomedical Department', floor: 3, room_number: 'I-102', x: 675, y: 340, description: 'Biomedical Engineering department bio-instrumentation labs.', rooms: ['Bio-Instrumentation Lab', 'Medical Imaging Lab', 'HOD Cabin I-102'], image_url: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=300', category: 'Block' },
  { id: 'canteen', name: 'CANTEEN', block_name: 'Food Court', subtitle: 'Cafeteria & Dining', floor: 1, room_number: 'Canteen-Main', x: 790, y: 340, description: 'Main campus food court and student hangouts.', rooms: ['Multi-cuisine Counter', 'Nescafe Booth', 'Outdoor Dining'], image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=300', category: 'Food' },
  
  // Row 4
  { id: 'hostel_girls', name: 'GIRLS HOSTEL', block_name: 'Block B Hostel', subtitle: 'Ladies Residency', floor: 5, room_number: 'GH-102', x: 200, y: 420, description: 'Ladies residency quarters and accommodation blocks.', rooms: ['Warden Cabin', 'Mess Hall', 'Reading Corner'], image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=300', category: 'Hostel' },
  { id: 'mba', name: 'MBA BLOCK', block_name: 'Block J', subtitle: 'Business Administration Department', floor: 2, room_number: 'J-101', x: 500, y: 420, description: 'Post-graduate business administration department.', rooms: ['Case Study Room', 'Seminar Hall J-101', 'MBA Lab'], image_url: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=300', category: 'Block' },
  
  // Row 5
  { id: 'sports', name: 'SPORTS COMPLEX', block_name: 'Arena', subtitle: 'Sports Grounds', floor: 1, room_number: 'Arena-1', x: 325, y: 480, description: 'Indoor sports halls, athletic running track and outdoor playing fields.', rooms: ['Badminton Court', 'Table Tennis Hall', 'Sports Equipment Room'], image_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=300', category: 'Sports' },
  { id: 'library', name: 'CENTRAL LIBRARY', block_name: 'Library Block', subtitle: 'Digital Resources Hub', floor: 3, room_number: 'Library-Main', x: 465, y: 480, description: 'Main library books archive and quiet reading halls.', rooms: ['Main Reading Hall', 'Digital Archives Section', 'E-Library Desk', 'Research Cubicles'], image_url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=300', category: 'Library' },
  { id: 'auditorium', name: 'AUDITORIUM', block_name: 'Academic Plaza', subtitle: 'Convention Center', floor: 1, room_number: 'Aud-Main', x: 610, y: 480, description: '1500-seater air-conditioned college auditorium.', rooms: ['Main Stage Hall', 'Backstage VIP Area', 'AV Control Room'], image_url: 'https://images.unsplash.com/photo-1503095391755-14144f54d15e?auto=format&fit=crop&q=80&w=300', category: 'Amenities' },
  { id: 'placement', name: 'PLACEMENT CELL', block_name: 'Admin Block Annex', subtitle: 'Career Development Hub', floor: 1, room_number: 'PC-12', x: 750, y: 480, description: 'Career Guidance and Campus Interview Center.', rooms: ['Interview Cabins 1-4', 'Group Discussion Room', 'GD Lobby'], image_url: 'https://images.unsplash.com/photo-1521791136368-1a869871026f?auto=format&fit=crop&q=80&w=300', category: 'Amenities' }
];

const ROADS = [
  // Horizontal grid lines
  { from: 'parking', to: 'admin' },
  { from: 'admin', to: 'medical' },
  
  { from: 'cse', to: 'aiml' },
  { from: 'aiml', to: 'csbs' },
  
  { from: 'aids', to: 'ece' },
  { from: 'ece', to: 'eee' },
  
  { from: 'boys_hostel', to: 'mech' },
  { from: 'mech', to: 'civil' },
  { from: 'civil', to: 'bme' },
  { from: 'bme', to: 'canteen' },
  
  { from: 'girls_hostel', to: 'sports' },
  { from: 'sports', to: 'library' },
  { from: 'library', to: 'auditorium' },
  { from: 'auditorium', to: 'placement' },
  
  // Vertical grid lines
  { from: 'gate', to: 'admin' },
  
  { from: 'parking', to: 'cse' },
  { from: 'cse', to: 'aids' },
  { from: 'aids', to: 'mech' },
  { from: 'mech', to: 'sports' },
  
  { from: 'admin', to: 'aiml' },
  { from: 'aiml', to: 'ece' },
  { from: 'ece', to: 'civil' },
  { from: 'civil', to: 'mba' },
  { from: 'mba', to: 'library' },
  
  { from: 'medical', to: 'csbs' },
  { from: 'csbs', to: 'eee' },
  { from: 'eee', to: 'bme' },
  { from: 'bme', to: 'auditorium' },
  
  { from: 'canteen', to: 'placement' },
  { from: 'boys_hostel', to: 'girls_hostel' }
];

interface CampusMapProps {
  onExit?: () => void;
}

export default function CampusMap({ onExit }: CampusMapProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(BUILDINGS.find(b => b.id === 'aiml') || null);
  
  // Navigation Routing States
  const [routeStart, setRouteStart] = useState('gate');
  const [routeEnd, setRouteEnd] = useState('aiml');
  
  // Map View States
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Filtered buildings based on search query
  const filteredBuildings = useMemo(() => {
    return BUILDINGS.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.rooms.some(r => r.toLowerCase().includes(searchQuery.toLowerCase())) ||
        b.block_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDept = selectedDept === 'All' || 
        (selectedDept === 'Block' && b.category === 'Block') ||
        (selectedDept === 'Admin' && b.category === 'Admin') ||
        (selectedDept === 'Hostel' && b.category === 'Hostel') ||
        (selectedDept === 'Library' && b.id === 'library') ||
        b.category === selectedDept ||
        b.id === selectedDept;
      
      return matchesSearch && matchesDept;
    });
  }, [searchQuery, selectedDept]);

  // Center map on selected building coordinates
  const selectAndCenterBuilding = (b: Building) => {
    setSelectedBuilding(b);
    setZoom(1.4); // Zoom in on target
    setPan({
      x: 500 - b.x * 1.4,
      y: 300 - b.y * 1.4
    });
    setSearchQuery(''); // Close dropdown suggestions
  };

  // Handle building select
  const selectBuilding = (b: Building) => {
    setSelectedBuilding(b);
    if (!routeStart) {
      setRouteStart(b.id);
    } else if (!routeEnd && routeStart !== b.id) {
      setRouteEnd(b.id);
    } else {
      setRouteEnd(b.id);
    }
  };

  // Live search submission logic
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Select first matching location
    const match = BUILDINGS.find(b => 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.rooms.some(r => r.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.block_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (match) {
      selectAndCenterBuilding(match);
    }
  };

  // Zoom control helpers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.6));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedBuilding(BUILDINGS.find(b => b.id === 'aiml') || null);
    setRouteStart('gate');
    setRouteEnd('aiml');
    setSearchQuery('');
    setSelectedDept('All');
  };

  // Dragging event handlers for map pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // BFS route solver between two nodes
  const solvedRoutePath = useMemo(() => {
    if (!routeStart || !routeEnd) return null;
    
    const adjList: Record<string, string[]> = {};
    BUILDINGS.forEach(b => { adjList[b.id] = []; });
    ROADS.forEach(r => {
      adjList[r.from]?.push(r.to);
      adjList[r.to]?.push(r.from);
    });

    const queue: string[][] = [[routeStart]];
    const visited = new Set([routeStart]);

    while (queue.length > 0) {
      const path = queue.shift() || [];
      const node = path[path.length - 1];

      if (node === routeEnd) {
        return path.map(id => BUILDINGS.find(b => b.id === id)).filter(Boolean) as Building[];
      }

      for (const neighbor of adjList[node] || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
    return null;
  }, [routeStart, routeEnd]);

  // Route Details calculations
  const routeDetails = useMemo(() => {
    if (!solvedRoutePath || solvedRoutePath.length < 2) return null;
    let totalPixelDistance = 0;
    for (let i = 0; i < solvedRoutePath.length - 1; i++) {
      const b1 = solvedRoutePath[i];
      const b2 = solvedRoutePath[i + 1];
      const dx = b2.x - b1.x;
      const dy = b2.y - b1.y;
      totalPixelDistance += Math.sqrt(dx * dx + dy * dy);
    }
    
    const isMainRoute = routeStart === 'gate' && routeEnd === 'aiml';
    const distanceMeters = isMainRoute ? 320 : Math.round(totalPixelDistance * 1.2);
    const timeMinutes = isMainRoute ? 4 : Math.max(1, Math.round(distanceMeters / 80));
    
    let steps: string[] = [];
    if (isMainRoute) {
      steps = [
        "Head straight from Main Gate",
        "Turn left after Administration Block",
        "Walk straight past Library",
        "AIML Block is on your right"
      ];
    } else {
      solvedRoutePath.forEach((b, idx) => {
        if (idx === 0) {
          steps.push(`Head straight from ${b.name}`);
        } else if (idx === solvedRoutePath.length - 1) {
          steps.push(`${b.name} is on your right`);
        } else {
          if (idx % 2 === 0) {
            steps.push(`Turn left after ${b.name}`);
          } else {
            steps.push(`Walk straight past ${b.name}`);
          }
        }
      });
    }
    
    return {
      distance: distanceMeters,
      time: timeMinutes,
      steps
    };
  }, [solvedRoutePath, routeStart, routeEnd]);

  // Category Icon helper for building badges
  const getBuildingBadgeIcon = (category: string) => {
    switch (category) {
      case 'Block': return <GraduationCap size={10} className="text-[#d4a017] mr-1 flex-shrink-0" />;
      case 'Admin': return <School size={10} className="text-[#d4a017] mr-1 flex-shrink-0" />;
      case 'Hostel': return <Home size={10} className="text-[#d4a017] mr-1 flex-shrink-0" />;
      case 'Food': return <Utensils size={10} className="text-[#d4a017] mr-1 flex-shrink-0" />;
      case 'Medical': return <HeartPulse size={10} className="text-[#d4a017] mr-1 flex-shrink-0" />;
      case 'Parking': return <CircleParking size={10} className="text-[#d4a017] mr-1 flex-shrink-0" />;
      case 'Sports': return <Activity size={10} className="text-[#d4a017] mr-1 flex-shrink-0" />;
      case 'Library': return <BookOpen size={10} className="text-[#d4a017] mr-1 flex-shrink-0" />;
      case 'Amenities': return <Award size={10} className="text-[#d4a017] mr-1 flex-shrink-0" />;
      case 'Entrance': return <MapPin size={10} className="text-[#d4a017] mr-1 flex-shrink-0" />;
      default: return <MapPin size={10} className="text-[#d4a017] mr-1 flex-shrink-0" />;
    }
  };

  return (
    <div className="w-full bg-[#0b0f17] border border-white/10 rounded-3xl p-5 shadow-2xl text-white font-sans animate-[fadeIn_0.4s_ease-out] relative">
      
      {/* HEADER BAR */}
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/10 pb-4 mb-4 gap-4">
        <div className="flex items-start gap-3">
          <AstrixIcon size={38} className="text-[#d4a017] mt-1" />
          <div>
            <h1 className="text-xl font-extrabold tracking-wider text-[#d4a017] leading-none uppercase font-serif">
              ASTRIX
            </h1>
            <span className="text-sm font-black text-white uppercase tracking-wider block mt-1">Campus Navigator</span>
            <span className="text-[10px] text-[#8e9bb0] block mt-0.5 font-medium">Find your way. Explore your campus.</span>
          </div>
        </div>
        
        {/* Top Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Top Search bar with drop-down suggest */}
          <div className="relative flex-1 md:w-64">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-10 py-1.5 text-xs border border-white/10 bg-background/60 rounded-full focus:outline-none focus:ring-1 focus:ring-primary text-white"
              />
              <button 
                type="submit"
                className="absolute right-3 top-1.5 text-muted hover:text-[#d4a017] transition-colors cursor-pointer"
                title="Search"
              >
                <Search size={14} />
              </button>
            </form>

            {/* UX friendly autosuggest dropdown list */}
            {searchQuery && (
              <div className="absolute top-9 left-0 right-0 bg-[#0d1117]/95 border border-white/10 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto p-1.5 text-xs backdrop-blur-md">
                {filteredBuildings.length > 0 ? (
                  filteredBuildings.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => selectAndCenterBuilding(b)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 flex flex-col gap-0.5 transition-all cursor-pointer"
                    >
                      <span className="font-bold text-white flex items-center gap-1.5">
                        {getBuildingBadgeIcon(b.category)}
                        {b.name}
                      </span>
                      <span className="text-[10px] text-white/50 block pl-4 truncate">{b.subtitle || b.block_name}</span>
                    </button>
                  ))
                ) : (
                  <div className="text-white/40 p-3 text-center italic">No matching locations found</div>
                )}
              </div>
            )}
          </div>
          <button 
            onClick={() => {
              setRouteStart('gate');
              setRouteEnd('aiml');
              setSelectedBuilding(BUILDINGS.find(b => b.id === 'aiml') || null);
              selectAndCenterBuilding(BUILDINGS.find(b => b.id === 'aiml')!);
            }}
            className="px-4 py-1.5 rounded-full bg-[#d4a017] text-black text-xs font-bold shadow-md flex items-center gap-1.5 hover:opacity-90 transition-all border border-[#d4a017]"
          >
            <Navigation size={12} className="fill-black" /> Directions
          </button>
          <button 
            onClick={handleReset}
            className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all"
          >
            View All
          </button>
          
          {/* Theme Switcher capsule */}
          <div className="flex items-center gap-1 bg-[#111622] border border-white/10 rounded-full p-1 cursor-pointer">
            <span className="w-3 h-3 rounded-full bg-[#d4a017]" />
            <span className="w-3 h-3 rounded-full bg-white/10" />
          </div>

          {/* Exit Workspace Button */}
          {onExit && (
            <button 
              onClick={onExit}
              className="px-4 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-sm"
            >
              <ArrowLeft size={13} className="text-[#d4a017]" /> Back to Dashboard
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start mt-2">
        
        {/* LEFT SIDEBAR - EXPLORE CAMPUS */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="border border-white/5 bg-white/5 rounded-2xl p-4 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-[#d4a017] uppercase tracking-widest block mb-2">Explore Campus</span>
              <div className="flex flex-col gap-1 text-xs">
                {[
                  { label: 'All Locations', category: 'All', icon: Grid },
                  { label: 'Academic Blocks', category: 'Block', icon: Building2 },
                  { label: 'Administrative', category: 'Admin', icon: School },
                  { label: 'Facilities', category: 'Amenities', icon: Settings },
                  { label: 'Hostels', category: 'Hostel', icon: Home },
                  { label: 'Sports & Recreation', category: 'Sports', icon: Activity },
                  { label: 'Food & Services', category: 'Food', icon: Utensils },
                  { label: 'Healthcare', category: 'Medical', icon: HeartPulse },
                  { label: 'Parking', category: 'Parking', icon: CircleParking },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => setSelectedDept(item.category)}
                      className={`w-full text-left py-2 px-3 rounded-xl transition-all font-semibold flex items-center gap-2.5 ${
                        selectedDept === item.category 
                          ? 'bg-[#d4a017]/20 text-[#d4a017] border border-[#d4a017]/30' 
                          : 'hover:bg-white/5 text-white/70'
                      }`}
                    >
                      <Icon size={14} className={selectedDept === item.category ? 'text-[#d4a017]' : 'text-white/50'} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Quick Search */}
            <div className="border-t border-white/10 pt-3 relative">
              <span className="text-[10px] font-bold text-[#d4a017] uppercase tracking-widest block mb-2">Quick Search</span>
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 text-[11px] border border-white/10 bg-background rounded-lg text-white"
                />
                <button 
                  type="submit"
                  className="absolute right-2.5 top-2 text-muted hover:text-[#d4a017] transition-colors cursor-pointer"
                  title="Search"
                >
                  <Search size={11} />
                </button>
              </form>
            </div>

            {/* Popular Places */}
            <div className="border-t border-white/10 pt-3">
              <span className="text-[10px] font-bold text-[#d4a017] uppercase tracking-widest block mb-2">Popular Places</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'Central Library', id: 'library' },
                  { name: 'CSE Department', id: 'cse' },
                  { name: 'AIML Department', id: 'aiml' },
                  { name: 'Auditorium', id: 'auditorium' },
                  { name: 'Canteen', id: 'canteen' },
                  { name: 'Sports Complex', id: 'sports' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      const building = BUILDINGS.find(b => b.id === p.id);
                      if (building) selectAndCenterBuilding(building);
                    }}
                    className="bg-white/5 border border-white/10 hover:border-[#d4a017]/50 hover:bg-[#d4a017]/10 px-2 py-1 rounded-lg text-[10px] text-white/80 font-bold transition-all cursor-pointer"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* ASTRIX Branding Card */}
            <div className="border border-white/10 bg-[#0d1117]/60 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#d4a017]/20 to-[#d4a017]/5 flex items-center justify-center border border-[#d4a017]/20">
                <AstrixIcon size={24} className="text-[#d4a017]" />
              </div>
              <div>
                <span className="block font-black text-xs text-[#d4a017] tracking-wider font-serif uppercase">ASTRIX</span>
                <span className="block text-[9px] text-[#8e9bb0] font-medium leading-normal mt-0.5">One Campus.<br />Infinite Possibilities.</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN - MAP VIEWPORT */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="border border-white/10 rounded-2xl bg-[#090b10] relative overflow-hidden h-[380px] md:h-[480px] shadow-inner select-none">
            {/* Map image background wrapper */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 animate-[fadeIn_0.5s_ease-out]"
              style={{ backgroundImage: "url('/campus-3d-map.png')" }}
            />
            {/* Overlay Grid lines to look high-tech */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
            
            {/* Controls Overlay */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
              <button onClick={handleZoomIn} className="p-1.5 rounded-lg bg-[#111622]/90 border border-white/10 text-white hover:bg-[#d4a017]/20 hover:text-[#d4a017] transition-all cursor-pointer"><ZoomIn size={14} /></button>
              <button onClick={handleZoomOut} className="p-1.5 rounded-lg bg-[#111622]/90 border border-white/10 text-white hover:bg-[#d4a017]/20 hover:text-[#d4a017] transition-all cursor-pointer"><ZoomOut size={14} /></button>
              <button onClick={handleReset} className="p-1.5 rounded-lg bg-[#111622]/90 border border-white/10 text-white hover:bg-[#d4a017]/20 hover:text-[#d4a017] transition-all cursor-pointer"><Maximize2 size={14} /></button>
            </div>

            {/* Compass Rose overlay */}
            <div className="absolute bottom-4 right-4 z-10 w-16 h-16 pointer-events-none opacity-80 hover:opacity-100 transition-opacity">
              <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_60s_linear_infinite]">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#d4a017" strokeWidth="1" strokeDasharray="2 3" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
                
                {/* Compass Points */}
                <polygon points="50,15 53,47 50,50 47,47" fill="#d4a017" />
                <polygon points="50,85 53,53 50,50 47,53" fill="white" opacity="0.7" />
                <polygon points="85,50 53,53 50,50 53,47" fill="white" opacity="0.7" />
                <polygon points="15,50 47,53 50,50 47,47" fill="white" opacity="0.4" />
                
                <text x="50" y="12" textAnchor="middle" fill="#d4a017" fontSize="10" fontWeight="bold">N</text>
                <text x="50" y="94" textAnchor="middle" fill="white" opacity="0.7" fontSize="8" fontWeight="bold">S</text>
                <text x="94" y="53" textAnchor="middle" fill="white" opacity="0.7" fontSize="8" fontWeight="bold">E</text>
                <text x="6" y="53" textAnchor="middle" fill="white" opacity="0.7" fontSize="8" fontWeight="bold">W</text>
              </svg>
            </div>

            {/* SVG Render Area */}
            <svg
              className="w-full h-full cursor-grab active:cursor-grabbing absolute inset-0 z-0"
              viewBox="0 0 1000 600"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Zoom/Pan Group wrapper */}
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} className="transition-transform duration-300 ease-out">
                {/* Roads Grid */}
                <g stroke="#d4a017" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" strokeDasharray="3 5">
                  {ROADS.map((r, idx) => {
                    const start = BUILDINGS.find(b => b.id === r.from);
                    const end = BUILDINGS.find(b => b.id === r.to);
                    if (!start || !end) return null;
                    return (
                      <line 
                        key={idx} 
                        x1={start.x} 
                        y1={start.y} 
                        x2={end.x} 
                        y2={end.y} 
                      />
                    );
                  })}
                </g>

                {/* Solved Route Overlay */}
                {solvedRoutePath && solvedRoutePath.length > 1 && (
                  <g>
                    {/* Glowing Back-path */}
                    <path
                      d={`M ${solvedRoutePath.map(b => `${b.x} ${b.y}`).join(' L ')}`}
                      fill="none"
                      stroke="#d4a017"
                      strokeWidth="5"
                      strokeLinecap="round"
                      className="opacity-50 blur-xs"
                    />
                    {/* Animated Dash Path */}
                    <path
                      d={`M ${solvedRoutePath.map(b => `${b.x} ${b.y}`).join(' L ')}`}
                      fill="none"
                      stroke="#d4a017"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="6 6"
                      className="animate-[dash_10s_linear_infinite]"
                      style={{ strokeDashoffset: -20 }}
                    />
                  </g>
                )}

                {/* Building Nodes */}
                {BUILDINGS.map((b) => {
                  const isSelected = selectedBuilding?.id === b.id;
                  const isHighlighted = filteredBuildings.some(fb => fb.id === b.id);
                  
                  // Selection glow
                  const isStartNode = routeStart === b.id;
                  const isEndNode = routeEnd === b.id;
                  const isActiveOnRoute = solvedRoutePath?.some(routeB => routeB.id === b.id);

                  return (
                    <g 
                      key={b.id} 
                      transform={`translate(${b.x}, ${b.y})`}
                      className="cursor-pointer group/node"
                      onClick={(e) => { e.stopPropagation(); selectAndCenterBuilding(b); }}
                    >
                      {/* Selection Ring */}
                      {(isSelected || isStartNode || isEndNode) && (
                        <circle r="18" className="fill-none stroke-primary animate-ping opacity-60" strokeWidth="1.5" />
                      )}

                      {/* Anchor Dot */}
                      <circle 
                        r="4.5" 
                        className={`transition-all duration-300 ${
                          isSelected ? 'fill-[#d4a017] scale-125' : 'fill-white/80'
                        } group-hover/node:fill-[#d4a017]`}
                      />

                      {/* Pill Badge label */}
                      <foreignObject
                        x="-65"
                        y="-26"
                        width="130"
                        height="24"
                        className="pointer-events-none"
                      >
                        <div className={`flex items-center justify-start rounded-full border px-2.5 py-1 text-[8px] tracking-wider shadow-md uppercase font-bold select-none whitespace-nowrap overflow-hidden bg-black/90 ${
                          isSelected || isStartNode || isEndNode || isActiveOnRoute
                            ? 'border-[#d4a017] text-[#d4a017] shadow-[#d4a017]/20 scale-105 transition-transform duration-300'
                            : 'border-white/10 text-white'
                        }`}>
                          {getBuildingBadgeIcon(b.category)}
                          <span className="truncate">{b.name}</span>
                        </div>
                      </foreignObject>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
          
          {/* Bottom Bar Category Filter */}
          <div className="flex flex-wrap items-center justify-center gap-6 bg-[#0d1117]/80 border border-white/10 rounded-full py-2.5 px-6 text-[9px] font-bold text-white/80 font-sans">
            <div className="flex items-center gap-1.5"><GraduationCap size={12} className="text-[#d4a017]" /> Academic Buildings</div>
            <div className="flex items-center gap-1.5"><School size={12} className="text-[#b8860b]" /> Administrative</div>
            <div className="flex items-center gap-1.5"><Home size={12} className="text-[#c084fc]" /> Hostels</div>
            <div className="flex items-center gap-1.5"><Activity size={12} className="text-[#4ade80]" /> Sports</div>
            <div className="flex items-center gap-1.5"><Utensils size={12} className="text-[#fb923c]" /> Food & Services</div>
            <div className="flex items-center gap-1.5"><HeartPulse size={12} className="text-[#f87171]" /> Healthcare</div>
            <div className="flex items-center gap-1.5"><CircleParking size={12} className="text-[#60a5fa]" /> Parking</div>
          </div>
        </div>

        {/* RIGHT SIDEBAR - DETAILS & ROUTING */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Location Details */}
          <div className="border border-white/5 bg-white/5 rounded-2xl p-4 space-y-4 min-h-[220px] flex flex-col justify-between">
            {selectedBuilding ? (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-[#d4a017] uppercase tracking-widest block">Location Details</span>
                <div>
                  <h4 className="font-extrabold text-[#d4a017] text-base font-sans leading-tight">{selectedBuilding.name}</h4>
                  <span className="text-[10px] text-white/90 block mt-0.5 font-semibold">{selectedBuilding.subtitle || selectedBuilding.block_name}</span>
                </div>
                {/* Custom building image inside details panel */}
                <div className="w-full h-28 rounded-lg overflow-hidden border border-white/10 bg-black/40 shadow-inner relative">
                  <img 
                    src={selectedBuilding.image_url} 
                    alt={selectedBuilding.name}
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const fallback = (e.target as HTMLImageElement).nextElementSibling;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#13161c] to-[#242936] text-[#d4a017] p-4 text-center">
                    <Building2 size={24} className="mb-1 text-[#d4a017]" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">{selectedBuilding.name}</span>
                  </div>
                </div>
                <p className="text-xs text-white/80 leading-relaxed font-medium">{selectedBuilding.description}</p>
                <div className="text-[10px]">
                  <span className="block font-bold text-[#d4a017] uppercase mb-1">Key Rooms:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedBuilding.rooms.map((room, idx) => (
                      <span key={idx} className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[8px] text-white/80">
                        {room}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground py-8">
                <Info size={24} className="mb-2 text-[#d4a017] animate-pulse" />
                <span className="text-xs font-semibold text-white/70">Select a building label on the map grid to view department descriptions and photos.</span>
              </div>
            )}
          </div>

          {/* Route Planner / Route Info */}
          <div className="border border-white/5 bg-white/5 rounded-2xl p-4 space-y-3">
            <span className="text-[10px] font-bold text-[#d4a017] uppercase tracking-widest block">Route Information</span>
            
            <div className="space-y-2.5 text-xs border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#d4a017]" />
                <span className="text-white/60">From:</span>
                <select
                  value={routeStart}
                  onChange={(e) => {
                    setRouteStart(e.target.value);
                    const b = BUILDINGS.find(x => x.id === e.target.value);
                    if (b) selectAndCenterBuilding(b);
                  }}
                  className="bg-transparent border-none font-bold text-white focus:outline-none cursor-pointer text-xs p-0 w-32"
                >
                  {BUILDINGS.map(b => <option key={b.id} value={b.id} className="bg-[#0b0f17] text-white">{b.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Navigation size={14} className="text-[#d4a017] fill-transparent" />
                <span className="text-white/60">To:</span>
                <select
                  value={routeEnd}
                  onChange={(e) => {
                    setRouteEnd(e.target.value);
                    const b = BUILDINGS.find(x => x.id === e.target.value);
                    if (b) selectAndCenterBuilding(b);
                  }}
                  className="bg-transparent border-none font-bold text-white focus:outline-none cursor-pointer text-xs p-0 w-32"
                >
                  {BUILDINGS.map(b => <option key={b.id} value={b.id} className="bg-[#0b0f17] text-white">{b.name}</option>)}
                </select>
              </div>
            </div>

            {routeDetails ? (
              <div className="space-y-4 pt-1 animate-[fadeIn_0.3s_ease-out]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#8e9bb0] uppercase tracking-wider block">Distance</span>
                    <span className="text-sm font-extrabold text-[#d4a017] block">{routeDetails.distance} m</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#8e9bb0] uppercase tracking-wider block">Estimated Time</span>
                    <span className="text-sm font-extrabold text-[#d4a017] block">{routeDetails.time} min walk</span>
                  </div>
                </div>

                <div className="text-xs text-white/80 space-y-2 border-t border-white/10 pt-3">
                  <span className="block font-bold text-white uppercase tracking-wider text-[10px]">Steps</span>
                  <div className="flex flex-col gap-2 text-[11px] leading-relaxed">
                    {routeDetails.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-1">
                        <span className="text-white/50 font-semibold">{idx + 1}.</span>
                        <span className="text-white/90 font-medium">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => alert(`Starting Navigation from ${routeDetails.steps[0]} to ${routeDetails.steps[routeDetails.steps.length - 1]}!`)}
                  className="w-full py-2.5 bg-[#d4a017] text-black font-black text-xs rounded-xl shadow-md uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Navigation size={12} className="fill-black text-black" /> Start Navigation
                </button>
              </div>
            ) : (
              <div className="text-[10px] text-center text-muted-foreground py-2 italic">
                Choose start and end locations to plot route instructions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
