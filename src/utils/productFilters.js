/**
 * Utility functions for filtering and manipulating product data
 */

/**
 * Filter products based on various criteria
 * @param {Array} products - Array of product objects
 * @param {Object} filters - Filters to apply
 * @returns {Array} Filtered products
 */
export const filterProducts = (products, filters) => {
  if (!products || !Array.isArray(products)) {
    return [];
  }

  return products.filter(product => {
    // Type/category filter with enhanced matching
    if (filters.type !== undefined) {
      const typeFilter = filters.type.toLowerCase();
      
      // Check for category matches in different ways
      const matchesCategory = product.categories && product.categories.some(cat => {
        // Match by category ID
        if (cat.id === parseInt(typeFilter, 10)) return true;
        
        // Match by slug
        if (cat.slug && cat.slug.toLowerCase() === typeFilter) return true;
        
        // Match by name (partial or full)
        if (cat.name && cat.name.toLowerCase().includes(typeFilter)) return true;
        
        return false;
      });
      
      // Check product name for type match as fallback
      const matchesName = product.name && product.name.toLowerCase().includes(typeFilter);
      
      if (!matchesCategory && !matchesName) return false;
    }

    // Price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const price = parseFloat(product.price || '0');
      
      if (filters.minPrice !== undefined && price < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && price > filters.maxPrice) return false;
    }

    // Height filter
    if (filters.height !== undefined) {
      const heightAttr = product.attributes && product.attributes.find(
        attr => attr.name === 'Height' || attr.name === 'height'
      );
      
      if (!heightAttr || !heightAttr.options.includes(filters.height)) return false;
    }

    // Width filter
    if (filters.width !== undefined) {
      const widthAttr = product.attributes && product.attributes.find(
        attr => attr.name === 'Width' || attr.name === 'width'
      );
      
      if (!widthAttr || !widthAttr.options.includes(filters.width)) return false;
    }

    // Material filter
    if (filters.material !== undefined) {
      const materialAttr = product.attributes && product.attributes.find(
        attr => attr.name === 'Material' || attr.name === 'material'
      );
      
      if (!materialAttr || !materialAttr.options.includes(filters.material)) return false;
    }

    // Search filter
    if (filters.search !== undefined && filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesName = product.name && product.name.toLowerCase().includes(searchTerm);
      const matchesDescription = product.description && product.description.toLowerCase().includes(searchTerm);
      const matchesShortDescription = product.short_description && product.short_description.toLowerCase().includes(searchTerm);
      
      if (!matchesName && !matchesDescription && !matchesShortDescription) return false;
    }

    // Availability filter
    if (filters.inStock !== undefined) {
      if (filters.inStock) {
        // Check both stock_status and stock_quantity
        const hasStock = product.stock_status === 'instock' || 
                        (product.manage_stock && product.stock_quantity > 0);
        if (!hasStock) return false;
        
        // For variable products, check if any variations are in stock
        if (product.type === 'variable' && product.variations) {
          const hasInStockVariation = product.variations.some(variation => 
            variation.stock_status === 'instock' || 
            (variation.manage_stock && variation.stock_quantity > 0)
          );
          if (!hasInStockVariation) return false;
        }
      }
    }

    return true;
  });
};

/**
 * Get unique attribute values from a list of products
 * @param {Array} products - Array of product objects
 * @param {string} attributeName - Name of the attribute to extract values from
 * @param {Object} options - Additional options
 * @returns {Array} Unique attribute values
 */
export const getUniqueAttributeValues = (products, attributeName, options = {}) => {
  if (!products || !Array.isArray(products)) {
    return [];
  }
  
  const { numericSort = false } = options;
  
  // Extract all values for the specified attribute
  const allValues = products.flatMap(product => {
    const attr = product.attributes && product.attributes.find(
      a => a.name === attributeName || a.name === attributeName.toLowerCase()
    );
    return attr?.options || [];
  });
  
  // Create a unique set of values
  const uniqueValues = [...new Set(allValues)];
  
  // Sort values if requested
  if (numericSort) {
    return uniqueValues.sort((a, b) => {
      // Extract numbers from strings like "4 ft", "5 ft", etc.
      const numA = parseFloat(a.match(/\d+(\.\d+)?/)?.[0] || 0);
      const numB = parseFloat(b.match(/\d+(\.\d+)?/)?.[0] || 0);
      return numA - numB;
    });
  }
  
  return uniqueValues.sort();
};