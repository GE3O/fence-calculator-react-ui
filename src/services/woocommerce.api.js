/**
 * WooCommerce REST API Client
 * Uses WooCommerce REST API to fetch fence products and variations
 */

// Configuration to control API behavior
const API_SETTINGS = {
  // Whether to use mock data when API calls fail
  USE_MOCK_DATA: true,
  // Maximum timeout for API calls in milliseconds
  REQUEST_TIMEOUT: 15000,
  // Number of retry attempts for failed requests
  MAX_RETRIES: 3,
  // Delay between retries in milliseconds (multiplied by retry attempt)
  RETRY_DELAY: 1000,
  // Whether to log API requests for debugging
  DEBUG_MODE: true,
  // Whether to show warnings in console for fallback data usage
  SHOW_FALLBACK_WARNINGS: true,
  // Log level: 'debug', 'info', 'warn', 'error', 'none'
  LOG_LEVEL: 'debug',
};

// Primary domain from environment
const primaryDomain = process.env.REACT_APP_WOOCOMMERCE_URL || 'https://example.com';

// Create alternative URLs to try
const getAlternativeUrls = (url) => {
  if (!url) return [];
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.startsWith('www.')) {
      // If URL starts with www, create a non-www version
      return [url.replace('www.', '')];
    } else {
      // If URL doesn't start with www, create a www version
      return [url.replace('://', '://www.')];
    }
  } catch (e) {
    return [];
  }
};

// API configuration with correct endpoint formats
const API_CONFIG = {
  // Try different API endpoint formats (will try each one in order until success)
  endpointFormats: [
    `${primaryDomain}/wp-json/wc/v3`,           // Standard format
    `${primaryDomain}/index.php/wp-json/wc/v3`, // Format for certain WordPress configurations
    `${primaryDomain}/wp-json/wc/v3`,           // Fallback to standard again
  ],
  // Alternative domains to try if primary fails
  alternativeDomains: getAlternativeUrls(primaryDomain),
  // Consumer key and secret from environment
  consumerKey: process.env.REACT_APP_WOOCOMMERCE_CONSUMER_KEY || '',
  consumerSecret: process.env.REACT_APP_WOOCOMMERCE_CONSUMER_SECRET || '',
};

/**
 * Creates a WooCommerce API client
 * @returns {Object} WooCommerce API client
 */
const createWooCommerceClient = () => {
  return {
    get: async (endpoint, params = {}) => {
      return woocommerceRequest(endpoint, params, 'GET');
    },
    post: async (endpoint, data = {}) => {
      return woocommerceRequest(endpoint, {}, 'POST', data);
    },
    put: async (endpoint, data = {}) => {
      return woocommerceRequest(endpoint, {}, 'PUT', data);
    },
    delete: async (endpoint, params = {}) => {
      return woocommerceRequest(endpoint, params, 'DELETE');
    }
  };
};

/**
 * Get API configuration
 * @returns {Object} API configuration
 */
export const getConfig = () => {
  return {
    ...API_CONFIG,
    settings: { ...API_SETTINGS }
  };
};

/**
 * Builds a WooCommerce API URL with authentication
 * @param {string} endpoint - API endpoint
 * @param {Object} params - URL parameters
 * @param {number} formatIndex - Index of endpoint format to use
 * @returns {string} URL with authentication
 */
const buildWooCommerceUrl = (endpoint, params = {}, formatIndex = 0) => {
  // Get the endpoint format to use, defaulting to the first one
  const endpointFormat = API_CONFIG.endpointFormats[formatIndex] || API_CONFIG.endpointFormats[0];
  
  // Build the URL
  const url = new URL(`${endpointFormat}/${endpoint}`);
  
  // Add authentication parameters
  const allParams = {
    consumer_key: API_CONFIG.consumerKey,
    consumer_secret: API_CONFIG.consumerSecret,
    ...params
  };
  
  // Add parameters to URL
  Object.keys(allParams).forEach(key => {
    if (allParams[key] !== undefined && allParams[key] !== null) {
      url.searchParams.append(key, allParams[key]);
    }
  });
  
  return url.toString();
};

/**
 * Makes a request to the WooCommerce API
 * @param {string} endpoint - API endpoint
 * @param {Object} params - URL parameters
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {Object} data - Request body for POST/PUT requests
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} API response
 */
export const woocommerceRequest = async (endpoint, params = {}, method = 'GET', data = null, options = {}) => {
  const { useMockData = API_SETTINGS.USE_MOCK_DATA } = options;
  
  // Log request if in debug mode
  if (API_SETTINGS.DEBUG_MODE && API_SETTINGS.LOG_LEVEL === 'debug') {
    console.debug(`[WooCommerce API] ${method} ${endpoint}`, params);
  }
  
  // Try each endpoint format
  for (let i = 0; i < API_CONFIG.endpointFormats.length; i++) {
    const url = buildWooCommerceUrl(endpoint, params, i);
    
    try {
      // Set up request options
      const fetchOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: API_SETTINGS.REQUEST_TIMEOUT,
      };
      
      // Add body for POST/PUT requests
      if (data && (method === 'POST' || method === 'PUT')) {
        fetchOptions.body = JSON.stringify(data);
      }
      
      // Make request with timeout
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), API_SETTINGS.REQUEST_TIMEOUT);
      fetchOptions.signal = abortController.signal;
      
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      
      // Handle response
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Log success if in debug mode
      if (API_SETTINGS.DEBUG_MODE && API_SETTINGS.LOG_LEVEL === 'debug') {
        console.debug(`[WooCommerce API] Response:`, responseData);
      }
      
      return responseData;
    } catch (error) {
      // Log error if in debug mode
      if (API_SETTINGS.DEBUG_MODE) {
        console.error(`[WooCommerce API] Error:`, error);
      }
      
      // Try next endpoint format
      if (i < API_CONFIG.endpointFormats.length - 1) {
        continue;
      }
      
      // If all endpoint formats fail and mock data is enabled, return mock data
      if (useMockData) {
        // Log warning about using mock data
        if (API_SETTINGS.SHOW_FALLBACK_WARNINGS) {
          console.warn(`[WooCommerce API] Using mock data for ${endpoint}`);
        }
        
        return generateMockData(endpoint, params);
      }
      
      // Otherwise, throw the error
      throw error;
    }
  }
};

/**
 * Creates an API client instance
 */
export const api = createWooCommerceClient();

/**
 * Generate mock data for different endpoints
 * @param {string} endpoint - API endpoint
 * @param {Object} params - URL parameters
 * @returns {Object} Mock data
 */
const generateMockData = (endpoint, params = {}) => {
  // Extract the type of endpoint
  if (endpoint.includes('products')) {
    if (endpoint.includes('categories')) {
      return generateMockCategories(params);
    }
    
    // If endpoint is a specific product
    if (/products\/\d+/.test(endpoint)) {
      const id = parseInt(endpoint.split('/').pop());
      return generateMockProduct(id);
    }
    
    // Otherwise, return a list of products
    return generateMockProducts(endpoint, params);
  }
  
  // Return empty array as default
  return [];
};

/**
 * Generate mock categories
 * @param {Object} params - URL parameters
 * @returns {Array} Mock categories
 */
const generateMockCategories = () => {
  return [
    { id: 53, name: 'Vinyl Fence', slug: 'vinyl-fence', count: 15 },
    { id: 49, name: 'Aluminum Fence', slug: 'aluminum-fence', count: 10 },
    { id: 439, name: 'Wood Fence', slug: 'wood-fence', count: 12 },
    { id: 296, name: 'Chain Link Fence', slug: 'chain-link-fence', count: 8 },
    { id: 289, name: 'Vinyl Panels', slug: 'vinyl-panels', count: 6 },
    { id: 290, name: 'Vinyl Gates', slug: 'vinyl-gates', count: 4 },
    { id: 291, name: 'Vinyl Posts', slug: 'vinyl-posts', count: 3 },
    { id: 292, name: 'Aluminum Panels', slug: 'aluminum-panels', count: 5 },
    { id: 293, name: 'Aluminum Posts', slug: 'aluminum-posts', count: 3 },
    { id: 295, name: 'Aluminum Gates', slug: 'aluminum-gates', count: 4 },
    { id: 297, name: 'Chain Link Fabric', slug: 'chain-link-fabric', count: 4 },
    { id: 298, name: 'Chain Link Gates', slug: 'chain-link-gates', count: 3 },
    { id: 299, name: 'Chain Link Posts', slug: 'chain-link-posts', count: 3 },
    { id: 300, name: 'Wood Posts', slug: 'wood-posts', count: 3 },
    { id: 301, name: 'Wood Panels', slug: 'wood-panels', count: 5 },
    { id: 302, name: 'Wood Gates', slug: 'wood-gates', count: 4 }
  ];
};

/**
 * Generate a mock product
 * @param {number} productId - Product ID
 * @returns {Object} Mock product
 */
const generateMockProduct = (productId) => {
  // Default template for a product
  const template = {
    id: productId,
    name: `Mock Product ${productId}`,
    slug: `mock-product-${productId}`,
    permalink: `https://example.com/product/mock-product-${productId}`,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
    type: 'simple',
    status: 'publish',
    featured: false,
    catalog_visibility: 'visible',
    description: 'This is a mock product description.',
    short_description: 'Mock product short description.',
    sku: `SKU-${productId}`,
    price: '99.99',
    regular_price: '99.99',
    sale_price: '',
    on_sale: false,
    purchasable: true,
    total_sales: 0,
    virtual: false,
    downloadable: false,
    downloads: [],
    download_limit: -1,
    download_expiry: -1,
    external_url: '',
    button_text: '',
    tax_status: 'taxable',
    tax_class: '',
    manage_stock: false,
    stock_quantity: null,
    stock_status: 'instock',
    backorders: 'no',
    backorders_allowed: false,
    backordered: false,
    sold_individually: false,
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    shipping_required: true,
    shipping_taxable: true,
    shipping_class: '',
    shipping_class_id: 0,
    reviews_allowed: true,
    average_rating: '0.00',
    rating_count: 0,
    related_ids: [],
    upsell_ids: [],
    cross_sell_ids: [],
    parent_id: 0,
    purchase_note: '',
    categories: [],
    tags: [],
    images: [
      {
        id: 1000 + productId,
        date_created: new Date().toISOString(),
        date_modified: new Date().toISOString(),
        src: `https://example.com/wp-content/uploads/mock-product-${productId}.jpg`,
        name: `Mock Product ${productId}`,
        alt: `Mock Product ${productId}`
      }
    ],
    attributes: [],
    default_attributes: [],
    variations: [],
    grouped_products: [],
    menu_order: 0,
    meta_data: [],
    _links: {
      self: [
        {
          href: `https://example.com/wp-json/wc/v3/products/${productId}`
        }
      ],
      collection: [
        {
          href: "https://example.com/wp-json/wc/v3/products"
        }
      ]
    }
  };
  
  // Vinyl privacy panel
  if (productId === 101) {
    return {
      ...template,
      name: "Vinyl Privacy Panel",
      price: "89.99",
      regular_price: "89.99",
      categories: [
        { id: 53, name: "Vinyl Fence", slug: "vinyl-fence" },
        { id: 289, name: "Vinyl Panels", slug: "vinyl-panels" }
      ],
      attributes: [
        { id: 1, name: "Width", position: 0, visible: true, variation: false, options: ["6 ft", "8 ft"] },
        { id: 2, name: "Height", position: 1, visible: true, variation: false, options: ["4 ft", "6 ft", "8 ft"] },
        { id: 3, name: "Color", position: 2, visible: true, variation: false, options: ["White", "Almond"] }
      ],
      images: [
        {
          id: 101,
          src: "https://example.com/vinyl-privacy.jpg",
          name: "Vinyl Privacy Panel",
          alt: "Vinyl Privacy Panel"
        }
      ],
      description: "Our premium vinyl privacy panels are constructed with durable, low-maintenance materials that won't fade, crack, or peel. These panels provide complete privacy while maintaining a clean, attractive appearance.",
      short_description: "Durable, low-maintenance vinyl privacy fence panels."
    };
  }
  
  // Vinyl gate
  if (productId === 104) {
    return {
      ...template,
      name: "Vinyl Gate",
      price: "219.99",
      regular_price: "219.99",
      categories: [
        { id: 53, name: "Vinyl Fence", slug: "vinyl-fence" },
        { id: 290, name: "Vinyl Gates", slug: "vinyl-gates" }
      ],
      attributes: [
        { id: 1, name: "Width", position: 0, visible: true, variation: true, options: ["3 ft", "4 ft", "5 ft", "6 ft"] },
        { id: 2, name: "Height", position: 1, visible: true, variation: true, options: ["4 ft", "6 ft"] },
        { id: 3, name: "Style", position: 2, visible: true, variation: true, options: ["Privacy", "Picket"] }
      ],
      images: [
        {
          id: 104,
          src: "https://example.com/vinyl-gate.jpg",
          name: "Vinyl Gate",
          alt: "Vinyl Gate"
        }
      ],
      description: "Our vinyl gates match perfectly with our vinyl fence panels for a consistent, elegant look. All hardware included for easy installation.",
      short_description: "High-quality vinyl gate to match your vinyl fence."
    };
  }
  
  // Default mock product
  return {
    ...template,
    name: `Mock Product ${productId}`,
    fallback: true, // Mark as fallback data for UI notification
    description: "This is a fallback product because the requested product could not be found.",
    attributes: [
      { id: 1, name: "Width", position: 0, visible: true, variation: false, options: ["6 ft", "8 ft"] },
      { id: 2, name: "Height", position: 1, visible: true, variation: false, options: ["4 ft", "6 ft"] }
    ]
  };
};

/**
 * Generate mock products based on endpoint and parameters
 * @param {string} endpoint - API endpoint
 * @param {Object} params - URL parameters
 * @returns {Array} Mock products
 */
const generateMockProducts = (endpoint, params = {}) => {
  const categoryFilter = params.category;
  const searchFilter = params.search;
  
  // Create a base set of products
  const baseProducts = [
    {
      id: 101,
      name: "Vinyl Privacy Panel",
      price: "89.99",
      categories: [
        { id: 53, name: "Vinyl Fence", slug: "vinyl-fence" },
        { id: 289, name: "Vinyl Panels", slug: "vinyl-panels" }
      ],
      attributes: [
        { id: 1, name: "Width", position: 0, visible: true, variation: false, options: ["6 ft", "8 ft"] },
        { id: 2, name: "Height", position: 1, visible: true, variation: false, options: ["4 ft", "6 ft", "8 ft"] },
        { id: 3, name: "Color", position: 2, visible: true, variation: false, options: ["White", "Almond"] }
      ]
    },
    {
      id: 102,
      name: "Vinyl Picket Panel",
      price: "79.99",
      categories: [
        { id: 53, name: "Vinyl Fence", slug: "vinyl-fence" },
        { id: 289, name: "Vinyl Panels", slug: "vinyl-panels" }
      ],
      attributes: [
        { id: 1, name: "Width", position: 0, visible: true, variation: false, options: ["6 ft", "8 ft"] },
        { id: 2, name: "Height", position: 1, visible: true, variation: false, options: ["3 ft", "4 ft"] },
        { id: 3, name: "Color", position: 2, visible: true, variation: false, options: ["White", "Almond"] }
      ]
    },
    {
      id: 103,
      name: "Vinyl Post",
      price: "45.99",
      categories: [
        { id: 53, name: "Vinyl Fence", slug: "vinyl-fence" },
        { id: 291, name: "Vinyl Posts", slug: "vinyl-posts" }
      ],
      attributes: [
        { id: 2, name: "Height", position: 0, visible: true, variation: false, options: ["4 ft", "5 ft", "6 ft", "8 ft"] },
        { id: 3, name: "Color", position: 1, visible: true, variation: false, options: ["White", "Almond"] }
      ]
    },
    {
      id: 104,
      name: "Vinyl Gate",
      price: "219.99",
      categories: [
        { id: 53, name: "Vinyl Fence", slug: "vinyl-fence" },
        { id: 290, name: "Vinyl Gates", slug: "vinyl-gates" }
      ],
      attributes: [
        { id: 1, name: "Width", position: 0, visible: true, variation: true, options: ["3 ft", "4 ft", "5 ft", "6 ft"] },
        { id: 2, name: "Height", position: 1, visible: true, variation: true, options: ["4 ft", "6 ft"] },
        { id: 3, name: "Style", position: 2, visible: true, variation: true, options: ["Privacy", "Picket"] }
      ]
    }
  ];
  
  // Apply category filter if present
  let filteredProducts = baseProducts;
  if (categoryFilter) {
    filteredProducts = baseProducts.filter(product => 
      product.categories.some(cat => cat.id === parseInt(categoryFilter) || cat.slug === categoryFilter)
    );
  }
  
  // Apply search filter if present
  if (searchFilter) {
    const searchLower = searchFilter.toLowerCase();
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(searchLower)
    );
  }
  
  // Convert to full products
  return filteredProducts.map(product => generateMockProduct(product.id));
};