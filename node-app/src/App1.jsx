import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import PokemonSearch from './PokemonSearch';

const Layout = () => (
  <div className="min-h-screen bg-gray-50">
    <nav className="bg-white shadow mb-4">
      <div className="container mx-auto px-4 py-3">
        <Link to="/" className="text-xl font-bold text-gray-800">Pokemon Search</Link>
      </div>
    </nav>
    <div className="container mx-auto px-4">
      <Routes>
        <Route path="/" element={<PokemonSearch />} />
      </Routes>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}