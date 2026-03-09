"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import styles from "../admin.module.css";
import { getSiteData, updateDiningCategory, createDiningCategory, deleteDiningCategory } from "../../actions";
import { Edit2, Trash2, Plus, Utensils, Coffee, Cake, LogOut } from "lucide-react";
import AdminModal from "../../components/AdminModal";
import { useCurrency } from "../../context/CurrencyContext";
import { showToast } from "../components/AdminToast";

export default function AdminDining() {
    const { formatPrice } = useCurrency();
    const [menu, setMenu] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
    const [deleteItemData, setDeleteItemData] = useState<{ categoryId: string, idx: number } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Category Modal State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoryForm, setCategoryForm] = useState<{ id: string, name: string }>({ id: "", name: "" });

    // Item Modal State
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [itemFormState, setItemFormState] = useState<{ categoryId: string, itemIdx: number | 'NEW', name: string, desc: string, price: string }>({
        categoryId: "",
        itemIdx: "NEW",
        name: "",
        desc: "",
        price: ""
    });

    const fetchMenu = async () => {
        const data = await getSiteData();
        setMenu(data.menuCategories);
        setLoading(false);
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const [error, setError] = useState<string | null>(null);

    // Category Handlers
    const handleAddCategory = () => {
        setCategoryForm({ id: "NEW", name: "" });
        setError(null);
        setIsCategoryModalOpen(true);
    };

    const handleEditCategory = (category: any) => {
        setCategoryForm({ id: category.id, name: category.name });
        setError(null);
        setIsCategoryModalOpen(true);
    };

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        let res;
        if (categoryForm.id === "NEW") {
            res = await createDiningCategory({ name: categoryForm.name, items: [] });
        } else {
            const category = menu.find(c => c.id === categoryForm.id);
            res = await updateDiningCategory(categoryForm.id, { ...category, name: categoryForm.name });
        }

        if (res.success) {
            await fetchMenu();
            setIsCategoryModalOpen(false);
            showToast(categoryForm.id === "NEW" ? "Category created successfully" : "Category updated successfully", "success");
        } else {
            setError(res.error || "Failed to save category.");
        }
        setIsSaving(false);
    };

    const handleDeleteCategory = async () => {
        if (!deleteCategoryId) return;
        setIsDeleting(true);
        const res = await deleteDiningCategory(deleteCategoryId);
        if (res.success) {
            await fetchMenu();
            setDeleteCategoryId(null);
            showToast("Category deleted successfully", "success");
        } else {
            showToast(res.error || "Failed to delete category.", "error");
        }
        setIsDeleting(false);
    };

    // Item Handlers
    const handleAddItem = (categoryId: string) => {
        setItemFormState({ categoryId, itemIdx: "NEW", name: "", desc: "", price: "" });
        setIsItemModalOpen(true);
    };

    const handleEditItem = (categoryId: string, itemIdx: number) => {
        const category = menu.find(c => c.id === categoryId);
        const item = category.items[itemIdx];
        setItemFormState({ categoryId, itemIdx, ...item });
        setIsItemModalOpen(true);
    };

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        const category = menu.find(c => c.id === itemFormState.categoryId);
        if (!category) return;

        let updatedItems = [...category.items];
        const newItem = { name: itemFormState.name, desc: itemFormState.desc, price: itemFormState.price };

        if (itemFormState.itemIdx === "NEW") {
            updatedItems.push(newItem);
        } else {
            updatedItems[itemFormState.itemIdx as number] = newItem;
        }

        const res = await updateDiningCategory(itemFormState.categoryId, { ...category, items: updatedItems });
        if (res.success) {
            await fetchMenu();
            setIsItemModalOpen(false);
            showToast(itemFormState.itemIdx === "NEW" ? "Dish added successfully" : "Dish updated successfully", "success");
        } else {
            setError(res.error || "Failed to save menu item.");
        }
        setIsSaving(false);
    };

    const handleDeleteItem = async () => {
        if (!deleteItemData) return;
        setIsDeleting(true);
        const category = menu.find(c => c.id === deleteItemData.categoryId);
        if (category) {
            const updatedItems = category.items.filter((_: any, idx: number) => idx !== deleteItemData.idx);
            const res = await updateDiningCategory(deleteItemData.categoryId, { ...category, items: updatedItems });
            if (res.success) {
                await fetchMenu();
                setDeleteItemData(null);
                showToast("Dish removed successfully", "success");
            } else {
                showToast(res.error || "Failed to delete item.", "error");
            }
        }
        setIsDeleting(false);
    };

    if (loading) return <div className={styles.mainContent}>Loading...</div>;

    return (
        <div className={styles.mainContent}>
            <div className={styles.sectionHeader}>
                <div>
                    <h1 className={styles.sectionTitle}>Dining & Cuisine</h1>
                    <p style={{ color: '#6B7280', marginTop: '0.5rem' }}>Manage your gourmet menu categories and culinary delights</p>
                </div>
                <button onClick={handleAddCategory} className={styles.addButton}>
                    <Plus size={18} /> New Category
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                {menu.map((category) => (
                    <div key={category.id} className={styles.card} style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F7F8FC', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ padding: '0.75rem', background: 'rgba(74, 43, 102, 0.08)', color: 'var(--secondary)', borderRadius: '12px' }}>
                                    {category.name === 'Starters' ? <Coffee size={24} /> : category.name === 'Dessert' ? <Cake size={24} /> : <Utensils size={24} />}
                                </span>
                                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{category.name}</h3>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button onClick={() => handleEditCategory(category)} className={styles.actionBtn} title="Edit Category"><Edit2 size={18} /></button>
                                <button onClick={() => setDeleteCategoryId(category.id)} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete Category"><Trash2 size={18} /></button>
                            </div>
                        </div>

                        <div style={{ padding: '0 2rem' }}>
                            {Array.isArray(category.items) && category.items.length > 0 ? (
                                category.items.map((item: any, idx: number) => (
                                    <div key={idx} className={styles.listItem} style={{ gridTemplateColumns: '1fr 120px 120px' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.9375rem', color: '#6B7280', marginTop: '0.25rem' }}>{item.desc}</div>
                                        </div>
                                        <div style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '1.1rem', textAlign: 'center' }}>{formatPrice(item.price)}</div>
                                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                            <button onClick={() => handleEditItem(category.id, idx)} className={styles.actionBtn} title="Edit Item"><Edit2 size={16} /></button>
                                            <button onClick={() => setDeleteItemData({ categoryId: category.id, idx })} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete Item"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280', fontSize: '0.9375rem' }}>
                                    No items in this category yet.
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '1.5rem 2rem', background: '#F7F8FC' }}>
                            <button onClick={() => handleAddItem(category.id)} style={{ width: '100%', padding: '1rem', background: 'transparent', border: '1px dashed rgba(0,0,0,0.12)', borderRadius: '12px', color: '#6B7280', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s ease' }} onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(183,148,62,0.3)'} onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                                <Plus size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Add new dish to {category.name}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Category Modal */}
            <AdminModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                title={categoryForm.id === "NEW" ? "Add Category" : "Edit Category"}
                onSubmit={handleSaveCategory}
                loading={isSaving}
                error={error}
            >
                <div className={styles.formGroup}>
                    <label className={styles.label}>Category Name</label>
                    <input
                        className={styles.input}
                        placeholder="e.g. Main Course, Wine List..."
                        value={categoryForm.name}
                        onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        required
                    />
                </div>
            </AdminModal>

            {/* Item Modal */}
            <AdminModal
                isOpen={isItemModalOpen}
                onClose={() => setIsItemModalOpen(false)}
                title={itemFormState.itemIdx === "NEW" ? "Add New Dish" : `Edit ${itemFormState.name}`}
                onSubmit={handleSaveItem}
                loading={isSaving}
                error={error}
            >
                <div className={styles.formGroup}>
                    <label className={styles.label}>Dish Name</label>
                    <input
                        className={styles.input}
                        placeholder="e.g. Grilled Ribeye Steak"
                        value={itemFormState.name}
                        onChange={e => setItemFormState({ ...itemFormState, name: e.target.value })}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Description</label>
                    <textarea
                        className={styles.input}
                        style={{ minHeight: '80px' }}
                        placeholder="Key ingredients, preparation method..."
                        value={itemFormState.desc}
                        onChange={e => setItemFormState({ ...itemFormState, desc: e.target.value })}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Price</label>
                    <input
                        className={styles.input}
                        placeholder="e.g. $45"
                        value={itemFormState.price}
                        onChange={e => setItemFormState({ ...itemFormState, price: e.target.value })}
                        required
                    />
                </div>
            </AdminModal>
            {/* Delete Confirmation Modals */}
            <AdminModal
                isOpen={!!deleteCategoryId}
                onClose={() => setDeleteCategoryId(null)}
                title="Confirm Deletion"
                onSubmit={(e) => { e.preventDefault(); handleDeleteCategory(); }}
                loading={isDeleting}
                submitLabel="Delete Category"
                danger
            >
                <div style={{ padding: '1rem 0' }}>
                    <p style={{ color: '#6B7280', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                        Are you sure you want to delete <strong style={{ color: '#111827' }}>{menu.find(c => c.id === deleteCategoryId)?.name}</strong> and all its menu items?
                    </p>
                    <p style={{ color: '#EF4444', fontSize: '0.8125rem', marginTop: '1rem', fontWeight: 500 }}>
                        This action cannot be undone.
                    </p>
                </div>
            </AdminModal>

            <AdminModal
                isOpen={!!deleteItemData}
                onClose={() => setDeleteItemData(null)}
                title="Confirm Deletion"
                onSubmit={(e) => { e.preventDefault(); handleDeleteItem(); }}
                loading={isDeleting}
                submitLabel="Remove Dish"
                danger
            >
                <div style={{ padding: '1rem 0' }}>
                    <p style={{ color: '#6B7280', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                        Are you sure you want to remove this dish from the menu?
                    </p>
                </div>
            </AdminModal>
        </div>
    );
}

