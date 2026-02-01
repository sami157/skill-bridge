'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchTutors, fetchCategories } from '@/lib/tutors';
import type { TutorProfile, Category, TutorsFilters } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Star, Search } from 'lucide-react';

export default function TutorsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters from URL
  const [filters, setFilters] = useState<TutorsFilters>({
    categoryId: searchParams.get('categoryId') || undefined,
    subjectId: searchParams.get('subjectId') || undefined,
    minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    sortBy: (searchParams.get('sortBy') as TutorsFilters['sortBy']) || undefined,
    search: searchParams.get('search') || undefined,
  });
  
  const [localFilters, setLocalFilters] = useState({
    categoryId: filters.categoryId || '',
    subjectId: filters.subjectId || '',
    minRating: filters.minRating?.toString() || '',
    maxPrice: filters.maxPrice?.toString() || '',
    sortBy: filters.sortBy || '',
    search: filters.search || '',
  });

  // Get all subjects from categories
  const allSubjects = categories.flatMap(cat => cat.subjects || []);

  // Update URL query params
  const updateURL = useCallback((newFilters: TutorsFilters) => {
    const params = new URLSearchParams();
    
    if (newFilters.categoryId) params.set('categoryId', newFilters.categoryId);
    if (newFilters.subjectId) params.set('subjectId', newFilters.subjectId);
    if (newFilters.minRating !== undefined) params.set('minRating', newFilters.minRating.toString());
    if (newFilters.maxPrice !== undefined) params.set('maxPrice', newFilters.maxPrice.toString());
    if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy);
    if (newFilters.search) params.set('search', newFilters.search);
    
    const queryString = params.toString();
    router.push(`/tutors${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [router]);

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Fetch tutors when filters change
  const loadTutors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchTutors(filters);
      
      if (response.success && response.data) {
        setTutors(response.data);
      } else {
        setError(response.message || 'Failed to load tutors');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load tutors when filters change
  useEffect(() => {
    loadTutors();
  }, [loadTutors]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localFilters.search !== filters.search) {
        const newFilters = {
          ...filters,
          search: localFilters.search || undefined,
        };
        setFilters(newFilters);
        updateURL(newFilters);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localFilters.search]);

  const handleFilterChange = (key: keyof typeof localFilters, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const newFilters: TutorsFilters = {
      categoryId: localFilters.categoryId || undefined,
      subjectId: localFilters.subjectId || undefined,
      minRating: localFilters.minRating ? parseFloat(localFilters.minRating) : undefined,
      maxPrice: localFilters.maxPrice ? parseFloat(localFilters.maxPrice) : undefined,
      sortBy: (localFilters.sortBy as TutorsFilters['sortBy']) || undefined,
      search: localFilters.search || undefined,
    };
    
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      categoryId: '',
      subjectId: '',
      minRating: '',
      maxPrice: '',
      sortBy: '',
      search: '',
    };
    setLocalFilters(emptyFilters);
    const newFilters: TutorsFilters = {};
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const selectedCategory = categories.find(cat => cat.id === localFilters.categoryId);
  const availableSubjects = selectedCategory?.subjects || allSubjects;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Find Tutors</h1>
        <p className="text-muted-foreground">
          Browse our expert tutors and find the perfect match for your learning needs
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search tutors..."
            value={localFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Sidebar - Filters */}
        <aside className="w-64 flex-shrink-0">
          <div className="bg-muted/40 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Filters</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                Clear
              </Button>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select
                value={localFilters.categoryId}
                onChange={(e) => {
                  handleFilterChange('categoryId', e.target.value);
                  handleFilterChange('subjectId', ''); // Reset subject when category changes
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            {availableSubjects.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <select
                  value={localFilters.subjectId}
                  onChange={(e) => handleFilterChange('subjectId', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Subjects</option>
                  {availableSubjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Min Rating */}
            <div>
              <label className="text-sm font-medium mb-2 block">Min Rating</label>
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                placeholder="0.0"
                value={localFilters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="text-sm font-medium mb-2 block">Max Price ($/hr)</label>
              <Input
                type="number"
                min="0"
                step="1"
                placeholder="No limit"
                value={localFilters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <select
                value={localFilters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Default</option>
                <option value="rating_desc">Rating: High to Low</option>
                <option value="rating_asc">Rating: Low to High</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            <Button onClick={applyFilters} className="w-full">
              Apply Filters
            </Button>
          </div>
        </aside>

        {/* Main Content - Tutor Cards */}
        <main className="flex-1">
          {loading && tutors.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => loadTutors()}>Try Again</Button>
            </div>
          ) : tutors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No tutors found matching your criteria.</p>
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {tutors.map((tutor) => (
                  <Link
                    key={tutor.id}
                    href={`/tutors/${tutor.id}`}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4 mb-3">
                      {tutor.user.image ? (
                        <img
                          src={tutor.user.image}
                          alt={tutor.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-lg font-semibold">
                            {tutor.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{tutor.user.name}</h3>
                        {tutor.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {tutor.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{tutor.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({tutor.reviewCount} {tutor.reviewCount === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>

                    <div className="mb-3">
                      <span className="text-lg font-bold">${tutor.pricePerHour}</span>
                      <span className="text-sm text-muted-foreground">/hour</span>
                    </div>

                    {tutor.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tutor.subjects.slice(0, 3).map((subject) => (
                          <span
                            key={subject.id}
                            className="text-xs bg-muted px-2 py-1 rounded"
                          >
                            {subject.name}
                          </span>
                        ))}
                        {tutor.subjects.length > 3 && (
                          <span className="text-xs text-muted-foreground px-2 py-1">
                            +{tutor.subjects.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                ))}
              </div>

            </>
          )}
        </main>
      </div>
    </div>
  );
}
