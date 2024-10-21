import React, { useState } from 'react';
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import PokemonList from './PokemonList'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

export default function PokemonSearch() {
  const [search, setSearch] = useState('');
  const [pokemonList, setPokemonList] = useState([]);

  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:8080/');
      const data = await response.json();
      console.log('Test response:', data);
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: search,
          top_k: 5
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPokemonList(data.data.map(pokemon => ({
          id: pokemon.number,
          name: pokemon.nameCn
        })));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Pokemon..."
          className="max-w-xs"
        />
        <Button onClick={handleSearch}>Search</Button>
        <Button onClick={testConnection}>Test Connection</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pokemonList.map((pokemon) => {
          return (
            <Link key={pokemon.id} to={`/pokemon/${pokemon.name}`} className="p-4 border rounded-lg shadow hover:shadow-md transition-shadow">
              <p className="font-bold">#{pokemon.id}</p>
              <p>{pokemon.name}</p>
            </Link>
          );
        })}
      </div>

      <PokemonList pokemonList={pokemonList} />
    </div>
  );
}