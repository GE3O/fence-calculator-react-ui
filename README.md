# Fence Calculator React UI

A modern React application for calculating fence costs and generating quotes. This application integrates with WooCommerce to fetch product data and provides a user-friendly interface for fence calculations.

## 🚀 Features

- Multi-section fence calculations
- Support for various fence types (Vinyl, Aluminum, Wood, Chain Link)
- Dynamic product loading from WooCommerce
- Gate and post customization
- Detailed cost breakdowns
- Quote generation

## 🛠️ Setup

1. **Clone the Repository**
```bash
git clone https://github.com/GE3O/fence-calculator-react-ui.git
cd fence-calculator-react-ui
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env` file in the root directory with:
```env
REACT_APP_WOOCOMMERCE_URL=your_woocommerce_site_url
REACT_APP_WOOCOMMERCE_CONSUMER_KEY=your_consumer_key
REACT_APP_WOOCOMMERCE_CONSUMER_SECRET=your_consumer_secret
```

4. **Start Development Server**
```bash
npm start
```

## 📁 Project Structure

```
src/
├── components/
│   ├── fence/
│   │   └── calculator/
│   │       ├── FenceCalculator.jsx
│   │       ├── FenceRunItem.jsx
│   │       ├── PostSelector.jsx
│   │       └── ...
│   └── shared/
├── hooks/
│   ├── useFenceCalculation.js
│   └── ...
├── services/
│   └── woocommerce.api.js
└── utils/
    └── productFilters.js
```

## 🔧 Configuration

### WooCommerce Categories
The application uses specific WooCommerce category IDs for different product types:

- Vinyl Fence: 53
- Aluminum Fence: 49
- Wood Fence: 439
- Chain Link Fence: 296

## 🧪 Testing

```bash
npm test
```

## 📦 Building for Production

```bash
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.