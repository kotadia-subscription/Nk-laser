import React, { useState, useRef, useEffect } from 'react';
import { Tag, Plus, Check, ChevronDown } from 'lucide-react';
import { ProductCategoryDef } from '../../types';

interface CategoryAutocompleteProps {
  value: string;
  onChange: (category: string, slug?: string) => void;
  categories?: ProductCategoryDef[];
  existingCategories?: string[];
  theme?: 'light' | 'dark';
}

export const CategoryAutocomplete: React.FC<CategoryAutocompleteProps> = ({
  value,
  onChange,
  categories = [],
  existingCategories = [],
  theme = 'light'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute category items list
  const categoryItems = React.useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map(c => ({ name: c.name, slug: c.slug }));
    }
    return existingCategories.map(name => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }));
  }, [categories, existingCategories]);

  const filtered = categoryItems.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (name: string, slug?: string) => {
    const foundSlug = slug || categoryItems.find(c => c.name.toLowerCase() === name.toLowerCase())?.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setQuery(name);
    onChange(name, foundSlug);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    const foundSlug = categoryItems.find(c => c.name.toLowerCase() === newQuery.toLowerCase())?.slug || newQuery.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    onChange(newQuery, foundSlug);
    setIsOpen(true);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={handleInputChange}
          placeholder="Type or select category..."
          className={`w-full border rounded-xl pl-3 pr-8 py-2 text-xs focus:outline-none focus:border-amber-500 font-medium bg-slate-50 border-slate-300 text-slate-900`}
        />

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600`}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <div className={`absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto border rounded-2xl shadow-xl py-1 divide-y bg-white border-slate-200 divide-slate-100`}>
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <button
                key={item.slug || item.name}
                type="button"
                onClick={() => handleSelect(item.name, item.slug)}
                className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  item.name === value 
                    ? 'bg-amber-50 text-amber-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{item.name}</span>
                {item.name === value && <Check className="w-3.5 h-3.5 text-amber-500" />}
              </button>
            ))
          ) : (
            <div className="p-2">
              <button
                type="button"
                onClick={() => handleSelect(query)}
                className="w-full text-left px-3 py-2 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 font-bold rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Select custom "{query}"</span>
              </button>
            </div>
          )}

          {query && !categoryItems.some(c => c.name.toLowerCase() === query.toLowerCase()) && filtered.length > 0 && (
            <div className="p-1">
              <button
                type="button"
                onClick={() => handleSelect(query)}
                className="w-full text-left px-3 py-1.5 text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-500" />
                <span>Use "{query}"</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
