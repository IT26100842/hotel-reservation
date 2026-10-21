import React, { useState } from 'react';
import { Room, RoomType } from '../types';
import { ALL_AMENITIES } from '../data/mockData';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Maximize2,
  Star,
  Check,
  X,
  Sparkles,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  Wrench,
  Loader2
} from 'lucide-react';

interface AdminRoomsProps {
  rooms: Room[];
  onAddRoom: (room: Partial<Room>) => Promise<void>;
  onUpdateRoom: (id: string, room: Partial<Room>) => Promise<void>;
  onDeleteRoom: (id: string) => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  isLoading?: boolean;
}

export const AdminRooms: React.FC<AdminRoomsProps> = ({
  rooms,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onShowToast,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | RoomType>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Room>>({
    name: '',
    slug: '',
    type: 'standard',
    pricePerNight: 15000,
    currency: 'LKR',
    rating: 5.0,
    reviewCount: 12,
    location: 'Bentota Beach, Sri Lanka',
    maxGuests: 2,
    beds: '1 King Bed',
    baths: 1,
    sizeSqFt: 450,
    tag: '',
    description: '',
    detailedDescription: '',
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in',
    bedType: '1 King Bed',
    view: 'Ocean View',
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Rain Shower'],
    images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'],
    featured: false,
    popular: true,
    status: 'available',
    totalRooms: 5,
    baseRoomNumber: 101
  });

  const [imageInput, setImageInput] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Real-time English validation for all Room fields
  const roomErrors = (() => {
    const errs: Record<string, string | null> = {};

    const cleanName = (formData.name || '').trim();
    if (!cleanName) {
      errs.name = 'Room category name is required.';
    } else if (cleanName.length < 3) {
      errs.name = 'Room category name must be at least 3 characters.';
    } else if (/^\d+$/.test(cleanName)) {
      errs.name = 'Room category name cannot contain only numbers.';
    } else {
      errs.name = null;
    }

    const price = Number(formData.pricePerNight);
    if (!formData.pricePerNight || isNaN(price) || price < 1000) {
      errs.pricePerNight = 'Price per night must be at least LKR 1,000.';
    } else if (price > 5000000) {
      errs.pricePerNight = 'Price per night cannot exceed LKR 5,000,000.';
    } else {
      errs.pricePerNight = null;
    }

    const totalRooms = Number(formData.totalRooms);
    if (!formData.totalRooms || isNaN(totalRooms) || !Number.isInteger(totalRooms) || totalRooms < 1 || totalRooms > 100) {
      errs.totalRooms = 'Total rooms count must be a whole number between 1 and 100.';
    } else {
      errs.totalRooms = null;
    }

    const baseNum = Number(formData.baseRoomNumber);
    if (!formData.baseRoomNumber || isNaN(baseNum) || !Number.isInteger(baseNum) || baseNum < 1 || baseNum > 9999) {
      errs.baseRoomNumber = 'Starting room number must be between 1 and 9999.';
    } else {
      errs.baseRoomNumber = null;
    }

    const maxGuests = Number(formData.maxGuests);
    if (!formData.maxGuests || isNaN(maxGuests) || !Number.isInteger(maxGuests) || maxGuests < 1 || maxGuests > 20) {
      errs.maxGuests = 'Max guests must be between 1 and 20.';
    } else {
      errs.maxGuests = null;
    }

    const cleanBeds = (formData.beds || '').trim();
    if (!cleanBeds || cleanBeds.length < 3) {
      errs.beds = 'Beds description is required (min 3 characters).';
    } else {
      errs.beds = null;
    }

    const baths = Number(formData.baths);
    if (!formData.baths || isNaN(baths) || !Number.isInteger(baths) || baths < 1 || baths > 10) {
      errs.baths = 'Baths must be between 1 and 10.';
    } else {
      errs.baths = null;
    }

    const sizeSqFt = Number(formData.sizeSqFt);
    if (!formData.sizeSqFt || isNaN(sizeSqFt) || sizeSqFt < 100 || sizeSqFt > 10000) {
      errs.sizeSqFt = 'Room size must be between 100 and 10,000 sq ft.';
    } else {
      errs.sizeSqFt = null;
    }

    const cleanView = (formData.view || '').trim();
    if (!cleanView || cleanView.length < 3) {
      errs.view = 'Room view description is required (e.g. Ocean View).';
    } else {
      errs.view = null;
    }

    const cleanCancel = (formData.cancellationPolicy || '').trim();
    if (!cleanCancel || cleanCancel.length < 5) {
      errs.cancellationPolicy = 'Cancellation policy is required (min 5 characters).';
    } else {
      errs.cancellationPolicy = null;
    }

    const cleanDesc = (formData.description || '').trim();
    if (!cleanDesc) {
      errs.description = 'Summary description is required.';
    } else if (cleanDesc.length < 10) {
      errs.description = 'Summary description must be at least 10 characters.';
    } else {
      errs.description = null;
    }

    const urls = imageInput
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (urls.length === 0) {
      errs.imageInput = 'At least one valid image URL is required.';
    } else if (urls.some((u) => !/^https?:\/\/.+/i.test(u) && !u.startsWith('/'))) {
      errs.imageInput = 'Every image line must be a valid URL starting with https:// or http://.';
    } else {
      errs.imageInput = null;
    }

    if (!formData.amenities || formData.amenities.length === 0) {
      errs.amenities = 'Please select at least one room amenity.';
    } else {
      errs.amenities = null;
    }

    return errs;
  })();

  const isRoomFormValid = Object.values(roomErrors).every((e) => e === null);

  const openCreateModal = () => {
    setEditingRoom(null);
    setTouched({});
    const nextBase = (rooms.length + 1) * 100 + 1;
    setFormData({
      name: '',
      slug: '',
      type: 'standard',
      pricePerNight: 15000,
      currency: 'LKR',
      rating: 5.0,
      reviewCount: 12,
      location: 'Bentota Beach, Sri Lanka',
      maxGuests: 2,
      beds: '1 King Bed',
      baths: 1,
      sizeSqFt: 450,
      tag: '',
      description: '',
      detailedDescription: '',
      cancellationPolicy: 'Free cancellation up to 48 hours before check-in',
      bedType: '1 King Bed',
      view: 'Ocean View',
      amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Rain Shower'],
      images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      popular: true,
      status: 'available',
      totalRooms: 5,
      baseRoomNumber: nextBase
    });
    setImageInput('https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80');
    setModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setTouched({});
    setFormData({
      ...room,
      totalRooms: room.totalRooms ?? 5,
      baseRoomNumber: room.baseRoomNumber ?? 101,
      status: room.status ?? 'available'
    });
    setImageInput(room.images.join('\n'));
    setModalOpen(true);
  };

  const handleToggleAmenity = (amenity: string) => {
    setTouched((prev) => ({ ...prev, amenities: true }));
    const list = formData.amenities || [];
    if (list.includes(amenity)) {
      setFormData({ ...formData, amenities: list.filter((a) => a !== amenity) });
    } else {
      setFormData({ ...formData, amenities: [...list, amenity] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      pricePerNight: true,
      totalRooms: true,
      baseRoomNumber: true,
      maxGuests: true,
      beds: true,
      baths: true,
      sizeSqFt: true,
      view: true,
      cancellationPolicy: true,
      description: true,
      imageInput: true,
      amenities: true
    });

    if (!isRoomFormValid) {
      onShowToast('Please fix the highlighted validation errors before saving.', 'info');
      return;
    }

    setIsSubmitting(true);
    try {
      // Parse images
      const images = imageInput
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const finalData = {
        ...formData,
        name: formData.name?.trim(),
        description: formData.description?.trim(),
        beds: formData.beds?.trim(),
        view: formData.view?.trim(),
        cancellationPolicy: formData.cancellationPolicy?.trim(),
        slug: formData.slug?.trim() || (formData.name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80']
      };

      if (editingRoom) {
        await onUpdateRoom(editingRoom.id, finalData);
        onShowToast(`Room "${formData.name}" successfully updated!`);
      } else {
        await onAddRoom(finalData);
        onShowToast(`New room "${formData.name}" created!`);
      }
      setModalOpen(false);
    } catch (err: any) {
      onShowToast(`Operation failed: ${err.message || 'Error'}`, 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (room: Room) => {
    if (window.confirm(`Are you sure you want to delete "${room.name}"? This action cannot be undone.`)) {
      try {
        await onDeleteRoom(room.id);
        onShowToast(`Room "${room.name}" deleted.`);
      } catch (err: any) {
        onShowToast(`Failed to delete room: ${err.message}`, 'info');
      }
    }
  };

  // Filtered rooms
  const filtered = rooms.filter((r) => {
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    const matchSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header controls: Search, Filter, Add Room */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Category tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by room name, type, specs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'standard', 'deluxe', 'suite', 'villa'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  typeFilter === t
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#162A24]'
                }`}
              >
                {t === 'all' ? 'All Types' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Add Room Button */}
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-950/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Room</span>
        </button>
      </div>

      {/* 2. Room Grid / Loading / Empty */}
      {isLoading ? (
        <div className="p-16 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin mb-3" />
          <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
            Loading Accommodations...
          </h4>
          <p className="text-xs text-stone-400 mt-1">
            Fetching hotel room categories and availability from database
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">No rooms found</p>
          <p className="text-xs text-stone-400 mt-1">Try modifying your search or click &quot;Add New Room&quot;</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((room) => (
          <div
            key={room.id}
            className="rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
          >
            {/* Top Image & Badge */}
            <div className="relative aspect-[16/10] bg-stone-100 dark:bg-[#142621] overflow-hidden">
              <img
                src={room.images[0]}
                alt={room.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-900/90 text-white backdrop-blur-md shadow-sm">
                  {room.type}
                </span>
                {room.tag && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/90 text-stone-900 backdrop-blur-md shadow-sm">
                    {room.tag}
                  </span>
                )}
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{room.rating}</span>
                <span className="text-white/70 text-[10px]">({room.reviewCount})</span>
              </div>
            </div>

            {/* Room Details */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {room.name}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                  {room.description}
                </p>

                {/* Room Inventory & Live Availability Box */}
                {(() => {
                  const total = room.totalRooms ?? 5;
                  const available = room.availableRooms ?? total;
                  const occupied = room.occupiedRooms ?? Math.max(0, total - available);
                  const baseNum = room.baseRoomNumber ?? 101;
                  const allNums = room.roomNumbers && room.roomNumbers.length > 0
                    ? room.roomNumbers
                    : Array.from({ length: total }, (_, i) => String(baseNum + i));
                  const occupiedSet = new Set(room.occupiedRoomNumbers || []);

                  return (
                    <div className="mt-3 p-3 rounded-xl bg-stone-50 dark:bg-[#142621] border border-stone-200/80 dark:border-[#223B33] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-700 dark:text-stone-200">
                          Total Rooms: <strong className="text-emerald-700 dark:text-emerald-400">{total}</strong>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            room.status === 'maintenance'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : available > 0
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {room.status === 'maintenance'
                            ? 'Maintenance'
                            : available > 0
                            ? `${available} Vacant · ${occupied} Booked`
                            : 'Fully Booked (0 Vacant)'}
                        </span>
                      </div>

                      {/* Room Numbers Pills */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {allNums.map((num) => {
                          const isOcc = occupiedSet.has(num);
                          return (
                            <span
                              key={num}
                              title={isOcc ? `Room #${num} (Occupied)` : `Room #${num} (Vacant)`}
                              className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${
                                isOcc
                                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 line-through'
                                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300'
                              }`}
                            >
                              #{num}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Specs row */}
                <div className="mt-3 pt-3 border-t border-stone-100 dark:border-[#1C2F29] flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    Up to {room.maxGuests}
                  </span>
                  <span>·</span>
                  <span>{room.beds}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5" />
                    {room.sizeSqFt} sq ft
                  </span>
                </div>

                {/* Amenities tags preview */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {room.amenities.slice(0, 3).map((a) => (
                    <span
                      key={a}
                      className="text-[10px] px-2 py-0.5 rounded bg-stone-100 dark:bg-[#162A24] text-stone-600 dark:text-stone-300"
                    >
                      {a}
                    </span>
                  ))}
                  {room.amenities.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded text-stone-400">
                      +{room.amenities.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-[#1C2F29] flex items-center justify-between">
                <div>
                  <span className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                    LKR {room.pricePerNight.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-stone-400 block -mt-1">per night</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(room)}
                    className="px-2.5 py-2 rounded-xl border border-stone-200 dark:border-[#223B33] text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-[#162A24] hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                    title="Edit room & room count"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit / Rooms</span>
                  </button>
                  <button
                    onClick={() => handleDelete(room)}
                    className="p-2 rounded-xl border border-stone-200 dark:border-[#223B33] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete room"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* 3. Add / Edit Room Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] rounded-2xl w-full max-w-3xl my-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 dark:border-[#1C2F29] flex items-center justify-between bg-stone-50 dark:bg-[#142621]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                    {editingRoom ? `Edit Room Category: ${editingRoom.name}` : 'Add New Room Category'}
                  </h3>
                  <p className="text-xs text-stone-500">Configure room count, room numbers, pricing, and amenities</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} noValidate className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Row 1: Name, Category, Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Room Category Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Oceanfront Villa"
                    value={formData.name || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setTouched((prev) => ({ ...prev, name: true }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                    className={`w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 ${
                      touched.name && roomErrors.name
                        ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30 bg-red-50/40 dark:bg-red-950/20'
                        : 'border-stone-200 dark:border-[#223B33] focus:ring-emerald-600'
                    }`}
                  />
                  {touched.name && roomErrors.name && (
                    <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {roomErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Category Type *
                  </label>
                  <select
                    value={formData.type || 'standard'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as RoomType })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                  >
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="suite">Suite</option>
                    <option value="villa">Villa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Price per Night (LKR) *
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    value={formData.pricePerNight ?? ''}
                    onChange={(e) => {
                      setFormData({ ...formData, pricePerNight: Number(e.target.value) });
                      setTouched((prev) => ({ ...prev, pricePerNight: true }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, pricePerNight: true }))}
                    className={`w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 ${
                      touched.pricePerNight && roomErrors.pricePerNight
                        ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30 bg-red-50/40 dark:bg-red-950/20'
                        : 'border-stone-200 dark:border-[#223B33] focus:ring-emerald-600'
                    }`}
                  />
                  {touched.pricePerNight && roomErrors.pricePerNight && (
                    <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {roomErrors.pricePerNight}
                    </p>
                  )}
                </div>
              </div>

              {/* Highlighted Room Inventory & Room Numbers Section */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-[#132822] border border-emerald-200 dark:border-emerald-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Room Inventory & Room Numbering
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    Rooms can only be booked when vacant
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-200 uppercase tracking-wider text-[10px] mb-1.5">
                      Total Rooms Count *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={formData.totalRooms ?? ''}
                      onChange={(e) => {
                        setFormData({ ...formData, totalRooms: Number(e.target.value) });
                        setTouched((prev) => ({ ...prev, totalRooms: true }));
                      }}
                      onBlur={() => setTouched((prev) => ({ ...prev, totalRooms: true }))}
                      className={`w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0E1D18] border text-stone-900 dark:text-stone-100 font-bold focus:outline-none focus:ring-2 ${
                        touched.totalRooms && roomErrors.totalRooms
                          ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30'
                          : 'border-emerald-300 dark:border-emerald-700 focus:ring-emerald-600'
                      }`}
                    />
                    {touched.totalRooms && roomErrors.totalRooms && (
                      <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {roomErrors.totalRooms}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-200 uppercase tracking-wider text-[10px] mb-1.5">
                      Starting Room Number *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={9999}
                      value={formData.baseRoomNumber ?? ''}
                      onChange={(e) => {
                        setFormData({ ...formData, baseRoomNumber: Number(e.target.value) });
                        setTouched((prev) => ({ ...prev, baseRoomNumber: true }));
                      }}
                      onBlur={() => setTouched((prev) => ({ ...prev, baseRoomNumber: true }))}
                      className={`w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0E1D18] border text-stone-900 dark:text-stone-100 font-mono font-bold focus:outline-none focus:ring-2 ${
                        touched.baseRoomNumber && roomErrors.baseRoomNumber
                          ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30'
                          : 'border-emerald-300 dark:border-emerald-700 focus:ring-emerald-600'
                      }`}
                    />
                    {touched.baseRoomNumber && roomErrors.baseRoomNumber && (
                      <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {roomErrors.baseRoomNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-200 uppercase tracking-wider text-[10px] mb-1.5">
                      Booking Availability Status
                    </label>
                    <select
                      value={formData.status || 'available'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0E1D18] border border-emerald-300 dark:border-emerald-700 text-stone-900 dark:text-stone-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                    >
                      <option value="available">Available (Open for Booking)</option>
                      <option value="maintenance">Under Maintenance (Closed)</option>
                    </select>
                  </div>
                </div>

                {/* Live Preview of Room Numbers */}
                <div className="pt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 mr-1">
                    Assigned Room Numbers:
                  </span>
                  {Array.from({ length: Math.min(25, Math.max(1, formData.totalRooms || 1)) }, (_, i) => (formData.baseRoomNumber || 101) + i).map((num) => (
                    <span
                      key={num}
                      className="px-2 py-0.5 rounded bg-white dark:bg-[#0E1D18] border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold"
                    >
                      #{num}
                    </span>
                  ))}
                  {(formData.totalRooms || 1) > 25 && (
                    <span className="text-[10px] text-stone-500">
                      ... up to #{(formData.baseRoomNumber || 101) + (formData.totalRooms || 1) - 1}
                    </span>
                  )}
                </div>
              </div>

              {/* Row 2: Max Guests, Beds, Baths, Size */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Max Guests *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.maxGuests ?? ''}
                    onChange={(e) => {
                      setFormData({ ...formData, maxGuests: Number(e.target.value) });
                      setTouched((prev) => ({ ...prev, maxGuests: true }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, maxGuests: true }))}
                    className={`w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border text-stone-900 dark:text-stone-100 ${
                      touched.maxGuests && roomErrors.maxGuests
                        ? 'border-red-500 dark:border-red-500 bg-red-50/40 dark:bg-red-950/20'
                        : 'border-stone-200 dark:border-[#223B33]'
                    }`}
                  />
                  {touched.maxGuests && roomErrors.maxGuests && (
                    <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1">
                      {roomErrors.maxGuests}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Beds Description *
                  </label>
                  <input
                    type="text"
                    value={formData.beds ?? ''}
                    onChange={(e) => {
                      setFormData({ ...formData, beds: e.target.value });
                      setTouched((prev) => ({ ...prev, beds: true }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, beds: true }))}
                    placeholder="e.g. 1 King Bed"
                    className={`w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border text-stone-900 dark:text-stone-100 ${
                      touched.beds && roomErrors.beds
                        ? 'border-red-500 dark:border-red-500 bg-red-50/40 dark:bg-red-950/20'
                        : 'border-stone-200 dark:border-[#223B33]'
                    }`}
                  />
                  {touched.beds && roomErrors.beds && (
                    <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1">
                      {roomErrors.beds}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Baths *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.baths ?? ''}
                    onChange={(e) => {
                      setFormData({ ...formData, baths: Number(e.target.value) });
                      setTouched((prev) => ({ ...prev, baths: true }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, baths: true }))}
                    className={`w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border text-stone-900 dark:text-stone-100 ${
                      touched.baths && roomErrors.baths
                        ? 'border-red-500 dark:border-red-500 bg-red-50/40 dark:bg-red-950/20'
                        : 'border-stone-200 dark:border-[#223B33]'
                    }`}
                  />
                  {touched.baths && roomErrors.baths && (
                    <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1">
                      {roomErrors.baths}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Size (sq ft) *
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={10000}
                    value={formData.sizeSqFt ?? ''}
                    onChange={(e) => {
                      setFormData({ ...formData, sizeSqFt: Number(e.target.value) });
                      setTouched((prev) => ({ ...prev, sizeSqFt: true }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, sizeSqFt: true }))}
                    className={`w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border text-stone-900 dark:text-stone-100 ${
                      touched.sizeSqFt && roomErrors.sizeSqFt
                        ? 'border-red-500 dark:border-red-500 bg-red-50/40 dark:bg-red-950/20'
                        : 'border-stone-200 dark:border-[#223B33]'
                    }`}
                  />
                  {touched.sizeSqFt && roomErrors.sizeSqFt && (
                    <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1">
                      {roomErrors.sizeSqFt}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 3: View, Cancellation Policy, Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                    View *
                  </label>
                  <input
                    type="text"
                    value={formData.view ?? ''}
                    onChange={(e) => {
                      setFormData({ ...formData, view: e.target.value });
                      setTouched((prev) => ({ ...prev, view: true }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, view: true }))}
                    placeholder="e.g. Ocean View"
                    className={`w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border text-stone-900 dark:text-stone-100 ${
                      touched.view && roomErrors.view
                        ? 'border-red-500 dark:border-red-500 bg-red-50/40 dark:bg-red-950/20'
                        : 'border-stone-200 dark:border-[#223B33]'
                    }`}
                  />
                  {touched.view && roomErrors.view && (
                    <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1">
                      {roomErrors.view}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Badge Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Guest Favorite, Best Value"
                    value={formData.tag || ''}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Cancellation Policy *
                  </label>
                  <input
                    type="text"
                    value={formData.cancellationPolicy ?? ''}
                    onChange={(e) => {
                      setFormData({ ...formData, cancellationPolicy: e.target.value });
                      setTouched((prev) => ({ ...prev, cancellationPolicy: true }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, cancellationPolicy: true }))}
                    placeholder="e.g. Free cancellation up to 48h"
                    className={`w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border text-stone-900 dark:text-stone-100 ${
                      touched.cancellationPolicy && roomErrors.cancellationPolicy
                        ? 'border-red-500 dark:border-red-500 bg-red-50/40 dark:bg-red-950/20'
                        : 'border-stone-200 dark:border-[#223B33]'
                    }`}
                  />
                  {touched.cancellationPolicy && roomErrors.cancellationPolicy && (
                    <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1">
                      {roomErrors.cancellationPolicy}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Summary Description *
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    setTouched((prev) => ({ ...prev, description: true }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
                  placeholder="Provide a descriptive summary of the room category (minimum 10 characters)..."
                  className={`w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border text-stone-900 dark:text-stone-100 ${
                    touched.description && roomErrors.description
                      ? 'border-red-500 dark:border-red-500 bg-red-50/40 dark:bg-red-950/20'
                      : 'border-stone-200 dark:border-[#223B33]'
                  }`}
                />
                {touched.description && roomErrors.description && (
                  <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {roomErrors.description}
                  </p>
                )}
              </div>

              {/* Images (One URL per line) */}
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Image URLs (Enter 1 valid URL per line) *
                </label>
                <textarea
                  rows={3}
                  value={imageInput}
                  onChange={(e) => {
                    setImageInput(e.target.value);
                    setTouched((prev) => ({ ...prev, imageInput: true }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, imageInput: true }))}
                  placeholder="https://images.unsplash.com/..."
                  className={`w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border text-stone-900 dark:text-stone-100 font-mono text-[11px] ${
                    touched.imageInput && roomErrors.imageInput
                      ? 'border-red-500 dark:border-red-500 bg-red-50/40 dark:bg-red-950/20'
                      : 'border-stone-200 dark:border-[#223B33]'
                  }`}
                />
                {touched.imageInput && roomErrors.imageInput && (
                  <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {roomErrors.imageInput}
                  </p>
                )}
              </div>

              {/* Amenities Selector */}
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-2">
                  Select Key Amenities *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_AMENITIES.slice(0, 12).map((amenity) => {
                    const checked = (formData.amenities || []).includes(amenity);
                    return (
                      <label
                        key={amenity}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                          checked
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-medium'
                            : 'border-stone-200 dark:border-[#223B33] text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-[#162A24]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleAmenity(amenity)}
                          className="w-3.5 h-3.5 text-emerald-600 rounded"
                        />
                        <span className="truncate">{amenity}</span>
                      </label>
                    );
                  })}
                </div>
                {touched.amenities && roomErrors.amenities && (
                  <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {roomErrors.amenities}
                  </p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-stone-200 dark:border-[#1C2F29] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-[#223B33] text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#162A24] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isRoomFormValid}
                  className={`px-5 py-2.5 rounded-xl font-semibold shadow-md flex items-center gap-1.5 transition-all ${
                    isRoomFormValid
                      ? 'bg-emerald-700 hover:bg-emerald-600 text-white cursor-pointer'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  {isSubmitting ? 'Saving...' : editingRoom ? 'Save Changes' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
