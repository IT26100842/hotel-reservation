import React, { useState, useEffect } from 'react';
import { RoomCategoryItem, Room } from '../types';
import { Plus, Trash2, Edit2, CheckCircle2, X, AlertCircle, Loader2, Layers, Tag } from 'lucide-react';

interface AdminCategoriesProps {
  rooms: Room[];
  isRoomsLoaded?: boolean;
  categories: RoomCategoryItem[];
  onAddCategory: (category: Partial<RoomCategoryItem>) => Promise<void>;
  onUpdateCategory: (id: number | string, category: Partial<RoomCategoryItem>) => Promise<void>;
  onDeleteCategory: (id: number | string) => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  currentAdmin?: any;
  isLoading?: boolean;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({
  rooms,
  isRoomsLoaded = false,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onShowToast,
  currentAdmin,
  isLoading = false
}) => {
  console.log('--- ADMIN CATEGORIES RENDER ---');
  console.log('1. isRoomsLoaded prop value:', isRoomsLoaded);
  console.log('2. rooms array length:', rooms?.length);
  console.log('3. categories array length:', categories?.length);
  if (rooms?.length > 0) {
    console.log('4. Sample Room Category ID:', rooms[0].categoryId);
  }

  const isStandardAdmin = currentAdmin?.role === 'admin';
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RoomCategoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [basePrice, setBasePrice] = useState(15000);
  const [sortOrder, setSortOrder] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setShortDescription('');
    setBasePrice(15000);
    setSortOrder(categories.length + 1);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: RoomCategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setShortDescription(cat.shortDescription || '');
    setBasePrice(cat.basePrice || 15000);
    setSortOrder(cat.sortOrder || 1);
    setFormError(null);
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setFormError('Category name is required.');
      return;
    }

    const cleanSlug = (slug || cleanName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-|-$/g, '');

    if (!cleanSlug) {
      setFormError('A valid slug is required.');
      return;
    }

    const duplicate = categories.find(
      (c) =>
        c.slug.toLowerCase() === cleanSlug &&
        (!editingCategory || String(c.id) !== String(editingCategory.id))
    );
    if (duplicate) {
      setFormError(`A category with slug "${cleanSlug}" already exists.`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await onUpdateCategory(editingCategory.id, {
          name: cleanName,
          slug: cleanSlug,
          shortDescription: shortDescription.trim(),
          basePrice: Number(basePrice) || 0,
          sortOrder: Number(sortOrder) || 1
        });
        onShowToast(`Category "${cleanName}" updated successfully!`);
      } else {
        await onAddCategory({
          name: cleanName,
          slug: cleanSlug,
          shortDescription: shortDescription.trim(),
          basePrice: Number(basePrice) || 0,
          sortOrder: Number(sortOrder) || 1,
          isActive: true
        });
        onShowToast(`Category "${cleanName}" created successfully!`);
      }
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat: RoomCategoryItem) => {
    if (confirm(`Are you sure you want to delete "${cat.name}" category? Rooms mapped to this category may need re-assigning.`)) {
      try {
        await onDeleteCategory(cat.id);
        onShowToast(`Category "${cat.name}" deleted successfully.`);
      } catch (err: any) {
        onShowToast(err.message || 'Failed to delete category.', 'info');
      }
    }
  };

  return (
    <div className="space-y-6">
      {isStandardAdmin && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Standard Administrator Mode:</span> You have view-only access to room categories. Adding, editing, and deleting category types are restricted to Manager and Super Administrator tiers.
          </div>
        </div>
      )}

      <div className="p-5 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Room Category Types
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Manage hotel room category types stored in the database. Updating categories updates room filters and dropdowns everywhere.
          </p>
        </div>

        {!isStandardAdmin && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-950/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category Type</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-16 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin mb-3" />
          <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
            Loading Categories...
          </h4>
          <p className="text-xs text-stone-400 mt-1">
            Fetching room category types from database
          </p>
        </div>
      ) : categories.length === 0 ? (
        <div className="p-16 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm flex flex-col items-center justify-center text-center">
          <Layers className="w-10 h-10 text-stone-300 dark:text-stone-600 mb-2" />
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">No categories found</p>
          <p className="text-xs text-stone-400 mt-1">Click &quot;Add Category Type&quot; above to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => {
            const hasRooms = rooms?.some((r) => Number(r.categoryId) === Number(cat.id));
            console.log(`Category: [${cat.name}] ID: [${cat.id}] - hasRooms mapping result:`, hasRooms);

            return (
              <div
                key={cat.id || cat.slug}
                className="p-5 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                        {cat.name}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-stone-100 dark:bg-[#182C25] text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-[#27443A]">
                      {cat.slug}
                    </span>
                  </div>

                  {cat.shortDescription && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mb-3">
                      {cat.shortDescription}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-stone-600 dark:text-stone-300 pt-2 border-t border-stone-100 dark:border-[#1B2F28]">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">Base Price</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        LKR {(cat.basePrice || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">Sort Order</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">
                        #{cat.sortOrder || idx + 1}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-stone-100 dark:border-[#1B2F28]">
                  {isStandardAdmin ? (
                    <span className="text-[11px] text-stone-400 italic font-medium px-2 py-1 bg-stone-100 dark:bg-[#13231E] rounded">
                      View Only (Admin)
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditModal(cat)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#182C25] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                        <span>Edit</span>
                      </button>
                      
                      {!isRoomsLoaded ? (
                        <span className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Checking...</span>
                        </span>
                      ) : !hasRooms ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      ) : (
                        <span 
                          title="Rooms are assigned to this category"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-400 bg-stone-50 dark:bg-[#13231E] flex items-center gap-1 cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5 opacity-50" />
                          <span>In Use</span>
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#101F1A] rounded-2xl shadow-2xl border border-stone-200 dark:border-[#1C2F29] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-stone-200 dark:border-[#1C2F29] flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {editingCategory ? 'Edit Category Type' : 'Add New Category Type'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#182C25] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl flex items-center gap-2 text-xs text-red-700 dark:text-red-300 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ocean Penthouse Suite"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  Slug (Unique Identifier) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ocean-penthouse"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                    Base Price (LKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-[#1C2F29]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#182C25] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};