import React from 'react';
import FilterBar from './FilterBar';
import Tabs from './Tabs';
import ProductTable from './ProductTable';
import Pagination from './Pagination';

const ProductListingSection = () => {
  return (
    <section className="bg-white rounded-xl shadow-feature-card mb-10 overflow-hidden">
      <FilterBar />
      <Tabs />
      <ProductTable />
      <Pagination />
    </section>
  );
};

export default ProductListingSection;