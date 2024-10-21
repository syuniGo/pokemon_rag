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
  const [selectedPokemonIndex, setSelectedPokemonIndex] = useState(0);

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
        setSelectedPokemonIndex(0);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 计算卡片位置和样式
  const getCardStyle = (index, isSelected) => {
    const baseTransform = `translateX(${index * 120}px)`;
    const selectedTransform = `translateX(${index * 120}px) translateY(-20px)`;
    
    return {
      transform: isSelected ? selectedTransform : baseTransform,
      transition: 'all 0.3s ease',
      position: 'absolute',
      left: 0,
      zIndex: isSelected ? pokemonList.length + 1 : pokemonList.length - index,
    };
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

        <div className="flex flex-col gap-6">
          {/* Pokemon Cards */}
          {pokemonList.length > 0 && (
            <div className="w-full">
              <h2 className="text-lg font-medium text-white mb-4">相关宝可梦</h2>
              <div className="relative w-full h-64 overflow-x-auto">
                <div className="absolute top-0 left-0 w-full h-full">
                  {pokemonList.map(({ id, name }, index) => (
                    <div
                      key={id}
                      style={getCardStyle(index, index === selectedPokemonIndex)}
                      className={`w-48 cursor-pointer ${
                        index === selectedPokemonIndex ? 'opacity-100' : 'opacity-90 hover:opacity-100'
                      }`}
                      onClick={() => setSelectedPokemonIndex(index)}
                    >
                      <div className={`bg-[#2a2f45] rounded-lg p-4 ${
                        index === selectedPokemonIndex 
                          ? 'border-2 border-[#4c4dff] bg-[#3a3f55]' 
                          : ''
                      }`}>
                        <div className="w-full h-28 bg-[#1a1f36] rounded-lg p-2 mb-2">
                          <img
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                            alt={name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-center">
                          <p className={`font-medium ${
                            index === selectedPokemonIndex 
                              ? 'text-[#4c4dff]' 
                              : 'text-white'
                          }`}>{name}</p>
                          <p className="text-sm text-gray-400">#{String(id).padStart(3, '0')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Response */}
          {searchResponse && (
            <div className="w-full space-y-4">
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