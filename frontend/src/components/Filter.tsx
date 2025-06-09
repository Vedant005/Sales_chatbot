// src/components/Filter.tsx
import React, { useState, useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useAuthStore } from "../stores/useAuthStore";

interface FilterProps {
  onApplyFilters: (params: {
    name?: string;
    category?: string;
    min_price?: number;
    max_price?: number;
  }) => void;
}

const Filter: React.FC<FilterProps> = ({ onApplyFilters }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const productStore = useProductStore();
  const authStore = useAuthStore();

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const API_BASE_URL = "http://127.0.0.1:5000";

  useEffect(() => {
    const fetchCategories = async () => {
      if (!authStore.isAuthenticated && !authStore.isLoading) {
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/products`); // Fetching products to get categories
        if (!response.ok) throw new Error("Failed to fetch categories");
        const products = await response.json();
        const uniqueCategories = new Set<string>();
        products.forEach((p: any) => {
          if (p.category) {
            p.category
              .split("|")
              .forEach((cat: string) => uniqueCategories.add(cat.trim()));
          }
        });
        setAvailableCategories(Array.from(uniqueCategories).sort());
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, [authStore.isAuthenticated, authStore.isLoading]); // Rerun when auth status changes

  const handleApplyFilters = () => {
    const filters: {
      name?: string;
      category?: string;
      min_price?: number;
      max_price?: number;
    } = {};
    if (searchTerm) filters.name = searchTerm;
    if (selectedCategory) filters.category = selectedCategory;
    if (minPrice && !isNaN(parseFloat(minPrice)))
      filters.min_price = parseFloat(minPrice);
    if (maxPrice && !isNaN(parseFloat(maxPrice)))
      filters.max_price = parseFloat(maxPrice);
    onApplyFilters(filters);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    onApplyFilters({}); // Apply empty filters to clear results
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Filter Products
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search by Name
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="e.g., Laptop, Keyboard"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">All Categories</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="min-price"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Min Price (₹)
          </label>
          <input
            type="number"
            id="min-price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="e.g., 500"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="max-price"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Max Price (₹)
          </label>
          <input
            type="number"
            id="max-price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="e.g., 10000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="mt-6 flex space-x-3">
        <button
          onClick={handleApplyFilters}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Apply Filters
        </button>
        <button
          onClick={handleClearFilters}
          className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default Filter;
