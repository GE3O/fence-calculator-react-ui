import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/shared/Layout';
import FenceCalculator from './components/fence/calculator/FenceCalculator';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<FenceCalculator />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;