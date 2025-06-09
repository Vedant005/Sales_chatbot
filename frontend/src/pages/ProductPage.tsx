// src/pages/ProductsPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import Header from "../components/Header";
import Filter from "../components/Filter";
import ProductCard from "../components/Product";
import { useProductStore } from "../stores/useProductStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";

const ProductsPage: React.FC = () => {
  const {
    products,
    isLoading,
    error,
    fetchProducts,
    totalProducts,
    currentPage,
    productsPerPage,
    setCurrentPage,
    setProductsPerPage,
  } = useProductStore();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const navigate = useNavigate();
  console.log(products);

  // State to hold active filters (name and category for now)
  const [appliedFilters, setAppliedFilters] = useState<{
    name?: string;
    category?: string;
    min_price?: number;
    max_price?: number;
  }>({});

  // Effect to fetch products based on filters and pagination
  useEffect(() => {
    if (!authLoading) {
      // Fetch products with current filters, page, and per_page
      fetchProducts({
        ...appliedFilters,
        page: currentPage,
        per_page: productsPerPage,
      });
    }
  }, [
    fetchProducts,
    appliedFilters,
    currentPage,
    productsPerPage,
    authLoading,
  ]);

  const handleApplyFilters = (filters: {
    name?: string;
    category?: string;
    min_price?: number;
    max_price?: number;
  }) => {
    setAppliedFilters(filters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const totalPages = useMemo(() => {
    return Math.ceil(totalProducts / productsPerPage);
  }, [totalProducts, productsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleProductsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newPerPage = parseInt(e.target.value, 10);
    setProductsPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg font-semibold text-gray-700">
          Loading user session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-inter">
      <Header />
      <main className="container mx-auto p-6 flex-grow">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Our Products
        </h1>

        <Filter onApplyFilters={handleApplyFilters} />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-gray-700">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-red-600 bg-red-100 p-4 rounded-md text-center">
            <p>Error: {error}</p>
            <p>
              Please ensure your backend is running and you are logged in if
              products are protected.
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-gray-600 text-center text-lg p-8">
            No products found matching your criteria. Try adjusting your
            filters.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>

                <span className="text-gray-700">
                  Page {currentPage} of {totalPages} (Total {totalProducts}{" "}
                  products)
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>

                <select
                  value={productsPerPage}
                  onChange={handleProductsPerPageChange}
                  className="ml-4 border border-gray-300 rounded-md py-2 px-3 bg-white"
                  disabled={isLoading}
                >
                  <option value={6}>6 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={24}>24 per page</option>
                  <option value={48}>48 per page</option>
                </select>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-4 mt-auto">
        <div className="container mx-auto text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} E-ShopBot. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ProductsPage;
