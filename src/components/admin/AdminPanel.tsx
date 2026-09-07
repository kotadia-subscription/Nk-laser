import React, { useState, useEffect, useCallback } from 'react';
import { 
  Lock, 
  Sun, 
  Moon, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Eye,
  EyeOff,
  ShieldAlert
} from 'lucide-react';
import { 
  ProductCategoryDef, 
  ProductItem, 
  BrandItem, 
  InquiryRecord, 
  SiteSettings,
  ReviewItem,
  ComprehensiveAuditResult
} from '../../types';
import {
  saveAdminPasswordSecurely,
  verifyAdminPassword,
  getAdminSession,
  setAdminSession,
  loadSiteSettings,
  saveSiteSettings,
  loadCategories,
  saveCategories,
  loadProducts,
  saveProducts,
  loadBrands,
  saveBrands,
  loadPowerRanges,
  savePowerRanges,
  loadInquiries,
  saveInquiries,
  saveInquiry,
  deleteInquiry,
  loadReviews,
  saveReviews,
  loadServices,
  runAutoBrandAudit,
  KNOWN_THIRD_PARTY_BRANDS,
  publishConfigurationEverywhere,
  pushConfigurationToServer
} from '../../utils/storage';
import {
  adminLogin,
  verifyAdminSession,
  adminLogout,
  adminChangePassword,
  fetchAdminInquiries,
  updateAdminInquiryStatus,
  deleteAdminInquiry,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  saveAdminBrands as apiSaveAdminBrands,
  saveAdminSettings as apiSaveAdminSettings,
  saveAdminPowerRanges as apiSaveAdminPowerRanges,
  publishAdminCatalog,
  addAdminReview,
  updateAdminReview,
  deleteAdminReview,
  fetchPublicReviews
} from '../../lib/api';
import { AdminSidebar, AdminTabType } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminCategoriesView } from './views/AdminCategoriesView';
import { AdminProductsView } from './views/AdminProductsView';
import { AdminFiltersView } from './views/AdminFiltersView';
import { AdminInquiriesView } from './views/AdminInquiriesView';
import { AdminReviewsView } from './views/AdminReviewsView';
import { AdminSettingsView } from './views/AdminSettingsView';
import { AdminSecurityView } from './views/AdminSecurityView';
import { ProductEditPageView } from './views/ProductEditPageView';
import { ProductEditModal } from './modals/ProductEditModal';
import { CategoryEditModal } from './modals/CategoryEditModal';
import { BrandEditModal } from './modals/BrandEditModal';

interface AdminPanelProps {
  isOpen?: boolean;
  initialTab?: AdminTabType;
  onTabChange?: (tab: AdminTabType) => void;
  onClose: () => void;
  onSettingsUpdated: (newSettings: SiteSettings) => void;
  onProductsUpdated?: (newProducts: ProductItem[]) => void;
  onCategoriesUpdated?: (newCategories: ProductCategoryDef[]) => void;
  onPowerRangesUpdated?: (newPowerRanges: string[]) => void;
  onInquiriesUpdated?: (newInquiries: InquiryRecord[]) => void;
  onReviewsUpdated?: (newReviews: ReviewItem[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen = false,
  initialTab = 'dashboard',
  onTabChange,
  onClose,
  onSettingsUpdated,
  onProductsUpdated,
  onCategoriesUpdated,
  onPowerRangesUpdated,
  onInquiriesUpdated,
  onReviewsUpdated
}) => {
  // Data States
  const [settings, setSettings] = useState<SiteSettings>(loadSiteSettings);

  // Theme is locked to light mode
  const theme: 'light' | 'dark' = 'light';
  const toggleTheme = () => {
    // Light mode only
  };

  // Auth State (Authoritative Server-Enforced via HttpOnly Cookies)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTabType>(initialTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Keep activeTab in sync with initialTab prop if it changes
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleSelectTab = (tab: AdminTabType) => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const [categories, setCategories] = useState<ProductCategoryDef[]>(loadCategories);
  const [products, setProducts] = useState<ProductItem[]>(loadProducts);
  const [brands, setBrands] = useState<BrandItem[]>(loadBrands);
  const [powerRanges, setPowerRanges] = useState<string[]>(loadPowerRanges);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>(loadInquiries);
  const [reviews, setReviews] = useState<ReviewItem[]>(loadReviews);

  // Load confidential inquiries from backend when authenticated
  const loadFreshInquiries = useCallback(async () => {
    const freshInquiries = await fetchAdminInquiries();
    if (freshInquiries && freshInquiries.length > 0) {
      setInquiries(freshInquiries);
      saveInquiries(freshInquiries);
    }
  }, []);

  // Load fresh reviews from backend
  const loadFreshReviews = useCallback(async () => {
    try {
      const freshReviews = await fetchPublicReviews();
      if (freshReviews && freshReviews.length > 0) {
        setReviews(freshReviews);
        saveReviews(freshReviews);
      }
    } catch (e) {
      console.warn('Could not load fresh reviews:', e);
    }
  }, []);

  // Verify server session on modal open & load fresh inquiries and reviews
  useEffect(() => {
    if (isOpen) {
      loadFreshReviews();
      verifyAdminSession().then((isValid) => {
        if (isValid) {
          setIsAuthenticated(true);
          loadFreshInquiries();
        } else {
          setIsAuthenticated(false);
        }
      });
    }
  }, [isOpen, loadFreshInquiries, loadFreshReviews]);

  // Selected Category Slug for category view
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(() => {
    const loaded = loadCategories();
    return loaded[0]?.slug || 'protective-lenses';
  });

  // Modal States
  const [editingProduct, setEditingProduct] = useState<Partial<ProductItem> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<ProductCategoryDef> | null>(null);
  const [editingBrand, setEditingBrand] = useState<Partial<BrandItem> | null>(null);

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Sync to parent hooks when categories or power ranges change
  useEffect(() => {
    if (onCategoriesUpdated) {
      onCategoriesUpdated(categories);
    }
  }, [categories, onCategoriesUpdated]);

  useEffect(() => {
    if (onPowerRangesUpdated) {
      onPowerRangesUpdated(powerRanges);
    }
  }, [powerRanges, onPowerRangesUpdated]);

  // Auth Handlers
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const passToCheck = passwordInput.trim();
    if (!passToCheck) {
      setAuthError(true);
      setAuthErrorMessage('Please enter the administrator master password');
      return;
    }

    setIsLoggingIn(true);
    setAuthError(false);
    setAuthErrorMessage('');

    try {
      const apiRes = await adminLogin(passToCheck);
      if (apiRes.success) {
        setIsAuthenticated(true);
        setAuthError(false);
        setAuthErrorMessage('');
        setPasswordInput('');
        showNotification('Master administrator authenticated successfully');
        loadFreshInquiries();
      } else {
        setIsAuthenticated(false);
        setAuthError(true);
        setAuthErrorMessage(apiRes.error || 'Access Denied: Invalid Administrator Password');
      }
    } catch (err: any) {
      setIsAuthenticated(false);
      setAuthError(true);
      setAuthErrorMessage(err?.message || 'Access Denied: Authentication server unavailable');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    setIsAuthenticated(false);
    onClose();
  };

  // ----------------------------------------------------
  // Category Actions
  // ----------------------------------------------------
  const handleSaveCategory = async (catData: Partial<ProductCategoryDef>) => {
    let updated: ProductCategoryDef[];
    if (catData.id) {
      updated = categories.map(c => c.id === catData.id ? ({ ...c, ...catData } as ProductCategoryDef) : c);
      try {
        await updateAdminCategory(catData.id, catData);
      } catch (err) {
        console.warn('Could not sync category to server:', err);
      }
    } else {
      const newCat: ProductCategoryDef = {
        id: 'cat-' + Date.now(),
        slug: catData.slug || catData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'custom-category',
        name: catData.name || 'New Category',
        shortTitle: catData.shortTitle || catData.name || 'Category',
        description: catData.description || 'Laser spares and consumables.',
        iconName: catData.iconName || 'Wrench',
        imageUrl: catData.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        subCategories: catData.subCategories || ['Standard Series'],
        oemBrands: catData.oemBrands || ['RayTools', 'OSPRI'],
        featured: catData.featured !== undefined ? catData.featured : true,
        showOnHome: catData.showOnHome !== undefined ? catData.showOnHome : true
      };
      updated = [...categories, newCat];
      setSelectedCategorySlug(newCat.slug as string);
      try {
        await createAdminCategory(newCat);
      } catch (err) {
        console.warn('Could not create category on server:', err);
      }
    }

    saveCategories(updated);
    setCategories(updated);
    if (onCategoriesUpdated) {
      onCategoriesUpdated(updated);
    }
    pushConfigurationToServer();
    setEditingCategory(null);
    showNotification(`Category "${catData.name}" saved!`);
  };

  const handleToggleCategoryFeatured = async (catId: string, currentVal?: boolean) => {
    const newVal = currentVal === false ? true : false;
    const target = categories.find(c => c.id === catId);
    if (!target) return;

    const updated = categories.map(c => c.id === catId ? { ...c, featured: newVal } : c);
    saveCategories(updated);
    setCategories(updated);
    if (onCategoriesUpdated) {
      onCategoriesUpdated(updated);
    }
    try {
      await updateAdminCategory(catId, { featured: newVal });
    } catch (err) {
      console.warn('Failed to update category featured state:', err);
    }
    pushConfigurationToServer();
    showNotification(`"${target.name}" ${newVal ? 'featured in top navigation' : 'removed from top navigation'}`);
  };

  const handleToggleCategoryHome = async (catId: string, currentVal?: boolean) => {
    const newVal = currentVal === false ? true : false;
    const target = categories.find(c => c.id === catId);
    if (!target) return;

    const updated = categories.map(c => c.id === catId ? { ...c, showOnHome: newVal } : c);
    saveCategories(updated);
    setCategories(updated);
    if (onCategoriesUpdated) {
      onCategoriesUpdated(updated);
    }
    try {
      await updateAdminCategory(catId, { showOnHome: newVal });
    } catch (err) {
      console.warn('Failed to update category home display state:', err);
    }
    pushConfigurationToServer();
    showNotification(`"${target.name}" ${newVal ? 'shown on Home Page' : 'hidden from Home Page'}`);
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (confirm(`Are you sure you want to delete category "${catName}"?`)) {
      const updated = categories.filter(c => c.id !== catId);
      saveCategories(updated);
      setCategories(updated);
      if (onCategoriesUpdated) {
        onCategoriesUpdated(updated);
      }
      try {
        await deleteAdminCategory(catId);
      } catch (err) {
        console.warn('Failed to delete category on server:', err);
      }
      pushConfigurationToServer();
      if (selectedCategorySlug === catId || categories.find(c => c.id === catId)?.slug === selectedCategorySlug) {
        setSelectedCategorySlug(updated[0]?.slug as string || '');
      }
      showNotification(`Category "${catName}" removed.`);
    }
  };

  const handleAddSubcategoryToActive = (sub: string) => {
    const activeCat = categories.find(c => c.slug === selectedCategorySlug);
    if (!activeCat) return;
    if (activeCat.subCategories?.includes(sub)) return;

    const updatedSub = [...(activeCat.subCategories || []), sub];
    const updatedCategories = categories.map(c => {
      if (c.slug === selectedCategorySlug) {
        return { ...c, subCategories: updatedSub };
      }
      return c;
    });

    saveCategories(updatedCategories);
    setCategories(updatedCategories);
    showNotification(`Added subcategory "${sub}"`);
  };

  const handleRemoveSubcategoryFromActive = (sub: string) => {
    const activeCat = categories.find(c => c.slug === selectedCategorySlug);
    if (!activeCat) return;

    const updatedSub = (activeCat.subCategories || []).filter(s => s !== sub);
    const updatedCategories = categories.map(c => {
      if (c.slug === selectedCategorySlug) {
        return { ...c, subCategories: updatedSub };
      }
      return c;
    });

    saveCategories(updatedCategories);
    setCategories(updatedCategories);
    showNotification(`Removed subcategory "${sub}"`);
  };

  const handleAddBrandToActiveCategory = (brand: string) => {
    const activeCat = categories.find(c => c.slug === selectedCategorySlug);
    if (!activeCat) return;
    if (activeCat.oemBrands?.includes(brand)) return;

    const updatedBrands = [...(activeCat.oemBrands || []), brand];
    const updatedCategories = categories.map(c => {
      if (c.slug === selectedCategorySlug) {
        return { ...c, oemBrands: updatedBrands };
      }
      return c;
    });

    saveCategories(updatedCategories);
    setCategories(updatedCategories);
    showNotification(`Added OEM brand "${brand}" to category`);
  };

  const handleRemoveBrandFromActiveCategory = (brand: string) => {
    const activeCat = categories.find(c => c.slug === selectedCategorySlug);
    if (!activeCat) return;

    const updatedBrands = (activeCat.oemBrands || []).filter(b => b !== brand);
    const updatedCategories = categories.map(c => {
      if (c.slug === selectedCategorySlug) {
        return { ...c, oemBrands: updatedBrands };
      }
      return c;
    });

    saveCategories(updatedCategories);
    setCategories(updatedCategories);
    showNotification(`Removed OEM brand "${brand}" from category`);
  };

  // ----------------------------------------------------
  // Product Actions
  // ----------------------------------------------------
  const handleSaveProduct = (prodData: Partial<ProductItem>) => {
    let updatedList: ProductItem[];
    if (prodData.id) {
      updatedList = products.map(p => p.id === prodData.id ? ({
        ...p,
        ...prodData,
        inStock: prodData.inStock ?? (prodData.stockStatus === 'In Stock')
      } as ProductItem) : p);
    } else {
      const newProd: ProductItem = {
        id: 'prod-' + Date.now(),
        sku: prodData.sku || `NK-${Math.floor(1000 + Math.random() * 9000)}`,
        title: prodData.title || 'New Laser Spare',
        category: prodData.category || categories[0]?.name || 'Protective Lenses',
        categorySlug: prodData.categorySlug || categories[0]?.slug || 'protective-lenses',
        subCategory: prodData.subCategory || 'Standard Series',
        brand: prodData.brand || 'RayTools',
        material: prodData.material || 'Optical Quartz / Silica',
        thickness: prodData.thickness || '3 mm',
        dimensions: prodData.dimensions || 'Dia 27.9mm',
        powerRange: prodData.powerRange || '1kW - 6kW',
        wavelength: prodData.wavelength || '1064nm Fiber Laser',
        stockStatus: prodData.stockStatus || 'In Stock',
        inStock: prodData.inStock ?? true,
        isPopular: prodData.isPopular ?? false,
        isFeatured: prodData.isFeatured ?? false,
        estimatedPrice: prodData.estimatedPrice || 850,
        moq: prodData.moq || 1,
        imageUrl: prodData.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        description: prodData.description || 'Precision fiber laser replacement spare.',
        specs: prodData.specs || ['High damage threshold', 'Precision engineered'],
        specificationsTable: prodData.specificationsTable || [
          { label: 'Category', value: prodData.category || 'Laser Spares' }
        ]
      };
      updatedList = [newProd, ...products];
    }

    saveProducts(updatedList);
    setProducts(updatedList);
    onSettingsUpdated(loadSiteSettings());
    setEditingProduct(null);
    showNotification(`Product "${prodData.title}" saved successfully!`);
  };

  const handleDeleteProduct = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      const updated = products.filter(p => p.id !== id);
      saveProducts(updated);
      setProducts(updated);
      onSettingsUpdated(loadSiteSettings());
      showNotification(`Product "${title}" removed.`);
    }
  };

  const handleDuplicateProduct = (prod: ProductItem) => {
    const copy: ProductItem = {
      ...prod,
      id: 'prod-' + Date.now(),
      sku: `NK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `${prod.title} (Copy)`
    };
    const updated = [copy, ...products];
    saveProducts(updated);
    setProducts(updated);
    onSettingsUpdated(loadSiteSettings());
    showNotification(`Duplicated "${prod.title}"!`);
  };

  const handleToggleProductInStock = (productId: string, currentVal: boolean | undefined, currentStatus: string | undefined) => {
    const isNowInStock = !(currentVal === true || currentStatus === 'In Stock');
    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          inStock: isNowInStock,
          stockStatus: (isNowInStock ? 'In Stock' : 'Low Stock') as ProductItem['stockStatus']
        };
      }
      return p;
    });
    saveProducts(updatedProducts);
    setProducts(updatedProducts);
    onSettingsUpdated(loadSiteSettings());
    showNotification(`Stock toggled: ${isNowInStock ? 'In Stock Ready' : 'Low Stock'}`);
  };

  const handleQuickChangeStockStatus = (productId: string, newStatus: ProductItem['stockStatus']) => {
    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          stockStatus: newStatus,
          inStock: newStatus === 'In Stock'
        };
      }
      return p;
    });
    saveProducts(updatedProducts);
    setProducts(updatedProducts);
    onSettingsUpdated(loadSiteSettings());
    showNotification(`Status updated to "${newStatus}"`);
  };

  // ----------------------------------------------------
  // Power & Brand Actions
  // ----------------------------------------------------
  const handleAddPowerRange = (pr: string) => {
    if (powerRanges.includes(pr)) return;
    const updated = [...powerRanges, pr];
    savePowerRanges(updated);
    setPowerRanges(updated);
    showNotification(`Added power rating "${pr}"`);
  };

  const handleDeletePowerRange = (pr: string) => {
    const updated = powerRanges.filter(p => p !== pr);
    savePowerRanges(updated);
    setPowerRanges(updated);
    showNotification(`Removed power rating "${pr}"`);
  };

  const handleSaveBrand = (brandData: Partial<BrandItem>) => {
    const brandName = (brandData.name || '').trim();
    if (!brandName) return;

    let updated: BrandItem[];
    // Check if editing existing or matching by ID or brand name (case-insensitive)
    const existingById = brandData.id ? brands.find(b => b.id === brandData.id) : null;
    const existingByName = !existingById ? brands.find(b => b.name.toLowerCase() === brandName.toLowerCase()) : null;
    const existingTarget = existingById || existingByName;

    if (existingTarget) {
      updated = brands.map(b => {
        if (b.id === existingTarget.id) {
          return {
            ...b,
            ...brandData,
            name: brandName,
            logoUrl: brandData.logoUrl || b.logoUrl
          } as BrandItem;
        }
        return b;
      });
    } else {
      const newBrand: BrandItem = {
        id: 'brand-' + brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: brandName,
        logoUrl: brandData.logoUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',
        category: brandData.category || 'Laser Heads & Spares',
        description: brandData.description || 'OEM laser spares supplier.',
        seriesList: brandData.seriesList || ['Standard']
      };
      updated = [...brands, newBrand];
    }
    saveBrands(updated);
    setBrands(updated);
    setEditingBrand(null);
    showNotification(`Brand "${brandName}" logo & details saved!`);
  };

  const handleQuickUpdateBrandLogo = (brand: BrandItem, newLogoUrl: string) => {
    const updated = brands.map(b => {
      if (b.id === brand.id || b.name.toLowerCase() === brand.name.toLowerCase()) {
        return {
          ...b,
          logoUrl: newLogoUrl
        };
      }
      return b;
    });
    saveBrands(updated);
    setBrands(updated);
    showNotification(`Logo updated & stored for brand "${brand.name}"!`);
  };

  const handleDeleteBrand = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete brand "${name}"?`)) {
      const updated = brands.filter(b => b.id !== id);
      saveBrands(updated);
      setBrands(updated);
      showNotification(`Brand "${name}" removed.`);
    }
  };

  // ----------------------------------------------------
  // Inquiries Actions
  // ----------------------------------------------------
  const handleUpdateInquiryStatus = async (id: string, newStatus: InquiryRecord['status']) => {
    const updated = inquiries.map(i => i.id === id ? { ...i, status: newStatus } : i);
    saveInquiries(updated);
    setInquiries(updated);
    if (onInquiriesUpdated) onInquiriesUpdated(updated);
    updateAdminInquiryStatus(id, newStatus).catch(() => {});
    showNotification(`Inquiry status updated to "${newStatus}"`);
  };

  const handleDeleteInquiry = async (id: string) => {
    deleteInquiry(id);
    const updated = inquiries.filter(i => i.id !== id);
    setInquiries(updated);
    if (onInquiriesUpdated) onInquiriesUpdated(updated);
    deleteAdminInquiry(id).catch(() => {});
    showNotification('Inquiry deleted.');
  };

  const handleAddInquiry = async (newInq: Omit<InquiryRecord, 'id' | 'createdAt' | 'status'>) => {
    const created = saveInquiry(newInq);
    const updated = [created, ...inquiries];
    setInquiries(updated);
    if (onInquiriesUpdated) onInquiriesUpdated(updated);
    showNotification(`Added inquiry for "${newInq.productOrService}". Home page ranking updated!`);
  };

  // ----------------------------------------------------
  // Review Actions
  // ----------------------------------------------------
  const handleAddReview = async (newRevData: Partial<ReviewItem>) => {
    try {
      const apiRes = await addAdminReview(newRevData);
      if (apiRes.success && apiRes.review) {
        const updated = [apiRes.review, ...reviews.filter(r => r.id !== apiRes.review!.id)];
        setReviews(updated);
        saveReviews(updated);
        if (onReviewsUpdated) onReviewsUpdated(updated);
        showNotification('Client review published successfully!');
        return;
      }
    } catch (err) {
      console.warn('Could not add review to server, using local fallback:', err);
    }

    // Local fallback
    const localNew: ReviewItem = {
      id: 'rev-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      clientName: newRevData.clientName || 'Valued Client',
      companyName: newRevData.companyName || 'Laser Cutting Facility',
      location: newRevData.location || 'India',
      rating: Number(newRevData.rating) || 5,
      date: newRevData.date || 'Today',
      comment: newRevData.comment || '',
      projectType: newRevData.projectType || 'Fiber Laser Spares',
      verified: newRevData.verified !== false
    };
    const updated = [localNew, ...reviews];
    setReviews(updated);
    saveReviews(updated);
    if (onReviewsUpdated) onReviewsUpdated(updated);
    showNotification('Review added to catalog!');
  };

  const handleUpdateReview = async (revData: Partial<ReviewItem>) => {
    if (!revData.id) return;
    try {
      await updateAdminReview(revData.id, revData);
    } catch (err) {
      console.warn('Could not sync updated review to server:', err);
    }
    const updated = reviews.map(r => r.id === revData.id ? ({ ...r, ...revData } as ReviewItem) : r);
    setReviews(updated);
    saveReviews(updated);
    if (onReviewsUpdated) onReviewsUpdated(updated);
    showNotification('Review updated successfully!');
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await deleteAdminReview(id);
    } catch (err) {
      console.warn('Could not sync review deletion to server:', err);
    }
    const updated = reviews.filter(r => r.id !== id);
    setReviews(updated);
    saveReviews(updated);
    if (onReviewsUpdated) onReviewsUpdated(updated);
    showNotification('Review removed from catalog.');
  };

  // ----------------------------------------------------
  // Settings & Security Actions
  // ----------------------------------------------------
  const handleSaveSettings = async (newSettings: SiteSettings) => {
    saveSiteSettings(newSettings);
    setSettings(newSettings);
    onSettingsUpdated(newSettings);
    apiSaveAdminSettings(newSettings).catch(() => {});
    showNotification('Site settings updated successfully!');
  };

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handlePublishEverywhere = async () => {
    setIsPublishing(true);
    try {
      const fullConfig = {
        version: '2.0',
        exportedAt: new Date().toISOString(),
        appName: 'NK Laser Spares & Optics',
        settings,
        products,
        categories,
        brands,
        reviews,
        inquiries,
        powerRanges
      };
      const res = await publishAdminCatalog(fullConfig);
      if (res.success) {
        setPublishStatus('success');
        showNotification('🚀 All admin changes published live across all devices!');
      } else {
        // Fallback
        const fallbackRes = await publishConfigurationEverywhere(fullConfig as any);
        if (fallbackRes.success) {
          setPublishStatus('success');
          showNotification('🚀 All admin changes published live across all devices!');
        } else {
          setPublishStatus('error');
          showNotification('⚠️ Could not publish: ' + (res.message || fallbackRes.message));
        }
      }
    } catch (err: any) {
      setPublishStatus('error');
      showNotification('⚠️ Error during publish: ' + (err.message || 'Unknown error'));
    } finally {
      setIsPublishing(false);
      setTimeout(() => setPublishStatus('idle'), 4000);
    }
  };

  const handleChangePassword = async (oldPass: string, newPass: string): Promise<boolean> => {
    if (!newPass || newPass.length < 8) {
      showNotification('New password must be at least 8 characters with high complexity');
      return false;
    }

    try {
      const apiRes = await adminChangePassword(oldPass, newPass);
      if (apiRes.success) {
        showNotification('Master admin password updated securely via server bcrypt hash!');
        return true;
      } else {
        showNotification(apiRes.error || 'Current administrator password is incorrect');
        return false;
      }
    } catch (e: any) {
      showNotification(e?.message || 'Failed to update administrator password on server');
      return false;
    }
  };

  const handleRunAudit = (): ComprehensiveAuditResult => {
    const catalogIssues: string[] = [];
    const validCatSlugs = new Set(categories.map(c => c.slug));
    const validBrandNames = new Set(brands.map(b => b.name.toLowerCase()));

    // 1. Catalog integrity validation (products, SKUs, category bindings, registered OEM brands)
    products.forEach(p => {
      if (!p.sku) catalogIssues.push(`Product "${p.title}" is missing an SKU.`);
      if (p.categorySlug && !validCatSlugs.has(p.categorySlug)) {
        catalogIssues.push(`Product "${p.title}" references non-existent category "${p.categorySlug}".`);
      }
      if (p.brand && !validBrandNames.has(p.brand.toLowerCase())) {
        catalogIssues.push(`Product "${p.title}" references unregistered OEM brand "${p.brand}".`);
      }
    });

    // 2. Generalized Brand Audit across all non-product content (Settings, Services, Categories, Reviews)
    // Rule: Except NKL / NK Laser, any brand listed in content outside of products MUST be flagged!
    const services = loadServices();
    const brandAuditItems = runAutoBrandAudit({
      brands,
      settings,
      services,
      categories,
      products,
      reviews
    });

    const brandFlags = brandAuditItems.filter(item => item.status === 'Flagged');
    const brandIssues = brandFlags.map(item => `${item.source} (${item.field}): ${item.issue}`);

    const allIssues = [...brandIssues, ...catalogIssues];
    const passed = allIssues.length === 0;

    let message = '';
    if (passed) {
      message = `All Integrity Checks Passed: 100% NKL brand compliance verified across non-product content, and ${products.length} catalog products & ${categories.length} categories validated.`;
    } else if (brandFlags.length > 0 && catalogIssues.length > 0) {
      message = `Audit Attention Required: Detected ${brandFlags.length} non-NKL brand mention(s) in site content and ${catalogIssues.length} catalog consistency item(s).`;
    } else if (brandFlags.length > 0) {
      message = `Brand Compliance Flag: Detected ${brandFlags.length} non-NKL brand mention(s) in site content. In content outside of products, only "NKL" is permitted.`;
    } else {
      message = `Catalog Audit Notice: Found ${catalogIssues.length} catalog consistency item(s) to verify.`;
    }

    return {
      passed,
      message,
      issues: allIssues,
      brandItems: brandAuditItems,
      catalogIssues,
      stats: {
        totalScanned: (services?.length || 0) + (categories?.length || 0) + (products?.length || 0) + 1 + (reviews?.length || 0),
        brandFlags: brandFlags.length,
        catalogIssues: catalogIssues.length,
        monitoredBrandsCount: brands.length + KNOWN_THIRD_PARTY_BRANDS.length
      }
    };
  };

  // Breadcrumb Tab Info
  const tabTitles: Record<AdminTabType, { title: string; description: string }> = {
    dashboard: {
      title: 'Admin Overview & KPIs',
      description: 'System health, product stock readiness, and real-time statistics'
    },
    categories: {
      title: 'Categories & Taxonomy Manager',
      description: 'Configure store categories, subcategories, and compatible OEM brands'
    },
    products: {
      title: 'Product Catalog & Inventory',
      description: 'Manage all fiber laser spares, stock status, and pricing'
    },
    filters: {
      title: 'Filter & Laser Options',
      description: 'Configure laser power rating (kW) ranges and registered OEM manufacturer brands'
    },
    inquiries: {
      title: 'Customer Inquiries & RFQs',
      description: 'Manage customer quotes, part requests, and initiate direct WhatsApp replies'
    },
    reviews: {
      title: 'Customer Reviews & Feedback',
      description: 'Add new verified client testimonials, edit existing reviews, and monitor customer satisfaction'
    },
    settings: {
      title: 'Site & Business Configuration',
      description: 'Configure WhatsApp order dispatch number, store contact details, and feature toggles'
    },
    security: {
      title: 'Security & Compliance',
      description: 'Update master administrative PIN and run automated catalog integrity audits'
    }
  };

  if (!isOpen) return null;

  // ----------------------------------------------------
  // UN-AUTHENTICATED LOGIN SCREEN
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-slate-900">
        
        {/* Top Right Actions */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            Back to Public Website
          </button>
        </div>

        <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#162657] to-[#1E3A8A] flex items-center justify-center text-white font-black mx-auto shadow-md">
              <Lock className="w-7 h-7 text-amber-400" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">NK Laser Admin Console</h2>
            <p className="text-xs text-slate-500">
              Restricted management portal. Enter your authorized administrator credentials to proceed.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-red-800">Authentication Failed</div>
                  <div className="text-[11px] text-red-600 leading-relaxed">
                    {authErrorMessage || 'Invalid administrator password. Please check your credentials and try again.'}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Administrator Master Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  placeholder="Enter administrator password..."
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError(false);
                    setAuthErrorMessage('');
                  }}
                  className="w-full border border-slate-300 rounded-xl pl-3.5 pr-10 py-2.5 text-xs bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={isLoggingIn}
                className="btn-primary w-full py-3 rounded-xl text-xs gap-2 shadow-md cursor-pointer justify-center disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <span>Unlock Admin Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>SHA-256 Encrypted Session</span>
            </span>
            <span className="text-slate-400 text-[10px]">
              Direct URL Protected
            </span>
          </div>

        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED ADMIN PANEL LAYOUT (TWO COLUMNS)
  // Left: AdminSidebar (Options) | Right: Container (Respective Config)
  // ----------------------------------------------------
  const counts = {
    categories: categories.length,
    products: products.length,
    inquiries: inquiries.length,
    newInquiries: inquiries.filter(i => i.status === 'New').length,
    reviews: reviews.length
  };

  // Render Dedicated Full-Page Product Editor when editing or creating a product
  if (editingProduct) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50">
        <ProductEditPageView
          theme={theme}
          product={editingProduct}
          categories={categories}
          brands={brands}
          powerRanges={powerRanges}
          settings={settings}
          onSave={handleSaveProduct}
          onBack={() => setEditingProduct(null)}
          onClose={() => setEditingProduct(null)}
          onOpenSettings={() => {
            setEditingProduct(null);
            setActiveTab('settings');
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden transition-colors bg-slate-50 text-slate-900">
      
      {/* Toast Notification Alert */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl bg-amber-500 text-zinc-950 font-bold text-xs shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* LEFT CONTAINER: Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        theme={theme}
        onToggleTheme={toggleTheme}
        onClose={onClose}
        onLogout={handleLogout}
        counts={counts}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        logoUrl={settings.logoUrl}
        businessName={settings.businessName}
      />

      {/* RIGHT CONTAINER: Active Tab Configuration & Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Right Container Top Header */}
        <AdminHeader
          activeTab={activeTab}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onClose={onClose}
          tabInfo={tabTitles[activeTab]}
          newInquiriesCount={counts.newInquiries}
          onNavigateTab={handleSelectTab}
          onPublishEverywhere={handlePublishEverywhere}
          isPublishing={isPublishing}
          publishStatus={publishStatus}
        />

        {/* Right Container Body Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          
          {activeTab === 'dashboard' && (
            <AdminDashboardView
              theme={theme}
              categories={categories}
              products={products}
              brands={brands}
              powerRanges={powerRanges}
              inquiries={inquiries}
              reviews={reviews}
              onNavigateTab={handleSelectTab}
              onOpenAddProduct={() => setEditingProduct({})}
              onOpenAddCategory={() => setEditingCategory({})}
            />
          )}

          {activeTab === 'categories' && (
            <AdminCategoriesView
              theme={theme}
              categories={categories}
              products={products}
              selectedCategorySlug={selectedCategorySlug}
              onSelectCategorySlug={setSelectedCategorySlug}
              onOpenEditCategory={setEditingCategory}
              onOpenCreateCategory={() => setEditingCategory({})}
              onDeleteCategory={handleDeleteCategory}
              onOpenCreateProductForCategory={(cat) => setEditingProduct({
                category: cat.name,
                categorySlug: cat.slug,
                subCategory: cat.subCategories?.[0] || 'Standard Series',
                brand: cat.oemBrands?.[0] || 'RayTools'
              })}
              onOpenEditProduct={setEditingProduct}
              onDeleteProduct={handleDeleteProduct}
              onDuplicateProduct={handleDuplicateProduct}
              onToggleProductInStock={handleToggleProductInStock}
              onQuickChangeStockStatus={handleQuickChangeStockStatus}
              onAddSubcategory={handleAddSubcategoryToActive}
              onRemoveSubcategory={handleRemoveSubcategoryFromActive}
              onAddBrandToCategory={handleAddBrandToActiveCategory}
              onRemoveBrandFromCategory={handleRemoveBrandFromActiveCategory}
              onToggleCategoryFeatured={handleToggleCategoryFeatured}
              onToggleCategoryHome={handleToggleCategoryHome}
              onCategoriesUpdated={(newCats) => {
                setCategories(newCats);
                saveCategories(newCats);
                if (onCategoriesUpdated) onCategoriesUpdated(newCats);
              }}
            />
          )}

          {activeTab === 'products' && (
            <AdminProductsView
              theme={theme}
              products={products}
              categories={categories}
              brands={brands}
              powerRanges={powerRanges}
              onOpenCreateProduct={() => setEditingProduct({})}
              onOpenEditProduct={setEditingProduct}
              onDeleteProduct={handleDeleteProduct}
              onDuplicateProduct={handleDuplicateProduct}
              onToggleProductInStock={handleToggleProductInStock}
              onQuickChangeStockStatus={handleQuickChangeStockStatus}
              onProductsUpdated={(newProds) => {
                setProducts(newProds);
                saveProducts(newProds);
                if (onProductsUpdated) onProductsUpdated(newProds);
              }}
            />
          )}

          {activeTab === 'filters' && (
            <AdminFiltersView
              theme={theme}
              powerRanges={powerRanges}
              brands={brands}
              onAddPowerRange={handleAddPowerRange}
              onDeletePowerRange={handleDeletePowerRange}
              onOpenCreateBrand={() => setEditingBrand({})}
              onOpenEditBrand={setEditingBrand}
              onDeleteBrand={handleDeleteBrand}
              onQuickUpdateBrandLogo={handleQuickUpdateBrandLogo}
            />
          )}

          {activeTab === 'inquiries' && (
            <AdminInquiriesView
              theme={theme}
              inquiries={inquiries}
              settings={settings}
              products={products}
              onUpdateInquiryStatus={handleUpdateInquiryStatus}
              onDeleteInquiry={handleDeleteInquiry}
              onAddInquiry={handleAddInquiry}
            />
          )}

          {activeTab === 'reviews' && (
            <AdminReviewsView
              theme={theme}
              reviews={reviews}
              onAddReview={handleAddReview}
              onUpdateReview={handleUpdateReview}
              onDeleteReview={handleDeleteReview}
              onReviewsUpdated={(newRevs) => {
                setReviews(newRevs);
                saveReviews(newRevs);
                if (onReviewsUpdated) onReviewsUpdated(newRevs);
              }}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettingsView
              theme={theme}
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}

          {activeTab === 'security' && (
            <AdminSecurityView
              theme={theme}
              categories={categories}
              products={products}
              brands={brands}
              settings={settings}
              onUpdateSettings={handleSaveSettings}
              onChangePassword={handleChangePassword}
              onRunAudit={handleRunAudit}
            />
          )}

        </main>

      </div>

      {/* MODALS */}
      {editingCategory && (
        <CategoryEditModal
          theme={theme}
          category={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}

      {editingBrand && (
        <BrandEditModal
          theme={theme}
          brand={editingBrand}
          onSave={handleSaveBrand}
          onClose={() => setEditingBrand(null)}
        />
      )}

    </div>
  );
};
