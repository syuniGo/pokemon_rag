import React, { useState } from 'react';
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Link } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import "./tw.css";

export default function PokemonSearch() {
  const [search, setSearch] = useState('');
  const [pokemonList, setPokemonList] = useState([]);
  const [searchResponse, setSearchResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8084/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: search, top_k: 5 }),
      });
      const data = await response.json();
      setSearchResponse(data);
      if (data?.search_results) {
        setPokemonList(data.search_results.map(pokemon => ({
          id: pokemon.number,
          name: pokemon.nameCn
        })));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1f36]">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">宝可梦搜索</h1>
          <p className="text-gray-400">探索宝可梦的世界</p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#2a2f45] border-[#3a3f55] text-white placeholder:text-gray-500"
              placeholder="搜索宝可梦..."
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-[#4c4dff] hover:bg-[#3a3bff] text-white px-8"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "搜索"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Pokemon List */}
          {pokemonList.length > 0 && (
            <div className="lg:w-2/5 space-y-3">
              <h2 className="text-lg font-medium text-white mb-4">相关宝可梦</h2>
              {pokemonList.map(({ id, name }) => (
                <Link
                  key={id}
                  to={`/pokemon/${name}`}
                  className="flex items-center gap-4 bg-[#2a2f45] p-4 rounded-lg hover:bg-[#3a3f55] transition-colors"
                >
                  <div className="w-16 h-16 bg-[#1a1f36] rounded-lg p-2">
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                      alt={name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-white">{name}</p>
                    <p className="text-sm text-gray-400">#{String(id).padStart(3, '0')}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* AI Response */}
          {searchResponse && (
            <div className="lg:w-3/5 space-y-4">
              <div className="bg-[#2a2f45] rounded-lg p-6">
                <h2 className="text-lg font-medium text-white mb-4">AI 回答</h2>
                <p className="text-gray-300">{searchResponse.answer}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#2a2f45] rounded-lg p-4">
                  <h3 className="font-medium text-white mb-2">相关度</h3>
                  <p className="text-gray-300">{searchResponse.relevance}</p>
                </div>
                <div className="bg-[#2a2f45] rounded-lg p-4">
                  <h3 className="font-medium text-white mb-2">解释</h3>
                  <p className="text-gray-300">{searchResponse.relevance_explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}