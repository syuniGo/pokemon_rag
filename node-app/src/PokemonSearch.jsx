import React, { useState, useCallback, useEffect } from 'react';
import { Input } from "/components/ui/input";
import { Button } from "/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import "/src/tw.css";
import PokemonDetailsCard from './PokemonDetailsCard';

/**
 * @typedef {Object} Pokemon
 * @property {number} id
 * @property {string} name
 * @property {boolean} [isRelevant]
 */

/**
 * @typedef {Object} SearchResponse
 * @property {Array<{number: number, nameCn: string}>} search_results
 * @property {string} answer
 * @property {string} relevance
 * @property {string} relevance_explanation
 */

export default function PokemonSearch() {
  const [search, setSearch] = useState('');
  const [pokemonList, setPokemonList] = useState([]);
  const [displayList, setDisplayList] = useState([]); 
  const [searchResponse, setSearchResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPokemonIndex, setSelectedPokemonIndex] = useState(0);

  const updateDisplayList = useCallback((newIndex) => {
    const listLength = pokemonList.length;
    const displayItems = [];

    for (let i = 0; i < 3; i++) {
      const index = (newIndex + i) % listLength;
      displayItems.push({
        ...pokemonList[index],
        displayIndex: i 
      });
    }

    setDisplayList(displayItems);
  }, [pokemonList]);

  useEffect(() => {
    if (pokemonList.length > 0) {
      updateDisplayList(0);
      setCurrentIndex(0);
      setSelectedPokemonIndex(0);
    }
  }, [pokemonList, updateDisplayList]);

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
      if (data?.search_results && data?.pokemon_entries) {
        const mostRelevantNo = data.summary?.most_relevant_pokemon?.no;
        const newPokemonList = data.search_results.map(pokemon => {
          const entry = data.pokemon_entries.find(entry => entry.no == pokemon.no);
          return {
            id: pokemon.no,
            name: pokemon.nameCn,
            isRelevant: pokemon.no == mostRelevantNo, 
            powerRating: entry?.power_rating || 'N/A',
            relevanceScore: entry?.relevance_score || 0,
            relevanceAnalysis: entry?.relevance_analysis || '',
            backgroundStory: entry?.background_story || ''
          };
        });
        setPokemonList(newPokemonList);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % pokemonList.length;
    setCurrentIndex(nextIndex);
    updateDisplayList(nextIndex);
    setSelectedPokemonIndex(1); 
  }, [currentIndex, pokemonList.length, updateDisplayList]);

  const handlePrev = useCallback(() => {
    const prevIndex = (currentIndex - 1 + pokemonList.length) % pokemonList.length;
    setCurrentIndex(prevIndex);
    updateDisplayList(prevIndex);
    setSelectedPokemonIndex(1); 
  }, [currentIndex, pokemonList.length, updateDisplayList]);

  const handleClearSearch = () => {
    setSearch('');
    setPokemonList([]);
    setDisplayList([]);
    setSearchResponse(null);
  };

  const handlePokemonClick = (index) => {
    const clickedIndex = (currentIndex + index) % pokemonList.length; 

    let newIndex;
    if (index === 0) { 
      newIndex = (clickedIndex - 1 + pokemonList.length) % pokemonList.length;
    } else if (index === 2) {  
      newIndex = (clickedIndex + 1) % pokemonList.length;
    } else {  
      newIndex = currentIndex;
    }

    setCurrentIndex(newIndex);
    updateDisplayList(newIndex);
    setSelectedPokemonIndex(1);  
  };


  return (
    <div className="min-h-screen bg-[#1a1f36]">
      <div className="mx-auto max-w-5xl p-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          探索宝可梦的世界
        </h1>

        {/* Search Bar */}
        <div className="relative w-full max-w-md mx-auto mb-12">
          <div className="relative">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#2a2f45] border-[#3a3f55] text-white placeholder:text-gray-400 pr-20"
              placeholder="搜索宝可梦..."
            />
            {search && (
              <button
                onClick={handleClearSearch}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <Button
              onClick={handleSearch}
              disabled={isLoading || !search.trim()}
              className="absolute right-0 top-0 h-full bg-[#4c4dff] hover:bg-[#3a3bff]"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "搜索"}
            </Button>
          </div>
        </div>

        {displayList.length > 0 && (
          <div className="mb-8">
            <div className="relative flex items-center justify-center gap-4">
              <Button
                onClick={handlePrev}
                variant="ghost"
                className="bg-[#2a2f45] hover:bg-[#3a3f55] text-white rounded-full p-2 z-20"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <div className="flex justify-center items-center gap-4">
                {displayList.map((pokemon, index) => (
                  <div
                    key={`${pokemon.id}-${pokemon.displayIndex}`}
                    onClick={() => handlePokemonClick(index)}
                    className={`transform transition-all duration-300 cursor-pointer ${index === 1
                      ? 'scale-125 z-10'
                      : ''
                      }`}
                  >
                    <div className={`bg-[#2a2f45] rounded-lg p-4 ${pokemon.isRelevant
                      ? 'ring-2 ring-[#FFD700] bg-[#313866]'
                      : ''
                      } ${index === 1
                        ? 'bg-[#3a3f55] shadow-xl shadow-[#4c4dff]/20'
                        : 'hover:bg-[#3a3f55]'
                      }`}>
                      <div className={`w-full aspect-square rounded-lg p-2 mb-2 ${pokemon.isRelevant
                        ? 'bg-[#232655]'
                        : 'bg-[#1a1f36]'
                        }`}>
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                          alt={pokemon.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-center p-4">
                        <p className={`font-medium truncate ${pokemon.isRelevant
                          ? 'text-[#FFD700]' 
                          : 'text-white'
                          }`}>
                          {pokemon.name}
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-300">
                            实力评级: {pokemon.powerRating}
                          </p>
                          <p className="text-xs text-gray-300">
                            相关度: {pokemon.relevanceScore}
                          </p>
                        </div>
                        {pokemon.isRelevant && (
                          <span className="absolute inline-block mt-1 px-2 py-0.5 bg-[#FFD700]/20 text-[#FFD700] text-xs rounded-full">
                            推荐
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleNext}
                variant="ghost"
                className="bg-[#2a2f45] hover:bg-[#3a3f55] text-white rounded-full p-2 z-20"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        )}

        {displayList.length > 0 && searchResponse?.search_results[selectedPokemonIndex] && (
          <PokemonDetailsCard
            pokemon={{
              ...(() => {
                const selectedPokemon = displayList[selectedPokemonIndex];
                const searchResult = searchResponse.search_results.find(
                  pokemon => pokemon.no === selectedPokemon.id
                );

                return {
                  name: {
                    cn: searchResult.nameCn,
                    en: searchResult.nameEn,
                    ja: searchResult.nameJa
                  },
                  id: searchResult.no,
                  stats: searchResult.stats,
                  types: searchResult.types,
                  abilities: searchResult.abilities,
                  description: searchResult.description,
                  relevanceAnalysis: selectedPokemon.relevanceAnalysis,
                  backgroundStory: selectedPokemon.backgroundStory,
                  relevanceScore: selectedPokemon.relevanceScore
                };
              })()
            }}
          />
        )}
        
        {/* AI Response */}
        {searchResponse && (
          <div className="space-y-4 mt-8">
            {/* <div className="bg-[#2a2f45] rounded-lg p-6">
              <h2 className="text-lg font-medium text-white mb-4">AI 回答</h2>
              <p className="text-gray-300 leading-relaxed">
                {searchResponse.answer}
              </p>
            </div> */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#2a2f45] rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">相关度</h3>
                <p className="text-gray-300">
                  {searchResponse.relevance}
                </p>
              </div>
              <div className="bg-[#2a2f45] rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">解释</h3>
                <p className="text-gray-300">
                  {searchResponse.relevance_explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}